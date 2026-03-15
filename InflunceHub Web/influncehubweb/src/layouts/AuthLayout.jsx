import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";

const AuthLayout = () => {
  return (
    <div >
      <div >
        <Navbar />
        <Outlet />
        <Footer />
      </div>
    </div>
  );
};

export default AuthLayout;