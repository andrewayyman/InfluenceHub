import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../Components/Layout/Navbar";
import Footer from "../Components/Layout/Footer";


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