import { Navigate } from "react-router-dom";
import React from "react";

/*
  ProtectedRoute Component
  ------------------------
  This component is used to protect certain routes in your app.
  Only authenticated users can access the route.
  Optionally, it can restrict access based on user roles.

  Props:
  - children: The component(s) that should render if the user is allowed.
  - role (optional): A string representing the required role to access the route.
*/

function ProtectedRoute({ children, role }) {
  
  // Get the current user from localStorage (assuming you store user info there)
  const user = JSON.parse(localStorage.getItem("user"));

  // 1️⃣ If no user is logged in, redirect to login page
  if (!user) {
    return <Navigate to="/auth/login" />;
  }

  // 2️⃣ If a role is specified and the user's role does NOT match, redirect to home page
  if (role && user.role !== role) {
    return <Navigate to="/" />;
  }

  // 3️⃣ If user exists and role matches (or role not specified), render the child component
  return children;
}

export default ProtectedRoute;