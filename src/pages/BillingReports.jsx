import { useEffect, useState } from "react";
import { getBillingOverview } from "../api/billingApi";
import { AgingChart, RevenueMixChart, RevenueTrendChart } from "../components/BillingCharts";
import EmptyState from "../components/EmptyState";
import { formatMoney } from "../utils/format";

export default function BillingReports() {
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getBillingOverview()
      .then(setData)
      .catch(loadError => setError(loadError.message));
  }, []);

  if (error && !data) return <EmptyState title="Billing reports unavailable" description={error} />;
  if (!data) return <div className="rounded-xl border border-slate-200 bg-white p-10 text-center text-sm text-slate-500">Loading billing reports…</div>;

  const paid = data.invoices.filter(invoice => invoice.status === "Paid");
  const overdue = data.invoices.filter(invoice => invoice.status === "Overdue");
  const collected = paid.reduce((sum, invoice) => sum + invoice.amount, 0);
  const overdueBalance = overdue.reduce((sum, invoice) => sum + invoice.amount, 0);

  return (
    <div className="space-y-5">
      <div>
        <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[.15em] text-teal-600">Finance insights</p>
        <h1 className="text-2xl font-bold tracking-tight text-ink">Billing reports</h1>
        <p className="mt-1.5 text-xs text-slate-500">A concise view of revenue performance and outstanding receivables.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <article className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-card"><p className="text-xs text-slate-500">Billed this month</p><p className="mt-2 text-xl font-bold text-ink">{formatMoney(data.kpis[0].value)}</p><p className="mt-1 text-[10px] text-teal-700">↑ {data.kpis[0].change}% from last month</p></article>
        <article className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-card"><p className="text-xs text-slate-500">Collected on listed invoices</p><p className="mt-2 text-xl font-bold text-teal-700">{formatMoney(collected)}</p><p className="mt-1 text-[10px] text-slate-400">{paid.length} paid invoices</p></article>
        <article className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-card"><p className="text-xs text-slate-500">Overdue invoice balance</p><p className="mt-2 text-xl font-bold text-rose-700">{formatMoney(overdueBalance)}</p><p className="mt-1 text-[10px] text-slate-400">{overdue.length} overdue invoices</p></article>
      </div>

      <section className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-card sm:p-5">
        <h2 className="text-sm font-bold text-ink">Revenue performance</h2>
        <p className="mt-1 text-[11px] text-slate-400">Monthly billed and collected revenue · USD thousands</p>
        <div className="mt-4"><RevenueTrendChart data={data.trend} /></div>
      </section>

      <div className="grid gap-4 xl:grid-cols-2">
        <section className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-card sm:p-5">
          <h2 className="text-sm font-bold text-ink">Receivables aging</h2>
          <p className="mt-1 text-[11px] text-slate-400">Open balance by aging period</p>
          <div className="mt-4"><AgingChart data={data.aging} /></div>
        </section>
        <section className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-card sm:p-5">
          <h2 className="text-sm font-bold text-ink">Revenue by service</h2>
          <p className="mt-1 text-[11px] text-slate-400">Share of billed revenue</p>
          <div className="mt-4"><RevenueMixChart data={data.revenueMix} /></div>
        </section>
      </div>
    </div>
  );
}
