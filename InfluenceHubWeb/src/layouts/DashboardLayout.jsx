import React, { useEffect, useRef, useState } from "react";

// Outlet is used to render the child routes inside this layout
import { Outlet, useLocation } from "react-router-dom";

// Importing layout components
import Sidebar from "../Components/Layout/Sidebar";
import NavBarr from "../Components/Layout/NavBarr";
import Footer from "../Components/Layout/Footer";
import { useAuth } from "../hooks/useAuth";

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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sidebarTriggerRef = useRef(null);
  const location = useLocation();
  const { user } = useAuth();
  const role = user?.role ?? "admin";

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  return (

    /*
      Main Layout Container
      - Flex layout
      - Minimum full screen height
      - Light dashboard background
    */

    <div className="ih-dashboard-shell ih-page-shell relative flex min-h-screen overflow-hidden">

      <a href="#dashboard-content" className="ih-skip-link">
        Skip to dashboard content
      </a>

      <div
        aria-hidden="true"
        className="ih-dashboard-atmosphere pointer-events-none absolute inset-0"
      />


      {/* =========================
          Sidebar Section
         ========================= */}

      {/*
        Sidebar receives the user role
        so it can render role-based navigation links
      */}
      <Sidebar
        role={role}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        triggerRef={sidebarTriggerRef}
      />


      {/* =========================
          Right Content Area
         ========================= */}

      <div className="relative z-10 flex min-w-0 flex-1 flex-col">

        {/* Top Navigation Bar */}
        <NavBarr
          isSidebarOpen={isSidebarOpen}
          onOpenSidebar={() => setIsSidebarOpen(true)}
          triggerRef={sidebarTriggerRef}
        />


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

        <main
          id="dashboard-content"
          className="ih-dashboard-main flex-1 min-w-0 overflow-x-hidden"
        >
          <div className="min-w-0">
            <Outlet />
          </div>
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
