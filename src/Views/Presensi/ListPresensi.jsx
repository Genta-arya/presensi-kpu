import React from "react";
import "react-calendar/dist/Calendar.css";

import Navigations from "../Navigation";
import useCheckLogin from "../../State/useLogin";

import {
  CheckCircle2,
  XCircle,
  Clock3,
  Stethoscope,
  CalendarDays,
  Sparkles,
  Briefcase,
  Palmtree,
  BookOpen,
  UserX,
  X,
} from "lucide-react";

import { toast } from "sonner";
import { getAbsenByUserId } from "../../service/Auth/absen.service";

import Loading from "../../components/Loading";
import AttendanceCalendar from "./Kalender";
import { Helmet } from "react-helmet-async";

const ListPresensi = () => {
  const [data, setData] = React.useState([]);
  const [isLoading, setIsLoading] = React.useState(true);
  
  const [selectedMonth, setSelectedMonth] = React.useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = React.useState(new Date().getFullYear());

  // State untuk Modal Detail Status
  const [modalOpen, setModalOpen] = React.useState(false);
  const [modalTitle, setModalTitle] = React.useState("");
  const [modalItems, setModalItems] = React.useState([]);

  const { user } = useCheckLogin();

  const fethcAbsen = async () => {
    try {
      setIsLoading(true);
      const response = await getAbsenByUserId(user?.id, selectedMonth, selectedYear);
      setData(response.data || []);
    } catch (error) {
      console.error(error);
      toast.error("Gagal mengambil data presensi.");
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    if (user?.id) {
      fethcAbsen();
    }
  }, [user, selectedMonth, selectedYear]);

  // Filter data berdasarkan status
  const listHadir = data.filter((d) => d.status === "hadir");
  const listAbsen = data.filter((d) => d.status === "absen");
  const listIzin = data.filter((d) => d.status === "izin");
  const listSakit = data.filter((d) => d.status === "sakit");
  const listCuti = data.filter((d) => d.status === "cuti");
  const listCutiLuar = data.filter((d) => d.status === "cuti_luar");
  const listDinasLuar = data.filter((d) => d.status === "dinas_luar");
  const listTugasBelajar = data.filter((d) => d.status === "tugas_belajar");
  const listTidakHadir = data.filter((d) => d.status === "tidak_hadir");

  const openDetailModal = (title, items) => {
    setModalTitle(title);
    setModalItems(items);
    setModalOpen(true);
  };

  const formatTanggalWIB = (dateString) => {
    if (!dateString) return "-";
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "-";
    return d.toLocaleDateString("id-ID", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  const months = [
    { value: 1, label: "Januari" },
    { value: 2, label: "Februari" },
    { value: 3, label: "Maret" },
    { value: 4, label: "April" },
    { value: 5, label: "Mei" },
    { value: 6, label: "Juni" },
    { value: 7, label: "Juli" },
    { value: 8, label: "Agustus" },
    { value: 9, label: "September" },
    { value: 10, label: "Oktober" },
    { value: 11, label: "November" },
    { value: 12, label: "Desember" },
  ];

  if (isLoading) return <Loading />;

  return (
    <>
      <Navigations title="Kembali" />
      <Helmet>
        <title>Rekap Presensi</title>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-b from-red-50 via-white to-white pt-20 pb-10">
        <div className=" mx-auto px-4">
          
          {/* HEADER */}
          <div className="bg-gradient-to-r from-red-600 via-red-500 to-red-400 rounded-[32px] p-6 shadow-2xl text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 opacity-10 text-[180px] font-black">
              📅
            </div>

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-white/20 p-3 rounded-2xl backdrop-blur">
                  <CalendarDays size={28} />
                </div>

                <div>
                  <h1 className="text-xl font-black">Kalender Presensi</h1>
                  <p className="text-red-100 text-sm">Monitoring kehadiran pegawai</p>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-5 text-sm bg-white/10 w-fit px-4 py-2 rounded-full backdrop-blur">
                <Sparkles size={16} />
                Rekapitulasi kehadiran bulanan
              </div>
            </div>
          </div>

          {/* FILTER BULAN & TAHUN */}
          <div className="bg-white rounded-3xl p-5 text-xs shadow-lg border border-gray-100 mt-6 flex flex-wrap gap-4 items-center">
            <div className="flex flex-col gap-1 min-w-[150px]">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Bulan</label>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                className="w-full bg-gray-50 border border-gray-200 text-gray-700 py-2.5 px-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-sm font-medium"
              >
                {months.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1 min-w-[120px]">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Tahun</label>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="w-full bg-gray-50 border border-gray-200 text-gray-700 py-2.5 px-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 text-sm font-medium"
              >
                {years.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>

          {/* STATS (DAPAT DIKLIK) */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
            
            {/* Hadir */}
            <div 
              onClick={() => openDetailModal("Daftar Kehadiran (Hadir)", listHadir)}
              className="bg-white rounded-3xl p-4 shadow-lg border border-emerald-100 cursor-pointer hover:shadow-xl hover:border-emerald-300 transition-all"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-500 text-xs font-semibold">Hadir</p>
                  <h1 className="text-2xl font-black text-emerald-600 mt-2">{listHadir.length}</h1>
                </div>
                <div className="bg-emerald-100 p-2.5 rounded-2xl">
                  <CheckCircle2 className="text-emerald-600" size={20} />
                </div>
              </div>
            </div>

            {/* Absen */}
            <div 
              onClick={() => openDetailModal("Daftar Absen", listAbsen)}
              className="bg-white rounded-3xl p-4 shadow-lg border border-red-100 cursor-pointer hover:shadow-xl hover:border-red-300 transition-all"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-500 text-xs font-semibold">Absen</p>
                  <h1 className="text-2xl font-black text-red-500 mt-2">{listAbsen.length}</h1>
                </div>
                <div className="bg-red-100 p-2.5 rounded-2xl">
                  <XCircle className="text-red-500" size={20} />
                </div>
              </div>
            </div>

            {/* Izin */}
            <div 
              onClick={() => openDetailModal("Daftar Izin", listIzin)}
              className="bg-white rounded-3xl p-4 shadow-lg border border-yellow-100 cursor-pointer hover:shadow-xl hover:border-yellow-300 transition-all"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-500 text-xs font-semibold">Izin</p>
                  <h1 className="text-2xl font-black text-yellow-500 mt-2">{listIzin.length}</h1>
                </div>
                <div className="bg-yellow-100 p-2.5 rounded-2xl">
                  <Clock3 className="text-yellow-500" size={20} />
                </div>
              </div>
            </div>

            {/* Sakit */}
            <div 
              onClick={() => openDetailModal("Daftar Sakit", listSakit)}
              className="bg-white rounded-3xl p-4 shadow-lg border border-sky-100 cursor-pointer hover:shadow-xl hover:border-sky-300 transition-all"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-500 text-xs font-semibold">Sakit</p>
                  <h1 className="text-2xl font-black text-sky-500 mt-2">{listSakit.length}</h1>
                </div>
                <div className="bg-sky-100 p-2.5 rounded-2xl">
                  <Stethoscope className="text-sky-500" size={20} />
                </div>
              </div>
            </div>

            {/* Cuti */}
            <div 
              onClick={() => openDetailModal("Daftar Cuti", listCuti)}
              className="bg-white rounded-3xl p-4 shadow-lg border border-purple-100 cursor-pointer hover:shadow-xl hover:border-purple-300 transition-all"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-500 text-xs font-semibold">Cuti</p>
                  <h1 className="text-2xl font-black text-purple-600 mt-2">{listCuti.length}</h1>
                </div>
                <div className="bg-purple-100 p-2.5 rounded-2xl">
                  <Palmtree className="text-purple-600" size={20} />
                </div>
              </div>
            </div>

            {/* Cuti Luar */}
            <div 
              onClick={() => openDetailModal("Daftar Cuti Luar (CLT)", listCutiLuar)}
              className="bg-white rounded-3xl p-4 shadow-lg border border-orange-100 cursor-pointer hover:shadow-xl hover:border-orange-300 transition-all"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-500 text-xs font-semibold">Cuti Luar (CLT)</p>
                  <h1 className="text-2xl font-black text-orange-500 mt-2">{listCutiLuar.length}</h1>
                </div>
                <div className="bg-orange-100 p-2.5 rounded-2xl">
                  <Palmtree className="text-orange-500" size={20} />
                </div>
              </div>
            </div>

            {/* Dinas Luar */}
            <div 
              onClick={() => openDetailModal("Daftar Dinas Luar", listDinasLuar)}
              className="bg-white rounded-3xl p-4 shadow-lg border border-blue-100 cursor-pointer hover:shadow-xl hover:border-blue-300 transition-all"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-500 text-xs font-semibold">Dinas Luar</p>
                  <h1 className="text-2xl font-black text-blue-500 mt-2">{listDinasLuar.length}</h1>
                </div>
                <div className="bg-blue-100 p-2.5 rounded-2xl">
                  <Briefcase className="text-blue-500" size={20} />
                </div>
              </div>
            </div>

            {/* Tugas Belajar */}
            <div 
              onClick={() => openDetailModal("Daftar Tugas Belajar", listTugasBelajar)}
              className="bg-white rounded-3xl p-4 shadow-lg border border-indigo-100 cursor-pointer hover:shadow-xl hover:border-indigo-300 transition-all"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-500 text-xs font-semibold">Tugas Belajar</p>
                  <h1 className="text-2xl font-black text-indigo-600 mt-2">{listTugasBelajar.length}</h1>
                </div>
                <div className="bg-indigo-100 p-2.5 rounded-2xl">
                  <BookOpen className="text-indigo-600" size={20} />
                </div>
              </div>
            </div>

            {/* Tidak Hadir */}
            <div 
              onClick={() => openDetailModal("Daftar Tidak Hadir", listTidakHadir)}
              className="bg-white rounded-3xl p-4 shadow-lg border border-rose-100 col-span-2 md:col-span-3 lg:col-span-4 cursor-pointer hover:shadow-xl hover:border-rose-300 transition-all"
            >
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-gray-500 text-xs font-semibold">Tidak Hadir</p>
                  <h1 className="text-2xl font-black text-rose-500 mt-1">{listTidakHadir.length}</h1>
                </div>
                <div className="bg-rose-100 p-3 rounded-2xl">
                  <UserX className="text-rose-500" size={22} />
                </div>
              </div>
            </div>

          </div>

          <AttendanceCalendar 
            data={data} 
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            setSelectedMonth={setSelectedMonth}
            setSelectedYear={setSelectedYear}
          />

        </div>
      </div>

      {/* --- MODAL DETAIL HARI & TANGGAL (DENGAN SCROLL) --- */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-xl border border-slate-100 w-full max-w-3xl overflow-hidden flex flex-col max-h-[80vh]">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <div>
                <h3 className="text-base font-black text-slate-800">{modalTitle}</h3>
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  Periode: {months.find(m => m.value === selectedMonth)?.label} {selectedYear} ({modalItems.length} Hari)
                </p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body (Dapat di-scroll jika banyak data) */}
            <div className="p-5 overflow-y-auto space-y-3 flex-1 max-h-96">
              {modalItems.length === 0 ? (
                <div className="text-center py-10 text-gray-400 text-sm">
                  Tidak ada data untuk status ini pada bulan tersebut.
                </div>
              ) : (
                modalItems.map((item, idx) => {
                  const targetDate = item.jam_masuk || item.createdAt;
                  return (
                    <div 
                      key={item.id || idx}
                      className="bg-slate-50 border border-slate-200/60 p-4 rounded-2xl flex flex-col gap-1"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-red-100 text-red-600 text-xs font-bold flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <span className="text-xs font-bold text-slate-800">
                          {formatTanggalWIB(targetDate)}
                        </span>
                      </div>

                      {item.keterangan && (
                        <p className="text-xs text-slate-500 pl-8 mt-0.5">
                          <span className="font-semibold text-slate-700">Keterangan:</span> {item.keterangan}
                        </p>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-end">
              <button
                onClick={() => setModalOpen(false)}
                className="bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold px-5 py-2.5 rounded-xl transition-colors"
              >
                Tutup
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
};

export default ListPresensi;