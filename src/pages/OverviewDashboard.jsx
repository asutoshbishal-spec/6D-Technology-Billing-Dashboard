import { useEffect, useMemo, useState } from "react";
import { ArrowRight, CalendarDays, CircleCheck, Clock3, Send, ShieldAlert } from "lucide-react";
import { Link } from "react-router-dom";
import { getBillingOverview, resolveException, sendReminder } from "../api/billingApi";
import { AgingChart, RevenueMixChart, RevenueTrendChart } from "../components/BillingCharts";
import EmptyState from "../components/EmptyState";
import KpiCard from "../components/KpiCard";
import { formatDate, formatMoney, formatNumber } from "../utils/format";

function Panel({ title, subtitle, action, children, className = "" }) {
  return (
    <section className={`min-w-0 rounded-xl border border-slate-200/80 bg-white p-4 shadow-card sm:p-5 ${className}`}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-ink">{title}</h2>
          {subtitle && <p className="mt-1 text-[11px] text-slate-400">{subtitle}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export default function OverviewDashboard() {
  const [data, setData] = useState(null);
  const [busyId, setBusyId] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [period, setPeriod] = useState("month");
  const [accountStatus, setAccountStatus] = useState("All statuses");

  async function load() {
    try {
      setData(await getBillingOverview());
      setError("");
    } catch (loadError) {
      setError(loadError.message);
    }
  }

  useEffect(() => { load(); }, []);

  const accounts = useMemo(() => {
    if (!data) return [];
    return accountStatus === "All statuses"
      ? data.enterprises
      : data.enterprises.filter(account => account.status === accountStatus);
  }, [data, accountStatus]);

  const exceptions = useMemo(() => {
    if (!data) return [];
    const statusByEnterprise = new Map(data.enterprises.map(account => [account.id, account.status]));
    return data.exceptions.filter(exception =>
      accountStatus === "All statuses" || statusByEnterprise.get(exception.enterpriseId) === accountStatus
    );
  }, [data, accountStatus]);

  const trend = useMemo(() => {
    if (!data) return [];
    if (period === "month") return data.trend.slice(-3);
    if (period === "year") return data.trend;
    const quarters = new Map();
    data.trend.forEach((entry, index) => {
      const monthIndex = (4 + index) % 12;
      const quarter = `Q${Math.floor(monthIndex / 3) + 1}`;
      const current = quarters.get(quarter) || { month: quarter, billed: 0, collected: 0 };
      current.billed += entry.billed;
      current.collected += entry.collected;
      quarters.set(quarter, current);
    });
    return [...quarters.values()];
  }, [data, period]);

  const trendLabel = period === "month"
    ? "Monthly trend · Aug–Oct 2026"
    : period === "quarter"
      ? "Quarterly trend · Q2–Q4 2026"
      : "Year-to-date · May–Oct 2026";

  async function handleExceptionAction(exception, action) {
    setBusyId(exception.id);
    setNotice("");
    try {
      if (action === "resolve") {
        const result = await resolveException(exception.id);
        setNotice(result.mocked
          ? `${exception.id} was resolved in mock mode; the change is only stored in this browser session.`
          : `${exception.id} has been resolved.`);
        await load();
      } else {
        const result = await sendReminder(exception.enterpriseId);
        setNotice(result.mocked
          ? `API unavailable; reminder to ${exception.enterprise} was simulated in mock mode.`
          : `Reminder sent to ${exception.enterprise}.`);
      }
    } catch (actionError) {
      setError(actionError.message);
    } finally {
      setBusyId("");
    }
  }

  if (!data && error) return <EmptyState title="Billing overview unavailable" description={error} />;
  if (!data) return <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">Loading billing overview…</div>;

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[.15em] text-teal-600">Monday, October 26, 2026</p>
          <h1 className="text-2xl font-bold tracking-tight text-ink">Billing overview</h1>
          <p className="mt-1.5 text-xs text-slate-500">Monitor revenue, enterprise accounts, and your upcoming bill run.</p>
        </div>
        <div className="flex flex-col gap-2 sm:items-end">
          <div className="flex flex-wrap items-center gap-2">
            <div className="inline-flex items-center rounded-lg border border-slate-200 bg-white p-1" aria-label="Revenue trend period">
              {[
                { value: "month", label: "Month" },
                { value: "quarter", label: "Quarter" },
                { value: "year", label: "Year" }
              ].map(option => (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={period === option.value}
                  onClick={() => setPeriod(option.value)}
                  className={`rounded-md px-3 py-1.5 text-[11px] font-medium transition-colors ${period === option.value ? "bg-violet-50 text-violet-700" : "text-slate-500 hover:text-slate-800"}`}
                >
                  {option.label}
                </button>
              ))}
            </div>
            <label className="sr-only" htmlFor="overview-account-status">Filter by account status</label>
            <select
              id="overview-account-status"
              value={accountStatus}
              onChange={event => setAccountStatus(event.target.value)}
              className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-[11px] font-medium text-slate-600 outline-none transition-colors focus:border-violet-300 focus:ring-2 focus:ring-violet-100"
            >
              <option value="All statuses">All status data</option>
              <option>Current</option>
              <option>Review</option>
              <option>Past due</option>
            </select>
          </div>
          <Link to="/pre-bill-review" className="inline-flex h-9 items-center justify-center gap-2 self-end rounded-lg bg-teal-500 px-3.5 text-xs font-semibold text-white transition-colors hover:bg-teal-600">
            Review bill run <ArrowRight size={14} />
          </Link>
          <p className="text-right text-[10px] text-slate-400">Period filters the trend · status filters accounts and exceptions</p>
        </div>
      </div>
        {data.dataSource === "mock" && <p role="status" className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-xs text-amber-800">API unavailable — showing local mock data. Review actions are simulated for this browser session.</p>}
        {notice && <p role="status" className="rounded-lg border border-teal-100 bg-teal-50 px-4 py-2.5 text-xs text-teal-700">{notice}</p>}
      {error && <p role="alert" className="rounded-lg border border-rose-100 bg-rose-50 px-4 py-2.5 text-xs text-rose-700">{error}</p>}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {data.kpis.map(item => <KpiCard key={item.label} item={item} />)}
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.7fr)_minmax(290px,.9fr)]">
        <Panel title="Revenue trend" subtitle={trendLabel + " · USD thousands"} action={<span className="rounded-md bg-slate-50 px-2.5 py-1.5 text-[10px] font-medium text-slate-500">Period</span>}>
          <div className="mb-2 flex gap-4 text-[10px] text-slate-500">
            <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-teal-500" />Billed</span>
            <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-blue-500" />Collected</span>
          </div>
          <RevenueTrendChart data={trend} />
        </Panel>
        <Panel title="Accounts receivable aging" subtitle="Outstanding balance by due date">
          <AgingChart data={data.aging} />
          <div className="mt-1 border-t border-slate-100 pt-3 text-xs text-slate-500">Total open balance <strong className="float-right text-ink">{formatMoney(data.aging.reduce((sum, bucket) => sum + bucket.amount, 0))}</strong></div>
        </Panel>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(300px,1fr)]">
        <Panel title="Enterprise accounts" subtitle="Recent account activity" action={<span className="text-[10px] text-slate-400">{accounts.length} accounts</span>}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-left">
              <thead><tr className="border-b border-slate-100 text-[10px] uppercase tracking-wide text-slate-400"><th className="pb-2.5 font-semibold">Enterprise</th><th className="pb-2.5 font-semibold">Account</th><th className="pb-2.5 font-semibold">Balance</th><th className="pb-2.5 font-semibold">Status</th><th className="pb-2.5 font-semibold">Next bill</th></tr></thead>
              <tbody>
                {accounts.map(account => (
                  <tr key={account.id} className="border-b border-slate-50 text-xs last:border-0 hover:bg-slate-50/70">
                    <td className="py-3"><Link className="font-semibold text-ink hover:text-teal-600" to={`/enterprise/${account.id}`}>{account.name}</Link><div className="mt-1 text-[10px] text-slate-400">{account.plan}</div></td>
                    <td className="py-3 text-slate-500">{account.account}</td>
                    <td className="py-3 font-semibold text-ink">{formatMoney(account.balance)}</td>
                    <td className="py-3"><span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${account.status === "Current" ? "bg-teal-50 text-teal-700" : account.status === "Past due" ? "bg-rose-50 text-rose-700" : "bg-amber-50 text-amber-700"}`}>{account.status}</span></td>
                    <td className="py-3 text-slate-500">{formatDate(account.nextBill)}</td>
                  </tr>
                ))}
                {!accounts.length && <tr><td colSpan="5" className="py-8 text-center text-xs text-slate-500">No accounts match this status.</td></tr>}
              </tbody>
            </table>
          </div>
        </Panel>

        <div className="space-y-4">
          <Panel title="Revenue mix" subtitle="Share by service category">
            <RevenueMixChart data={data.revenueMix} />
          </Panel>
          <Panel title="Pending bill run" subtitle={data.pendingBillRun.cycle}>
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-lg bg-slate-50 p-2.5"><p className="text-[10px] text-slate-500">Accounts</p><p className="mt-1 text-sm font-bold">{formatNumber(data.pendingBillRun.accounts)}</p></div>
              <div className="rounded-lg bg-teal-50 p-2.5"><p className="text-[10px] text-teal-700">Ready</p><p className="mt-1 text-sm font-bold text-teal-800">{formatNumber(data.pendingBillRun.ready)}</p></div>
              <div className="rounded-lg bg-amber-50 p-2.5"><p className="text-[10px] text-amber-700">Exceptions</p><p className="mt-1 text-sm font-bold text-amber-800">{formatNumber(data.pendingBillRun.exceptions)}</p></div>
            </div>
            <p className="mt-3 flex items-center gap-2 text-[10px] text-slate-500"><CalendarDays size={13} />Scheduled {formatDate(data.pendingBillRun.scheduled)}</p>
            <Link className="mt-3 inline-flex items-center gap-1 text-[11px] font-semibold text-teal-600 hover:text-teal-700" to="/pre-bill-review">Open pre-bill review <ArrowRight size={13} /></Link>
          </Panel>
        </div>
      </div>

      <Panel title="Billing exceptions" subtitle="Items requiring attention before the next bill run" action={<ShieldAlert size={17} className="text-amber-500" />}>
        {exceptions.length ? (
          <div className="divide-y divide-slate-100">
            {exceptions.map(item => (
              <div className="flex flex-col gap-3 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between" key={item.id}>
                <div className="flex min-w-0 items-start gap-3">
                  <span className="mt-0.5 rounded-lg bg-amber-50 p-2 text-amber-600"><Clock3 size={15} /></span>
                  <div className="min-w-0"><p className="text-xs font-semibold text-ink">{item.title} <span className="ml-1 font-normal text-slate-400">· {item.id}</span></p><p className="mt-1 text-[11px] text-slate-500">{item.enterprise} — {item.detail}</p></div>
                </div>
                <div className="flex shrink-0 items-center gap-2 pl-10 sm:pl-0">
                  <span className="mr-1 text-xs font-semibold text-ink">{formatMoney(item.amount)}</span>
                  <button disabled={busyId === item.id} onClick={() => handleExceptionAction(item, "remind")} className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2.5 py-1.5 text-[10px] font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"><Send size={12} />Remind</button>
                  <button disabled={busyId === item.id} onClick={() => handleExceptionAction(item, "resolve")} className="inline-flex items-center gap-1 rounded-md bg-teal-50 px-2.5 py-1.5 text-[10px] font-semibold text-teal-700 hover:bg-teal-100 disabled:opacity-50"><CircleCheck size={12} />Resolve</button>
                </div>
              </div>
            ))}
          </div>
        ) : <EmptyState title="No open exceptions" description="All billing exceptions are resolved." />}
      </Panel>
    </div>
  );
}
