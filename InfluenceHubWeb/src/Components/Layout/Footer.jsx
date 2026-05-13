import React from "react";
import { Instagram, Linkedin, Twitter } from "lucide-react";
import { TransitionLink } from "../Motion/TransitionLink";

const platformLinks = [
  { label: "Discovery", to: "/#Hero" },
  { label: "Campaigns", to: "/#services" },
  { label: "Reporting", to: "/#Subscription" },
];
const companyLinks = [
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
  { label: "Security", to: "/security" },
];
const legalLinks = [
  { label: "Privacy", to: "/privacy" },
  { label: "Terms", to: "/terms" },
];
const socialLinks = [
  { label: "Twitter", icon: Twitter },
  { label: "Instagram", icon: Instagram },
  { label: "LinkedIn", icon: Linkedin },
];

const Footer = () => {
  return (
    <footer className="ih-nav-panel relative overflow-hidden bg-slate-900 text-slate-300 pt-20 pb-10 border-t-0">
      {/* Decorative top border gradient */}
      <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-purple-500 via-emerald-500 to-amber-500"></div>
      
      {/* Background glow */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-[800px] h-[400px] bg-slate-800/50 rounded-full blur-[100px] pointer-events-none"></div>

      <div className="relative z-10 mx-auto max-w-7xl px-6">
        <div className="grid gap-12 lg:grid-cols-[1.5fr_1fr_1fr_1.2fr] lg:gap-16">
          
          <div className="max-w-md">
            <div className="mb-6 inline-flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white font-bold text-lg shadow-lg">IH</span>
              <span className="text-2xl font-bold tracking-tight text-white">InfluiX</span>
            </div>
            <h3 className="text-xl font-semibold tracking-tight text-slate-100 mb-4">
              Create campaigns, match influencers, and track results with one shared workflow.
            </h3>
            <p className="text-slate-400 text-base leading-relaxed">
              Built for brands, influencers, and admins who need clear approvals, reporting, and ROI visibility.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-50 mb-6">Platform</h4>
            <ul className="space-y-4">
              {platformLinks.map((link) => (
                <li key={link.label}>
                  <TransitionLink to={link.to} className="text-slate-400 hover:text-white transition-colors duration-200 font-medium text-base inline-flex items-center group">
                    <span className="w-0 h-0.5 bg-purple-500 mr-0 transition-all duration-300 group-hover:w-3 group-hover:mr-2 rounded-full"></span>
                    {link.label}
                  </TransitionLink>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-50 mb-6">Company</h4>
            <ul className="space-y-4">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <TransitionLink to={link.to} className="text-slate-400 hover:text-white transition-colors duration-200 font-medium text-base inline-flex items-center group">
                    <span className="w-0 h-0.5 bg-emerald-500 mr-0 transition-all duration-300 group-hover:w-3 group-hover:mr-2 rounded-full"></span>
                    {link.label}
                  </TransitionLink>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-bold uppercase tracking-wider text-slate-50 mb-6">Follow Us</h4>
            <div className="flex flex-wrap gap-4 text-lg mb-8">
              {socialLinks.map((socialLink) => (
                <button
                  key={socialLink.label}
                  type="button"
                  disabled
                  aria-disabled="true"
                  aria-label={socialLink.label}
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white hover:scale-110 transition-all duration-300 shadow-sm"
                  title="Official social profile coming soon"
                >
                  {React.createElement(socialLink.icon, {
                    "aria-hidden": "true",
                    size: 20,
                    strokeWidth: 2,
                  })}
                </button>
              ))}
            </div>
            <div className="p-4 rounded-2xl bg-slate-800/50 border border-slate-700/50 backdrop-blur-sm">
              <p className="text-slate-300 text-sm leading-relaxed mb-2 font-medium">Questions or partnerships:</p>
              <a href="mailto:contact@influix.com" className="text-amber-400 hover:text-amber-300 font-semibold transition-colors">contact@influix.com</a>
            </div>
          </div>
        </div>

        <div className="mt-20 pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-slate-500 text-sm font-medium">
            © {new Date().getFullYear()} InfluiX. All rights reserved.
          </p>

          <div className="flex flex-wrap items-center gap-8">
            {legalLinks.map((link) => (
              <TransitionLink key={link.label} to={link.to} className="text-slate-500 hover:text-slate-300 text-sm font-medium transition-colors">
                {link.label}
              </TransitionLink>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
