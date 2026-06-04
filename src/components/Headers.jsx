import React, { useState, useEffect } from "react";
import { useUserContext } from "../State/useContext";
import { FiLogOut } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { CalendarCheck, LogOut } from "lucide-react";
import { JABATAN_LABELS } from "../Constants/Constants";

const Headers = () => {
  const { selectedUser, setSelectedUser } = useUserContext();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Trigger V2 aktif setelah melewati tinggi header default (sekitar 140px)
      setIsScrolled(window.scrollY > 140);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!selectedUser) return null;

  const handleLogout = () => {
    localStorage.removeItem("token");
    setSelectedUser(null);
    window.location.href = "/login";
  };

  return (
    <>
      {/* ========================================================= */}
      {/* VERSI 1: HEADER UTAMA (Normal di Atas Halaman)            */}
      {/* ========================================================= */}
      <div className="bg-white border-b-[6px] border-red-500 shadow-[0_12px_30px_-15px_rgba(0,0,0,0.08)] relative overflow-hidden pt-4 pb-4 rounded-b-[28px]">
        {/* Efek dekoratif latar belakang */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-b from-red-500/5 to-transparent rounded-full blur-2xl pointer-events-none" />

        <div className="mx-auto px-5">
          {/* Baris Utama V1 */}
          <div className="flex items-start justify-between w-full gap-3">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div
                onClick={() => navigate("/profil/" + selectedUser.id)}
                className="w-12 h-12 flex-shrink-0 rounded-full cursor-pointer shadow-sm border-2 border-white bg-gray-50 mt-0.5"
              >
                <img
                  src={selectedUser.avatar || "/default-avatar.png"}
                  alt={selectedUser.name}
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <div className="flex flex-col min-w-0 flex-1 pt-0.5">
                <h2 className="text-sm font-black text-gray-800 leading-tight break-words">
                  {selectedUser.name}
                </h2>
                <div className="inline-block bg-red-50/70 border border-red-100 text-red-600 px-2 py-1 rounded-md max-w-full mt-1.5">
                  <span className="text-[9px] font-bold tracking-wide uppercase break-words block leading-normal">
                    {JABATAN_LABELS[selectedUser.jabatan] || selectedUser.jabatan}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center flex-shrink-0 pt-1">
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 px-2 py-1 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                title="Keluar"
              >
                <FiLogOut size={16} />
                <span className="text-[10px] font-bold uppercase tracking-wider ml-0.5">
                  Keluar
                </span>
              </button>
            </div>
          </div>

          {/* Floating Action Panel V1 */}
          <div className="grid grid-cols-2 gap-3 mt-4">
            <button
              onClick={() => navigate(`/absensi/` + selectedUser.id)}
              className="flex items-center justify-center gap-2 bg-emerald-50 text-emerald-700 py-2.5 rounded-xl text-xs font-black shadow-sm hover:bg-emerald-100 transition-all"
            >
              <CalendarCheck size={16} /> Masuk
            </button>
            <button
              onClick={() => navigate("/data/absen-pulang")}
              className="flex items-center justify-center gap-2 bg-rose-50 text-rose-700 py-2.5 rounded-xl text-xs font-black shadow-sm hover:bg-rose-100 transition-all"
            >
              <LogOut size={16} /> Pulang
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* VERSI 2: FIXED STICKY HEADER (Lengkap dengan Jabatan & Absen) */}
      {/* ========================================================= */}
      <div
        className={`fixed top-0 left-0 right-0 z-50 bg-white border-b-4 border-red-500 shadow-md pt-3 pb-3 rounded-b-2xl transition-all duration-300 ease-in-out transform ${
          isScrolled 
            ? "translate-y-0 opacity-100" 
            : "-translate-y-full opacity-0 pointer-events-none"
        }`}
      >
        <div className=" mx-auto px-5 space-y-3">
          
          {/* BARIS UTAMA V2 */}
          <div className="flex items-center justify-between w-full gap-3">
            
            {/* Sisi Kiri (Avatar + Informasi Akun Lengkap) */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div
                onClick={() => navigate("/profil/" + selectedUser.id)}
                className="w-10 h-10 flex-shrink-0 rounded-full cursor-pointer border border-gray-200"
              >
                <img
                  src={selectedUser.avatar || "/default-avatar.png"}
                  alt={selectedUser.name}
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                {/* Supaya tidak tabrakan di ruang sempit, teks dipotong rapi jika terlalu panjang */}
                <h2 className="text-xs font-black text-gray-800 leading-tight">
                  {selectedUser.name}
                </h2>
                <div className="inline-block bg-red-50/70 border border-red-100 text-red-600 px-1.5 py-0.5 rounded mt-0.5 w-fit max-w-full">
                  <span className="text-[8px] font-bold tracking-wide uppercase block max-w-[180px]">
                    {selectedUser.jabatan}
                  </span>
                </div>
              </div>
            </div>

            {/* Sisi Kanan (Tombol Logout Mini) */}
            <button
              onClick={handleLogout}
              className="flex items-center justify-center w-8 h-8 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 flex-shrink-0"
              title="Keluar"
            >
              <FiLogOut size={16} />
            </button>
          </div>

          {/* BARIS TOMBOL ABSEN V2 (Lebih compact untuk menghemat space layar saat melayang) */}
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => navigate(`/absensi/` + selectedUser.id)}
              className="flex items-center justify-center gap-1.5 bg-emerald-50 text-emerald-700 py-1.5 rounded-lg text-[11px] font-black shadow-sm hover:bg-emerald-100 transition-all"
            >
              <CalendarCheck size={14} /> Masuk
            </button>
            <button
              onClick={() => navigate("/data/absen-pulang")}
              className="flex items-center justify-center gap-1.5 bg-rose-50 text-rose-700 py-1.5 rounded-lg text-[11px] font-black shadow-sm hover:bg-rose-100 transition-all"
            >
              <LogOut size={14} /> Pulang
            </button>
          </div>

        </div>
      </div>
    </>
  );
};

export default Headers;