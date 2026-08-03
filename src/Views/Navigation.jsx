import React from "react";
import { FaChevronLeft } from "react-icons/fa";
import { FaGear } from "react-icons/fa6";
import { Link, useLocation, useNavigate } from "react-router-dom"; // Tambahkan useNavigate di sini

const Navigations = ({ title }) => {
  const location = useLocation();
  const navigate = useNavigate(); // Inisialisasi hook navigate

  const isProfilePath = location.pathname.includes("profil") || location.pathname.includes("profile");

  const handleBack = () => {
    // --- PERBAIKAN DI SINI ---
    // Jika path saat ini tepat bernilai /pegawai, langsung arahkan ke root (/)
    if (location.pathname === "/pegawai") {
      navigate("/");
      return;
    }

    // Langsung ke /
    navigate("/"); // Kembali ke halaman sebelumnya
    
  };

  return (
    <div className="flex fixed z-20 w-full items-center justify-between p-4 bg-red-600 text-white shadow-md">
      {/* SISI KIRI: Tombol Kembali & Judul Navigasi */}
      <div className="flex items-center gap-2">
        <button 
          onClick={handleBack}
          className="p-1 hover:bg-red-700 rounded-full transition-colors"
        >
          <FaChevronLeft className="cursor-pointer" />
        </button>
        <span className="ml-2 text-sm font-bold">{title}</span>
      </div>

      {/* SISI KANAN: Tombol Pengaturan */}
      {isProfilePath && (
        <Link 
          to={"/pengaturan"}
          className="cursor-pointer text-xl hover:opacity-80 transition-opacity p-1"
        >
          <FaGear />
        </Link>
      )}
    </div>
  );
};

export default Navigations;