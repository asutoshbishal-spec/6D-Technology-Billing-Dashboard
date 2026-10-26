import { ChartNoAxesCombined, FileText, LayoutDashboard, ReceiptText, UsersRound } from "lucide-react";
import { NavLink } from "react-router-dom";

const navItems = [
  { to: "/", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/enterprises", label: "Enterprise accounts", icon: UsersRound },
  { to: "/invoices", label: "Invoices", icon: FileText },
  { to: "/pre-bill-review", label: "Pre-bill Review", icon: ReceiptText },
  { to: "/reports", label: "Billing reports", icon: ChartNoAxesCombined }
];

export default function Sidebar({ open, onNavigate }) {
  return (
    <aside className={`sidebar-shell fixed inset-y-0 left-0 z-30 flex w-[248px] -translate-x-full flex-col bg-[#19162e] px-4 py-6 text-[#c9c4da] md:translate-x-0 ${open ? "sidebar-open" : ""}`}>
      <div className="mb-9 flex items-center gap-3 px-2">
        <img className="brand-logo h-auto w-full" src="/brand-logo.svg" alt="6D Technology — Billing operations" />
      </div>

      <div className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[.14em] text-[#827b9d]">Workspace</div>
      <nav className="grid gap-1" aria-label="Main navigation">
        {navItems.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavigate}
            className={({ isActive }) => `sidebar-link flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] font-medium ${isActive ? "sidebar-link-active bg-[#332b52] text-[#e5dcff] shadow-[inset_3px_0_#b7a0ff]" : "text-[#c9c4da] hover:bg-[#28233f] hover:text-white"}`}
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto rounded-xl border border-[#393252] bg-[#24203b] p-4">
        <p className="text-xs font-semibold text-white">Billing cycle</p>
        <p className="mt-1 text-[11px] leading-relaxed text-[#a9a3bd]">October bill run is scheduled for Oct 29.</p>
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#403a5a]">
          <div className="h-full w-[82%] rounded-full bg-[#b7a0ff]" />
        </div>
        <p className="mt-2 text-[10px] text-[#a9a3bd]">82% usage allowance consumed</p>
      </div>
      <div className="mt-5 flex items-center gap-3 border-t border-[#393252] pt-4">
        <div className="grid h-9 w-9 place-items-center rounded-full bg-[#e5dcff] text-xs font-extrabold tracking-tight text-[#4c3b82]">6D</div>
        <div>
          <p className="text-xs font-semibold text-[#f5f2ff]">Billing administrator</p>
          <p className="mt-0.5 text-[10px] font-semibold text-[#c4b5fd]">Finance team</p>
        </div>
      </div>
    </aside>
  );
}
