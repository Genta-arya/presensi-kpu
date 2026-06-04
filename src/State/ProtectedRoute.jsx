import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import useCheckLogin from "./useLogin";
import Loading from "../components/Loading";
import { ADMIN_ROLES } from "../Constants/Constants";

const ProtectedRoute = ({ element, allowedRoles = [] }) => {
  const { user, isLoading } = useCheckLogin();
  const location = useLocation();

  if (isLoading) {
    return <Loading />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const isAdmin = ADMIN_ROLES.includes(user.role);

  // Admin hanya boleh mengakses area dashboard
  if (
    isAdmin &&
    !location.pathname.startsWith("/dashboard")
  ) {
    return <Navigate to="/dashboard" replace />;
  }

  // User tidak boleh mengakses dashboard
  if (
    user.role === "USER" &&
    location.pathname.startsWith("/dashboard")
  ) {
    return <Navigate to="/" replace />;
  }

  // Validasi role khusus
  if (
    allowedRoles.length > 0 &&
    !allowedRoles.includes(user.role)
  ) {
    return (
      <Navigate
        to={isAdmin ? "/dashboard" : "/"}
        replace
      />
    );
  }

  return element;
};

export default ProtectedRoute;