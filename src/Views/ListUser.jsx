import React, { useEffect, useState } from "react";
import { listUser } from "../service/User/user.services";
import { FiRefreshCcw, FiSearch } from "react-icons/fi";
import {
  FaChevronDown,
  FaChevronUp,
  FaCalendarAlt,
  FaFileAlt,
} from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import { useUserContext } from "../State/useContext.jsx";
import Container from "../components/Container.jsx";
import { motion, AnimatePresence } from "framer-motion";
import Navigations from "./Navigation.jsx";
import { getAbsenByUserId } from "../service/Auth/absen.service.js";

import { toast } from "sonner";
import AttendanceCalendar from "./Presensi/Kalender.jsx";
import { GetLaporanByUser } from "../service/Laporan/Laporan.services.js";

// --- Helper Function untuk Sanitize HTML & Entitas (&nbsp;) ---
const sanitizeHtml = (html) => {
  if (!html) return "";
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = html;
  return tempDiv.textContent || tempDiv.innerText || "";
};

const SkeletonCard = () => (
  <div className="bg-white p-4 rounded-xl shadow-md border border-gray-200 animate-pulse">
    <div className="flex items-center gap-4">
      <div className="w-12 h-12 rounded-full bg-gray-200" />
      <div className="flex-1 space-y-2">
        <div className="w-32 h-4 bg-gray-200 rounded" />
        <div className="w-20 h-3 bg-gray-200 rounded" />
      </div>
    </div>
  </div>
);

// --- Komponen Item Laporan yang Lebih Rapi & Clean ---
const LaporanItem = ({ laporan }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const cleanDeskripsi = sanitizeHtml(laporan.deskripsi);
  const formattedDate = new Date(
    laporan.tanggal || laporan.createdAt,
  ).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div
      className="p-4 bg-white border border-gray-200 rounded-xl shadow-xs cursor-pointer hover:border-red-300 hover:shadow-md transition-all duration-200"
      onClick={() => setIsExpanded(!isExpanded)}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="bg-red-50 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0">
              {formattedDate}
            </span>
            <h4 className="font-bold text-gray-800 text-sm break-words">
              {laporan.judul || "Tanpa Judul"}
            </h4>
          </div>

          <AnimatePresence initial={false}>
            {isExpanded ? (
              <motion.div
                key="expanded"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="text-xs text-gray-600 whitespace-pre-wrap leading-relaxed pt-2 mt-2 border-t border-gray-100 break-words"
              >
                {cleanDeskripsi || "-"}
              </motion.div>
            ) : (
              <motion.p
                key="collapsed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xs text-gray-500 line-clamp-1 mt-1 break-words"
              >
                {cleanDeskripsi || "-"}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        <div className="text-gray-400 mt-1 shrink-0">
          {isExpanded ? <FaChevronUp size={14} /> : <FaChevronDown size={14} />}
        </div>
      </div>
    </div>
  );
};

const ListUser = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const [filterStatus, setFilterStatus] = useState("all");
  const [countSudah, setCountSudah] = useState(0);
  const [countBelum, setCountBelum] = useState(0);

  const [expandedUserId, setExpandedUserId] = useState(null);
  const [activeTab, setActiveTab] = useState({});

  const [userAbsenData, setUserAbsenData] = useState({});
  const [userLaporanData, setUserLaporanData] = useState({});
  const [attendanceLoading, setAttendanceLoading] = useState(false);
  const [laporanLoading, setLaporanLoading] = useState(false);

  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(
    currentDate.getMonth() + 1,
  );
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());

  const fetchLaporanForUser = async (userId) => {
    try {
      setLaporanLoading(true);
      const response = await GetLaporanByUser(userId);
      const data = Array.isArray(response?.data) ? response.data : [];
      data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      setUserLaporanData((prev) => ({
        ...prev,
        [userId]: data,
      }));
    } catch (error) {
      console.error(error);
      toast.error("Gagal memuat laporan harian.");
    } finally {
      setLaporanLoading(false);
    }
  };

  const fetchAbsenForUser = async (userId, month, year) => {
    try {
      setAttendanceLoading(true);
      const response = await getAbsenByUserId(userId, month, year);
      setUserAbsenData((prev) => ({
        ...prev,
        [userId]: response?.data || [],
      }));
    } catch (error) {
      console.error(error);
      toast.error("Gagal mengambil data presensi.");
    } finally {
      setAttendanceLoading(false);
    }
  };

  // Helper untuk mendapatkan absensi hari ini (berdasarkan tanggal UTC/Lokal sistem)
  const getAbsenHariIni = (absens) => {
    if (!Array.isArray(absens)) return null;
    const todayString = new Date().toISOString().split("T")[0];
    return absens.find((item) => {
      const targetDateStr = item.jam_masuk || item.createdAt;
      if (!targetDateStr) return false;
      return new Date(targetDateStr).toISOString().split("T")[0] === todayString;
    });
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await listUser();
      const data = response?.data || [];

      // Hitung hanya yang status hari ini bernilai "hadir"
      const sudah = data.filter((user) => {
        const absenHariIni = getAbsenHariIni(user.Absens);
        return absenHariIni && absenHariIni.status === "hadir";
      }).length;

      const belum = data.length - sudah;

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
        user.nip?.toLowerCase().includes(keyword),
    );
    setFilteredUsers(filtered);
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (expandedUserId) {
      fetchAbsenForUser(expandedUserId, selectedMonth, selectedYear);
      fetchLaporanForUser(expandedUserId);
    }
  }, [expandedUserId, selectedMonth, selectedYear]);

  useEffect(() => {
    let result = users;
    if (search) {
      result = result.filter(
        (user) =>
          user.name?.toLowerCase().includes(search) ||
          user.nip?.toLowerCase().includes(search),
      );
    }
    if (filterStatus === "sudah") {
      result = result.filter((user) => {
        const absenHariIni = getAbsenHariIni(user.Absens);
        return absenHariIni && absenHariIni.status === "hadir";
      });
    } else if (filterStatus === "belum") {
      result = result.filter((user) => {
        const absenHariIni = getAbsenHariIni(user.Absens);
        return !absenHariIni || absenHariIni.status !== "hadir";
      });
    }
    setFilteredUsers(result);
  }, [search, users, filterStatus]);

  const toggleExpand = (userId, isAnggotaAtauKetua, e) => {
    e.stopPropagation();
    if (isAnggotaAtauKetua) {
      navigate(`#`);
      return;
    }

    if (expandedUserId === userId) {
      setExpandedUserId(null);
    } else {
      setExpandedUserId(userId);
      if (!activeTab[userId]) {
        setActiveTab((prev) => ({ ...prev, [userId]: "kalender" }));
      }
      fetchAbsenForUser(userId, selectedMonth, selectedYear);
      fetchLaporanForUser(userId);
    }
  };

  const handleTabChange = (userId, tabName, e) => {
    e.stopPropagation();
    setActiveTab((prev) => ({ ...prev, [userId]: tabName }));
  };

  return (
    <>
      <Navigations title="Daftar Pegawai" />

      <div className="px-4 py-6 pt-20">
        <div className="flex lg:hidden flex-col sm:flex-row justify-between items-center gap-4 mb-6">
          <div className="flex flex-col gap-2 w-full">
            <div className="flex w-full gap-2">
              <div className="relative w-full">
                <input
                  type="text"
                  value={search}
                  onChange={handleSearch}
                  placeholder="Cari nama..."
                  className="w-full px-4 py-2 pl-10 pr-10 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
                <FiSearch className="absolute top-3 left-3 text-gray-400" />
                {search && (
                  <button
                    onClick={() => setSearch("")}
                    className="absolute top-2 right-3 text-gray-400 hover:text-gray-600"
                    aria-label="Clear search"
                  >
                    ×
                  </button>
                )}
              </div>
              <button
                onClick={() => {
                  setSearch("");
                  setFilterStatus("all");
                  fetchData();
                }}
                aria-label="Refresh"
                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition"
              >
                <FiRefreshCcw className="text-lg" />
              </button>
            </div>
          </div>
        </div>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="border mb-4 text-sm -mt-4 w-full border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          <option value="all">Semua ({users.length})</option>
          <option value="sudah">Sudah Absen ({countSudah})</option>
          <option value="belum">Belum Absen ({countBelum})</option>
        </select>

        {loading ? (
          <div className="space-y-3 pb-20">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : filteredUsers.length === 0 ? (
          <p className="text-gray-500 text-center py-10">
            Tidak ditemukan pegawai.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-3 pb-20">
            {filteredUsers.map((user) => {
              const jabatanText =
                typeof user.jabatan === "object"
                  ? user.jabatan?.nama || user.jabatan?.nama_jabatan
                  : user.jabatan || "-";

              const jabatanLower = jabatanText.toLowerCase();
              const isAnggotaAtauKetua =
                jabatanLower.includes("anggota") ||
                jabatanLower.includes("ketua");

              const isExpanded = expandedUserId === user.id;
              const currentTab = activeTab[user.id] || "kalender";
              
              // Cek absen hari ini secara spesifik statusnya
              const absenHariIni = getAbsenHariIni(user.Absens);
              const statusHariIni = absenHariIni ? absenHariIni.status : null;
              const isHadir = statusHariIni === "hadir";
              const isCutiAtauIzin = ["cuti", "cuti_luar", "izin", "sakit", "dinas_luar"].includes(statusHariIni);

              return (
                <motion.div
                  key={user.id}
                  className="bg-white rounded-xl shadow-md border border-red-100 overflow-hidden transition"
                >
                  {/* Bagian Header Kartu */}
                  <div
                    onClick={(e) =>
                      toggleExpand(user.id, isAnggotaAtauKetua, e)
                    }
                    className="p-4 flex justify-between items-center gap-4 cursor-pointer hover:bg-gray-50 transition"
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={user.avatar || "/default-avatar.png"}
                        alt={user.name}
                        className="w-12 h-12 rounded-full object-cover border border-gray-200"
                      />
                      <div>
                        <h2 className="text-base font-bold text-red-600 mb-1">
                          {user.name || "Tanpa Nama"}
                        </h2>
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-sm font-semibold text-gray-700">
                            {jabatanText}
                          </p>
                          {/* BADGE / PENANDA STATUS HARI INI */}
                          {isHadir && (
                            <span className="bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                              Sudah Absen
                            </span>
                          )}
                          {isCutiAtauIzin && (
                            <span className="bg-purple-100 text-purple-700 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                              {statusHariIni.replace("_", " ")}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {!isAnggotaAtauKetua && (
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
                          {isExpanded ? (
                            <FaChevronUp size={14} />
                          ) : (
                            <FaChevronDown size={14} />
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bagian Konten Expand (Hanya untuk non-anggota/non-ketua) */}
                  {!isAnggotaAtauKetua && (
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="border-t border-gray-100 bg-gray-50 p-4"
                        >
                          {/* Tab Navigasi */}
                          <div className="flex border-b border-gray-200 mb-4">
                            <button
                              onClick={(e) =>
                                handleTabChange(user.id, "kalender", e)
                              }
                              className={`flex items-center gap-2 pb-2 px-4 text-sm font-semibold border-b-2 transition ${
                                currentTab === "kalender"
                                  ? "border-red-600 text-red-600"
                                  : "border-transparent text-gray-500 hover:text-gray-700"
                              }`}
                            >
                              <FaCalendarAlt size={14} /> Kalender Absensi
                            </button>
                            <button
                              onClick={(e) =>
                                handleTabChange(user.id, "laporan", e)
                              }
                              className={`flex items-center gap-2 pb-2 px-4 text-sm font-semibold border-b-2 transition ${
                                currentTab === "laporan"
                                  ? "border-red-600 text-red-600"
                                  : "border-transparent text-gray-500 hover:text-gray-700"
                              }`}
                            >
                              <FaFileAlt size={14} /> Laporan Harian
                            </button>
                          </div>

                          {/* Konten Tab */}
                          <div className="bg-white p-4 rounded-xl border border-gray-200 min-h-[150px]">
                            {currentTab === "kalender" ? (
                              <div>
                                {attendanceLoading ? (
                                  <div className="text-center py-6 text-sm text-gray-500">
                                    Memuat kalender absensi...
                                  </div>
                                ) : (
                                  <AttendanceCalendar
                                    data={userAbsenData[user.id] || []}
                                    selectedMonth={selectedMonth}
                                    selectedYear={selectedYear}
                                    setSelectedMonth={setSelectedMonth}
                                    setSelectedYear={setSelectedYear}
                                  />
                                )}
                              </div>
                            ) : (
                              <div>
                                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                                  Riwayat Laporan Harian
                                </h3>
                                {laporanLoading ? (
                                  <div className="text-center py-6 text-sm text-gray-500">
                                    Memuat laporan harian...
                                  </div>
                                ) : userLaporanData[user.id] &&
                                  userLaporanData[user.id].length > 0 ? (
                                  <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                                    {userLaporanData[user.id].map(
                                      (laporan, idx) => (
                                        <LaporanItem
                                          key={laporan.id || idx}
                                          laporan={laporan}
                                        />
                                      ),
                                    )}
                                  </div>
                                ) : (
                                  <div className="p-4 bg-gray-50 rounded-lg text-center text-xs text-gray-400 border border-dashed border-gray-300">
                                    Belum ada laporan harian.
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};

export default ListUser;