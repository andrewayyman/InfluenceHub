import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const [open, setOpen] = useState(false);

  // دالة للـ smooth scroll
  const scrollToSection = (id) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <nav className="fixed w-full top-0 z-50 backdrop-blur-md bg-[#0F172A]/80 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">

        {/* Logo */}
        <Link
          to="/"
          className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-emerald-400 bg-clip-text text-transparent"
        >
          InfluenceHub
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-8 text-white/80">

          <Link to="/" className="hover:text-purple-400 transition">
            Home
          </Link>

          <button
            onClick={() => scrollToSection("services")}
            className="hover:text-purple-400 transition"
          >
            Services
          </button>

          <button
            onClick={() => scrollToSection("contact")}
            className="hover:text-purple-400 transition"
          >
            Contact
          </button>

          <Link
            to="/auth/login"
            className="px-4 py-2 rounded-lg border border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white transition"
          >
            Login
          </Link>

          <Link
            to="/auth/register"
            className="px-5 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-emerald-500 text-white hover:scale-105 transition"
          >
            Register
          </Link>

        </div>

        {/* Mobile Button */}
        <button
          className="md:hidden text-white"
          onClick={() => setOpen(!open)}
        >
          {open ? <X size={28} /> : <Menu size={28} />}
        </button>

      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden bg-[#0F172A] border-t border-white/10 px-6 py-6 space-y-4 text-white">

          <Link to="/" className="block hover:text-purple-400"onClick={() => { scrollToSection("Hero"); setOpen(false); }}>
            Home
          </Link>

          <button
            onClick={() => { scrollToSection("services"); setOpen(false); }}
            className="block hover:text-purple-400"
          >
            Services
          </button>

          <button
            onClick={() => { scrollToSection("Subscription"); setOpen(false); }}
            className="block hover:text-purple-400"
          >
            Contact
          </button>

          <Link
            to="/auth/login"
            className="block px-4 py-2 rounded-lg border border-purple-500 text-purple-400 text-center"
            onClick={() => setOpen(false)}
          >
            Login
          </Link>

          <Link
            to="/auth/register"
            className="block px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-emerald-500 text-center"
            onClick={() => setOpen(false)}
          >
            Register
          </Link>

        </div>
      )}
    </nav>
  );
};

export default Navbar;