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
        className={`ih-nav-panel fixed inset-y-0 left-0 z-40 flex w-[min(85vw,17rem)] flex-col border-r shadow-2xl shadow-black/40 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] lg:sticky lg:top-0 lg:min-h-screen lg:w-64 lg:translate-x-0 lg:shadow-none ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo Section */}
        <div className="ih-divider-bottom flex h-16 shrink-0 items-center justify-between px-5">
          <div className="flex items-center gap-3">
            <span className="ih-brand-mark shrink-0">IH</span>
            <span className="ih-text-primary text-[15px] font-bold tracking-tight">
              InfluenceHub
            </span>
          </div>
          <button
            ref={closeButtonRef}
            type="button"
            onClick={onClose}
            aria-label="Close navigation menu"
            className="ih-dashboard-icon-button ih-focus-ring ih-text-secondary flex items-center justify-center rounded-[0.9rem] p-1.5 transition-colors hover:text-white lg:hidden"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5 sm:py-6">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <TransitionNavLink
                key={link.path}
                to={link.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `group flex items-center gap-3 rounded-[0.8rem] px-3 py-2.5 text-sm font-medium transition-all duration-200 ${
                    isActive ? "ih-nav-link-active" : "ih-nav-link-inactive"
                  }`
                }
              >
                <div className="ih-surface-interactive flex items-center justify-center rounded-md p-1.5">
                  <Icon size={18} strokeWidth={2} />
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

        {/* Footer / User Profile Area */}
        <div className="ih-divider-top px-4 py-4">
          <div className="ih-sidebar-user mb-3 flex items-center gap-3 rounded-[1.15rem] p-3 transition-colors">
            <div className="ih-gradient-brand flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white shadow-inner">
              {profileInitials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="ih-text-primary truncate text-sm font-medium">{profileName}</p>
              <p className="ih-text-subtle truncate text-xs capitalize">{getRoleLabel(activeRole)} Account</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="ih-danger-button-subtle ih-focus-ring flex w-full items-center gap-3 rounded-[0.8rem] px-3 py-2 text-sm font-medium"
          >
            <div className="flex items-center justify-center rounded-md p-1.5">
              <LogOut size={18} strokeWidth={2} />
            </div>
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
