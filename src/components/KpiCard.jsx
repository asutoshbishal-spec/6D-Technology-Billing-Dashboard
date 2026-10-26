import { AlertTriangle, ArrowDownRight, ArrowUpRight, Clock3, WalletCards, ChartNoAxesCombined } from "lucide-react";
import { formatMoney, formatNumber, formatPercent } from "../utils/format";

const icons = {
  wallet: WalletCards,
  chart: ChartNoAxesCombined,
  clock: Clock3,
  alert: AlertTriangle
};

export default function KpiCard({ item }) {
  const Icon = icons[item.icon] || WalletCards;
  const isPositive = item.change >= 0;
  const ChangeIcon = isPositive ? ArrowUpRight : ArrowDownRight;
  const displayValue = item.count ? formatNumber(item.value) : formatMoney(item.value);

  return (
    <article className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-card transition-shadow duration-150 hover:shadow-md sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-medium text-slate-500">{item.label}</p>
        <span className={`grid h-9 w-9 place-items-center rounded-xl ${item.icon === "alert" ? "bg-amber-50 text-amber-600" : "bg-teal-50 text-teal-600"}`}>
          <Icon size={18} />
        </span>
      </div>
      <p className="mt-3 text-2xl font-bold tracking-tight text-ink">{displayValue}</p>
      <div className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-400">
        <span className={`inline-flex items-center font-semibold ${isPositive ? "text-teal-600" : "text-rose-600"}`}>
          <ChangeIcon size={14} /> {formatPercent(Math.abs(item.change))}
        </span>
        <span>vs. last month</span>
      </div>
    </article>
  );
}
