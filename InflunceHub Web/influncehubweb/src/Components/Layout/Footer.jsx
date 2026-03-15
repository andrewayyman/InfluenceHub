import React from "react";
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="relative bg-[#0F172A] text-white pt-16 pb-10 px-6 border-t border-white/10">

      <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-10">

        {/* Logo + Description */}
        <div>
          <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-emerald-400 bg-clip-text text-transparent mb-4">
            InfluenceHub
          </h3>

          <p className="text-white/70 leading-relaxed max-w-sm">
            Connecting brands with influencers to launch powerful marketing
            campaigns and grow audiences across the MENA region.
          </p>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-lg font-semibold mb-4">Quick Links</h4>

          <ul className="space-y-3 text-white/70">
            <li className="hover:text-purple-400 transition cursor-pointer">Home</li>
            <li className="hover:text-purple-400 transition cursor-pointer">Services</li>
            <li className="hover:text-purple-400 transition cursor-pointer">Creators</li>
            <li className="hover:text-purple-400 transition cursor-pointer">Brands</li>
            <li className="hover:text-purple-400 transition cursor-pointer">Contact</li>
          </ul>
        </div>

        {/* Social Media */}
        <div>
          <h4 className="text-lg font-semibold mb-4">Follow Us</h4>

          <div className="flex gap-4 text-xl">

            <div className="p-3 bg-white/10 rounded-xl hover:bg-purple-500 transition cursor-pointer">
              <FaFacebook />
            </div>

            <div className="p-3 bg-white/10 rounded-xl hover:bg-purple-500 transition cursor-pointer">
              <FaTwitter />
            </div>

            <div className="p-3 bg-white/10 rounded-xl hover:bg-purple-500 transition cursor-pointer">
              <FaInstagram />
            </div>

            <div className="p-3 bg-white/10 rounded-xl hover:bg-purple-500 transition cursor-pointer">
              <FaLinkedin />
            </div>

          </div>

        </div>

      </div>

      {/* Bottom Bar */}
      <div className="mt-12 pt-6 border-t border-white/10 text-center text-white/50 text-sm">
        © {new Date().getFullYear()} InfluenceHub. All rights reserved.
      </div>

    </footer>
  );
};

export default Footer;