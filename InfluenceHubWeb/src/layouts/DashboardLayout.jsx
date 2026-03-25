import React from "react";

// Outlet is used to render the child routes inside this layout
import { Outlet } from "react-router-dom";

// Importing layout components
import Sidebar from "../Components/Layout/Sidebar";
import NavBarr from "../Components/Layout/NavBarr";
import Footer from "../Components/Layout/Footer";

/*
  DashboardLayout Component
  ------------------------------------------------
  This layout is used for all dashboard pages.

  Structure of the layout:
  ├── Sidebar (left side navigation)
  └── Right Section
      ├── Navbar (top navigation)
      ├── Page Content (Outlet)
      └── Footer

  The <Outlet /> is where nested routes will render.
*/

const DashboardLayout = () => {

  /*
    Temporary role variable

    This will later come from:
    - Authentication system
    - JWT token
    - Context / Global state

    It will control:
    - Sidebar menu items
    - Page access permissions
  */
  const role = "admin"; // temporary until login system is implemented

  return (

    /*
      Main Layout Container
      - Flex layout
      - Minimum full screen height
      - Light dashboard background
    */

    <div className="flex min-h-screen bg-gray-100">


      {/* =========================
          Sidebar Section
         ========================= */}

      {/*
        Sidebar receives the user role
        so it can render role-based navigation links
      */}
      <Sidebar role={role} />


      {/* =========================
          Right Content Area
         ========================= */}

      <div className="flex flex-col flex-1">

        {/* Top Navigation Bar */}
        <NavBarr />


        {/* =========================
            Page Content
           ========================= */}

        {/*
          Outlet renders the current page
          Example:
          /dashboard → DashboardPage
          /campaigns → CampaignsPage
          /analytics → AnalyticsPage
        */}

        <main className="flex-1">
          <Outlet />
        </main>


        {/* =========================
            Footer Section
           ========================= */}

        <Footer />

      </div>

    </div>
  );
};

// Export layout to be used in routing
export default DashboardLayout;