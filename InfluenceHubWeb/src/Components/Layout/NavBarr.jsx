import React from "react";
import { Menu, ShieldCheck } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { getRoleLabel, getUserInitials } from "../../utils/auth";

const navMeta = [
  {
    match: (pathname) => pathname === "/dashboard/admin",
    kicker: "Admin overview",
    title: "Trust, delivery, and operations at a glance",
    description: "Follow platform health, review urgent queues, and jump directly into the tasks blocking campaigns.",
  },
  {
    match: (pathname) => pathname.includes("/dashboard/admin/users"),
    kicker: "User oversight",
    title: "Manage active brand and influencer accounts",
    description: "Review account health, disable risky access, and remove unsupported users without leaving the workspace.",
  },
  {
    match: (pathname) => pathname.includes("/dashboard/admin/campaigns"),
    kicker: "Campaign oversight",
    title: "Keep campaign delivery moving cleanly",
    description: "Track status, close stalled work, and protect the marketplace from dead or invalid campaign activity.",
  },
  {
    match: (pathname) => pathname.includes("/dashboard/admin/reports"),
    kicker: "Report review",
    title: "Approve performance reports with confidence",
    description: "Validate submitted metrics, review evidence, and clear the queue without losing campaign context.",
  },
  {
    match: (pathname) => pathname.includes("/dashboard/admin/messages"),
    kicker: "Support inbox",
    title: "Triage incoming contact requests quickly",
    description: "Keep public inquiries moving, surface unresolved threads, and mark follow-up as soon as it is handled.",
  },
];

const getNavMeta = (pathname) => navMeta.find((item) => item.match(pathname)) ?? navMeta[0];

const Navbar = ({ isSidebarOpen, onOpenSidebar, triggerRef }) => {
  const location = useLocation();
  const { user } = useAuth();
  const meta = getNavMeta(location.pathname);

  return (
    <nav className="ih-nav-shell sticky top-0 z-20 border-b backdrop-blur-xl">
      <div className="flex flex-wrap items-start justify-between gap-4 px-4 py-3 sm:px-6 lg:py-4">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <button
            ref={triggerRef}
            type="button"
            onClick={onOpenSidebar}
            aria-controls="dashboard-sidebar"
            aria-expanded={isSidebarOpen}
            aria-label="Open navigation menu"
            className="ih-dashboard-icon-button ih-focus-ring ih-text-secondary rounded-xl p-2 lg:hidden"
          >
            <Menu size={20} aria-hidden="true" />
          </button>

          <div className="min-w-0 max-w-3xl">
            <p className="ih-kicker ih-kicker-warm text-xs">
              {meta.kicker}
            </p>
            <h2 className="ih-text-primary mt-1 max-w-2xl text-base font-semibold sm:text-lg lg:text-xl">
              {meta.title}
            </h2>
            <p className="ih-text-muted mt-2 hidden max-w-2xl text-sm leading-6 lg:block">
              {meta.description}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="ih-pill-tint ih-pill-brand">{getRoleLabel(user?.role)}</span>
              <span className="ih-pill-tint ih-pill-emerald">Secure workspace</span>
              <span className="ih-pill-tint ih-pill-warm">{new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 self-stretch sm:self-start">
          <div className="ih-dashboard-profile hidden items-center gap-3 rounded-xl px-3 py-2 sm:flex">
            <div className="ih-icon-chip ih-icon-chip-success h-9 w-9 rounded-full">
              <ShieldCheck size={16} aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="ih-text-primary truncate text-sm font-medium">Admin session secured</p>
              <p className="ih-text-subtle truncate text-xs">{user?.email || "Signed in"}</p>
            </div>
          </div>

          <div className="ih-dashboard-profile flex items-center gap-3 rounded-xl px-3 py-2">
            <div className="ih-gradient-brand flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white">
              {getUserInitials(user)}
            </div>
            <div className="hidden min-w-0 sm:block">
              <p className="ih-text-primary truncate text-sm font-medium">{user?.displayName || "Admin"}</p>
              <p className="ih-text-subtle truncate text-xs">{user?.email || "Operations"}</p>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
