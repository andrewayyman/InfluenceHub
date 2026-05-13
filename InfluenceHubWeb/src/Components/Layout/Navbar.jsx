import React, { useRef, useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { TransitionLink } from "../Motion/TransitionLink";
import { useOverlayAccessibility } from "../../hooks/useOverlayAccessibility";
import { prefersReducedMotion } from "../../utils/overdrive";
import { motion, AnimatePresence } from "framer-motion";

const navigationLinks = [
  { label: "Home", sectionId: "Hero" },
  { label: "Platform", sectionId: "services" },
  { label: "Briefing", sectionId: "Subscription" },
];

const Navbar = ({ showSectionLinks = true }) => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const mobileMenuRef = useRef(null);
  const mobileToggleRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
    <nav 
      className={`fixed top-0 z-50 w-full transition-all duration-300 ${
        scrolled 
          ? "bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-sm" 
          : "bg-transparent border-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4">
        <div className="min-w-0">
          <TransitionLink to="/" className="ih-focus-ring group inline-flex items-center gap-3 rounded-xl text-xl font-bold tracking-tight text-slate-900 sm:text-2xl transition-transform hover:scale-[1.02]">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white shadow-md group-hover:shadow-lg transition-shadow">
              IH
            </span>
            <span className="bg-gradient-to-br from-slate-900 to-slate-700 bg-clip-text text-transparent">InfluiX</span>
          </TransitionLink>
        </div>

        <div className={`hidden items-center md:flex ${showSectionLinks ? "gap-8" : "gap-0"}`}>
          {showSectionLinks ? (
            <div className="flex items-center gap-2 bg-slate-100/50 backdrop-blur-md px-2 py-1.5 rounded-2xl border border-slate-200/50">
              {navigationLinks.map((link) => (
                <button
                  key={link.label}
                  type="button"
                  onClick={() => handleSectionClick(link.sectionId)}
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-white transition-all shadow-sm shadow-transparent hover:shadow-slate-200/50"
                >
                  {link.label}
                </button>
              ))}
            </div>
          ) : null}

          <div className="flex items-center gap-4 ml-2">
            <TransitionLink to="/auth/login" className="text-sm font-semibold text-slate-600 hover:text-purple-600 transition-colors px-2 py-2">
              Sign In
            </TransitionLink>
            <TransitionLink to="/auth/register" className="ih-focus-ring inline-flex items-center justify-center rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-bold text-white shadow-md hover:bg-slate-800 transition-all hover:scale-105 active:scale-95">
              Start Free
            </TransitionLink>
          </div>
        </div>

        <button
          ref={mobileToggleRef}
          type="button"
          className="ih-focus-ring text-slate-700 hover:bg-slate-100 rounded-xl p-2.5 md:hidden transition-colors"
          onClick={() => setOpen(!open)}
          aria-expanded={open}
          aria-controls="mobile-navigation"
          aria-haspopup="dialog"
          aria-label={open ? "Close navigation menu" : "Open navigation menu"}
        >
          {open ? <X size={26} aria-hidden="true" /> : <Menu size={26} aria-hidden="true" />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            id="mobile-navigation"
            ref={mobileMenuRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="mobile-navigation-heading"
            tabIndex={-1}
            className="border-t border-slate-200/60 bg-white/95 backdrop-blur-2xl px-6 py-6 md:hidden shadow-2xl overflow-hidden"
          >
            <p id="mobile-navigation-heading" className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">Navigation</p>

            {showSectionLinks ? (
              <div className="space-y-2 mb-6">
                {navigationLinks.map((link) => (
                  <button
                    key={link.label}
                    type="button"
                    onClick={() => handleSectionClick(link.sectionId)}
                    className="block w-full rounded-xl px-4 py-3 text-left text-lg font-semibold text-slate-700 hover:bg-slate-50 hover:text-purple-600 transition-colors"
                  >
                    {link.label}
                  </button>
                ))}
              </div>
            ) : null}

            <div className={`flex flex-col gap-3 ${showSectionLinks ? "border-t border-slate-100 pt-6" : ""}`}>
              <TransitionLink
                to="/auth/login"
                className="w-full block rounded-xl border-2 border-slate-200 px-4 py-3.5 text-center text-base font-bold text-slate-700 hover:border-purple-200 hover:bg-purple-50 hover:text-purple-700 transition-colors"
                onClick={() => setOpen(false)}
              >
                Sign In
              </TransitionLink>
              <TransitionLink
                to="/auth/register"
                className="w-full block rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-3.5 text-center text-base font-bold text-white shadow-md hover:shadow-lg transition-all"
                onClick={() => setOpen(false)}
              >
                Create Account
              </TransitionLink>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
