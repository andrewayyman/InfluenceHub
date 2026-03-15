import React from "react";
import { createBrowserRouter } from "react-router-dom";

// Layouts
import AuthLayout from "../layouts/AuthLayout";
import DashboardLayout from "../layouts/DashboardLayout";

// Pages
import Home from "../pages/home/Home";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";

// Dashboards
/* import AdminDashboard from "../pages/admin/AdminDashboard";
import BrandDashboard from "../pages/brand/BrandDashboard";
import InfluencerDashboard from "../pages/influencer/InfluencerDashboard"; */

// Protected Route
import ProtectedRoute from "./ProtectedRoute";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },

  {
    path: "/auth",
    element: <AuthLayout />,
    children: [
      { path: "login", element: <Login /> },
      { path: "register", element: <Register /> },
    ],
  },

  // ADMIN
/*   {
    path: "/dashboard/admin",
    element: (
      <ProtectedRoute role="admin">
        <DashboardLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <AdminDashboard />,
      },
    ],
  }, */

  // BRAND
/*   {
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

  // INFLUENCER
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
  }, */
]);