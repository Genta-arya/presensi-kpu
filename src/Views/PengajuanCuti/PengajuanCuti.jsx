import React, { useEffect, useState, useMemo } from "react";
import Navigations from "../Navigation";
import {
  Plus,
  Search,
  Calendar,
  Filter,
  CalendarX,
  Users,
  UserCheck,
  Check,
  X as XIcon,
  FileText,
  Bookmark,
  Activity,
  HeartPulse,
  AlertCircle,
  Baby,
  History,
  Undo2,
} from "lucide-react";
import { toast } from "sonner";

import {
  cancelCuti,
  getPengajuanCutiKasubagSingle,
  getPengajuanCutiSingle,
  getRiwayatCuti,
  updateStatusCuti,
} from "../../service/Auth/absen.service";
import useCheckLogin from "../../State/useLogin";
import { CgSpinner } from "react-icons/cg";
import FormAjukanCuti from "./FormPengajuanCuti";
import { Helmet } from "react-helmet-async";

const PengajuanCuti = () => {
  const [search, setSearch] = useState("");
  const [filterTahun, setFilterTahun] = useState(
    new Date().getFullYear().toString(),
  );
  const [isAdding, setIsAdding] = useState(false);
  const { user } = useCheckLogin();
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Kontrol navigasi Tab aktif ("saya", "staff", atau "riwayat")
  const [activeTab, setActiveTab] = useState("saya");

  // AMBIL DATA SALDO CUTI USER BERDASARKAN TAHUN YANG DIPILIH
  const activeSaldo = useMemo(() => {
    if (!user || !user.SaldoCutis || user.SaldoCutis.length === 0) return null;
    return (
      user.SaldoCutis.find((s) => s.tahun.toString() === filterTahun) ||
      user.SaldoCutis[0]
    );
  }, [user, filterTahun]);

  // MENGECEK AKSES KHUSUS ATASAN
  const isUserPenyetuju = useMemo(() => {
    if (!user) return false;
    const isKasubag = user.strukturUnit?.some(
      (unit) => unit.posisi === "KASUBAG",
    );
    const isSekretaris = user.role === "SEKRETARIS";
    return isKasubag || isSekretaris;
  }, [user]);

  const isSekretaris = useMemo(() => user?.role === "SEKRETARIS", [user]);

  // Cari tahu string role penyetuju aktual saat ini untuk payload backend
  const rolePenyetujuAktal = useMemo(() => {
    if (!user) return null;
    if (user.role === "SEKRETARIS") return "SEKRETARIS";
    if (user.strukturUnit?.some((unit) => unit.posisi === "KASUBAG"))
      return "KASUBAG";
    return null;
  }, [user]);

  // Kamus pemetaan status dari Database ENUM ke Teks Indonesia
  const statusLabelMapping = {
    MENUNGGU_KASUBAG: "Menunggu Verifikasi Kasubbag",
    MENUNGGU_SEKRETARIS: "Menunggu Persetujuan Sekretaris",
    DISETUJUI: "Disetujui",
    DITOLAK_KASUBAG: "Ditolak Kasubag",
    DITOLAK_SEKRETARIS: "Ditolak Sekretaris",
    DIBATALKAN: "Dibatalkan",
  };

  // 1. Ambil Data Cuti Pribadi (Tab "Cuti Saya")
  const fetchDataCuti = async () => {
    if (!user?.id) return;
    try {
      setIsLoading(true);
      const response = await getPengajuanCutiSingle(user.id, filterTahun);
      setData(response.data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error(
        error.response?.data?.message || "Gagal mengambil data cuti.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Ambil Data Berkas Masuk dari Staff (Tab "Permohonan Cuti Staff")
  const fetchDataCutiStaff = async () => {
    if (!user?.id) return;
    try {
      setIsLoading(true);
      const response = await getPengajuanCutiKasubagSingle(
        user.id,
        filterTahun,
      );
      setData(response.data || []);
    } catch (error) {
      console.error("Error fetching staff data:", error);
      toast.error(
        error.response?.data?.message ||
          "Gagal mengambil data permohonan staff.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Ambil Seluruh Riwayat Cuti Global (Khusus Tab "Riwayat Cuti Global" - Sekretaris)
  const fetchRiwayatCutiGlobal = async () => {
    if (!user?.id) return;
    try {
      setIsLoading(true);
      const response = await getRiwayatCuti(user.id, filterTahun);
      setData(response.data || []);
    } catch (error) {
      console.error("Error fetching riwayat cuti:", error);
      toast.error(
        error.response?.data?.message || "Gagal mengambil riwayat cuti.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  // LOGIK REFRESH DATA SAAT TAB BERPINDAH ATAU FILTER TAHUN BERUBAH
  useEffect(() => {
    setSearch("");
    if (activeTab === "saya") {
      fetchDataCuti();
    } else if (activeTab === "staff") {
      fetchDataCutiStaff();
    } else if (activeTab === "riwayat") {
      fetchRiwayatCutiGlobal();
    }
  }, [activeTab, user?.id, filterTahun]);

  // Handler Pembatalan Cuti Penuh (Oleh Sekretaris)
  const handleCancelingCuti = async (idCuti) => {
    const catatan = prompt("Masukkan alasan pembatalan resmi cuti ini:");
    if (catatan === null) return; // Batal jika prompt di-cancel

    try {
      setIsLoading(true);
      await cancelCuti(idCuti, { catatanPembatalan: catatan });
      toast.success(
        "Cuti resmi berhasil dibatalkan dan saldo telah dikembalikan.",
      );
      fetchRiwayatCutiGlobal(); // Refresh data riwayat
    } catch (error) {
      console.error("Error canceling cuti:", error);
      toast.error(
        error.response?.data?.message || "Gagal membatalkan pengajuan cuti.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (formData) => {
    console.log("Pengajuan Cuti Baru dikirim:", formData);
    setActiveTab("saya");
    fetchDataCuti();
    setIsAdding(false);
  };

  const handleAksiPersetujuan = async (idPengajuan, aksi) => {
    const catatan =
      aksi === "tolak" ? prompt("Masukkan alasan penolakan berkas:") : null;
    if (action === "tolak" && catatan === null) return;

    try {
      setIsLoading(true);
      await updateStatusCuti(idPengajuan, {
        rolePenyetuju: rolePenyetujuAktal,
        aksi,
        catatan: catatan,
      });

      toast.success(`Berkas permohonan berhasil diproses.`);
      fetchDataCutiStaff();
    } catch (error) {
      console.error("Error updating status cuti:", error);
      toast.error(
        error.response?.data?.message || "Gagal memproses aksi berkas.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const formatTanggalIndo = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const listTahunOptions = useMemo(() => {
    const tahunSekarang = new Date().getFullYear();
    const opsi = [];
    for (let i = 0; i < 5; i++) {
      opsi.push((tahunSekarang - i).toString());
    }
    return opsi;
  }, []);

  const getStatusBadgeClass = (status) => {
    switch (status?.toUpperCase()) {
      case "DISETUJUI":
        return "bg-emerald-100 text-emerald-700 border border-emerald-200";
      case "DITOLAK_KASUBAG":
      case "DITOLAK_SEKRETARIS":
        return "bg-rose-100 text-rose-700 border border-rose-200";
      case "DIBATALKAN":
        return "bg-slate-100 text-slate-600 border border-slate-200";
      case "MENUNGGU_SEKRETARIS":
        return "bg-indigo-100 text-indigo-700 border border-indigo-200";
      default:
        return "bg-amber-100 text-amber-700 border border-amber-200";
    }
  };

  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const namaStaff = item.user?.name || "";
      return (
        item.jenisCuti?.toLowerCase().includes(search.toLowerCase()) ||
        item.keterangan?.toLowerCase().includes(search.toLowerCase()) ||
        namaStaff.toLowerCase().includes(search.toLowerCase())
      );
    });
  }, [data, search]);

  return (
    <>
      <Navigations title={isAdding ? "Tambah Cuti" : "Pengajuan Cuti"} />
      <Helmet>
        <title>{isAdding ? "Tambah Cuti" : "Pengajuan Cuti"}</title>
      </Helmet>

      <div className="min-h-screen bg-gray-100 pt-20 pb-28 px-4">
        <div className="max-w-5xl mx-auto">
          {/* CONDITION RENDERING */}
          {isAdding ? (
            <FormAjukanCuti
              onCancel={() => setIsAdding(false)}
              onSubmit={handleFormSubmit}
              refresh={fetchDataCuti}
            />
          ) : (
            <>
              {/* SYSTEM MENU TAB NAVIGATION */}
              {isUserPenyetuju && (
                <div className="flex flex-wrap bg-white p-1.5 rounded-2xl shadow-sm mb-5 border border-gray-100 gap-1">
                  <button
                    onClick={() => setActiveTab("saya")}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all ${
                      activeTab === "saya"
                        ? "bg-red-600 text-white shadow-md"
                        : "text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    <UserCheck size={16} /> Cuti Saya
                  </button>
                  <button
                    onClick={() => setActiveTab("staff")}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all ${
                      activeTab === "staff"
                        ? "bg-red-600 text-white shadow-md"
                        : "text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    <Users size={16} /> Permohonan Cuti
                  </button>
                  {/* TAB RIWAYAT BARU KHUSUS SEKRETARIS */}
                  {isSekretaris && (
                    <button
                      onClick={() => setActiveTab("riwayat")}
                      className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all ${
                        activeTab === "riwayat"
                          ? "bg-red-600 text-white shadow-md"
                          : "text-gray-500 hover:bg-gray-50"
                      }`}
                    >
                      <History size={16} /> Riwayat
                    </button>
                  )}
                </div>
              )}

              {/* RENDER DASHBOARD KUOTA SALDO CUTI */}
              {activeTab === "saya" && activeSaldo && (
                <div className="mb-6">
                  <p className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2">
                    Kuota Sisa Cuti Anda (Tahun {activeSaldo.tahun})
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3">
                      <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                        <Bookmark size={16} />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase leading-none">
                          Tahunan
                        </p>
                        <p className="text-base font-black text-slate-800 mt-1 leading-none">
                          {activeSaldo.sisaTahunan}{" "}
                          <span className="text-[9px] font-normal text-slate-400">
                            Hari
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3">
                      <div className="p-2 bg-sky-50 text-sky-600 rounded-xl">
                        <HeartPulse size={16} />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase leading-none">
                          Sakit
                        </p>
                        <p className="text-base font-black text-slate-800 mt-1 leading-none">
                          {activeSaldo.sisaSakit}{" "}
                          <span className="text-[9px] font-normal text-slate-400">
                            Hari
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3">
                      <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
                        <AlertCircle size={16} />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase leading-none">
                          Penting
                        </p>
                        <p className="text-base font-black text-slate-800 mt-1 leading-none">
                          {activeSaldo.sisaAlasanPenting}{" "}
                          <span className="text-[9px] font-normal text-slate-400">
                            Hari
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-3">
                      <div className="p-2 bg-purple-50 text-purple-600 rounded-xl">
                        <Activity size={16} />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase leading-none">
                          Besar
                        </p>
                        <p className="text-base font-black text-slate-800 mt-1 leading-none">
                          {activeSaldo.sisaBesar}{" "}
                          <span className="text-[9px] font-normal text-slate-400">
                            Hari
                          </span>
                        </p>
                      </div>
                    </div>
                    <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 col-span-2 sm:col-span-1 flex items-center gap-3">
                      <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
                        <Baby size={16} />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase leading-none">
                          Melahirkan
                        </p>
                        <p className="text-base font-black text-slate-800 mt-1 leading-none">
                          {activeSaldo.sisaMelahirkan}{" "}
                          <span className="text-[9px] font-normal text-slate-400">
                            Hari
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SEARCH BAR */}
              <div className="bg-white rounded-2xl p-4 shadow-sm mb-4 border border-gray-100">
                <div className="relative">
                  <Search
                    size={18}
                    className="absolute left-3 top-3 text-gray-400"
                  />
                  <input
                    type="text"
                    placeholder={
                      activeTab === "saya"
                        ? "Cari jensi cuti atau alasan..."
                        : "Cari nama staff, jenis cuti, atau alasan..."
                    }
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl border outline-none focus:ring-2 focus:ring-red-500 text-sm"
                  />
                </div>
              </div>

              {/* FILTER TAHUN */}
              <div className="bg-white rounded-2xl p-4 shadow-sm mb-5 border border-gray-100">
                <div className="flex items-center gap-2 mb-3">
                  <Filter size={16} className="text-gray-500" />
                  <h3 className="font-bold text-sm text-gray-700">
                    Filter Tahun Pengajuan
                  </h3>
                </div>
                <div className="w-full">
                  <select
                    value={filterTahun}
                    onChange={(e) => setFilterTahun(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border bg-white outline-none text-sm text-gray-700 focus:ring-2 focus:ring-red-500 shadow-sm appearance-none"
                  >
                    {listTahunOptions.map((tahun) => (
                      <option key={tahun} value={tahun}>
                        Tahun {tahun}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* AREA RENDERING UTAMA */}
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <CgSpinner size={36} className="animate-spin text-red-600" />
                  <p className="text-sm font-semibold text-gray-400">
                    Memuat data...
                  </p>
                </div>
              ) : filteredData.length === 0 ? (
                <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-gray-100 flex flex-col items-center justify-center py-14">
                  <div className="p-4 bg-red-50 text-red-500 rounded-full mb-3">
                    <CalendarX size={32} />
                  </div>
                  <h3 className="font-bold text-gray-700 mb-1">
                    Tidak Ada Data
                  </h3>
                  <p className="text-xs text-gray-400 max-w-sm">
                    {activeTab === "saya" &&
                      `Riwayat data pengajuan cuti pribadi tidak ditemukan di tahun ${filterTahun}.`}
                    {activeTab === "staff" &&
                      `Tidak ada permohonan aktif menunggu verifikasi Anda di tahun ${filterTahun}.`}
                    {activeTab === "riwayat" &&
                      `Tidak ada rekaman data riwayat cuti staff hulu ke hilir di tahun ${filterTahun}.`}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredData.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 transition-all"
                    >
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          {activeTab !== "saya" && (
                            <span className="text-xs font-extrabold text-red-600 bg-red-50 px-2 py-1 rounded-md mb-2 inline-block">
                              👤 Pemohon: {item.user?.name || "Staff"} (NIP.{" "}
                              {item.user?.nip || "-"})
                            </span>
                          )}
                          <h2 className="font-bold text-gray-800 text-base">
                            Cuti {item.jenisCuti}
                          </h2>
                          <p className="text-xs text-gray-400 font-medium mt-0.5">
                            {formatTanggalIndo(item.tanggalMulai)} ➔{" "}
                            {formatTanggalIndo(item.tanggalSelesai)}
                            <span className="ml-2 px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded text-[10px] font-bold">
                              {item.totalHari} Hari Kerja
                            </span>
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-[11px] font-extrabold tracking-wide text-center ${getStatusBadgeClass(item.status)}`}
                        >
                          {statusLabelMapping[item.status] || item.status}
                        </span>
                      </div>

                      <p className="mt-4 text-sm text-gray-600 bg-gray-50/50 p-3 rounded-xl border border-gray-50/50">
                        <span className="font-bold text-xs text-gray-400 block uppercase tracking-wider mb-1">
                          Alasan:
                        </span>
                        {item.keterangan || "-"}
                      </p>

                      {item.suratDokter && (
                        <div className="mt-3">
                          <a
                            href={item.suratDokter}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:underline bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-100"
                          >
                            <FileText size={14} /> Lihat Surat Keterangan Dokter
                          </a>
                        </div>
                      )}

                      {/* AREA AKSI TAB BERKAS PERMOHONAN MASUK */}
                      {activeTab === "staff" && (
                        <>
                          {rolePenyetujuAktal === "KASUBAG" &&
                            item.status === "MENUNGGU_KASUBAG" && (
                              <div className="flex gap-2.5 pt-4 mt-4 border-t border-dashed border-gray-100">
                                <button
                                  onClick={() =>
                                    handleAksiPersetujuan(item.id, "tolak")
                                  }
                                  className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl bg-gray-50 text-gray-500 text-xs font-bold border border-gray-200 hover:bg-rose-50 hover:text-rose-600 transition-all"
                                >
                                  <XIcon size={14} /> Tolak Berkas
                                </button>
                                <button
                                  onClick={() =>
                                    handleAksiPersetujuan(item.id, "setuju")
                                  }
                                  className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 shadow-sm transition-all"
                                >
                                  <Check size={14} /> Verifikasi & Teruskan
                                </button>
                              </div>
                            )}

                          {rolePenyetujuAktal === "SEKRETARIS" &&
                            item.status === "MENUNGGU_SEKRETARIS" && (
                              <div className="flex gap-2.5 pt-4 mt-4 border-t border-dashed border-gray-100">
                                <button
                                  onClick={() =>
                                    handleAksiPersetujuan(item.id, "tolak")
                                  }
                                  className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl bg-gray-50 text-gray-500 text-xs font-bold border border-gray-200 hover:bg-rose-50 hover:text-rose-600 transition-all"
                                >
                                  <XIcon size={14} /> Tolak Cuti
                                </button>
                                <button
                                  onClick={() =>
                                    handleAksiPersetujuan(item.id, "setuju")
                                  }
                                  className="flex-1 flex items-center justify-center gap-1 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 shadow-sm transition-all"
                                >
                                  <Check size={14} /> Setujui Penuh (Sah)
                                </button>
                              </div>
                            )}
                        </>
                      )}

                      {/* STRUKTUR AKSI UNTUK TAB RIWAYAT GLOBAL (KHUSUS SEKRETARIS UNTUK BATALKAN CUTI YANG SAH) */}
                      {activeTab === "riwayat" &&
                        item.status === "DISETUJUI" && (
                          <div className="pt-4 mt-4 border-t border-dashed border-gray-100">
                            <button
                              onClick={() => handleCancelingCuti(item.id)}
                              className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-black border border-rose-200 transition-all shadow-sm"
                            >
                              <Undo2 size={14} /> Batalkan Hak Cuti Pegawai
                            </button>
                          </div>
                        )}

                      {item.catatanAdmin && (
                        <p className="mt-3 text-xs font-semibold text-rose-600 bg-rose-50 p-3 rounded-xl border border-rose-100">
                          📌 Catatan Penolak/Pembatalan: {item.catatanAdmin}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {!isAdding && activeTab === "saya" && (
          <button
            className="fixed bottom-24 right-5 w-14 h-14 rounded-full bg-red-600 text-white shadow-xl flex items-center justify-center z-50 hover:bg-red-700 transition-all transform hover:scale-105"
            onClick={() => setIsAdding(true)}
          >
            <Plus size={24} />
          </button>
        )}
      </div>
    </>
  );
};

export default PengajuanCuti;
