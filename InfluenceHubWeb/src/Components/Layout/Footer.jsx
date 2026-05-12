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
    <footer className="ih-nav-panel border-t px-6 pb-8 pt-14 sm:pt-16">
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[minmax(0,1.2fr)_repeat(3,minmax(0,0.55fr))]">
        <div className="max-w-md">
          <div className="mb-4 inline-flex items-center gap-3">
            <span className="ih-brand-mark">IH</span>
            <p className="ih-kicker ih-kicker-warm">InfluiX</p>
          </div>
          <h3 className="text-2xl font-semibold tracking-[-0.04em] ih-text-primary">Create campaigns, match influencers, and track results with one shared workflow.</h3>
          <p className="ih-text-muted mt-4 text-sm leading-7 sm:text-base">
            Built for brands, influencers, and admins who need clear approvals, reporting, and ROI visibility.
          </p>
        </div>

        <div>
          <h4 className="ih-footer-heading">Platform</h4>
          <ul className="mt-4 space-y-3 text-sm">
            {platformLinks.map((link) => (
              <li key={link.label}>
                <TransitionLink to={link.to} className="ih-link ih-focus-ring rounded-sm text-left">
                  {link.label}
                </TransitionLink>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="ih-footer-heading">Company</h4>
          <ul className="mt-4 space-y-3 text-sm">
            {companyLinks.map((link) => (
              <li key={link.label}>
                <TransitionLink to={link.to} className="ih-link ih-focus-ring rounded-sm text-left">
                  {link.label}
                </TransitionLink>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="ih-footer-heading">Follow</h4>
          <div className="mt-4 flex flex-wrap gap-3 text-lg">
            {socialLinks.map((socialLink) => (
              <button
                key={socialLink.label}
                type="button"
                disabled
                aria-disabled="true"
                aria-label={socialLink.label}
                className="ih-social-button ih-focus-ring rounded-full"
                title="Official social profile coming soon"
              >
                {React.createElement(socialLink.icon, {
                  "aria-hidden": "true",
                  size: 18,
                  strokeWidth: 1.9,
                })}
              </button>
            ))}
          </div>
          <p className="ih-text-subtle mt-5 text-sm leading-6">Questions or partnership inquiries: contact@influix.com</p>
          <p className="ih-text-subtle mt-2 text-xs leading-6">Official social profiles will be published after launch hardening.</p>
        </div>
      </div>

      <div className="ih-divider-top ih-text-subtle mt-14 flex flex-col items-start justify-between gap-4 pt-6 text-sm md:flex-row md:items-center">
        <p>© {new Date().getFullYear()} InfluiX. All rights reserved.</p>

        <div className="flex flex-wrap gap-6">
          {legalLinks.map((link) => (
            <TransitionLink key={link.label} to={link.to} className="ih-link ih-focus-ring rounded-sm text-sm">
              {link.label}
            </TransitionLink>
          ))}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
