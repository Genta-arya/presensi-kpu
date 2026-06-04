import React from "react";
import { NavLink } from "react-router-dom";
import { FaHome, FaNewspaper } from "react-icons/fa";
import useCheckLogin from "../State/useLogin";

const BottomNav = () => {
  const { user } = useCheckLogin();

  return (
    // Container Luar: Ditambahkan padding bawah dan samping agar komponen terlihat melayang (Floating)
    <div className="fixed bottom-4 left-0 right-0 px-4 z-40">
      {/* Dock Utama: Menggunakan efek Glassmorphism blur dan bayangan lembut */}
      <div className="max-w-md mx-auto bg-white/90 backdrop-blur-lg border border-gray-100/50 rounded-[24px] shadow-[0_12px_32px_-4px_rgba(0,0,0,0.08)] h-16 flex justify-around items-center px-2">
        
        {/* NAV 1: BERANDA */}
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center relative w-16 h-full text-[10px] font-bold tracking-wide transition-all duration-300 ${
              isActive ? "text-red-600 scale-105" : "text-gray-400 hover:text-gray-600"
            }`
          }
        >
          {({ isActive }) => (
            <>
              <FaHome size={22} className="mb-0.5" />
              <span>Beranda</span>
              {/* Indikator Kapsul Aktif di Bawah Teks */}
              {isActive && (
                <span className="absolute bottom-1 w-5 h-1 bg-red-600 rounded-full animate-fade-in" />
              )}
            </>
          )}
        </NavLink>

        {/* NAV 2: BERITA */}
        <NavLink
          to="/berita"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center relative w-16 h-full text-[10px] font-bold tracking-wide transition-all duration-300 ${
              isActive ? "text-red-600 scale-105" : "text-gray-400 hover:text-gray-600"
            }`
          }
        >
          {({ isActive }) => (
            <>
              <FaNewspaper size={21} className="mb-0.5" />
              <span>Berita</span>
              {isActive && (
                <span className="absolute bottom-1 w-5 h-1 bg-red-600 rounded-full animate-fade-in" />
              )}
            </>
          )}
        </NavLink>

        {/* NAV 3: PROFIL */}
        <NavLink
          to={`/profil/${user?.id || "me"}`}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center relative w-16 h-full text-[10px] font-bold tracking-wide transition-all duration-300 ${
              isActive ? "text-red-600 scale-105" : "text-gray-400 hover:text-gray-600"
            }`
          }
        >
          {({ isActive }) => (
            <>
              {/* Bingkai Avatar yang dinamis mengikuti status aktif */}
              <div
                className={`w-7 h-7 rounded-full overflow-hidden p-0.5 mb-0.5 transition-all duration-300 ${
                  isActive
                    ? "bg-gradient-to-tr from-red-600 to-orange-500 shadow-sm"
                    : "bg-gray-200"
                }`}
              >
                <img
                  src={user?.avatar || "https://via.placeholder.com/28"}
                  alt="avatar"
                  className="w-full h-full rounded-full object-cover bg-white"
                />
              </div>
              <span>Profil</span>
              {isActive && (
                <span className="absolute bottom-1 w-5 h-1 bg-red-600 rounded-full animate-fade-in" />
              )}
            </>
          )}
        </NavLink>

      </div>

      {/* Tambahan style mikro untuk animasi pemanis indikator pil */}
      <style>{`
        @keyframes pillExpand {
          from { transform: scaleX(0.4); opacity: 0; }
          to { transform: scaleX(1); opacity: 1; }
        }
        .animate-fade-in {
          animation: pillExpand 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
};

export default BottomNav;