import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, X } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { useOverlayAccessibility } from "../../hooks/useOverlayAccessibility";
import { sidebarLinks } from "../../utils/sidebarLinks";
import { getRoleLabel, getUserInitials } from "../../utils/auth";
import { TransitionNavLink } from "../Motion/TransitionLink";
import { navigateWithOverdrive } from "../../utils/overdrive";

const Sidebar = ({ role, isOpen = false, onClose = () => {}, triggerRef }) => {
  const navigate = useNavigate();
  const asideRef = useRef(null);
  const closeButtonRef = useRef(null);
  const { logout, user } = useAuth();
  const activeRole = user?.role ?? role ?? "admin";
  const profileName = user?.displayName || user?.email || "InfluiX";
  const profileInitials = getUserInitials(user);

  useOverlayAccessibility({
    containerRef: asideRef,
    initialFocusRef: closeButtonRef,
    isOpen,
    lockBodyScroll: true,
    onClose,
    triggerRef,
  });

  const handleLogout = () => {
    logout();
    onClose();
    navigateWithOverdrive(navigate, "/auth/login");
  };

  const links = sidebarLinks[activeRole] || [];

  return (
    <>
      <button
        type="button"
        aria-label="Close sidebar"
        aria-hidden={!isOpen}
        tabIndex={isOpen ? 0 : -1}
        onClick={onClose}
        className={`fixed inset-0 z-30 transition-opacity duration-300 lg:hidden ${
          isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        style={{ backgroundColor: "var(--ih-bg-overlay)", backdropFilter: "blur(4px)" }}
      />

      <aside
        ref={asideRef}
        id="dashboard-sidebar"
        aria-label="Dashboard navigation"
        role={isOpen ? "dialog" : undefined}
        aria-modal={isOpen ? "true" : undefined}
        tabIndex={isOpen ? -1 : undefined}
        className={`ih-nav-panel fixed inset-y-0 left-0 z-40 flex w-[min(85vw,17.5rem)] flex-col transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] lg:h-full lg:w-64 lg:translate-x-0 lg:shadow-none ${
          isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"
        }`}
      >
        {/* Logo Section */}
        <div className="flex h-20 shrink-0 items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="ih-brand-mark flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-brand-400 text-white shadow-lg shadow-brand-500/20">
              <span className="text-xs font-bold tracking-widest">IH</span>
            </div>
            <span className="ih-text-primary text-lg font-bold tracking-tight">
              InfluiX
            </span>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Close navigation menu"
            className="ih-dashboard-icon-button flex items-center justify-center rounded-xl p-2 transition-all hover:bg-slate-100 lg:hidden"
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-4 scrollbar-thin scrollbar-thumb-slate-200">
          <div className="mb-4 px-2 text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400/80">
            Main Navigation
          </div>
          <div className="flex flex-col gap-1.5">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <TransitionNavLink
                  key={link.path}
                  to={link.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13.5px] font-medium transition-all duration-200 ${
                      isActive ? "ih-nav-link-active" : "ih-nav-link-inactive"
                    }`
                  }
                >
                  <div className="ih-surface-interactive flex h-8 w-8 items-center justify-center rounded-lg transition-transform group-hover:scale-105">
                    <Icon size={18} strokeWidth={2} />
                  </div>
                  <span className="flex-1">{link.name}</span>
                  
                  {link.badge && (
                    <span className="ih-sidebar-badge flex h-5 min-w-[1.25rem] items-center justify-center rounded-full px-1.5 text-[10px] font-bold uppercase tracking-wider">
                      {link.badge}
                    </span>
                  )}
                </TransitionNavLink>
              );
            })}
          </div>
        </nav>

        {/* Footer / User Profile Area */}
        <div className="mt-auto shrink-0 space-y-3 p-4">
          <div className="ih-sidebar-user flex items-center gap-3 rounded-2xl p-3">
            <div className="ih-gradient-brand flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white shadow-inner ring-4 ring-slate-50">
              {profileInitials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="ih-text-primary truncate text-[13.5px] font-semibold leading-tight">
                {profileName}
              </p>
              <p className="ih-text-subtle truncate text-[11px] font-medium capitalize">
                {getRoleLabel(activeRole)} Account
              </p>
            </div>
          </div>
          
          <button
            type="button"
            onClick={handleLogout}
            className="ih-danger-button-subtle ih-focus-ring group flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold"
          >
            <LogOut size={18} strokeWidth={2} className="transition-transform group-hover:rotate-12" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
