import React, { useState } from "react";

// Link is used for navigation between pages without page reload (React Router)
import { Link } from "react-router-dom";

// Icons used for mobile menu toggle (hamburger / close icon)
import { Menu, X } from "lucide-react";

/*
  Navbar Component
  ------------------------------------------------
  This component represents the main navigation bar of the website.

  Features:
  - Responsive design (Desktop + Mobile)
  - React Router navigation
  - Smooth scrolling to page sections
  - Mobile menu toggle
*/

const Navbar = () => {

  /*
    State to control mobile menu visibility
    open = true  -> mobile menu is visible
    open = false -> mobile menu is hidden
  */
  const [open, setOpen] = useState(false);

  /*
    Function: scrollToSection
    ----------------------------------------
    Used to scroll smoothly to a specific section in the page.

    Steps:
    1. Find the section using document.getElementById
    2. If the section exists → scroll to it smoothly
  */
  const scrollToSection = (id) => {
    const section = document.getElementById(id);

    if (section) {
      section.scrollIntoView({
        behavior: "smooth"
      });
    }
  };

  return (

    /*
      Main navbar container
      - fixed position so it stays at the top
      - backdrop blur effect
      - dark transparent background
      - border bottom
    */
    <nav className="fixed w-full top-0 z-50 backdrop-blur-md bg-[#0F172A]/80 border-b border-white/10">

      {/* Navbar content wrapper */}
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">


        {/* =========================
            Logo / Brand Name
           ========================= */}

        <Link
          to="/"
          className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-emerald-400 bg-clip-text text-transparent"
        >
          InfluenceHub
        </Link>



        {/* =========================
            Desktop Navigation Menu
           ========================= */}

        {/* 
          Hidden on small screens
          Visible on medium screens and above (md:flex)
        */}
        <div className="hidden md:flex items-center gap-8 text-white/80">

          {/* Home link */}
          <Link
            to="/"
            className="hover:text-purple-400 transition"
          >
            Home
          </Link>


          {/* Scroll to Services section */}
          <button
            onClick={() => scrollToSection("services")}
            className="hover:text-purple-400 transition"
          >
            Services
          </button>


          {/* Scroll to Contact section */}
          <button
            onClick={() => scrollToSection("contact")}
            className="hover:text-purple-400 transition"
          >
            Contact
          </button>


          {/* Login page navigation */}
          <Link
            to="/auth/login"
            className="px-4 py-2 rounded-lg border border-purple-500 text-purple-400 hover:bg-purple-500 hover:text-white transition"
          >
            Login
          </Link>


          {/* Register page navigation */}
          <Link
            to="/auth/register"
            className="px-5 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-emerald-500 text-white hover:scale-105 transition"
          >
            Register
          </Link>

        </div>



        {/* =========================
            Mobile Menu Toggle Button
           ========================= */}

        <button
          className="md:hidden text-white"
          onClick={() => setOpen(!open)} // Toggle mobile menu
        >

          {/* 
            If menu is open → show close icon (X)
            If menu is closed → show hamburger icon (Menu)
          */}
          {open ? <X size={28} /> : <Menu size={28} />}

        </button>

      </div>



      {/* =========================
          Mobile Navigation Menu
         ========================= */}

      {/* 
        Render this menu ONLY if open === true
        This is called Conditional Rendering
      */}
      {open && (

        <div className="md:hidden bg-[#0F172A] border-t border-white/10 px-6 py-6 space-y-4 text-white">

          {/* Home */}
          <Link
            to="/"
            className="block hover:text-purple-400"
            onClick={() => {
              scrollToSection("Hero");
              setOpen(false); // close menu after clicking
            }}
          >
            Home
          </Link>


          {/* Services */}
          <button
            onClick={() => {
              scrollToSection("services");
              setOpen(false);
            }}
            className="block hover:text-purple-400"
          >
            Services
          </button>


          {/* Contact */}
          <button
            onClick={() => {
              scrollToSection("Subscription");
              setOpen(false);
            }}
            className="block hover:text-purple-400"
          >
            Contact
          </button>


          {/* Login */}
          <Link
            to="/auth/login"
            className="block px-4 py-2 rounded-lg border border-purple-500 text-purple-400 text-center"
            onClick={() => setOpen(false)}
          >
            Login
          </Link>


          {/* Register */}
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

// Exporting the Navbar component so it can be used in other pages/layouts
export default Navbar;