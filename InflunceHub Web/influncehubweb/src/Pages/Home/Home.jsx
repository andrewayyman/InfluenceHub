import React from "react";

import Footer from "../../components/layout/Footer";
import Navbar from "../../components/layout/Navbar";
import Hero from "./Hero";
import Services from "./Services";
import Subscription from "./Subscription";

const Home = () => {
  return (
    <div className="bg-gray-50">
      <Navbar />
      <Hero />
      <Services />
      <Subscription />
      <Footer />
    </div>
  );
};

export default Home;