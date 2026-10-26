import { useEffect, useMemo, useState } from "react";
import { Search, UsersRound } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { getBillingOverview } from "../api/billingApi";
import EmptyState from "../components/EmptyState";
import { formatDate, formatMoney } from "../utils/format";

function StatusBadge({ status }) {
  const style = status === "Current"
    ? "bg-teal-50 text-teal-700"
    : status === "Past due"
      ? "bg-rose-50 text-rose-700"
      : "bg-amber-50 text-amber-700";
  return <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${style}`}>{status}</span>;
}

export default function EnterpriseAccounts() {
  const location = useLocation();
  const initialQuery = new URLSearchParams(location.search).get("search") || "";
  const [accounts, setAccounts] = useState([]);
  const [search, setSearch] = useState(initialQuery);
  const [error, setError] = useState("");

  useEffect(() => {
    setSearch(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    getBillingOverview()
      .then(data => setAccounts(data.enterprises))
      .catch(loadError => setError(loadError.message));
  }, []);

  const filteredAccounts = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    if (!query) return accounts;
    return accounts.filter(account =>
      `${account.name} ${account.account} ${account.plan} ${account.status}`.toLocaleLowerCase().includes(query)
    );
  }, [accounts, search]);

  const totalBalance = filteredAccounts.reduce((sum, account) => sum + account.balance, 0);

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="mb-1.5 text-[10px] font-bold uppercase tracking-[.15em] text-teal-600">Customer portfolio</p>
          <h1 className="text-2xl font-bold tracking-tight text-ink">Enterprise accounts</h1>
          <p className="mt-1.5 text-xs text-slate-500">Find accounts and review their current billing status.</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-2.5 text-slate-400" size={15} />
          <input value={search} onChange={event => setSearch(event.target.value)} className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-xs outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-100 sm:w-64" placeholder="Search accounts..." aria-label="Search enterprise accounts" />
        </div>
      </div>
      {error && <p role="alert" className="rounded-lg border border-rose-100 bg-rose-50 px-4 py-2.5 text-xs text-rose-700">{error}</p>}

      <div className="grid gap-3 sm:grid-cols-3">
        <article className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-card"><p className="text-xs text-slate-500">Enterprise accounts</p><p className="mt-2 text-xl font-bold text-ink">{accounts.length}</p></article>
        <article className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-card"><p className="text-xs text-slate-500">Accounts needing attention</p><p className="mt-2 text-xl font-bold text-amber-700">{accounts.filter(account => account.status !== "Current").length}</p></article>
        <article className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-card"><p className="text-xs text-slate-500">Portfolio balance</p><p className="mt-2 text-xl font-bold text-ink">{formatMoney(accounts.reduce((sum, account) => sum + account.balance, 0))}</p></article>
      </div>

      <section className="overflow-hidden rounded-xl border border-slate-200/80 bg-white shadow-card">
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-4 sm:px-5">
          <div className="flex items-center gap-2"><UsersRound size={16} className="text-violet-500" /><h2 className="text-sm font-bold text-ink">Account directory</h2></div>
          <span className="text-[10px] text-slate-400">{filteredAccounts.length} accounts · {formatMoney(totalBalance)} balance</span>
        </div>
        {filteredAccounts.length ? <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-left">
            <thead><tr className="border-b border-slate-100 bg-slate-50/70 text-[10px] uppercase tracking-wide text-slate-400"><th className="px-5 py-3 font-semibold">Enterprise</th><th className="px-4 py-3 font-semibold">Account ID</th><th className="px-4 py-3 font-semibold">Plan</th><th className="px-4 py-3 font-semibold">Balance</th><th className="px-4 py-3 font-semibold">Status</th><th className="px-5 py-3 font-semibold">Next bill</th></tr></thead>
            <tbody>{filteredAccounts.map(account => (
              <tr className="border-b border-slate-50 text-xs last:border-0 hover:bg-slate-50/70" key={account.id}>
                <td className="px-5 py-3.5"><Link className="font-semibold text-ink hover:text-violet-700" to={`/enterprise/${account.id}`}>{account.name}</Link></td>
                <td className="px-4 py-3.5 text-slate-500">{account.account}</td>
                <td className="px-4 py-3.5 text-slate-500">{account.plan}</td>
                <td className="px-4 py-3.5 font-semibold text-ink">{formatMoney(account.balance)}</td>
                <td className="px-4 py-3.5"><StatusBadge status={account.status} /></td>
                <td className="px-5 py-3.5 text-slate-500">{formatDate(account.nextBill)}</td>
              </tr>
            ))}</tbody>
          </table>
        </div> : <div className="p-5"><EmptyState title="No matching accounts" description="Try a different name, account number, plan, or status." /></div>}
      </section>
    </div>
  );
}
