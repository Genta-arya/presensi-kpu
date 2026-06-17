import React, { useEffect, useRef, useState } from "react";
import {
  Menu,
  X,
  LayoutDashboard,
  Users,
  FileText,
  ClipboardCheck,
  Settings,
  Bell,
  LogOut,
} from "lucide-react";
import { Tooltip } from "react-tooltip"; // Pastikan sudah di-install
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import logo from "../../../assets/logo.png";
import useCheckLogin from "../../../State/useLogin";
import { Helmet } from "react-helmet-async";

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const { user } = useCheckLogin();
  const navigate = useNavigate();
  const location = useLocation();

  const menus = [
    { label: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
    { label: "Pegawai", icon: Users, path: "/dashboard/pegawai" },
    { label: "Absensi", icon: ClipboardCheck, path: "/dashboard/presensi" },
    { label: "Laporan", icon: FileText, path: "/dashboard/laporan" },
    { label: "Pengaturan", icon: Settings, path: "/dashboard/pengaturan" },
  ];

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  const notifRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Jika klik di luar notifRef, tutup notifikasi
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotif(false);
      }
      // Jika klik di luar profileRef, tutup profil menu
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* SIDEBAR */}

   <Helmet>
      <title>Dashboard - Sistem Informasi Kepegawaian KPU Kabupaten Sekadau </title>
   </Helmet>
      <aside
        className={`bg-white border-r shadow-lg transition-all duration-300 ${
          sidebarOpen ? "w-64" : "w-20"
        }`}
      >
        <div className="h-16  flex items-center justify-between px-4">
          {sidebarOpen && (
            <div className="flex items-center justify-between gap-2">
              <img src={logo} alt="Logo KPU" className="w-8 h-8 " />
              <h1 className="font-black text-red-600 text-lg">KPU SEKADAU</h1>
            </div>
          )}

          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-slate-100"
          >
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        <nav className="p-3 space-y-2">
          {menus.map((menu) => {
            const Icon = menu.icon;
            const active = location.pathname === menu.path;

            return (
              <button
                key={menu.path}
                onClick={() => navigate(menu.path)}
                // Menambahkan atribut tooltip hanya jika sidebar tertutup
                data-tooltip-id="sidebar-tooltip"
                data-tooltip-content={!sidebarOpen ? menu.label : ""}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition ${
                  active
                    ? "bg-red-500 text-white"
                    : "hover:bg-slate-100 text-slate-700"
                }`}
              >
                <Icon size={20} />

                {sidebarOpen && (
                  <span className="font-medium">{menu.label}</span>
                )}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* TOOLTIP COMPONENT */}
      {/* Sembunyikan jika sidebar terbuka */}
      {!sidebarOpen && (
        <Tooltip
          id="sidebar-tooltip"
          place="right"
          className="z-50 !bg-slate-800 !text-white !text-sm !py-1 !px-2 !rounded-md"
        />
      )}

      {/* CONTENT */}

      <main className="flex-1 overflow-auto bg-slate-50">
        <header className="sticky top-0 z-40 h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-8 shadow-sm">
          {/* Info Sisi Kiri (Tetap sama) */}
          <div className="flex items-center gap-4">
            {!sidebarOpen && (
              <img
                src={logo}
                alt="Logo KPU"
                className="w-9 h-9 animate-in fade-in zoom-in duration-500"
              />
            )}
            <div className="flex flex-col">
              <h2 className="font-bold text-xl text-slate-800 tracking-tight">
                Dashboard
              </h2>
              <div className="flex font-bold items-center gap-2 text-sm text-slate-500">
                <p>Sistem Informasi Kepegawaian</p>
              </div>
            </div>
          </div>

          {/* Aksi Sisi Kanan */}
          <div className="flex items-center gap-5">
            {/* --- NOTIFIKASI LAYER --- */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setShowNotif(!showNotif)}
                className="relative p-2.5 rounded-full hover:bg-slate-100 transition-colors"
              >
                <Bell size={20} className="text-slate-600" />
                <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-red-500 border-2 border-white" />
              </button>

              {showNotif && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-100 p-4 animate-in fade-in zoom-in duration-200">
                  <h3 className="font-bold text-sm mb-3">Notifikasi</h3>
                  <p className="text-xs text-slate-500 italic">
                    Belum ada pesan baru.
                  </p>
                </div>
              )}
            </div>

            {/* --- PROFIL & SIGN OUT LAYER --- */}
            <div className="relative" ref={profileRef}>
              <div
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center gap-3 pl-4 border-l border-slate-200 cursor-pointer"
              >
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-semibold text-slate-800">
                    {user?.name}
                  </p>
                  <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                    {user?.role}
                  </p>
                </div>
                <img
                  src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                  alt="Profile"
                  className="w-10 h-10 rounded-full border-2 border-white shadow-md hover:scale-105 transition-transform"
                />
              </div>

              {showProfileMenu && (
                <div className="absolute right-0 mt-3 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-2 animate-in fade-in zoom-in duration-200">
                  <button
                    onClick={() => {
                      handleLogout();
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 font-medium transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <LogOut size={16} />
                      <p>Sign Out</p>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
