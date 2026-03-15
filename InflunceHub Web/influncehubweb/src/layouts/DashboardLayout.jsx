import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../Components/Layout/Navbar";
import Footer from "../Components/Layout/Footer";


const DashboardLayout = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 p-6 bg-gray-100">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default DashboardLayout;