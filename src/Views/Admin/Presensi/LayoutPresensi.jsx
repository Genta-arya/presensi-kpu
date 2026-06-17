import React, { useState, useEffect } from "react";
import { getAllAbsensi } from "../../../service/Auth/absen.service";

import {
  Calendar,
  Users,
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  Loader2,
  Download,
} from "lucide-react";
import { exportToExcelAbsensi } from "../../../Constants/exportExcel";
import { exportToPdfAbsensi } from "../../../Constants/exportPdf";
import { Link } from "react-router-dom";

const LayoutPresensi = () => {
  const [presensi, setPresensi] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("active");
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth() + 1);
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());

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

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  const fetchPresensiData = async () => {
    setLoading(true);
    try {
      const response = await getAllAbsensi({
        status: activeTab,
        month: filterMonth,
        year: filterYear,
      });
      setPresensi(response?.data || []);
    } catch (error) {
      console.error("Gagal memuat rekap presensi:", error);
      setPresensi([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPresensiData();
  }, [activeTab, filterMonth, filterYear]);

  const handleExport = () => {
    const currentMonthLabel =
      months.find((m) => m.value === filterMonth)?.label || "Bulan";
    exportToExcelAbsensi(presensi, currentMonthLabel, filterYear);
  };

  const handleExportPdf = () => {
    const currentMonthLabel =
      months.find((m) => m.value === filterMonth)?.label || "Bulan";
    exportToPdfAbsensi(presensi, currentMonthLabel, filterYear, true);
  };

  return (
    <div className="p-6 space-y-4 bg-slate-50 min-h-screen">
      {/* ACTION BAR HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
          
            REKAP ABSENSI
          </h1>
          <p className="text-slate-400 text-sm mt-1 font-bold uppercase tracking-wider">
            KOMISI PEMILIHAN UMUM KABUPATEN SEKADAU
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 self-end md:self-auto">
          {/* Dropdown Filter */}
          <div className="flex items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl border border-slate-200">
            <Calendar size={16} className="text-slate-500 ml-2" />
            <select
              value={filterMonth}
              onChange={(e) => setFilterMonth(Number(e.target.value))}
              className="bg-transparent text-sm font-bold text-slate-700 outline-none pr-2 cursor-pointer py-1"
            >
              {months.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>

            <select
              value={filterYear}
              onChange={(e) => setFilterYear(Number(e.target.value))}
              className="bg-transparent text-sm font-bold text-slate-700 outline-none pr-4 border-l border-slate-300 pl-2 cursor-pointer py-1"
            >
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          {/* Tombol Unduh */}
        </div>
      </div>
      <div className="flex  flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <button
          onClick={handleExport}
          disabled={presensi.length === 0 || loading}
          className="flex w-full items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-black text-sm px-4 py-2.5 rounded-2xl transition-all shadow-sm active:scale-95"
        >
          <Download size={16} />
          Export Excel
        </button>
        <button
          onClick={handleExportPdf}
          disabled={presensi.length === 0 || loading}
          className="flex w-full items-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-black text-sm px-4 py-2.5 rounded-2xl transition-all shadow-sm active:scale-95"
        >
          <Download size={16} />
          Export PDF
        </button>
      </div>

      {/* FILTER TABS PEGAWAI */}
      <div className="flex border-b w-full items-center justify-center border-slate-200 bg-white rounded-t-3xl pt-2 px-4 shadow-sm">
        <button
          onClick={() => setActiveTab("active")}
          className={`flex items-center justify-center w-full text-center gap-2 pb-3.5 px-4 font-black text-sm tracking-wide transition-all border-b-2 outline-none
          ${activeTab === "active" ? "border-red-600 text-red-600" : "border-transparent text-slate-400 hover:text-slate-600"}`}
        >
          <CheckCircle2 size={16} />
          <span>Pegawai Aktif</span>
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full rounded-tl-none leading-none transition-all
            ${activeTab === "active" ? "bg-red-100 text-red-600" : "bg-slate-100 text-slate-400"}`}
          >
            {loading ? "-" : activeTab === "active" ? presensi.length : "-"}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("inactive")}
          className={`flex items-center w-full justify-center text-center gap-2 pb-3.5 px-4 font-black text-sm tracking-wide transition-all border-b-2 outline-none
          ${activeTab === "inactive" ? "border-red-600 text-red-600" : "border-transparent text-slate-400 hover:text-slate-600"}`}
        >
          <XCircle size={16} />
          <span>Pegawai Inaktif (Arsip)</span>
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full rounded-tl-none leading-none transition-all
            ${activeTab === "inactive" ? "bg-red-100 text-red-600" : "bg-slate-100 text-slate-400"}`}
          >
            {loading ? "-" : activeTab === "inactive" ? presensi.length : "-"}
          </span>
        </button>
      </div>

      {/* RENDER UTAMA TABEL */}
      <div className="bg-white p-6 rounded-b-3xl shadow-sm border-x border-b border-slate-100 min-h-[400px] flex flex-col justify-start">
        {loading ? (
          <div className="flex flex-col items-center justify-center text-slate-400 space-y-2 py-20 my-auto">
            <Loader2 className="animate-spin text-red-500" size={36} />
            <p className="text-sm font-semibold tracking-wide animate-pulse">
              Memuat data rekap presensi...
            </p>
          </div>
        ) : presensi.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-slate-400 space-y-3 py-20 my-auto">
            <Users size={52} className="text-slate-300 stroke-[1.5]" />
            <div className="text-center">
              <p className="font-bold text-slate-700 text-base">
                Tidak Ada Data Rekap
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Belum ada log kehadiran untuk bulan dan kategori ini.
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto w-full rounded-2xl border border-slate-100">
            <table className="w-full text-left border-collapse min-w-[950px]">
              <thead>
                <tr className="bg-slate-50 text-slate-700 text-xs font-black uppercase tracking-wider border-b border-slate-200">
                  <th className="p-3.5 text-center w-14">No</th>
                  <th className="p-3.5 w-64">Nama</th>
                  <th className="p-3.5 w-56">Jabatan</th>
                  <th className="p-3.5 text-center bg-green-50/50 text-green-700 w-14">
                    H
                  </th>
                  <th className="p-3.5 text-center bg-red-50/50 text-red-700 w-14">
                    A
                  </th>
                  <th className="p-3.5 text-center bg-blue-50/50 text-blue-700 w-14">
                    C
                  </th>
                  <th className="p-3.5 text-center bg-amber-50/50 text-amber-700 w-14">
                    I
                  </th>
                  <th className="p-3.5 text-center bg-orange-50/50 text-orange-700 w-14">
                    S
                  </th>
                  <th className="p-3.5 text-center bg-yellow-50/50 text-yellow-600 w-14">
                    DL
                  </th>
                  <th className="p-3.5 text-center bg-purple-50/50 text-purple-700 w-14">
                    TB
                  </th>
                  <th className="p-3.5 text-center font-black bg-slate-100 text-slate-800 w-24">
                    Total
                  </th>
                
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-600">
                {presensi.map((pegawai, index) => (
                  <tr
                    key={pegawai.id}
                    className="hover:bg-slate-50/60 transition-colors"
                  >
                    <td className="p-3.5 text-center text-slate-400 font-semibold">
                      {index + 1}
                    </td>
                    <td className="p-3.5">
                      <Link
                        to={`/dashboard/pegawai/${pegawai.id || pegawai._id}`}
                        className="font-black text-slate-800 text-sm tracking-tight hover:text-red-600 hover:underline transition-colors block cursor-pointer"
                      >
                        {pegawai.name}
                      </Link>
                    </td>
                    <td className="p-3.5 text-slate-700 font-semibold text-xs ">
                      {pegawai.jabatan}
                    </td>
                    <td className="p-3.5 text-center font-bold text-green-600 bg-green-50/10">
                      {pegawai.rekap?.H ?? 0}
                    </td>
                    <td className="p-3.5 text-center font-bold text-red-600 bg-red-50/10">
                      {pegawai.rekap?.A ?? 0}
                    </td>
                    <td className="p-3.5 text-center font-bold text-blue-600 bg-blue-50/10">
                      {pegawai.rekap?.C ?? 0}
                    </td>
                    <td className="p-3.5 text-center font-bold text-amber-600 bg-amber-50/10">
                      {pegawai.rekap?.I ?? 0}
                    </td>
                    <td className="p-3.5 text-center font-bold text-orange-600 bg-orange-50/10">
                      {pegawai.rekap?.S ?? 0}
                    </td>
                    <td className="p-3.5 text-center font-bold text-yellow-600 bg-yellow-50/10">
                      {pegawai.rekap?.DL ?? 0}
                    </td>
                    <td className="p-3.5 text-center font-bold text-purple-600 bg-purple-50/10">
                      {pegawai.rekap?.TB ?? 0}
                    </td>
                    <td className="p-3.5 text-center font-black bg-slate-50 text-slate-800 text-sm">
                      {pegawai.total ?? 0}
                    </td>
                   
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default LayoutPresensi;
