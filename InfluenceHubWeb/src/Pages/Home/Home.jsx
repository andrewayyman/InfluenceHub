import React from "react";

/*
  Layout Components
  ------------------------------------------------
  These components are shared across multiple pages
  such as the main navigation bar and the footer.
*/
import Footer from "../../components/layout/Footer";
import Navbar from "../../components/layout/Navbar";

/*
  Page Sections
  ------------------------------------------------
  These components represent different sections
  of the landing page.
*/
import Hero from "./Hero";
import Services from "./Services";
import Subscription from "./Subscription";

/*
  Home Component
  ------------------------------------------------
  This component represents the main landing page
  of the website.

  Structure:
  1. Navbar (top navigation)
  2. Hero Section (main introduction)
  3. Services Section (platform features)
  4. Subscription Section (pricing / plans)
  5. Footer (site information and links)
*/

const Home = () => {
  return (

    /*
      Main Page Container
      - Light background color
      - Wraps the entire landing page content
    */
    <div className="bg-gray-50">

      {/* Top navigation bar */}
      <Navbar />

      {/* Hero section (first section users see) */}
      <Hero />

      {/* Services section explaining platform features */}
      <Services />

      {/* Subscription / Pricing plans section */}
      <Subscription />

      {/* Footer section */}
      <Footer />

    </div>
  );
};

export default Home;