import React from "react";
import { Menu, ChevronDown, Plus, Search, Users as UsersIcon } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { getRoleLabel, getUserInitials } from "../../utils/auth";
import { TransitionLink } from "../Motion/TransitionLink";

const getPageTitle = (pathname) => {
  const parts = pathname.split('/').filter(Boolean);
  if (parts.length <= 2) return "Overview";
  
  const lastPart = parts[parts.length - 1];
  if (lastPart === 'create-campaign') return 'New Campaign';
  if (lastPart === 'profile') return 'My Profile';
  
  return lastPart.charAt(0).toUpperCase() + lastPart.slice(1).replace('-', ' ');
};

const getRoleAction = (role) => {
  switch (role) {
    case "brand":
      return { label: "New Campaign", icon: Plus, to: "/dashboard/brand/create-campaign" };
    case "influencer":
      return { label: "Discover Campaigns", icon: Search, to: "/dashboard/influencer/suggested" };
    case "admin":
      return { label: "Manage Users", icon: UsersIcon, to: "/dashboard/admin/users" };
    default:
      return null;
  }
};

const Navbar = ({ isSidebarOpen, onOpenSidebar, triggerRef }) => {
  const location = useLocation();
  const { user } = useAuth();
  const role = user?.role || "admin";
  
  const pageTitle = getPageTitle(location.pathname);
  const action = getRoleAction(role);

  return (
    <nav className="ih-nav-shell sticky top-0 z-20 flex h-16 w-full items-center justify-between border-b backdrop-blur-xl px-4 sm:px-6 lg:px-12">
      <div className="flex items-center gap-4">
        <button
          ref={triggerRef}
          type="button"
          onClick={onOpenSidebar}
          aria-controls="dashboard-sidebar"
          aria-expanded={isSidebarOpen}
          aria-label="Open navigation menu"
          className="ih-dashboard-icon-button ih-focus-ring ih-text-secondary flex items-center justify-center rounded-xl lg:hidden"
        >
          <Menu size={20} aria-hidden="true" />
        </button>

        {/* Breadcrumb Path */}
        <div className="hidden items-center text-sm font-medium sm:flex">
          <span className="ih-text-subtle cursor-default">Dashboard</span>
          <span className="ih-text-subtle mx-2 opacity-50">/</span>
          <span className="ih-text-primary cursor-default">{pageTitle}</span>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        {/* Primary Quick Action Button */}
        {action && (
          <TransitionLink
            to={action.to}
            className="ih-button-primary ih-focus-ring hidden items-center gap-2 px-4 py-2 text-sm sm:flex"
          >
            <action.icon size={16} />
            {action.label}
          </TransitionLink>
        )}

        {/* Separator */}
        <div className="hidden h-6 w-px bg-slate-100 sm:block"></div>

        {/* Profile Menu Block */}
        <button className="ih-dashboard-profile ih-focus-ring flex items-center gap-3 rounded-xl px-3 py-2 transition-transform hover:scale-[1.02]">
          <div className="ih-gradient-brand flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ih-text-primary shadow-[0_0_0_1px_rgba(255,255,255,0.1)]">
            {getUserInitials(user)}
          </div>
          <div className="hidden text-left sm:block min-w-0">
            <p className="ih-text-primary text-sm font-medium truncate">
              {user?.displayName || getRoleLabel(user?.role)}
            </p>
          </div>
          <ChevronDown size={14} className="ih-text-subtle hidden sm:block" />
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
