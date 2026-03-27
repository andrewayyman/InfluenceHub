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
  const profileName = user?.displayName || user?.email || "InfluenceHub";
  const profileInitials = getUserInitials(user);

  useOverlayAccessibility({
    containerRef: asideRef,
    initialFocusRef: closeButtonRef,
    isOpen,
    lockBodyScroll: true,
    onClose,
    triggerRef,
  });

  // Logout function: remove token and redirect to login
  const handleLogout = () => {
    logout();
    onClose();
    navigateWithOverdrive(navigate, "/auth/login");
  };

  // Get links for current role
  const links = sidebarLinks[activeRole] || [];

  return (
    <>
      <button
        type="button"
        aria-label="Close sidebar"
        aria-hidden={!isOpen}
        tabIndex={isOpen ? 0 : -1}
        onClick={onClose}
        className={`fixed inset-0 z-30 backdrop-blur-sm transition-opacity duration-200 lg:hidden ${
          isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        style={{ backgroundColor: "var(--ih-bg-overlay)" }}
      />

      <aside
        ref={asideRef}
        id="dashboard-sidebar"
        aria-label="Dashboard navigation"
        role={isOpen ? "dialog" : undefined}
        aria-modal={isOpen ? "true" : undefined}
        tabIndex={isOpen ? -1 : undefined}
        className={`ih-nav-panel fixed inset-y-0 left-0 z-40 flex w-[min(85vw,18rem)] flex-col border-r shadow-2xl shadow-black/40 transition-transform duration-300 ease-out lg:sticky lg:top-0 lg:min-h-screen lg:w-64 lg:translate-x-0 lg:shadow-none ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >

        {/* ===== Logo / Branding ===== */}
        <div className="ih-divider-bottom flex items-center gap-3 px-5 py-5 sm:px-6 sm:py-6">
          <span className="ih-brand-mark shrink-0">IH</span>
          <div className="min-w-0">
            <h1 className="ih-text-primary text-lg font-bold">
              InfluenceHub
            </h1>
            <p className="ih-text-subtle truncate text-xs">Growth command center</p>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Close navigation menu"
            className="ih-dashboard-icon-button ih-focus-ring ih-text-secondary rounded-xl p-2 lg:hidden"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <div className="px-4 pt-4 sm:px-5">
          <div className="ih-sidebar-status rounded-[1.35rem] p-4">
            <p className="ih-kicker ih-kicker-warm mb-2">Operations focus</p>
            <p className="text-sm leading-6 text-white">
              Keep platform trust high by reviewing reports, responding to contact requests, and removing friction from campaign delivery.
            </p>
            <div className="mt-4 flex flex-wrap gap-2.5">
              <span className="ih-pill-tint ih-pill-brand">Marketplace trust</span>
              <span className="ih-pill-tint ih-pill-emerald">Admin controls</span>
            </div>
          </div>
        </div>

        {/* ===== Navigation Menu ===== */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5 sm:px-4 sm:py-6">
          <p className="ih-text-subtle mb-2 px-3 text-xs uppercase tracking-[0.22em]">
            Main Menu
          </p>

          {/* Loop through links and render NavLink for each */}
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <TransitionNavLink
                key={link.path}
                to={link.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `group flex items-center gap-3 rounded-xl px-3 py-3 text-sm transition ${
                    isActive
                      ? "ih-nav-link-active"
                      : "ih-nav-link-inactive"
                  }`
                }
              >
                <div className="ih-surface-interactive rounded-md p-2">
                  <Icon size={16} />
                </div>

                <span className="flex-1">{link.name}</span>

                {link.badge && (
                  <span className="ih-sidebar-badge rounded-full px-2 py-0.5 text-xs">
                    {link.badge}
                  </span>
                )}
              </TransitionNavLink>
            );
          })}
        </nav>

        {/* ===== User Profile ===== */}
        <div className="ih-divider-top p-4">
          <div className="ih-sidebar-user flex items-center gap-3 rounded-[1.15rem] p-3">
            <div className="ih-gradient-brand flex h-9 w-9 items-center justify-center rounded-full font-bold text-white">
              {profileInitials}
            </div>

            <div className="min-w-0 flex-1">
              <p className="ih-text-primary truncate text-sm font-medium">{profileName}</p>
              {user?.email ? (
                <p className="ih-text-subtle truncate text-xs">{user.email}</p>
              ) : null}
              <div className="mt-1">
                <span className="ih-pill-tint ih-pill-brand text-xs capitalize">{getRoleLabel(activeRole)}</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="ih-danger-button-subtle ih-focus-ring mt-4 flex w-full items-center gap-3 rounded-lg px-3 py-2"
          >
            <div className="ih-surface-interactive rounded-md p-2">
              <LogOut size={16} />
            </div>
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
