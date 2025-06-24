import React from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <>
      <nav className="fixed w-full z-50 bg-white shadow-md px-4 py-5 flex items-center gap-4">
        <img src="/logo.png" alt="" className="w-8" />
        <div className="uppercase ">
          <h1 className="text-base font-bold text-red-600">
            Komisi Pemilihan Umum
          </h1>
          <p className="font-bold text-xs">Kabupaten Sekadau</p>

         
        </div>
      </nav>
    </>
  );
};

export default Navbar;
