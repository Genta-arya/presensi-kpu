import React, { useState, useEffect } from "react";
import { useUserContext } from "../State/useContext";
import { FiLogOut } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { CalendarCheck, LogOut, CheckCircle2, Info, CalendarOff } from "lucide-react";
import { JABATAN_LABELS } from "../Constants/Constants";
import useCheckLogin from "../State/useLogin";

// --- KOMPONEN SKELETON LOADING ---
const HeaderSkeleton = () => {
  return (
    <div className="bg-white border-b-[6px] border-gray-200 shadow-[0_12px_30px_-15px_rgba(0,0,0,0.08)] pt-4 pb-4 rounded-b-[28px] animate-pulse">
      <div className="mx-auto px-5">
        <div className="flex items-start justify-between w-full gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="w-12 h-12 flex-shrink-0 rounded-full bg-gray-200 border-2 border-white mt-0.5" />
            <div className="flex flex-col min-w-0 flex-1 pt-0.5 space-y-2">
              <div className="w-32 h-4 bg-gray-200 rounded-md" />
              <div className="w-20 h-3.5 bg-gray-100 rounded-md mt-1" />
            </div>
          </div>
          <div className="w-16 h-6 bg-gray-100 rounded-lg pt-1" />
        </div>
        <div className="grid grid-cols-2 gap-3 mt-4">
          <div className="bg-gray-100 h-9 rounded-xl" />
          <div className="bg-gray-100 h-9 rounded-xl" />
        </div>
      </div>
    </div>
  );
};

const Headers = () => {
  const { user, setUser } = useCheckLogin();
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 140);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!user) return <HeaderSkeleton />;

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    navigate("/login");
  };

  const namaJabatan =
    user?.jabatan?.nama || user?.jabatan?.nama_jabatan || "Pegawai";

  // --- LOGIKA PENGECEKAN JAM & STATUS ABSENSI ---
  const serverDate = user?.today ? new Date(user.today) : new Date();
  
  const hours = serverDate.getUTCHours();
  const minutes = serverDate.getUTCMinutes();
  const todayString = serverDate.toISOString().split("T")[0];

  // Filter absensi HANYA untuk hari ini
  const absenHariIni = user?.Absens?.find(item => {
    const targetDateStr = item.jam_masuk || item.createdAt;
    if (!targetDateStr) return false;
    const tanggalAbsen = new Date(targetDateStr).toISOString().split("T")[0];
    return tanggalAbsen === todayString;
  }) || null;

  const statusHariIni = absenHariIni ? absenHariIni.status : null;
  const isCutiAtauLibur = ["cuti", "cuti_luar", "libur", "izin", "sakit", "dinas_luar", "tugas_belajar", "tidak_hadir", "absen"].includes(statusHariIni);

  // Status sudah absen hanya berlaku jika statusnya hadir
  const sudahAbsenMasuk = Boolean(absenHariIni && absenHariIni.jam_masuk && statusHariIni === "hadir");
  const sudahAbsenPulang = Boolean(absenHariIni && absenHariIni.jam_keluar && statusHariIni === "hadir");

  // Cek apakah waktu server sudah memenuhi syarat buka tombol (Jam 07:30 UTC)
  const isWaktuMasukBuka = hours > 7 || (hours === 7 && minutes >= 30);
  
  // Cek apakah waktu server sudah memenuhi syarat pulang (Jam 15:00 UTC)
  const isWaktuPulangBuka = hours >= 15;

  // Penentuan aktif/tidaknya tombol
  const canClickMasuk = !isCutiAtauLibur && isWaktuMasukBuka && !absenHariIni;
  const canClickPulang = !isCutiAtauLibur && isWaktuPulangBuka && sudahAbsenMasuk && !sudahAbsenPulang;

  // --- FUNGSI PESAN BANNER BERDASARKAN STATUS ---
  const getStatusMessage = (status) => {
    switch (status) {
      case "cuti":
      case "cuti_luar":
        return "☕ Anda sedang menikmati masa cuti hari ini. Selamat beristirahat!";
      case "izin":
        return "📝 Anda tercatat izin untuk hari ini. Semoga urusannya lancar.";
      case "sakit":
        return "💊 Anda tercatat sakit hari ini. Semoga lekas diberikan kesembuhan.";
      case "dinas_luar":
        return "Briefcase Anda sedang menjalankan tugas Dinas Luar hari ini. Semangat!";
      case "tugas_belajar":
        return "📚 Anda sedang menjalani Tugas Belajar hari ini. Terus semangat!";
      case "libur":
        return "🌴 Hari ini adalah hari libur. Nikmati waktu santai Anda!";
      case "tidak_hadir":
      case "absen":
        return "⚠️ Anda tercatat tidak hadir / absen pada hari ini.";
      default:
        return sudahAbsenPulang
          ? "✨ Sempurna! Presensi masuk & pulang hari ini sudah diselesaikan."
          : "✅ Mantap! Presensi masuk hari ini sudah berhasil direkam.";
    }
  };

  return (
    <>
      {/* ========================================================= */}
      {/* VERSI 1: HEADER UTAMA (Normal di Atas Halaman)            */}
      {/* ========================================================= */}
      <div className="bg-white border-b-[6px] border-red-500 shadow-[0_12px_30px_-15px_rgba(0,0,0,0.08)] relative overflow-hidden pt-4 pb-4 rounded-b-[28px]">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-b from-red-500/5 to-transparent rounded-full blur-2xl pointer-events-none" />

        <div className="mx-auto px-5">
          {/* Baris Utama V1 */}
          <div className="flex items-start justify-between w-full gap-3">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <div
                onClick={() => navigate("/profil/" + user.id)}
                className="w-12 h-12 flex-shrink-0 rounded-full cursor-pointer shadow-sm border-2 border-white bg-gray-50 mt-0.5"
              >
                <img
                  src={user?.avatar || "/default-avatar.png"}
                  alt={user?.name}
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <div className="flex flex-col min-w-0 flex-1 pt-0.5">
                <h2 className="text-sm font-black text-gray-800 leading-tight break-words">
                  {user?.name}
                </h2>
                <div className="inline-block bg-red-50/70 border border-red-100 text-red-600 px-2 py-1 rounded-md max-w-full mt-1.5 w-fit">
                  <span className="text-[9px] font-bold tracking-wide uppercase break-words block leading-normal">
                    {JABATAN_LABELS[user?.jabatan?.kode] || namaJabatan}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center flex-shrink-0 pt-1">
              <button
                onClick={handleLogout}
                className="flex items-center gap-1 px-2 py-1 rounded-xl text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all"
                title="Keluar"
              >
                <FiLogOut size={16} />
                <span className="text-[10px] font-bold uppercase tracking-wider ml-0.5">
                  Keluar
                </span>
              </button>
            </div>
          </div>

          {/* Floating Action Panel V1 */}
          <div className="grid grid-cols-2 gap-3 mt-4">
            {/* Tombol Absen Masuk V1 */}
            <button
              disabled={!canClickMasuk}
              onClick={() => navigate(`/absensi/` + user?.id)}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black shadow-sm transition-all ${
                canClickMasuk
                  ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 cursor-pointer"
                  : isCutiAtauLibur
                    ? "bg-purple-50 text-purple-700 border border-purple-200/50 cursor-not-allowed"
                    : sudahAbsenMasuk
                      ? "bg-emerald-100/60 text-emerald-800/60 border border-emerald-200/50 cursor-not-allowed"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed opacity-60"
              }`}
            >
              {isCutiAtauLibur ? (
                <>
                  <CalendarOff size={16} className="text-purple-600" />
                  <span className="capitalize">{statusHariIni.replace("_", " ")}</span>
                </>
              ) : sudahAbsenMasuk ? (
                <>
                  <CheckCircle2 size={16} className="text-emerald-600" />
                  <span>Sudah Masuk</span>
                </>
              ) : (
                <>
                  <CalendarCheck size={16} />
                  <span>
                    Masuk {hours < 7 || (hours === 7 && minutes < 30) ? "(07:30)" : ""}
                  </span>
                </>
              )}
            </button>

            {/* Tombol Absen Pulang V1 */}
            <button
              disabled={!canClickPulang}
              onClick={() => navigate("/data/absen-pulang")}
              className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black shadow-sm transition-all ${
                canClickPulang
                  ? "bg-rose-50 text-rose-700 hover:bg-rose-100 cursor-pointer"
                  : isCutiAtauLibur
                    ? "bg-purple-50 text-purple-700 border border-purple-200/50 cursor-not-allowed"
                    : sudahAbsenPulang
                      ? "bg-rose-100/60 text-rose-800/60 border border-rose-200/50 cursor-not-allowed"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed opacity-60"
              }`}
            >
              {isCutiAtauLibur ? (
                <>
                  <CalendarOff size={16} className="text-purple-600" />
                  <span className="capitalize">{statusHariIni.replace("_", " ")}</span>
                </>
              ) : sudahAbsenPulang ? (
                <>
                  <CheckCircle2 size={16} className="text-rose-600" />
                  <span>Sudah Pulang</span>
                </>
              ) : (
                <>
                  <LogOut size={16} />
                  <span>
                    Pulang {!sudahAbsenMasuk ? "(Belum Masuk)" : hours < 16 ? "(16:00)" : ""}
                  </span>
                </>
              )}
            </button>
          </div>

          {/* --- KETERANGAN STATUS PRESENSI HARI INI (V1) --- */}
          {absenHariIni && (
            <div
              className={`mt-2.5 px-3 py-2 rounded-xl border flex items-center justify-center gap-1.5 text-[11px] font-bold transition-all ${
                isCutiAtauLibur
                  ? "bg-purple-50/80 border-purple-200/60 text-purple-700"
                  : sudahAbsenPulang
                    ? "bg-emerald-50/80 border-emerald-200/60 text-emerald-700"
                    : "bg-blue-50/80 border-blue-200/60 text-blue-700"
              }`}
            >
              <Info size={14} className="flex-shrink-0" />
              <span>{getStatusMessage(statusHariIni)}</span>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* VERSI 2: FIXED STICKY HEADER                              */}
      {/* ========================================================= */}
      <div
        className={`fixed top-0 left-0 right-0 z-50 bg-white border-b-4 border-red-500 shadow-md pt-3 pb-3 rounded-b-2xl transition-all duration-300 ease-in-out transform ${
          isScrolled
            ? "translate-y-0 opacity-100"
            : "-translate-y-full opacity-0 pointer-events-none"
        }`}
      >
        <div className="mx-auto px-5 space-y-3">
          {/* BARIS UTAMA V2 */}
          <div className="flex items-center justify-between w-full gap-3">
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <div
                onClick={() => navigate("/profil/" + user?.id)}
                className="w-10 h-10 flex-shrink-0 rounded-full cursor-pointer border border-gray-200"
              >
                <img
                  src={user?.avatar || "/default-avatar.png"}
                  alt={user?.name}
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <h2 className="text-xs font-black text-gray-800 leading-tight">
                  {user?.name}
                </h2>
                <div className="inline-block bg-red-50/70 border border-red-100 text-red-600 px-1.5 py-0.5 rounded mt-0.5 w-fit max-w-full">
                  <span className="text-[8px] font-bold tracking-wide uppercase block max-w-[180px] truncate">
                    {namaJabatan}
                  </span>
                </div>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center justify-center w-8 h-8 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 flex-shrink-0"
              title="Keluar"
            >
              <FiLogOut size={16} />
            </button>
          </div>

          {/* BARIS TOMBOL ABSEN V2 */}
          <div className="grid grid-cols-2 gap-2">
            {/* Tombol Absen Masuk V2 */}
            <button
              disabled={!canClickMasuk}
              onClick={() => navigate(`/absensi/` + user?.id)}
              className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[11px] font-black shadow-sm transition-all ${
                canClickMasuk
                  ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 cursor-pointer"
                  : isCutiAtauLibur
                    ? "bg-purple-50 text-purple-700 border border-purple-200/50 cursor-not-allowed"
                    : sudahAbsenMasuk
                      ? "bg-emerald-100/60 text-emerald-800/60 border border-emerald-200/50 cursor-not-allowed"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed opacity-60"
              }`}
            >
              {isCutiAtauLibur ? (
                <>
                  <CalendarOff size={14} className="text-purple-600" />
                  <span className="capitalize">{statusHariIni.replace("_", " ")}</span>
                </>
              ) : sudahAbsenMasuk ? (
                <>
                  <CheckCircle2 size={14} className="text-emerald-600" />
                  <span>Masuk (Selesai)</span>
                </>
              ) : (
                <>
                  <CalendarCheck size={14} /> Masuk
                </>
              )}
            </button>

            {/* Tombol Absen Pulang V2 */}
            <button
              disabled={!canClickPulang}
              onClick={() => navigate("/data/absen-pulang")}
              className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[11px] font-black shadow-sm transition-all ${
                canClickPulang
                  ? "bg-rose-50 text-rose-700 hover:bg-rose-100 cursor-pointer"
                  : isCutiAtauLibur
                    ? "bg-purple-50 text-purple-700 border border-purple-200/50 cursor-not-allowed"
                    : sudahAbsenPulang
                      ? "bg-rose-100/60 text-rose-800/60 border border-rose-200/50 cursor-not-allowed"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed opacity-60"
              }`}
            >
              {isCutiAtauLibur ? (
                <>
                  <CalendarOff size={14} className="text-purple-600" />
                  <span className="capitalize">{statusHariIni.replace("_", " ")}</span>
                </>
              ) : sudahAbsenPulang ? (
                <>
                  <CheckCircle2 size={14} className="text-rose-600" />
                  <span>Pulang (Selesai)</span>
                </>
              ) : (
                <>
                  <LogOut size={14} /> Pulang
                </>
              )}
            </button>
          </div>

          {/* --- KETERANGAN STATUS PRESENSI HARI INI (V2) --- */}
          {absenHariIni && (
            <div
              className={`px-2.5 py-1.5 rounded-lg border flex items-center justify-center gap-1 text-[10px] font-bold transition-all ${
                isCutiAtauLibur
                  ? "bg-purple-50/80 border-purple-200/60 text-purple-700"
                  : sudahAbsenPulang
                    ? "bg-emerald-50/80 border-emerald-200/60 text-emerald-700"
                    : "bg-blue-50/80 border-blue-200/60 text-blue-700"
              }`}
            >
              <Info size={13} className="flex-shrink-0" />
              <span className="truncate">{getStatusMessage(statusHariIni)}</span>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Headers;