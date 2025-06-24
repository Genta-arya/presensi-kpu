import React, { useEffect, useState } from "react";
import { listUser } from "../service/User/user.services";
import { FiRefreshCcw, FiSearch } from "react-icons/fi";
import { FaChevronCircleRight } from "react-icons/fa";
import { FaChevronRight } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import { useUserContext } from "../State/useContext.jsx";


const ListUser = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const { setSelectedUser } = useUserContext();
  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await listUser();
      const data = response?.data || [];
      setUsers(data);
      setFilteredUsers(data);
    } catch (error) {
      console.error("Gagal ambil data user:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    const keyword = e.target.value.toLowerCase();
    setSearch(keyword);
    const filtered = users.filter(
      (user) =>
        user.name?.toLowerCase().includes(keyword) ||
        user.nip?.toLowerCase().includes(keyword)
    );
    setFilteredUsers(filtered);
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <>
      <div className="p-6 min-h-screen bg-gradient-to-br from-red-100 to-red-200 lg:hidden">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
      
          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative w-full">
              <input
                type="text"
                value={search}
                onChange={handleSearch}
                placeholder="Cari nama..."
                className="w-full sm:w-64 px-4 py-2 pl-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <FiSearch className="absolute top-2.5 left-3 text-gray-400" />
            </div>
            <button
              onClick={fetchData}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition"
            >
              <FiRefreshCcw className="text-lg" />
              Refresh
            </button>
          </div>
        </div>

        {loading ? (
          <p className="text-gray-500 text-center">Loading...</p>
        ) : filteredUsers.length === 0 ? (
          <p className="text-gray-500 text-center">Tidak ditemukan.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-1 gap-2">
            {filteredUsers.map((user) => (
              <div
                onClick={() => {
                  setSelectedUser(user); // kirim data user ke global
                  navigate(`/absensi/${user.id}`);
                }}
                key={user.id}
                className="bg-white p-4 rounded-xl shadow-md border border-red-100 hover:shadow-lg transition"
              >
                <div className="flex justify-between items-center gap-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={user.avatar || "/default-avatar.png"}
                      alt=""
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <h2 className="text-lg font-semibold text-red-600 mb-1">
                        {user.name || "Tanpa Nama"}
                      </h2>
                      <p className="text-sm text-gray-700">
                        <strong>NIP:</strong> {user.nip || "-"}
                      </p>
                    </div>
                  </div>

                  <FaChevronRight className="font-bold" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="hidden lg:block">
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 text-center px-4">
          <h1 className="text-3xl font-bold text-red-600 mb-4">Ooopsss</h1>
          <p className="text-lg text-gray-700">
            Aplikasi ini hanya bisa diakses melalui perangkat{" "}
            <strong>Smartphone</strong>.
          </p>
          <p className="text-sm text-gray-500 mt-2">
            Silakan buka aplikasi ini di HP kamu ya ✨
          </p>
        </div>
      </div>
    </>
  );
};

export default ListUser;
