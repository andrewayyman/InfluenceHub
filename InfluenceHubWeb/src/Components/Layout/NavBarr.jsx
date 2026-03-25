import React from "react";
import { Search, Bell, User } from "lucide-react";

const Navbar = () => {
  return (
    <nav className="h-16 w-full flex items-center justify-between px-6 bg-[#0d0d12]/80 backdrop-blur-xl border-b border-white/10">

      {/* Search */}
      <div className="relative w-72">

        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
        />

        <input
          type="text"
          placeholder="Search..."
          className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white placeholder-gray-400 focus:outline-none focus:border-purple-500 transition"
        />

      </div>

      {/* Right Side */}
      <div className="flex items-center gap-6">

        {/* Notifications */}
        <button className="relative p-2 rounded-lg bg-white/5 hover:bg-white/10 transition">

          <Bell size={20} className="text-gray-300" />

          {/* Badge */}
          <span className="absolute -top-1 -right-1 bg-purple-600 text-white text-xs w-5 h-5 flex items-center justify-center rounded-full">
            3
          </span>

        </button>

        {/* Profile */}
        <div className="flex items-center gap-3 cursor-pointer bg-white/5 px-3 py-2 rounded-lg hover:bg-white/10 transition">

          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-emerald-400 flex items-center justify-center text-white text-sm font-bold">
            A
          </div>

          <span className="text-sm text-gray-200 hidden md:block">
            Admin
          </span>

        </div>

      </div>

    </nav>
  );
};

export default Navbar;