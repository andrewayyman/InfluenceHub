import React, { useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { TransitionLink } from "../Motion/TransitionLink";
import { useOverlayAccessibility } from "../../hooks/useOverlayAccessibility";
import { prefersReducedMotion } from "../../utils/overdrive";

const navigationLinks = [
  { label: "Home", sectionId: "Hero" },
  { label: "Platform", sectionId: "services" },
  { label: "Briefing", sectionId: "Subscription" },
];

const Navbar = ({ showSectionLinks = true }) => {
  const [open, setOpen] = useState(false);
  const mobileMenuRef = useRef(null);
  const mobileToggleRef = useRef(null);

  useOverlayAccessibility({
    containerRef: mobileMenuRef,
    isOpen: open,
    lockBodyScroll: true,
    onClose: () => setOpen(false),
    triggerRef: mobileToggleRef,
  });

  const scrollToSection = (id) => {
    const section = document.getElementById(id);

    if (section) {
      section.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth" });
    }
  };

  const handleSectionClick = (sectionId) => {
    scrollToSection(sectionId);
    setOpen(false);
  };

  return (
    <nav className="ih-nav-shell fixed top-0 z-50 w-full border-b backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4">
        <div className="min-w-0">
          <TransitionLink to="/" className="ih-focus-ring inline-flex items-center gap-3 rounded-sm text-xl font-semibold tracking-[-0.03em] ih-text-primary sm:text-2xl">
            <span className="ih-brand-mark">IH</span>
            <span>Influix</span>
          </TransitionLink>
          <p className="ih-text-subtle mt-1 hidden text-xs tracking-[0.22em] uppercase sm:block">Campaign matching and reporting for MENA teams</p>
        </div>

        <div className={`hidden items-center md:flex ${showSectionLinks ? "gap-8" : "gap-0"}`}>
          {showSectionLinks ? (
            <div className="flex items-center gap-6">
              {navigationLinks.map((link) => (
                <button
                  key={link.label}
                  type="button"
                  onClick={() => handleSectionClick(link.sectionId)}
                  className="ih-link ih-focus-ring rounded-sm text-sm font-medium"
                >
                  {link.label}
                </button>
              ))}
            </div>
          ) : null}

          <div className="flex items-center gap-3">
            <TransitionLink to="/auth/login" className="ih-link-strong ih-focus-ring rounded-sm px-2 py-2 text-sm font-medium">
              Login
            </TransitionLink>
            <TransitionLink to="/auth/register" className="ih-button-primary ih-focus-ring rounded-xl px-5 py-2.5 text-sm font-semibold">
              Create account
            </TransitionLink>
          </div>
        </div>

        <button
          ref={mobileToggleRef}
          type="button"
          className="ih-focus-ring ih-text-primary rounded-lg p-2.5 md:hidden"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-controls="mobile-navigation"
          aria-haspopup="dialog"
          aria-label={open ? "Close navigation menu" : "Open navigation menu"}
        >
          {open ? <X size={28} aria-hidden="true" /> : <Menu size={28} aria-hidden="true" />}
        </button>
      </div>

      {open && (
        <div
          id="mobile-navigation"
          ref={mobileMenuRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="mobile-navigation-heading"
          tabIndex={-1}
          className="ih-nav-panel border-t px-6 py-6 md:hidden"
        >
          <p id="mobile-navigation-heading" className="ih-kicker mb-3">Site navigation</p>

          {showSectionLinks ? (
            <div className="space-y-2">
              {navigationLinks.map((link) => (
                <button
                  key={link.label}
                  type="button"
                  onClick={() => handleSectionClick(link.sectionId)}
                  className="ih-link ih-focus-ring block w-full rounded-sm py-2 text-left text-base"
                >
                  {link.label}
                </button>
              ))}
            </div>
          ) : null}

          <div className={`flex flex-col gap-3 ${showSectionLinks ? "ih-divider-top mt-5 pt-5" : "mt-2"}`}>
            <TransitionLink
              to="/auth/login"
              className="ih-button-secondary ih-focus-ring block rounded-xl px-4 py-3 text-center"
              onClick={() => setOpen(false)}
            >
              Login
            </TransitionLink>
            <TransitionLink
              to="/auth/register"
              className="ih-button-primary ih-focus-ring block rounded-xl px-4 py-3 text-center"
              onClick={() => setOpen(false)}
            >
              Create account
            </TransitionLink>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
