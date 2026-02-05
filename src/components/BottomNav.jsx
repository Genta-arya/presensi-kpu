import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  FaUsers,
  FaCheckCircle,
  FaCalendarAlt,
  FaFilePdf,
  FaSignOutAlt,
  FaHome,
} from "react-icons/fa";
import { useUserContext } from "../State/useContext";
import { FaGear, FaPerson } from "react-icons/fa6";

const BottomNav = () => {
  const navigate = useNavigate();
  const { selectedUser, setSelectedUser } = useUserContext();
  const handleSignOut = () => {
    localStorage.removeItem("token");
    setSelectedUser(null);
    navigate("/login");
  };

  console.log("Selected User in BottomNav:", selectedUser);

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t shadow z-40">
      <div className="flex justify-around items-center h-20">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex flex-col items-center text-xs ${
              isActive ? "text-red-600" : "text-gray-500"
            }`
          }
        >
          <FaHome size={32} className="mb-1" />
          Beranda
        </NavLink>

        <NavLink
          to={`/pengaturan`}
          className={({ isActive }) =>
            `flex flex-col items-center text-xs ${
              isActive ? "text-red-600" : "text-gray-500"
            }`
          }
        >
          <FaGear size={32} className="mb-1" />
          Pengaturan
        </NavLink>

        {/* <button
          onClick={handleSignOut}
          className="flex flex-col items-center text-xs text-gray-500"
        >
          <FaSignOutAlt size={20} />
          Keluar
        </button> */}
      </div>
    </div>
  );
};

export default BottomNav;
