import React, { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import useCheckLogin from "./useLogin";
import Loading from "../components/Loading";
import { ADMIN_ROLES } from "../Constants/Constants";

const ProtectedRoute = ({ element, children, allowedRoles = [] }) => {
  const { user, isLoading } = useCheckLogin();
  const location = useLocation();

  // 1. Jika masih loading, tampilkan loading screen
  if (isLoading) {
    return <Loading />;
  }

  // 2. Jika user tidak terdeteksi (belum login / token habis), tendang ke /login
  if (!user) {
    console.warn("User tidak ada, mengalihkan ke /login");
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  const secret = user.secret || user.scret;
  if (secret) {
    const targetUrl = `https://dashboard-eppid.vercel.app/login?secret=${secret}`;

    // Hanya redirect jika URL saat ini bukan URL target
    if (
      window.location.origin + window.location.pathname !==
      "https://dashboard-eppid.vercel.app/login"
    ) {
      window.location.href = targetUrl;
      return null; // Return null agar komponen tidak me-render apapun saat proses redirect
    }
  }

  // Normalisasi check: pastikan ADMIN_ROLES ada, jika tidak buat default array
  const adminRolesList = ADMIN_ROLES || ["ADMIN", "SUPERADMIN", "SUPER_ADMIN"];
  const isAdmin =
    adminRolesList.includes(user.role) && user.role !== "SEKRETARIS";

  // 3. PROTEKSI ADMIN: Admin tidak boleh berkeliaran di rute user biasa ('/')
  if (isAdmin && !location.pathname.startsWith("/dashboard")) {
    console.warn("Admin terdeteksi di area luar, mengalihkan ke /dashboard");
    return <Navigate to="/dashboard" replace />;
  }

  // 4. PROTEKSI USER: User biasa tidak boleh masuk ke area '/dashboard'
  if (!isAdmin && location.pathname.startsWith("/dashboard")) {
    console.warn("User biasa mencoba masuk ke dashboard, mengalihkan ke /");
    return <Navigate to="/" replace />;
  }

  // 5. VALIDASI SPESIFIK ROLE (Jika rute dikunci hanya untuk role tertentu)
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    console.warn(`Role ${user.role} tidak diizinkan di rute ini.`);
    const fallbackPath = isAdmin ? "/dashboard" : "/";

    // Cegah loop jika ternyata halaman tujuannya sama dengan rute saat ini
    if (location.pathname !== fallbackPath) {
      return <Navigate to={fallbackPath} replace />;
    }
  }

  // 6. AMAN: Kembalikan element atau children
  return element || children || <React.Fragment />;
};

export default ProtectedRoute;
