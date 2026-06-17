import React from "react";
import { FaChevronLeft, FaBars } from "react-icons/fa";
import { useLocation } from "react-router-dom";

const Navigations = ({ title }) => {
  const location = useLocation();

  const isProfilePath = location.pathname.includes("profil") || location.pathname.includes("profile");

  const handleBack = () => {
    // Memaksa reload ke halaman sebelumnya atau ke root
    if (window.history.length > 1 && window.history.state?.idx > 0) {
      window.history.back(); // Reloads via browser native back
    } else {
      window.location.href = "/"; // Full reload ke home
    }
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

      {/* SISI KANAN: Tombol Garis Tiga */}
      {isProfilePath && (
        <a 
          href="/pengaturan" 
          className="cursor-pointer text-xl hover:opacity-80 transition-opacity p-1"
        >
          <FaBars />
        </a>
      )}
    </div>
  );
};

export default Navigations;