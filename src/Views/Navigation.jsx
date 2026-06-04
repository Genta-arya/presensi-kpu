import React from "react";
import { FaChevronLeft, FaBars } from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";

const Navigations = ({ title }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isProfilePath = location.pathname.includes("profil") || location.pathname.includes("profile");

  const handleBack = () => {
    // Memeriksa window.history untuk mendeteksi apakah ada riwayat navigasi sebelumnya
    if (window.history.length > 1 && window.history.state?.idx > 0) {
      navigate(-1);
    } else {
      navigate("/", { replace: true });
    }
  };

  return (
    <div className="flex fixed z-20 w-full items-center justify-between p-4 bg-red-600 text-white">
      {/* SISI KIRI: Tombol Kembali & Judul Navigasi */}
      <div className="flex items-center gap-2">
        <FaChevronLeft className="cursor-pointer" onClick={handleBack} />
        <span className="ml-2 text-sm font-bold">{title}</span>
      </div>

      {/* SISI KANAN: Tombol Garis Tiga */}
      {isProfilePath && (
        <FaBars 
          className="cursor-pointer text-xl hover:opacity-80 transition-opacity" 
          onClick={() => navigate("/pengaturan")}
        />
      )}
    </div>
  );
};

export default Navigations;