import React from "react";
import { NavLink } from "react-router-dom";
import { FaUsers, FaComments, FaCheckCircle } from "react-icons/fa";

const BottomNav = () => {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow z-50">
      <div className="flex justify-around items-center h-20">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex flex-col items-center text-xs ${
              isActive ? "text-red-600" : "text-gray-500"
            }`
          }
        >
          <FaCheckCircle size={20} />
          Kehadiran
        </NavLink>
        <NavLink
          to="/presensi-apel"
          className={({ isActive }) =>
            `flex flex-col items-center text-xs ${
              isActive ? "text-red-600" : "text-gray-500"
            }`
          }
        >
          <FaUsers size={20} />
          Apel
        </NavLink>

        <NavLink
          to="/presensi-rapat"
          className={({ isActive }) =>
            `flex flex-col items-center text-xs ${
              isActive ? "text-red-600" : "text-gray-500"
            }`
          }
        >
          <FaComments size={20} />
          Rapat
        </NavLink>
      </div>
    </div>
  );
};

export default BottomNav;
