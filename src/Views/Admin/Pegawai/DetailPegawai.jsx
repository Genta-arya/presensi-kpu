import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { SingleUsers } from "../../../service/User/user.services";
import { toast } from "sonner";
import Loading from "../../../components/Loading";
import {
  ArrowLeft,
  Briefcase,
  Building2,
  User,
  Shield,
  IdCard,
  CalendarDays,
  FileSpreadsheet,
  ChevronRight,
  X,
} from "lucide-react";
import AbsenRow from "./AbsenRow";
import AttendanceCalendar from "./AttendanceCalendar";
import { getAbsenByUserId } from "../../../service/Auth/absen.service";

const DetailPegawai = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPresensiOpen, setIsPresensiOpen] = useState(false);
  const [isLaporanOpen, setIsLaporanOpen] = useState(false);
  const [modalData, setModalData] = useState([]);
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth() + 1);
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        setIsLoading(true);
        const res = await SingleUsers(id);
        setData(res.data);
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Gagal memuat data pegawai",
        );
        navigate("/dashboard/pegawai");
      } finally {
        setIsLoading(false);
      }
    })();
  }, [id]);

  useEffect(() => {
    if (isPresensiOpen && id) {
      (async () => {
        try {
          setIsModalLoading(true);
          const res = await getAbsenByUserId(id, filterMonth, filterYear);
          setModalData(res.data || []);
        } catch {
          setModalData([]);
        } finally {
          setIsModalLoading(false);
        }
      })();
    }
  }, [filterMonth, filterYear, isPresensiOpen, id]);

  if (isLoading) return <Loading />;
  if (!data)
    return (
      <div className="p-6 text-center text-slate-500">
        Data tidak ditemukan.
      </div>
    );

  const textJabatan =
    data.jabatan?.nama_subbagian || data.jabatan?.nama || "Umum";
  const namaSubbagian =
    data.strukturUnit?.[0]?.unitKerja?.nama || "Belum Masuk Subbagian";
  const posisiStruktur = data.strukturUnit?.[0]?.posisi || "STAFF";

  const listBulan = [
    { v: 1, n: "Januari" },
    { v: 2, n: "Februari" },
    { v: 3, n: "Maret" },
    { v: 4, n: "April" },
    { v: 5, n: "Mei" },
    { v: 6, n: "Juni" },
    { v: 7, n: "Juli" },
    { v: 8, n: "Agustus" },
    { v: 9, n: "September" },
    { v: 10, n: "Oktober" },
    { v: 11, n: "November" },
    { v: 12, n: "Desember" },
  ];

  return (
    <div className="space-y-6 p-1 animate-fade-in relative text-sm">
      {/* HEADER BAR */}
      <div className="bg-white p-4 rounded-3xl border border-slate-100 flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2.5 hover:bg-slate-50 rounded-xl text-slate-600 border border-slate-100 transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <h1 className="text-lg font-black text-slate-800">Detail Pegawai</h1>
      </div>

      {/* QUICK ACTIONS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <button
          onClick={() => setIsPresensiOpen(true)}
          className="flex items-center justify-between bg-white p-5 rounded-3xl border border-slate-100 shadow-xs hover:border-red-200 transition-all text-left group"
        >
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-emerald-50 text-emerald-600 rounded-2xl group-hover:bg-emerald-600 group-hover:text-white transition-all">
              <CalendarDays size={22} />
            </div>
            <div>
              <h4 className="font-black text-slate-800 text-sm">
                Detail Presensi
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Buka Kalender Presensi
              </p>
            </div>
          </div>
          <ChevronRight
            size={18}
            className="text-slate-300 group-hover:text-slate-700 transition-colors ml-2 shrink-0"
          />
        </button>

        <button
          onClick={() => setIsLaporanOpen(true)}
          className="flex items-center justify-between bg-white p-5 rounded-3xl border border-slate-100 shadow-xs hover:border-red-200 transition-all text-left group"
        >
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-blue-50 text-blue-600 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-all">
              <FileSpreadsheet size={22} />
            </div>
            <div>
              <h4 className="font-black text-slate-800 text-sm">
                Laporan Harian
              </h4>
              <p className="text-xs text-slate-400 mt-0.5">
                Periksa log riwayat capaian kinerja
              </p>
            </div>
          </div>
          <ChevronRight
            size={18}
            className="text-slate-300 group-hover:text-slate-700 transition-colors ml-2 shrink-0"
          />
        </button>
      </div>

      {/* MODAL RIWAYAT PRESENSI */}
      {isPresensiOpen && (
        <div className="fixed inset-[-50px] z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-6xl h-[90vh] flex flex-col shadow-2xl border border-slate-100 overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-100 flex justify-between items-center shrink-0">
              <div>
                <h3 className="text-lg font-black text-slate-800">
                  Riwayat Presensi Bulanan
                </h3>
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  Rekapitulasi kehadiran pegawai
                </p>
              </div>
              <button
                onClick={() => setIsPresensiOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-50 rounded-xl transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Filter Panel */}
            <div className="p-4 bg-slate-50 border-b border-slate-100 flex gap-3 items-center shrink-0">
              <select
                value={filterMonth}
                onChange={(e) => setFilterMonth(Number(e.target.value))}
                className="p-2 text-xs border w-full bg-white font-bold rounded-xl outline-none text-slate-700 focus:border-slate-300"
              >
                {listBulan.map((b) => (
                  <option key={b.v} value={b.v}>
                    {b.n}
                  </option>
                ))}
              </select>
              <select
                value={filterYear}
                onChange={(e) => setFilterYear(Number(e.target.value))}
                className="p-2 text-xs border bg-white font-bold rounded-xl outline-none text-slate-700 focus:border-slate-300"
              >
                {Array.from(
                  { length: 5 },
                  (_, i) => new Date().getFullYear() - i,
                ).map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>

            {/* Modal Main Body split layout */}
            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0 bg-slate-50/20">
              {/* SISI KIRI: Kalender Kehadiran (Diatur proporsional agar seimbang dengan kolom grid kanan) */}
              <div className="w-full lg:w-[410px] p-5 lg:border-r border-b lg:border-b-0 border-slate-100 overflow-y-auto shrink-0 bg-white">
                <AttendanceCalendar
                  data={modalData}
                  month={filterMonth}
                  year={filterYear}
                  setMonth={setFilterMonth}
                  setYear={setFilterYear}
                />
              </div>

              {/* SISI KANAN: List Grid 2 Kolom Kiri Kanan (TANPA TRUNCATE) */}
              <div className="flex-1 overflow-y-auto p-5 space-y-4">
                <div className="mb-1">
                  <h5 className="text-xs font-black text-slate-400 uppercase tracking-wider">
                    Rincian Presensi ({modalData.length}) Hari
                  </h5>
                </div>

                {isModalLoading ? (
                  <div className="h-44 flex justify-center items-center">
                    <Loading />
                  </div>
                ) : modalData.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-1 gap-4 pb-2">
                    {modalData.map((absen) => (
                      <div
                        key={absen.id}
                        className={`${expandedId === absen.id ? "col-span-1 md:col-span-1" : "col-span-1"} transition-all duration-300`}
                      >
                        <AbsenRow
                          absen={absen}
                          isExpanded={expandedId === absen.id}
                          onToggle={() =>
                            setExpandedId(
                              expandedId === absen.id ? null : absen.id,
                            )
                          }
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 text-slate-400 italic">
                    Tidak ada data presensi.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL LAPORAN HARIAN */}
      {isLaporanOpen && (
        <div className="fixed inset-[-50px] z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-5xl h-[85vh] flex flex-col shadow-2xl border border-slate-100">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center shrink-0">
              <div>
                <h3 className="text-lg font-black text-slate-800">
                  Laporan Tugas Harian
                </h3>
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  {data.name}
                </p>
              </div>
              <button
                onClick={() => setIsLaporanOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-50 rounded-xl"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30">
              <div className="text-center py-20 text-slate-400 italic">
                Belum ada rincian laporan kerja.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CARD UTAMA BIODATA */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-6 py-6 flex flex-col md:flex-row gap-6 items-start">
          <div className="relative shrink-0 mx-auto md:mx-0">
            <img
              src={
                data.avatar ||
                "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
              }
              alt={data.name}
              className="w-32 h-32 rounded-3xl object-cover bg-white p-1.5 border border-slate-100 shadow-sm"
            />
          </div>
          <div className="pt-2 text-center md:text-left flex-1">
            <h2 className="text-2xl font-black text-slate-800 leading-tight">
              {data.name}
            </h2>
            <div className="flex flex-wrap justify-center md:justify-start items-center gap-2 mt-2">
              <span className="px-3 py-0.5 text-xs font-bold rounded-md bg-red-50 text-red-600 border border-red-100">
                {textJabatan}
              </span>
              <span className="px-3 py-0.5 text-xs font-black rounded-md bg-amber-50 text-amber-700 border border-amber-100">
                {posisiStruktur
                  .replace("KASUBAG", "KASUBBAG")
                  .replace("_", " ")}
              </span>
            </div>
          </div>
        </div>

        {/* DETAILS FIELD GRID - TANPA TRUNCATE */}
        <div className="border-t border-slate-100 bg-slate-50/50 p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center gap-3">
            <IdCard className="text-slate-400 shrink-0" size={20} />
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">
                NIP / Nomor Identitas
              </span>
              <span className="font-bold text-slate-700 block break-words">
                {data.nip && !data.nip.startsWith("KPU-") ? data.nip : "-"}
              </span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center gap-3">
            <Building2 className="text-slate-400 shrink-0" size={20} />
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">
                Subbagian / Unit Kerja
              </span>
              <span className="font-bold text-slate-700 block break-words">
                {namaSubbagian}
              </span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center gap-3">
            <Shield className="text-slate-400 shrink-0" size={20} />
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">
                Role Hak Akses
              </span>
              <span className="font-bold text-slate-700 uppercase block break-words">
                {data.role}
              </span>
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-100 flex items-center gap-3 sm:col-span-2 md:col-span-3">
            <Briefcase className="text-slate-400 shrink-0" size={20} />
            <div>
              <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wider">
                Status Absensi Hari Ini
              </span>
              <span
                className={`text-xs font-extrabold px-2.5 py-0.5 rounded-md mt-1 inline-block ${data.sudah_absen ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-red-50 text-red-600 border border-red-100"}`}
              >
                {data.sudah_absen ? "SUDAH ABSEN" : "BELUM ABSEN"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <style>{`.custom-calendar{width:100%!important;border:none!important;background:transparent;font-family:inherit}.react-calendar__navigation{display:none!important}.react-calendar__month-view__weekdays{text-transform:uppercase;font-size:11px!important;font-weight:800;color:#9ca3af;margin-bottom:8px;text-align:center}.react-calendar__month-view__weekdays__weekday{padding:4px!important}.react-calendar__month-view__weekdays__weekday:nth-child(6) abbr,.react-calendar__month-view__weekdays__weekday:nth-child(7) abbr{color:#dc2626!important}.react-calendar__tile{height:52px!important;font-size:11px!important;font-weight:600;border-radius:12px;transition:0.15s;position:relative;color:#374151;pointer-events:none;padding:4px!important}.react-calendar__tile--now{background:#fee2e2!important;color:#dc2626!important;font-weight:bold}.react-calendar__month-view__days__day--neighboringMonth{color:#d1d5db!important;opacity:0.2}.text-holiday-red {color:#dc2626!important}`}</style>
    </div>
  );
};

export default DetailPegawai;
