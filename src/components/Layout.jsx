import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

const pageTitles = {
  "/": "Overview",
  "/enterprises": "Enterprise accounts",
  "/invoices": "Invoices",
  "/pre-bill-review": "Pre-bill Review",
  "/reports": "Billing reports"
};

export default function Layout() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { pathname } = useLocation();
  const title = pathname.startsWith("/enterprise/")
    ? "Enterprise details"
    : pageTitles[pathname] || "Overview";

  return (
    <div className="min-h-screen bg-canvas">
      <Sidebar open={menuOpen} onNavigate={() => setMenuOpen(false)} />
      {menuOpen && (
        <button
          className="fixed inset-0 z-20 bg-slate-950/30 md:hidden"
          aria-label="Close navigation"
          onClick={() => setMenuOpen(false)}
        />
      )}
      <div className="min-h-screen md:pl-[248px]">
        <Topbar title={title} onMenuClick={() => setMenuOpen(value => !value)} />
        <main className="mx-auto max-w-[1480px] px-4 py-6 sm:px-6 lg:px-9 lg:py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
