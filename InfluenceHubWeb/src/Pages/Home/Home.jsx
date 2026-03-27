import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Footer from "../../Components/Layout/Footer";
import Navbar from "../../Components/Layout/Navbar";
import Hero from "./Hero";
import Services from "./Services";
import Subscription from "./Subscription";
import { prefersReducedMotion } from "../../utils/overdrive";

const Home = () => {
  const location = useLocation();

  useEffect(() => {
    if (!location.hash) {
      return;
    }

    const sectionId = decodeURIComponent(location.hash.slice(1));
    const scrollToHash = () => {
      const section = document.getElementById(sectionId);

      if (section) {
        section.scrollIntoView({ behavior: prefersReducedMotion() ? "auto" : "smooth", block: "start" });
      }
    };

    window.requestAnimationFrame(scrollToHash);
  }, [location.hash]);

  return (
    <div className="ih-home-shell ih-page-shell ih-motion-stage relative min-h-screen overflow-hidden">
      <a href="#main-content" className="ih-skip-link">
        Skip to main content
      </a>

      <div aria-hidden="true" className="ih-home-atmosphere pointer-events-none" />
      <div aria-hidden="true" className="ih-home-grid pointer-events-none" />
      <div aria-hidden="true" className="ih-home-sheen pointer-events-none" />
      <div aria-hidden="true" className="ih-home-orb ih-home-orb-plum pointer-events-none" />
      <div aria-hidden="true" className="ih-home-orb ih-home-orb-emerald pointer-events-none" />
      <div aria-hidden="true" className="ih-home-orb ih-home-orb-warm pointer-events-none" />

      <div className="relative z-10">
        <Navbar />
        <main id="main-content">
          <Hero />
          <Services />
          <Subscription />
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default Home;
