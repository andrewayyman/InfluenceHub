import React from "react";

/*
  Importing icons from lucide-react library
  These icons are used in the dashboard statistics cards
*/
import {
  Users,
  Megaphone,
  Activity,
  AlertCircle,
  Edit,
  Trash,
} from "lucide-react";

const AdminDashboard = () => {

  /*
    Temporary mock data for users
    Later this data should come from an API
    Example: GET /api/users
  */
  const users = [
    { id: 1, name: "Ahmed Hassan", email: "ahmed@mail.com", role: "Influencer", status: "Active" },
    { id: 2, name: "Sara Ali", email: "sara@mail.com", role: "Brand", status: "Pending" },
  ];

  /*
    Temporary mock data for campaigns
    Later this should also be fetched from backend
  */
  const campaigns = [
    { id: 1, name: "Summer Fashion Campaign", brand: "Nike", budget: "$5000", status: "Active" },
    { id: 2, name: "Tech Review Launch", brand: "Samsung", budget: "$8000", status: "Pending" },
  ];

  return (

    /*
      Main dashboard container
      - Vertical spacing between sections
      - Dark background theme
      - Full screen height
    */
    <div className="space-y-10 px-10 py-8 bg-[#0F172A] min-h-screen text-white">

      {/* ================= Header Section ================= */}
      <div>
        {/* Dashboard Title */}
        <h1 className="text-3xl font-bold text-white">
          Admin Dashboard
        </h1>

        {/* Short description */}
        <p className="text-gray-300 mt-1">
          Monitor platform activity and manage users & campaigns.
        </p>
      </div>

      {/* ================= Statistics Cards ================= */}
      {/* Grid layout for platform statistics */}
      <div className="grid md:grid-cols-4 gap-6">

        {/* Total Users Card */}
        <div className="bg-[#1E293B] border border-gray-700 p-6 rounded-2xl shadow-sm hover:shadow-lg transition flex justify-between items-center">
          <div>
            <p className="text-gray-400 text-sm">Total Users</p>
            <h2 className="text-3xl font-bold mt-1">120</h2>
          </div>

          {/* Icon container */}
          <div className="bg-purple-800 p-3 rounded-xl">
            <Users className="text-purple-400" size={24} />
          </div>
        </div>

        {/* Total Campaigns Card */}
        <div className="bg-[#1E293B] border border-gray-700 p-6 rounded-2xl shadow-sm hover:shadow-lg transition flex justify-between items-center">
          <div>
            <p className="text-gray-400 text-sm">Total Campaigns</p>
            <h2 className="text-3xl font-bold mt-1">45</h2>
          </div>

          <div className="bg-blue-800 p-3 rounded-xl">
            <Megaphone className="text-blue-400" size={24} />
          </div>
        </div>

        {/* Active Campaigns Card */}
        <div className="bg-[#1E293B] border border-gray-700 p-6 rounded-2xl shadow-sm hover:shadow-lg transition flex justify-between items-center">
          <div>
            <p className="text-gray-400 text-sm">Active Campaigns</p>
            <h2 className="text-3xl font-bold mt-1">18</h2>
          </div>

          <div className="bg-green-800 p-3 rounded-xl">
            <Activity className="text-green-400" size={24} />
          </div>
        </div>

        {/* Reports Pending Card */}
        <div className="bg-[#1E293B] border border-gray-700 p-6 rounded-2xl shadow-sm hover:shadow-lg transition flex justify-between items-center">
          <div>
            <p className="text-gray-400 text-sm">Reports Pending</p>
            <h2 className="text-3xl font-bold mt-1">6</h2>
          </div>

          <div className="bg-red-800 p-3 rounded-xl">
            <AlertCircle className="text-red-400" size={24} />
          </div>
        </div>
      </div>

      {/* ================= Users Management Section ================= */}
      <div className="bg-[#1E293B] rounded-2xl shadow-sm border border-gray-700 p-6">

        {/* Section header */}
        <div className="flex justify-between items-center mb-6">

          <h2 className="text-xl font-semibold text-white">
            Users Management
          </h2>

          {/* Add new user button */}
          <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition">
            Add User
          </button>
        </div>

        {/* Responsive table container */}
        <div className="overflow-x-auto">

          {/* Users Table */}
          <table className="w-full text-left">

            {/* Table Header */}
            <thead className="text-gray-400 text-sm border-b border-gray-600">
              <tr>
                <th className="pb-3">User</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            {/* Table Body */}
            <tbody>

              {/* Loop through users array */}
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="border-b last:border-none hover:bg-gray-800 transition"
                >

                  {/* User Name + Avatar */}
                  <td className="py-4 flex items-center gap-3">

                    {/* Avatar circle with first letter */}
                    <div className="w-10 h-10 rounded-full bg-purple-800 flex items-center justify-center font-semibold text-purple-400">
                      {user.name.charAt(0)}
                    </div>

                    <span className="font-medium text-white">
                      {user.name}
                    </span>
                  </td>

                  {/* Email */}
                  <td className="text-gray-300">{user.email}</td>

                  {/* Role Badge */}
                  <td>
                    <span className="bg-gray-700 text-gray-300 px-3 py-1 rounded-full text-sm">
                      {user.role}
                    </span>
                  </td>

                  {/* Status Badge */}
                  <td>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium
                      ${user.status === "Active"
                        ? "bg-green-800 text-green-400"
                        : "bg-yellow-800 text-yellow-400"
                      }`}
                    >
                      {user.status}
                    </span>
                  </td>

                  {/* Action Buttons */}
                  <td className="flex gap-3">

                    {/* Edit Button */}
                    <button className="p-2 rounded-lg hover:bg-blue-900 text-blue-400 transition">
                      <Edit size={18} />
                    </button>

                    {/* Delete Button */}
                    <button className="p-2 rounded-lg hover:bg-red-900 text-red-400 transition">
                      <Trash size={18} />
                    </button>

                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= Campaign Management Section ================= */}
      <div className="bg-[#1E293B] rounded-2xl shadow-sm border border-gray-700 p-6">

        {/* Section Title */}
        <h2 className="text-xl font-semibold mb-6 text-white">
          Campaign Management
        </h2>

        <div className="overflow-x-auto">

          {/* Campaign Table */}
          <table className="w-full text-left">

            {/* Table Header */}
            <thead className="text-gray-400 text-sm border-b border-gray-600">
              <tr>
                <th className="pb-3">Campaign</th>
                <th>Brand</th>
                <th>Budget</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>

              {/* Loop through campaigns */}
              {campaigns.map((campaign) => (
                <tr
                  key={campaign.id}
                  className="border-b last:border-none hover:bg-gray-800 transition"
                >

                  {/* Campaign Name */}
                  <td className="py-4 font-medium text-white">
                    {campaign.name}
                  </td>

                  {/* Brand Name */}
                  <td className="text-gray-300">
                    {campaign.brand}
                  </td>

                  {/* Budget */}
                  <td className="font-medium text-white">
                    {campaign.budget}
                  </td>

                  {/* Status Badge */}
                  <td>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium
                      ${campaign.status === "Active"
                        ? "bg-green-800 text-green-400"
                        : "bg-yellow-800 text-yellow-400"
                      }`}
                    >
                      {campaign.status}
                    </span>
                  </td>

                  {/* Action Buttons */}
                  <td className="flex gap-3">

                    {/* Edit Campaign */}
                    <button className="p-2 rounded-lg hover:bg-blue-900 text-blue-400 transition">
                      <Edit size={18} />
                    </button>

                    {/* Delete Campaign */}
                    <button className="p-2 rounded-lg hover:bg-red-900 text-red-400 transition">
                      <Trash size={18} />
                    </button>

                  </td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>
      </div>

    </div>
  );
};

export default AdminDashboard;