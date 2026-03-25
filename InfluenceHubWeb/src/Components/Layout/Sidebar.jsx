import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { LogOut, Sparkles } from "lucide-react";
import { sidebarLinks } from "../../utils/sidebarLinks";

// Temporary user data (replace with real auth system later)
const user = {
  name: "Alex Kim",
  initials: "AK",
  role: "admin", // "admin" | "brand" | "influencer"
};

const Sidebar = () => {
  const navigate = useNavigate();

  // Logout function: remove token and redirect to login
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/auth/login");
  };

  // Get links for current role
  const links = sidebarLinks[user.role] || [];

  return (
    <aside className="w-64 min-h-screen bg-[#0d0d12] text-gray-300 flex flex-col border-r border-white/10">

      {/* ===== Logo / Branding ===== */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-white/10">
        <div className="bg-purple-600 p-2 rounded-lg">
          <Sparkles size={18} className="text-white" />
        </div>
        <h1 className="font-bold text-white text-lg">
          Influence<span className="text-purple-400">Hub</span>
        </h1>
        <span className="ml-auto text-[10px] bg-purple-600 px-2 py-0.5 rounded-full text-white">
          PRO
        </span>
      </div>

      {/* ===== Navigation Menu ===== */}
      <nav className="flex-1 px-3 py-6 space-y-1">
        <p className="text-xs uppercase text-gray-500 px-3 mb-2">Main Menu</p>

        {/* Loop through links and render NavLink for each */}
        {links.map((link) => {
          const Icon = link.icon; // Extract icon component
          return (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${
                  isActive ? "bg-purple-600/20 text-white" : "hover:bg-white/5"
                }`
              }
            >
              {/* Icon container */}
              <div className="bg-white/5 p-2 rounded-md">
                <Icon size={16} />
              </div>

              {/* Link name */}
              <span className="flex-1">{link.name}</span>

              {/* Optional badge */}
              {link.badge && (
                <span className="text-xs bg-purple-600 px-2 py-0.5 rounded-full text-white">
                  {link.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* ===== User Profile ===== */}
      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl">
          {/* Avatar */}
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-teal-400 flex items-center justify-center text-white font-bold">
            {user.initials}
          </div>

          {/* User info */}
          <div className="flex-1">
            <p className="text-sm text-white font-medium">{user.name}</p>
            <p className="text-xs text-gray-500">{user.role}</p>
          </div>
        </div>

        {/* Logout button */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 mt-4 w-full px-3 py-2 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition"
        >
          <div className="bg-white/5 p-2 rounded-md">
            <LogOut size={16} />
          </div>
          Sign Out
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;