import { useEffect, useMemo, useState } from "react";
import { FileText, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { getBillingOverview } from "../api/billingApi";
import EmptyState from "../components/EmptyState";
import { formatDate, formatMoney } from "../utils/format";

const statusStyles = {
  Paid: "bg-teal-50 text-teal-700",
  Pending: "bg-blue-50 text-blue-700",
  Overdue: "bg-rose-50 text-rose-700"
};

export default function Invoices() {
  const [invoices, setInvoices] = useState([]);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All statuses");
  const [error, setError] = useState("");

  useEffect(() => {
    getBillingOverview()
      .then(data => setInvoices(data.invoices || []))
      .catch(loadError => setError(loadError.message));
  }, []);

  const filteredInvoices = useMemo(() => invoices.filter(invoice => {
    const matchesStatus = statusFilter === "All statuses" || invoice.status === statusFilter;
    const normalizedQuery = query.trim().toLocaleLowerCase();
    const matchesQuery = !normalizedQuery || `${invoice.id} ${invoice.enterprise}`.toLocaleLowerCase().includes(normalizedQuery);
    return matchesStatus && matchesQuery;
  }), [invoices, query, statusFilter]);

  const totals = invoices.reduce((result, invoice) => {
    result[invoice.status] = (result[invoice.status] || 0) + 1;
    return result;
  }, {});

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[.15em] text-teal-600">Billing documents</p>
          <h1 className="text-2xl font-bold tracking-tight text-ink">Invoices</h1>
          <p className="mt-1.5 text-xs text-slate-500">Track issued invoices and payment status across enterprise accounts.</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <label className="relative">
            <Search className="absolute left-3 top-2.5 text-slate-400" size={15} />
            <input value={query} onChange={event => setQuery(event.target.value)} className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-xs outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-100 sm:w-52" placeholder="Search invoices..." aria-label="Search invoices" />
          </label>
          <select value={statusFilter} onChange={event => setStatusFilter(event.target.value)} className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs text-slate-600 outline-none focus:border-violet-300" aria-label="Filter invoice status">
            <option>All statuses</option><option>Paid</option><option>Pending</option><option>Overdue</option>
          </select>
        </div>
      </div>
      {error && <p role="alert" className="rounded-lg border border-rose-100 bg-rose-50 px-4 py-2.5 text-xs text-rose-700">{error}</p>}

      <div className="grid gap-3 sm:grid-cols-3">
        {[["Paid", "Paid invoices", "text-teal-700"], ["Pending", "Pending payment", "text-blue-700"], ["Overdue", "Overdue invoices", "text-rose-700"]].map(([status, label, color]) => (
          <article className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-card" key={status}><p className="text-xs text-slate-500">{label}</p><p className={`mt-2 text-xl font-bold ${color}`}>{totals[status] || 0}</p></article>
        ))}
      </div>

      <section className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-card">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-4 sm:px-5">
          <div className="flex items-center gap-2"><FileText size={16} className="text-violet-500" /><h2 className="text-sm font-bold text-ink">Invoice register</h2></div>
          <span className="text-[10px] text-slate-400">{filteredInvoices.length} shown</span>
        </div>
        {filteredInvoices.length ? <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left">
            <thead><tr className="border-b border-slate-100 bg-slate-50/70 text-[10px] uppercase tracking-wide text-slate-400"><th className="px-5 py-3 font-semibold">Invoice</th><th className="px-4 py-3 font-semibold">Enterprise</th><th className="px-4 py-3 font-semibold">Issued</th><th className="px-4 py-3 font-semibold">Due date</th><th className="px-4 py-3 font-semibold">Amount</th><th className="px-5 py-3 font-semibold">Status</th></tr></thead>
            <tbody>{filteredInvoices.map(invoice => (
              <tr className="border-b border-slate-50 text-xs last:border-0 hover:bg-slate-50/70" key={invoice.id}>
                <td className="px-5 py-3.5 font-semibold text-ink">{invoice.id}</td>
                <td className="px-4 py-3.5"><Link className="font-medium text-slate-600 hover:text-violet-700" to={`/enterprise/${invoice.enterpriseId}`}>{invoice.enterprise}</Link></td>
                <td className="px-4 py-3.5 text-slate-500">{formatDate(invoice.issued)}</td>
                <td className="px-4 py-3.5 text-slate-500">{formatDate(invoice.due)}</td>
                <td className="px-4 py-3.5 font-semibold text-ink">{formatMoney(invoice.amount)}</td>
                <td className="px-5 py-3.5"><span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${statusStyles[invoice.status]}`}>{invoice.status}</span></td>
              </tr>
            ))}</tbody>
          </table>
        </div> : <div className="p-5"><EmptyState title="No matching invoices" description="Adjust the search or status filter to see more invoices." /></div>}
      </section>
    </div>
  );
}
