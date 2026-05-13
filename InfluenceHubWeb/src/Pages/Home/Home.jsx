import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import Footer from "../../Components/Layout/Footer";
import Navbar from "../../Components/Layout/Navbar";
import Hero from "./Hero";
import Services from "./Services";
import Subscription from "./Subscription";
import { prefersReducedMotion } from "../../utils/overdrive";
import { motion } from "framer-motion";

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
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="ih-home-shell ih-page-shell relative min-h-screen overflow-hidden bg-slate-50"
    >
      <a href="#main-content" className="ih-skip-link">
        Skip to main content
      </a>

      {/* Global subtle background patterns */}
      <div aria-hidden="true" className="ih-home-atmosphere pointer-events-none opacity-50" />
      <div aria-hidden="true" className="ih-home-grid pointer-events-none opacity-20" />

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />
        <main id="main-content" className="flex-grow">
          <Hero />
          <Services />
          <Subscription />
        </main>
        <Footer />
      </div>
    </motion.div>
  );
};

export default Home;
