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
const AdminMessages = lazy(() => import("../Pages/admin/AdminMessages"));
const AdminCommission = lazy(() => import("../Pages/admin/AdminCommission"));
const AdminPayments = lazy(() => import("../Pages/admin/AdminPayments"));
const BrandDashboard = lazy(() => import("../Pages/brand/BrandDashboard"));
const BrandStub = lazy(() => import("../Pages/brand/BrandStub"));
const CreateCampaign = lazy(() => import("../Pages/brand/CreateCampaign"));
const BrandCampaigns = lazy(() => import("../Pages/brand/BrandCampaigns"));
const CampaignApplications = lazy(() => import("../Pages/brand/CampaignApplications"));
const BrandReports = lazy(() => import("../Pages/brand/BrandReports"));

const InfluencerDashboard = lazy(() => import("../Pages/influencer/InfluencerDashboard"));
const SuggestedCampaigns = lazy(() => import("../Pages/influencer/SuggestedCampaigns"));
const MyApplications = lazy(() => import("../Pages/influencer/MyApplications"));
const ActiveCampaigns = lazy(() => import("../Pages/influencer/ActiveCampaigns"));
const SubmitReport = lazy(() => import("../Pages/influencer/SubmitReport"));
const CampaignInsights = lazy(() => import("../Pages/influencer/CampaignInsights"));
const InfluencerProfile = lazy(() => import("../Pages/influencer/InfluencerProfile"));
const MyEarnings = lazy(() => import("../Pages/influencer/MyEarnings"));

const InfluencerPublicProfile = lazy(() => import("../Pages/public/InfluencerPublicProfile"));

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
    path: "/influencer/:influencerId",
    element: withSuspense(<InfluencerPublicProfile />),
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
      { path: "messages", element: withSuspense(<AdminMessages />) },
      { path: "commission", element: withSuspense(<AdminCommission />) },
      { path: "payments", element: withSuspense(<AdminPayments />) },
    ],
  },
  {
    path: "/dashboard/brand",
    element: (
      withSuspense(
        <ProtectedRoute role="brand">
          <DashboardLayout />
        </ProtectedRoute>,
      )
    ),
    children: [
      { index: true, element: withSuspense(<BrandDashboard />) },
      {
        path: "create-campaign",
        element: withSuspense(<CreateCampaign />),
      },
      {
        path: "edit-campaign/:campaignId",
        element: withSuspense(<CreateCampaign />),
      },
      {
        path: "campaigns",
        element: withSuspense(<BrandCampaigns />),
      },
      {
        path: "applications",
        element: withSuspense(<CampaignApplications />),
      },
      {
        path: "reports",
        element: withSuspense(<BrandReports />),
      },
    ],
  },
  {
    path: "/dashboard/influencer",
    element: (
      withSuspense(
        <ProtectedRoute role="influencer">
          <DashboardLayout />
        </ProtectedRoute>,
      )
    ),
    children: [
      { index: true, element: withSuspense(<InfluencerDashboard />) },
      { path: "suggested", element: withSuspense(<SuggestedCampaigns />) },
      { path: "applications", element: withSuspense(<MyApplications />) },
      { path: "active", element: withSuspense(<ActiveCampaigns />) },
      { path: "report", element: withSuspense(<SubmitReport />) },
      { path: "insights", element: withSuspense(<CampaignInsights />) },
      { path: "earnings", element: withSuspense(<MyEarnings />) },
      { path: "profile", element: withSuspense(<InfluencerProfile />) },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);
