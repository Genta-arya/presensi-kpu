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

  // Penghitungan status kehadiran lengkap termasuk cuti & dinas luar
  const hadir = data.filter((d) => d.status === "hadir").length;
  const izin = data.filter((d) => d.status === "izin").length;
  const sakit = data.filter((d) => d.status === "sakit").length;
  const alpha = data.filter((d) => d.status === "alpha" || d.status === "absen" || d.status === "tidak_hadir").length;
  const cuti = data.filter((d) => d.status === "cuti" || d.status === "cuti_luar").length;
  const dinasLuar = data.filter((d) => d.status === "dinas_luar").length;

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
        <div className="max-w-6xl mx-auto px-4">
          
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

          {/* STATS (DIPERLUAS DENGAN CUTI & DINAS LUAR) */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-6">
            {/* Hadir */}
            <div className="bg-white rounded-3xl p-4 shadow-lg border border-emerald-100">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-500 text-xs font-semibold">Hadir</p>
                  <h1 className="text-2xl font-black text-emerald-600 mt-2">{hadir}</h1>
                </div>
                <div className="bg-emerald-100 p-2.5 rounded-2xl">
                  <CheckCircle2 className="text-emerald-600" size={20} />
                </div>
              </div>
            </div>

            {/* Izin */}
            <div className="bg-white rounded-3xl p-4 shadow-lg border border-yellow-100">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-500 text-xs font-semibold">Izin</p>
                  <h1 className="text-2xl font-black text-yellow-500 mt-2">{izin}</h1>
                </div>
                <div className="bg-yellow-100 p-2.5 rounded-2xl">
                  <Clock3 className="text-yellow-500" size={20} />
                </div>
              </div>
            </div>

            {/* Sakit */}
            <div className="bg-white rounded-3xl p-4 shadow-lg border border-sky-100">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-500 text-xs font-semibold">Sakit</p>
                  <h1 className="text-2xl font-black text-sky-500 mt-2">{sakit}</h1>
                </div>
                <div className="bg-sky-100 p-2.5 rounded-2xl">
                  <Stethoscope className="text-sky-500" size={20} />
                </div>
              </div>
            </div>

            {/* Cuti */}
            <div className="bg-white rounded-3xl p-4 shadow-lg border border-purple-100">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-500 text-xs font-semibold">Cuti</p>
                  <h1 className="text-2xl font-black text-purple-600 mt-2">{cuti}</h1>
                </div>
                <div className="bg-purple-100 p-2.5 rounded-2xl">
                  <Palmtree className="text-purple-600" size={20} />
                </div>
              </div>
            </div>

            {/* Dinas Luar */}
            <div className="bg-white rounded-3xl p-4 shadow-lg border border-indigo-100">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-500 text-xs font-semibold">Dinas Luar</p>
                  <h1 className="text-2xl font-black text-indigo-600 mt-2">{dinasLuar}</h1>
                </div>
                <div className="bg-indigo-100 p-2.5 rounded-2xl">
                  <Briefcase className="text-indigo-600" size={20} />
                </div>
              </div>
            </div>

            {/* Alpha / Tidak Hadir */}
            <div className="bg-white rounded-3xl p-4 shadow-lg border border-red-100">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-gray-500 text-xs font-semibold">Alpha</p>
                  <h1 className="text-2xl font-black text-red-500 mt-2">{alpha}</h1>
                </div>
                <div className="bg-red-100 p-2.5 rounded-2xl">
                  <XCircle className="text-red-500" size={20} />
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
    </>
  );
};

export default ListPresensi;