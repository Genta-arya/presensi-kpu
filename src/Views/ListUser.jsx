import React, { useEffect, useState } from "react";
import { listUser } from "../service/User/user.services";
import { FiRefreshCcw, FiSearch } from "react-icons/fi";
import { FaChevronRight } from "react-icons/fa6";
import { useNavigate } from "react-router-dom";
import { useUserContext } from "../State/useContext.jsx";
import Container from "../components/Container.jsx";
import { motion } from "framer-motion";

const SkeletonCard = () => (
  <div className="bg-white p-4 rounded-xl   shadow-md border border-gray-200 animate-pulse">
    <div className="flex items-center gap-4 ">
      <div className="w-12 h-12 rounded-full bg-gray-200" />
      <div className="flex-1 space-y-2">
        <div className="w-32 h-4 bg-gray-200 rounded" />
        <div className="w-20 h-3 bg-gray-200 rounded" />
      </div>
    </div>
  </div>
);

const ListUser = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const [filterStatus, setFilterStatus] = useState("all");
  const [countSudah, setCountSudah] = useState(0);
  const [countBelum, setCountBelum] = useState(0);

  const { setSelectedUser } = useUserContext();

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await listUser();
      const data = response?.data || [];

      // Hitung jumlah yang sudah dan belum absen
      const sudah = data.filter((user) => user.Absens?.length > 0).length;
      const belum = data.filter(
        (user) => !user.Absens || user.Absens.length === 0
      ).length;

      setCountSudah(sudah);
      setCountBelum(belum);
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

  useEffect(() => {
    let result = users;

    // filter berdasarkan nama atau NIP
    if (search) {
      result = result.filter(
        (user) =>
          user.name?.toLowerCase().includes(search) ||
          user.nip?.toLowerCase().includes(search)
      );
    }

    // filter berdasarkan status absen
    if (filterStatus === "sudah") {
      result = result.filter((user) => user.Absens?.length > 0);
    } else if (filterStatus === "belum") {
      result = result.filter(
        (user) => !user.Absens || user.Absens.length === 0
      );
    }

    setFilteredUsers(result);
  }, [search, users, filterStatus]);

  return (
    <>
      <Container>
        <div className="flex lg:hidden flex-col sm:flex-row justify-between items-center gap-4 mb-6">
          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative w-full">
              <input
                type="text"
                value={search}
                onChange={handleSearch}
                placeholder="Cari nama..."
                className="w-full sm:w-64 px-4 py-2 pl-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <FiSearch className="absolute top-3 left-3 text-gray-400" />
            </div>
            <button
              onClick={fetchData}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition"
            >
              <FiRefreshCcw className="text-lg" />
            </button>
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="border w-full border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="all">Semua ({users.length})</option>
            <option value="sudah">Sudah Absen ({countSudah})</option>
            <option value="belum">Belum Absen ({countBelum})</option>
          </select>
        </div>

        {loading ? (
          <div className="space-y-3 pb-20">
            {Array.from({ length: 10 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : filteredUsers.length === 0 ? (
          <p className="text-gray-500 text-center">Tidak ditemukan.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-1 gap-2 pb-20 ">
            {filteredUsers.map((user, index) => (
              <motion.div
                key={user.id}
                onClick={() => {
                  setSelectedUser(user);
                  navigate(`/absensi/${user.id}`);
                }}
                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{
                  delay: index * 0.05,
                  duration: 0.8,
                  type: "spring",
                  stiffness: 300,
                }}
                className="bg-white p-4 rounded-xl shadow-md border border-red-100 hover:shadow-lg transition cursor-pointer"
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
                  {user.Absens?.length > 0 ? (
                    <div className="text-green-600 font-bold text-xl">✓</div>
                  ) : (
                    <FaChevronRight className="font-bold text-gray-400" />
                  )}
                </div>

                {user.Absens?.length > 0 && (
                  <div className="mt-3 bg-green-500 rounded-md py-2 border-t border-green-500 text-center">
                    <p className="text-sm text-white font-semibold">
                      Sudah Absen
                    </p>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </Container>

      {/* Desktop block message */}
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
