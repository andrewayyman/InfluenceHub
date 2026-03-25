import React from "react";

// Import social media icons from react-icons library
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa";

// Import Sparkles icon from lucide-react for the logo
import { Sparkles } from "lucide-react";

/*
  Footer Component
  ------------------------------------------------
  This component represents the footer section of the website.
  It contains:
  - Brand logo and description
  - Platform quick links
  - Company links
  - Newsletter subscription
  - Social media icons
  - Copyright section
*/

const Footer = () => {
  return (

    /*
      Main footer container
      Tailwind classes used for:
      - Dark background
      - Text color
      - Top border
      - Padding
    */
    <footer className="bg-[#0d0d12] text-gray-300 border-t border-white/10 pt-16 pb-8 px-6">

      {/* 
        Grid container for footer sections
        - max width center aligned
        - 4 columns on medium screens and above
        - responsive spacing
      */}
      <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-10">


        {/* =========================
            Logo + Brand Description
           ========================= */}
        <div>

          {/* Logo container */}
          <div className="flex items-center gap-2 mb-4">

            {/* Logo icon background */}
            <div className="bg-purple-600 p-2 rounded-lg">

              {/* Sparkles icon used as brand icon */}
              <Sparkles size={18} className="text-white"/>

            </div>

            {/* Brand name */}
            <h3 className="text-lg font-bold text-white">
              Influence<span className="text-purple-400">Hub</span>
            </h3>

          </div>

          {/* Brand description text */}
          <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
            Connecting brands with influencers to launch powerful marketing
            campaigns and grow audiences across the MENA region.
          </p>

        </div>


        {/* =========================
            Platform Quick Links
           ========================= */}
        <div>

          {/* Section title */}
          <h4 className="text-white font-semibold mb-4">
            Platform
          </h4>

          {/* Links list */}
          <ul className="space-y-3 text-sm">

            {/* Each list item represents a navigation link */}
            <li className="hover:text-purple-400 cursor-pointer transition">
              Discover Influencers
            </li>

            <li className="hover:text-purple-400 cursor-pointer transition">
              Campaigns
            </li>

            <li className="hover:text-purple-400 cursor-pointer transition">
              Analytics
            </li>

            <li className="hover:text-purple-400 cursor-pointer transition">
              Pricing
            </li>

          </ul>

        </div>


        {/* =========================
            Company Links
           ========================= */}
        <div>

          {/* Section title */}
          <h4 className="text-white font-semibold mb-4">
            Company
          </h4>

          {/* Links list */}
          <ul className="space-y-3 text-sm">

            <li className="hover:text-purple-400 cursor-pointer transition">
              About
            </li>

            <li className="hover:text-purple-400 cursor-pointer transition">
              Blog
            </li>

            <li className="hover:text-purple-400 cursor-pointer transition">
              Careers
            </li>

            <li className="hover:text-purple-400 cursor-pointer transition">
              Contact
            </li>

          </ul>

        </div>


        {/* =========================
            Newsletter + Social Media
           ========================= */}
        <div>

          {/* Section title */}
          <h4 className="text-white font-semibold mb-4">
            Stay Updated
          </h4>

          {/* Newsletter input + button */}
          <div className="flex mb-4">

            {/* Email input field */}
            <input
              type="email"
              placeholder="Your email"
              className="flex-1 px-3 py-2 rounded-l-lg bg-white/5 border border-white/10 text-sm focus:outline-none focus:border-purple-500"
            />

            {/* Subscribe button */}
            <button className="px-4 py-2 bg-gradient-to-r from-purple-600 to-emerald-500 text-white rounded-r-lg hover:opacity-90 transition">
              Join
            </button>

          </div>


          {/* Social media icons */}
          <div className="flex gap-3 text-lg">

            {/* Facebook icon */}
            <div className="p-2 bg-white/5 rounded-lg hover:bg-purple-600 transition cursor-pointer">
              <FaFacebook />
            </div>

            {/* Twitter icon */}
            <div className="p-2 bg-white/5 rounded-lg hover:bg-purple-600 transition cursor-pointer">
              <FaTwitter />
            </div>

            {/* Instagram icon */}
            <div className="p-2 bg-white/5 rounded-lg hover:bg-purple-600 transition cursor-pointer">
              <FaInstagram />
            </div>

            {/* LinkedIn icon */}
            <div className="p-2 bg-white/5 rounded-lg hover:bg-purple-600 transition cursor-pointer">
              <FaLinkedin />
            </div>

          </div>

        </div>

      </div>


      {/* =========================
          Bottom Footer Section
         ========================= */}
      <div className="mt-14 pt-6 border-t border-white/10 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">

        {/* Dynamic copyright year */}
        <p>
          © {new Date().getFullYear()} InfluenceHub. All rights reserved.
        </p>

        {/* Footer legal links */}
        <div className="flex gap-6 mt-4 md:mt-0">

          <span className="hover:text-purple-400 cursor-pointer">
            Privacy
          </span>

          <span className="hover:text-purple-400 cursor-pointer">
            Terms
          </span>

          <span className="hover:text-purple-400 cursor-pointer">
            Security
          </span>

        </div>

      </div>

    </footer>
  );
};

// Exporting the component so it can be used in other pages
export default Footer;