import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../Components/Layout/Navbar";
import Footer from "../Components/Layout/Footer";


const AuthLayout = () => {
  return (
    <div className="ih-app-shell min-h-screen">
      <div className="min-h-screen">
        <a href="#auth-content" className="ih-skip-link">
          Skip to auth content
        </a>
        <Navbar showSectionLinks={false} />
        <main id="auth-content">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
};

export default AuthLayout;
