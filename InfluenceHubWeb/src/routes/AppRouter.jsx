import React, { Suspense, lazy } from "react";
import { Navigate, createBrowserRouter } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";
import RouteLoader from "./RouteLoader";
const AuthLayout = lazy(() => import("../layouts/AuthLayout"));
const DashboardLayout = lazy(() => import("../layouts/DashboardLayout"));
const Home = lazy(() => import("../Pages/Home/Home"));
const PublicInfoPage = lazy(() => import("../Pages/public/PublicInfoPage"));
const Login = lazy(() => import("../Pages/auth/Login"));
const Register = lazy(() => import("../Pages/auth/Register"));
const AdminDashboard = lazy(() => import("../Pages/admin/AdminDashboard"));
const AdminUsers = lazy(() => import("../Pages/admin/AdminUsers"));
const AdminCampaigns = lazy(() => import("../Pages/admin/AdminCampaigns"));
const AdminReports = lazy(() => import("../Pages/admin/AdminReports"));
const AdminMessages = lazy(() => import("../Pages/admin/AdminMessages"));

const withSuspense = (element) => (
  <Suspense fallback={<RouteLoader />}>
    {element}
  </Suspense>
);

export const router = createBrowserRouter([
  {
    path: "/",
    element: withSuspense(<Home />),
  },
  {
    path: "/auth",
    element: withSuspense(<AuthLayout />),
    children: [
      { path: "login", element: withSuspense(<Login />) },
      { path: "register", element: withSuspense(<Register />) },
    ],
  },
  {
    path: "/about",
    element: withSuspense(<PublicInfoPage pageKey="about" />),
  },
  {
    path: "/contact",
    element: withSuspense(<PublicInfoPage pageKey="contact" />),
  },
  {
    path: "/security",
    element: withSuspense(<PublicInfoPage pageKey="security" />),
  },
  {
    path: "/privacy",
    element: withSuspense(<PublicInfoPage pageKey="privacy" />),
  },
  {
    path: "/terms",
    element: withSuspense(<PublicInfoPage pageKey="terms" />),
  },
  {
    path: "/dashboard/admin",
    element: (
      withSuspense(
        <ProtectedRoute role="admin">
          <DashboardLayout />
        </ProtectedRoute>,
      )
    ),
    children: [
      { index: true, element: withSuspense(<AdminDashboard />) },
      { path: "users", element: withSuspense(<AdminUsers />) },
      { path: "campaigns", element: withSuspense(<AdminCampaigns />) },
      { path: "reports", element: withSuspense(<AdminReports />) },
      { path: "messages", element: withSuspense(<AdminMessages />) },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);
