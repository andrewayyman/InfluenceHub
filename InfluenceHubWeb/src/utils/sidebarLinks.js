/*
  Importing icons from lucide-react
  Each icon will be displayed next to the sidebar link
*/
import {
  LayoutDashboard,
  Megaphone,
  FolderKanban,
  FileText,
  Users,
  MessageSquare,
  BarChart3,
  ClipboardList,
  User,
  DollarSign,
  Percent,
  Star,
} from "lucide-react";

/*
  sidebarLinks Object
  ------------------------------------------------
  This object contains all sidebar navigation links
  for each user role in the platform.

  Roles supported:
  - brand
  - influencer
  - admin

  Each role has its own navigation menu.
*/
export const sidebarLinks = {

  /*
    Brand Sidebar Links
    ------------------------------------------------
    These links will appear when the logged-in user
    has the role "brand".
  */
  brand: [
    {
      name: "Dashboard", // Text displayed in sidebar
      path: "/dashboard/brand", // Route path
      icon: LayoutDashboard, // Icon component
    },
    {
      name: "Create Campaign",
      path: "/dashboard/brand/create-campaign",
      icon: Megaphone,
    },
    {
      name: "My Campaigns",
      path: "/dashboard/brand/campaigns",
      icon: FolderKanban,
    },
    {
      name: "Applications",
      path: "/dashboard/brand/applications",
      icon: ClipboardList,
    },
    {
      name: "Reports",
      path: "/dashboard/brand/reports",
      icon: BarChart3,
    },
  ],

  /*
    Influencer Sidebar Links
    ------------------------------------------------
    Navigation menu for users with the role "influencer".
  */
  influencer: [
    {
      name: "Dashboard",
      path: "/dashboard/influencer",
      icon: LayoutDashboard,
    },
    {
      name: "My Profile",
      path: "/dashboard/influencer/profile",
      icon: User,
    },
    {
      name: "Campaigns",
      path: "/dashboard/influencer/suggested",
      icon: Megaphone,
    },
    {
      name: "My Applications",
      path: "/dashboard/influencer/applications",
      icon: ClipboardList,
    },
    {
      name: "Active Campaigns",
      path: "/dashboard/influencer/active",
      icon: FolderKanban,
    },
    {
      name: "Submit Report",
      path: "/dashboard/influencer/report",
      icon: FileText,
    },
    {
      name: "Campaign Insights",
      path: "/dashboard/influencer/insights",
      icon: BarChart3,
    },
    {
      name: "Ratings",
      path: "/dashboard/influencer/ratings",
      icon: Star,
    },
    {
      name: "Earnings",
      path: "/dashboard/influencer/earnings",
      icon: DollarSign,
    },
  ],

  /*
    Admin Sidebar Links
    ------------------------------------------------
    Navigation menu for platform administrators.
    Admin users manage the entire platform.
  */
  admin: [
    {
      name: "Dashboard",
      path: "/dashboard/admin",
      icon: LayoutDashboard,
    },
    {
      name: "Users",
      path: "/dashboard/admin/users",
      icon: Users,
    },
    {
      name: "Campaigns",
      path: "/dashboard/admin/campaigns",
      icon: Megaphone,
    },
    {
      name: "Contact Messages",
      path: "/dashboard/admin/messages",
      icon: MessageSquare,
    },
    {
      name: "Commission",
      path: "/dashboard/admin/commission",
      icon: Percent,
    },
    {
      name: "Payments",
      path: "/dashboard/admin/payments",
      icon: DollarSign,
    },
  ],
};