import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { getRoleDashboardPath, normalizeRole } from "../utils/auth";

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
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();
  const requiredRoles = Array.isArray(role)
    ? role.map(normalizeRole).filter(Boolean)
    : role
      ? [normalizeRole(role)].filter(Boolean)
      : [];

  if (!isAuthenticated || !user) {
    return <Navigate to="/auth/login" replace state={{ from: location.pathname }} />;
  }

  if (requiredRoles.length > 0 && !requiredRoles.includes(user.role)) {
    return <Navigate to={getRoleDashboardPath(user.role)} replace />;
  }

  return children;
}

export default ProtectedRoute;
