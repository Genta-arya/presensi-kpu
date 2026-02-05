import React from "react";
import { useUserContext } from "../State/useContext";
import { FiLogOut } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const Headers = () => {
  const { selectedUser, setSelectedUser } = useUserContext();
  const navigate = useNavigate();
  if (!selectedUser) return null; // kalau belum ada user, kosong

  const handleLogout = () => {
    // hapus token & reset user context
    localStorage.removeItem("token");
    setSelectedUser(null);
    window.location.href = "/login"; // redirect ke login
  };

  return (
    <div className="flex items-center justify-between border-b-2 rounded-bl-[40px] rounded-br-[40px] pb-10 border-red-500 bg-white px-4 py-3 rounded-lg shadow-md">
      {/* Avatar + Info */}

      <div className="flex justify-between w-full items-center">
        <div className="flex items-center gap-4 mt-4">
          <img
            onClick={() => navigate("/profil/" + selectedUser.id)}
            src={selectedUser.avatar || "/default-avatar.png"}
            alt={selectedUser.name}
            className="w-16 h-16 rounded-full object-cover border-2 border-red-500"
          />

          <div className="flex flex-col">
            <p className="text-sm text-black font-bold mb-1">Selamat Datang,</p>
            <h2 className="text-xs w-48 lg:w-full font-bold text-red-600">
              {selectedUser.name}
            </h2>
            <p className="text-sm  w-48 lg:w-full text-gray-700 font-semibold">
              {selectedUser.jabatan}
            </p>
          </div>
        </div>

        {/* Tombol Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 mt-8 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition"
        >
          <FiLogOut className="text-lg" />
        </button>
      </div>
    </div>
  );
};

export default Headers;
