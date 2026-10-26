import { useEffect, useRef, useState } from "react";
import { Bell, Check, ChevronRight, Menu, Search, ShieldAlert, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { getBillingOverview } from "../api/billingApi";
import { formatMoney } from "../utils/format";

export default function Topbar({ title, onMenuClick }) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [notificationsError, setNotificationsError] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [hasUnread, setHasUnread] = useState(true);
  const popupRef = useRef(null);

  useEffect(() => {
    let active = true;
    getBillingOverview()
      .then(data => {
        if (active) setNotifications(data.exceptions);
      })
      .catch(error => {
        if (active) setNotificationsError(error.message);
      });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!isOpen) return undefined;
    function closeOnOutsideClick(event) {
      if (!popupRef.current?.contains(event.target)) setIsOpen(false);
    }
    function closeOnEscape(event) {
      if (event.key === "Escape") setIsOpen(false);
    }
    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [isOpen]);

  function openNotifications() {
    const nextOpen = !isOpen;
    setIsOpen(nextOpen);
    if (nextOpen) {
      setHasUnread(false);
      refreshNotifications();
    }
  }

  async function refreshNotifications() {
    try {
      const data = await getBillingOverview();
      setNotifications(data.exceptions);
      setNotificationsError("");
    } catch (error) {
      setNotificationsError(error.message);
    }
  }

  function submitSearch(event) {
    event.preventDefault();
    const query = searchQuery.trim();
    if (query) navigate(`/enterprises?search=${encodeURIComponent(query)}`);
  }

  return (
    <header className="sticky top-0 z-10 flex min-h-[68px] items-center justify-between gap-4 border-b border-slate-200/80 bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-9">
      <div className="flex min-w-0 items-center gap-3">
        <button className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200 text-slate-600 md:hidden" onClick={onMenuClick} aria-label="Open navigation">
          <Menu size={18} />
        </button>
        <div className="truncate text-xs text-slate-400">Billing workspace <span className="px-2 text-slate-300">/</span><strong className="font-semibold text-ink">{title}</strong></div>
      </div>
      <div className="flex items-center gap-2 sm:gap-3">
        <form className="relative hidden sm:block" role="search" onSubmit={submitSearch}>
          <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
          <input
            className="h-9 w-44 rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-100 lg:w-56"
            type="search"
            value={searchQuery}
            onChange={event => setSearchQuery(event.target.value)}
            placeholder="Search accounts..."
            aria-label="Search accounts"
          />
        </form>
        <div ref={popupRef} className="relative">
          <button
            type="button"
            className={`relative grid h-9 w-9 place-items-center rounded-lg border transition-colors ${isOpen ? "border-violet-200 bg-violet-50 text-violet-700" : "border-slate-200 text-slate-500 hover:bg-slate-50"}`}
            aria-label={`Notifications${notifications.length ? `, ${notifications.length} billing alerts` : ""}`}
            aria-expanded={isOpen}
            aria-controls="notification-popup"
            onClick={openNotifications}
          >
            <Bell size={17} />
            {hasUnread && notifications.length > 0 && (
              <span className="absolute -right-1 -top-1 grid h-[17px] min-w-[17px] place-items-center rounded-full border-2 border-white bg-rose-500 px-0.5 text-[8px] font-bold leading-none text-white">
                {notifications.length}
              </span>
            )}
          </button>
          {isOpen && (
            <section
              id="notification-popup"
              aria-label="Billing notifications"
              className="absolute right-0 top-12 z-50 w-[min(360px,calc(100vw-2rem))] overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_16px_48px_rgba(23,34,53,.16)]"
            >
              <div className="flex items-start justify-between border-b border-slate-100 px-4 py-3.5">
                <div>
                  <h2 className="text-sm font-bold text-ink">Notifications</h2>
                  <p className="mt-1 text-[10px] text-slate-500">
                    {notifications.length ? `${notifications.length} billing ${notifications.length === 1 ? "item needs" : "items need"} attention` : "You're all caught up"}
                  </p>
                </div>
                <button type="button" onClick={() => setIsOpen(false)} className="grid h-7 w-7 place-items-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700" aria-label="Close notifications">
                  <X size={15} />
                </button>
              </div>
              {notificationsError ? (
                <div className="px-4 py-5 text-center">
                  <p role="alert" className="text-xs text-rose-600">{notificationsError}</p>
                  <button type="button" onClick={refreshNotifications} className="mt-2 text-xs font-semibold text-violet-700 hover:text-violet-800">Try again</button>
                </div>
              ) : notifications.length ? (
                <div className="max-h-[320px] overflow-y-auto">
                  {notifications.slice(0, 5).map(item => (
                    <Link
                      key={item.id}
                      to="/pre-bill-review"
                      onClick={() => setIsOpen(false)}
                      className="flex gap-3 border-b border-slate-50 px-4 py-3 transition-colors last:border-0 hover:bg-slate-50"
                    >
                      <span className={`mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg ${item.severity === "High" ? "bg-rose-50 text-rose-600" : "bg-amber-50 text-amber-600"}`}>
                        <ShieldAlert size={15} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-xs font-semibold text-ink">{item.title}</span>
                        <span className="mt-1 block truncate text-[10px] text-slate-500">{item.enterprise} · {item.id}</span>
                      </span>
                      <span className="flex shrink-0 items-center gap-1 text-[10px] font-semibold text-slate-600">{formatMoney(item.amount)}<ChevronRight size={13} className="text-slate-400" /></span>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="px-4 py-8 text-center">
                  <span className="mx-auto grid h-9 w-9 place-items-center rounded-full bg-teal-50 text-teal-600"><Check size={17} /></span>
                  <p className="mt-2 text-xs font-semibold text-ink">All caught up</p>
                  <p className="mt-1 text-[10px] text-slate-500">No billing alerts need your attention.</p>
                </div>
              )}
              <div className="border-t border-slate-100 bg-slate-50/70 px-4 py-2.5">
                <Link to="/pre-bill-review" onClick={() => setIsOpen(false)} className="text-[11px] font-semibold text-violet-700 transition-colors hover:text-violet-900">
                  Open pre-bill review <span aria-hidden="true">→</span>
                </Link>
              </div>
            </section>
          )}
        </div>
        <div className="hidden h-8 w-px bg-slate-200 sm:block" />
        <div className="hidden text-right sm:block">
          <div className="text-xs font-semibold text-ink">6D Corporation LTD</div>
          <div className="mt-0.5 text-[10px] text-slate-400">Finance team</div>
        </div>
      </div>
    </header>
  );
}
