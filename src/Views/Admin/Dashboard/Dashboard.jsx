import React, { useState } from "react";
import {
  Menu,
  X,
  LayoutDashboard,
  Users,
  FileText,
  ClipboardCheck,
  Settings,
  Bell,
} from "lucide-react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import logo from "../../../assets/logo.png";
const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const menus = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      path: "/dashboard",
    },
    {
      label: "Pegawai",
      icon: Users,
      path: "/dashboard/pegawai",
    },
    {
      label: "Absensi",
      icon: ClipboardCheck,
      path: "/dashboard/presensi",
    },
    {
      label: "Laporan",
      icon: FileText,
      path: "/dashboard/laporan",
    },
    {
      label: "Pengaturan",
      icon: Settings,
      path: "/dashboard/pengaturan",
    },
  ];

  //  otomatis scroll ke atas dan jika modal aktif maka scroll tidak bisa dilakukan
  React.useEffect(() => {
    window.scrollTo(0, 0);
   
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* SIDEBAR */}
      <aside
        className={`bg-white border-r shadow-lg transition-all duration-300 ${
          sidebarOpen ? "w-64" : "w-20"
        }`}
      >
        <div className="h-16 border-b flex items-center justify-between px-4">
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

      {/* CONTENT */}
      <main className="flex-1 overflow-auto">
        <header className="h-16 bg-white shadow-sm flex items-center justify-between px-6">
          <div>
            <h2 className="font-bold text-lg">Dashboard Admin</h2>

            <p className="text-sm text-gray-500">
              Sistem Informasi KPU Kabupaten Sekadau
            </p>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative">
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-500" />
            </button>

            <img
              src="https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
              alt=""
              className="w-10 h-10 rounded-full border"
            />
          </div>
        </header>

        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
