import React from "react";

// createBrowserRouter is used to define the application routing structure
import { createBrowserRouter } from "react-router-dom";

/* ================================
   Layout Components
   ================================ */

// Layout used for authentication pages (login / register)
import AuthLayout from "../layouts/AuthLayout";

// Layout used for dashboard pages (contains Sidebar + Navbar + Footer)
import DashboardLayout from "../layouts/DashboardLayout";

/* ================================
   Public Pages
   ================================ */

// Landing page
import Home from "../pages/home/Home";

// Authentication pages
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";

/* ================================
   Dashboard Pages
   ================================ */

// Admin dashboard page
import AdminDashboard from "../pages/admin/AdminDashboard";

/* 
// Future dashboards for other roles
import BrandDashboard from "../pages/brand/BrandDashboard";
import InfluencerDashboard from "../pages/influencer/InfluencerDashboard";
*/

/* ================================
   Route Protection
   ================================ */

// Component used to protect routes (authentication / role-based access)
import ProtectedRoute from "./ProtectedRoute";

/*
  Router Configuration
  ------------------------------------------------
  createBrowserRouter allows us to define the
  entire routing system as a structured object.

  Structure:
  - Public Routes
  - Auth Routes
  - Dashboard Routes
*/

export const router = createBrowserRouter([

  /* =================================
     Public Route
     ================================= */

  {
    // Root URL
    path: "/",

    // Landing page component
    element: <Home />,
  },


  /* =================================
     Authentication Routes
     ================================= */

  {
    path: "/auth",

    // AuthLayout wraps login and register pages
    element: <AuthLayout />,

    // Nested routes rendered using <Outlet />
    children: [

      // /auth/login
      { path: "login", element: <Login /> },

      // /auth/register
      { path: "register", element: <Register /> },

    ],
  },


  /* =================================
     ADMIN DASHBOARD
     ================================= */

  {
    // Admin dashboard route
    path: "/dashboard/admin",

    /*
      In production this should be wrapped
      with ProtectedRoute to ensure:

      1. User is logged in
      2. User role is "admin"
    */

    element: (
      <DashboardLayout />
    ),

    /*
      Nested routes rendered inside DashboardLayout
      using the <Outlet /> component
    */

    children: [

      {
        // Default page for /dashboard/admin
        index: true,

        // Admin dashboard main page
        element: <AdminDashboard />,
      },

    ],
  },


  /* =================================
     BRAND DASHBOARD (future)
     ================================= */

/*
  {
    path: "/dashboard/brand",

    element: (
      <ProtectedRoute role="brand">
        <DashboardLayout />
      </ProtectedRoute>
    ),

    children: [
      {
        index: true,
        element: <BrandDashboard />,
      },
    ],
  },
*/


  /* =================================
     INFLUENCER DASHBOARD (future)
     ================================= */

/*
  {
    path: "/dashboard/influencer",

    element: (
      <ProtectedRoute role="influencer">
        <DashboardLayout />
      </ProtectedRoute>
    ),

    children: [
      {
        index: true,
        element: <InfluencerDashboard />,
      },
    ],
  },
*/

]);