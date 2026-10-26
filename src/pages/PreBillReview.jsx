import { useEffect, useState } from "react";
import { AlertTriangle, ArrowRight, CircleCheck, Send } from "lucide-react";
import { Link } from "react-router-dom";
import { getBillingOverview, resolveException, sendReminder } from "../api/billingApi";
import EmptyState from "../components/EmptyState";
import { formatDate, formatMoney, formatNumber, formatPercent } from "../utils/format";

export default function PreBillReview() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [busyId, setBusyId] = useState("");

  async function load() {
    try {
      setData(await getBillingOverview());
      setError("");
    } catch (loadError) {
      setError(loadError.message);
    }
  }

  useEffect(() => { load(); }, []);

  async function handleAction(item, action) {
    setBusyId(item.id);
    setError("");
    setNotice("");
    try {
      if (action === "resolve") {
        const result = await resolveException(item.id);
        setNotice(result.mocked
          ? `${item.id} was resolved in mock mode; the change is only stored in this browser session.`
          : `${item.id} marked as resolved.`);
        await load();
      } else {
        const result = await sendReminder(item.enterpriseId);
        setNotice(result.mocked
          ? `API unavailable; reminder to ${item.enterprise} was simulated in mock mode.`
          : `Reminder sent to ${item.enterprise}.`);
      }
    } catch (actionError) {
      setError(actionError.message);
    } finally {
      setBusyId("");
    }
  }

  if (!data && error) return <EmptyState title="Review queue unavailable" description={error} />;
  if (!data) return <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">Loading review queue…</div>;
  const { pendingBillRun: run, exceptions } = data;

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[.15em] text-teal-600">Billing operations · {run.cycle}</p>
          <h1 className="text-2xl font-bold tracking-tight text-ink">Pre-bill review</h1>
          <p className="mt-1.5 text-xs text-slate-500">Review exceptions and validate the queue before generating invoices.</p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600"><span className="h-2 w-2 rounded-full bg-teal-500" />Bill run scheduled {formatDate(run.scheduled)}</div>
      </div>
      {data.dataSource === "mock" && <p role="status" className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-xs text-amber-800">API unavailable — showing local mock data. Review actions are simulated for this browser session.</p>}
      {notice && <p role="status" className="rounded-lg border border-teal-100 bg-teal-50 px-4 py-2.5 text-xs text-teal-700">{notice}</p>}
      {error && <p role="alert" className="rounded-lg border border-rose-100 bg-rose-50 px-4 py-2.5 text-xs text-rose-700">{error}</p>}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Accounts in queue", value: formatNumber(run.accounts), color: "text-ink" },
          { label: "Ready to bill", value: formatNumber(run.ready), color: "text-teal-700" },
          { label: "Exceptions", value: formatNumber(run.exceptions), color: "text-amber-700" },
          { label: "Exception amount", value: formatMoney(exceptions.reduce((total, item) => total + item.amount, 0)), color: "text-rose-700" }
        ].map(card => <article className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-card" key={card.label}><p className="text-xs text-slate-500">{card.label}</p><p className={`mt-2 text-xl font-bold ${card.color}`}>{card.value}</p></article>)}
      </div>

      <section className="rounded-xl border border-slate-200/80 bg-white shadow-card">
        <div className="flex items-start justify-between border-b border-slate-100 px-4 py-4 sm:px-5">
          <div><h2 className="text-sm font-bold text-ink">Review queue</h2><p className="mt-1 text-[11px] text-slate-400">Investigate and resolve each exception to complete validation.</p></div>
          <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-semibold text-amber-700">{exceptions.length} open</span>
        </div>
        {exceptions.length ? <div className="divide-y divide-slate-100">
          {exceptions.map(item => (
            <article className="p-4 sm:p-5" key={item.id}>
              <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                <div className="flex min-w-0 items-start gap-3">
                  <span className="mt-0.5 rounded-lg bg-amber-50 p-2.5 text-amber-600"><AlertTriangle size={17} /></span>
                  <div>
                    <div className="flex flex-wrap items-center gap-2"><h3 className="text-xs font-bold text-ink">{item.title}</h3><span className={`rounded-full px-2 py-0.5 text-[9px] font-semibold ${item.severity === "High" ? "bg-rose-50 text-rose-700" : item.severity === "Medium" ? "bg-amber-50 text-amber-700" : "bg-slate-100 text-slate-600"}`}>{item.severity} priority</span></div>
                    <p className="mt-1.5 text-[11px] text-slate-500">{item.detail}</p>
                    <Link to={`/enterprise/${item.enterpriseId}`} className="mt-2 inline-flex items-center gap-1 text-[10px] font-semibold text-teal-600 hover:text-teal-700">{item.enterprise} <ArrowRight size={11} /></Link>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-3 pl-12 lg:justify-end lg:pl-0">
                  <span className="text-sm font-bold text-ink">{formatMoney(item.amount)}</span>
                  <button disabled={busyId === item.id} onClick={() => handleAction(item, "remind")} className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 px-3 py-2 text-[10px] font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"><Send size={12} />Remind</button>
                  <button disabled={busyId === item.id} onClick={() => handleAction(item, "resolve")} className="inline-flex items-center gap-1.5 rounded-md bg-teal-500 px-3 py-2 text-[10px] font-semibold text-white hover:bg-teal-600 disabled:opacity-50"><CircleCheck size={12} />Resolve</button>
                </div>
              </div>
            </article>
          ))}
        </div> : <div className="p-5"><EmptyState title="Review queue is clear" description="All identified billing exceptions have been resolved." /></div>}
      </section>

      <div className="flex flex-col justify-between gap-3 rounded-xl border border-teal-100 bg-gradient-to-r from-teal-50 to-white p-4 sm:flex-row sm:items-center sm:p-5">
        <div><p className="text-xs font-bold text-ink">Bill run readiness</p><p className="mt-1 text-[11px] text-slate-500">{formatNumber(run.ready)} of {formatNumber(run.accounts)} accounts passed validation.</p></div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-teal-100 sm:max-w-xs"><div className="h-full rounded-full bg-teal-500" style={{ width: `${Math.min(100, run.ready / run.accounts * 100)}%` }} /></div>
        <span className="text-xs font-bold text-teal-700">{formatPercent(run.ready / run.accounts * 100)} ready</span>
      </div>
    </div>
  );
}
