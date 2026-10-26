import { useEffect, useState } from "react";
import { ArrowLeft, CalendarDays, CircleDollarSign, Clock3, Network, Send } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { getEnterpriseById, sendReminder } from "../api/billingApi";
import { EnterpriseUsageChart } from "../components/BillingCharts";
import EmptyState from "../components/EmptyState";
import { formatDate, formatMoney } from "../utils/format";

const months = ["May", "Jun", "Jul", "Aug", "Sep", "Oct"];

export default function EnterpriseDetails() {
  const { id } = useParams();
  const [account, setAccount] = useState(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  useEffect(() => {
    let active = true;
    getEnterpriseById(id)
      .then(result => { if (active) { setAccount(result); setError(""); } })
      .catch(loadError => { if (active) setError(loadError.message); });
    return () => { active = false; };
  }, [id]);

  async function remindAccount() {
    setSending(true);
    setMessage("");
    try {
      const result = await sendReminder(id);
      setMessage(result.mocked
        ? `API unavailable; the reminder for ${account.name} was simulated in mock mode.`
        : `A billing reminder was sent to ${account.name}.`);
    } catch (actionError) {
      setError(actionError.message);
    } finally {
      setSending(false);
    }
  }

  if (error && !account) return <EmptyState title="Enterprise account unavailable" description={error} />;
  if (!account) return <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">Loading enterprise account…</div>;
  const chartData = account.usage.map((usage, index) => ({ month: months[index] || `Period ${index + 1}`, usage }));

  return (
    <div className="space-y-5">
      <div>
        <Link to="/" className="mb-4 inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-teal-600"><ArrowLeft size={14} />Back to overview</Link>
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[.15em] text-teal-600">Enterprise account · {account.account}</p>
            <h1 className="text-2xl font-bold tracking-tight text-ink">{account.name}</h1>
            <p className="mt-1.5 text-xs text-slate-500">{account.plan}</p>
          </div>
          <button onClick={remindAccount} disabled={sending} className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"><Send size={14} />{sending ? "Sending…" : "Send billing reminder"}</button>
        </div>
      </div>
      {account.dataSource === "mock" && <p role="status" className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-xs text-amber-800">API unavailable — showing local mock data. Actions are simulated for this browser session.</p>}
      {message && <p role="status" className="rounded-lg border border-teal-100 bg-teal-50 px-4 py-2.5 text-xs text-teal-700">{message}</p>}
      {error && <p role="alert" className="rounded-lg border border-rose-100 bg-rose-50 px-4 py-2.5 text-xs text-rose-700">{error}</p>}

      <div className="grid gap-3 sm:grid-cols-3">
        <article className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-card"><div className="flex items-center gap-2 text-xs text-slate-500"><CircleDollarSign size={16} className="text-teal-600" />Current balance</div><p className="mt-3 text-2xl font-bold text-ink">{formatMoney(account.balance)}</p><p className="mt-1 text-[10px] text-slate-400">Open balance on account</p></article>
        <article className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-card"><div className="flex items-center gap-2 text-xs text-slate-500"><Network size={16} className="text-blue-600" />Usage this cycle</div><p className="mt-3 text-2xl font-bold text-ink">{account.usage.at(-1)} TB</p><p className="mt-1 text-[10px] text-slate-400">Monthly enterprise data</p></article>
        <article className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-card"><div className="flex items-center gap-2 text-xs text-slate-500"><Clock3 size={16} className="text-amber-600" />Account status</div><p className="mt-3 text-2xl font-bold text-ink">{account.status}</p><p className="mt-1 text-[10px] text-slate-400">Current billing standing</p></article>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(280px,.8fr)]">
        <section className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-card sm:p-5">
          <h2 className="text-sm font-bold text-ink">Data usage trend</h2>
          <p className="mt-1 text-[11px] text-slate-400">Enterprise service usage by month</p>
          <div className="mt-3"><EnterpriseUsageChart data={chartData} /></div>
        </section>
        <section className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-card sm:p-5">
          <h2 className="text-sm font-bold text-ink">Billing snapshot</h2>
          <p className="mt-1 text-[11px] text-slate-400">Account metadata and upcoming activity</p>
          <dl className="mt-5 divide-y divide-slate-100">
            <div className="flex justify-between gap-3 py-3 text-xs"><dt className="text-slate-500">Account number</dt><dd className="font-semibold text-ink">{account.account}</dd></div>
            <div className="flex justify-between gap-3 py-3 text-xs"><dt className="text-slate-500">Service plan</dt><dd className="text-right font-semibold text-ink">{account.plan}</dd></div>
            <div className="flex justify-between gap-3 py-3 text-xs"><dt className="flex items-center gap-1.5 text-slate-500"><CalendarDays size={13} />Next bill date</dt><dd className="font-semibold text-ink">{formatDate(account.nextBill)}</dd></div>
            <div className="flex justify-between gap-3 py-3 text-xs"><dt className="text-slate-500">Payment terms</dt><dd className="font-semibold text-ink">Net 30</dd></div>
            <div className="flex justify-between gap-3 py-3 text-xs"><dt className="text-slate-500">Allowance used</dt><dd className="font-semibold text-ink">{account.usage.at(-1)} TB / 100 TB</dd></div>
          </dl>
        </section>
      </div>
    </div>
  );
}
