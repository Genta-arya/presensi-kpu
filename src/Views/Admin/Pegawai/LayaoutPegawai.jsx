import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom"; // Ubah useParams ke useLocation
import {
  createUser,
  deleteUser,
  listUser,
  updateIndex,
} from "../../../service/User/user.services";
import { toast } from "sonner";
import Loading from "../../../components/Loading";
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  X,
  ChevronRight,
  Briefcase,
  Building2,
  UserCog,
  CheckCircle2,
  XCircle,
  ShieldAlert,
} from "lucide-react";
import { getJabatan } from "../../../service/Jabatan/Jabatan.services";
import { UpdateSingleUser } from "../../../service/Auth/auth.service";
import { Helmet } from "react-helmet-async";

const LayaoutPegawai = () => {
  const [data, setData] = useState([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  // SINKRONISASI STATE TAB
  const [activeTab, setActiveTab] = useState("active");

  // State List Jabatan Dinamis dari DB
  const [jabatanList, setJabatanList] = useState([]);
  const [isFetchingJabatan, setIsFetchingJabatan] = useState(false);
  const [hasLoadedJabatan, setHasLoadedJabatan] = useState(false);

  // State Anti-Spam Tombol
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    nip: "",
    jabatan: "",
    role: "USER",
    isActive: true,
  });

  // --- AMBIL QUERY PARAMETER DARI URL ---
  const location = useLocation();
  const queryParams = useMemo(
    () => new URLSearchParams(location.search),
    [location.search],
  );
  const queryId = queryParams.get("id");
  const queryUpdate = queryParams.get("update");

  // Ambil data teks jabatan aktif yang sedang dipilih oleh form saat ini
  const selectedJabatanName = useMemo(() => {
    if (!formData.jabatan || jabatanList.length === 0) return "";
    const found = jabatanList.find(
      (j) => String(j.id) === String(formData.jabatan),
    );
    return (found?.nama_jabatan || found?.nama || "").toLowerCase();
  }, [formData.jabatan, jabatanList]);

  // Cek validasi apakah NIP harus disembunyikan di MODAL
  const shouldHideNip = useMemo(() => {
    return (
      selectedJabatanName.includes("ketua") ||
      selectedJabatanName.includes("anggota")
    );
  }, [selectedJabatanName]);

  // Fetch daftar jabatan dari DB saat select diklik/difokuskan
  const handleSelectFocus = async () => {
    if (hasLoadedJabatan || isFetchingJabatan) return;

    setIsFetchingJabatan(true);
    try {
      const response = await getJabatan();
      setJabatanList(response.data || []);
      setHasLoadedJabatan(true);
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message ||
          "Gagal memuat daftar jabatan dari server",
      );
    } finally {
      setIsFetchingJabatan(false);
    }
  };

  // Fetch pegawai otomatis dipicu ulang setiap kali activeTab berubah status
  const fetchPegawai = async () => {
    try {
      setIsLoading(true);
      const response = await listUser(activeTab);
      const formattedData = (response.data || []).map((item) => ({
        ...item,
        isActive: item.active ?? item.isActive ?? true,
      }));
      setData(formattedData);
    } catch (error) {
      console.error(error);
      toast.error("Gagal mengambil data pegawai.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStatus = (id) => {
    setData((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isActive: !p.isActive } : p)),
    );
    toast.success("Status keaktifan diperbarui");
  };

  const handleDelete = async (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus pegawai ini?")) {
      try {
        setIsLoading(true);
        await deleteUser(id);
        toast.success("Pegawai berhasil dihapus");
        fetchPegawai();
        // scroll data paling bawah
      } catch (error) {
        toast.error(error.response?.data?.message || "Gagal menghapus pegawai");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleOpenModal = (pegawai = null) => {
    setIsEdit(!!pegawai);
    setFormData(
      pegawai
        ? {
            ...pegawai,
            jabatan:
              pegawai.jabatan?.id || pegawai.jabatanId || pegawai.jabatan || "",
          }
        : { name: "", nip: "", jabatan: "", role: "USER", isActive: true },
    );

    if (pegawai) {
      handleSelectFocus();
    }

    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    if (isSubmitting) return;
    setIsModalOpen(false);
    // balikan url nya
    setSearch("");
    navigate("/dashboard/pegawai");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const payload = {
        name: formData.name,
        nip: formData.nip,
        jabatanId: formData.jabatan, // Kirim sebagai jabatanId
        role: formData.role,
        status: formData.isActive,
      };
      await (isEdit
        ? UpdateSingleUser(formData.id, payload)
        : createUser(payload));

      toast.success(
        isEdit ? "Data berhasil diupdate!" : "Data berhasil ditambah!",
      );
      if (!isEdit) {
        window.scrollTo(0, document.body.scrollHeight);
      }
      setIsModalOpen(false);
      navigate("/dashboard/pegawai");
      await fetchPegawai();
    } catch (error) {
      console.error(error);
      toast.error("Gagal menyimpan data pegawai");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Efek Pertama: Monitor pergantian Tab Aktif / Inaktif
  useEffect(() => {
    fetchPegawai();
    window.scrollTo(0, 0);
  }, [activeTab]);

  // --- EFEK KEDUA: DETEKSI URL QUERY ?id=xxx&update=true ---
  useEffect(() => {
    if (queryId && queryUpdate === "true" && data.length > 0) {
      // Cari data pegawai yang id-nya sesuai di dalam state data saat ini
      const pegawaiTerpilih = data.find(
        (p) => String(p.id) === String(queryId),
      );
      setSearch(pegawaiTerpilih?.name || "");

      if (pegawaiTerpilih) {
        handleOpenModal(pegawaiTerpilih);
      } else {
        navigate("/dashboard/pegawai");
      }
    }
  }, [queryId, queryUpdate, data]); // Dipicu ulang ketika data pegawai selesai di-load dari API

  // LOGIKA FILTER TEXT SEARCH
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const nameData = item.name?.toLowerCase() || "";
      const jabatanData = (
        item.jabatan?.nama_jabatan ||
        item.jabatan?.nama ||
        ""
      ).toLowerCase();
      const unitData = (
        item.strukturUnit?.[0]?.unitKerja?.nama || ""
      ).toLowerCase();
      const searchLower = search.toLowerCase();

      return (
        nameData.includes(searchLower) ||
        jabatanData.includes(searchLower) ||
        unitData.includes(searchLower)
      );
    });
  }, [data, search]);

  const moveUser = async (currentIndex, direction) => {
    const targetIndex =
      direction === "up" ? currentIndex - 1 : currentIndex + 1;

    if (targetIndex < 0 || targetIndex >= data.length) return;

    const currentItem = data[currentIndex];
    const targetItem = data[targetIndex];

    try {
      setIsLoading(true);
      // Asumsi backend Anda mendukung pertukaran dua data
      await updateIndex({
        id1: currentItem.id,
        index1: targetIndex, // Posisi baru untuk currentItem
        id2: targetItem.id,
        index2: currentIndex, // Posisi baru untuk targetItem
      });

      // Update state lokal secara instan (Optimistic UI)
      const newData = [...data];
      newData[currentIndex] = targetItem;
      newData[targetIndex] = currentItem;
      setData(newData);

      toast.success("Urutan berhasil diubah");
    } catch (error) {
      console.error(error);
      toast.error("Gagal mengubah urutan.");
      // Jika gagal, ambil ulang data dari server untuk memastikan sinkronisasi
      fetchPegawai();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 relative">
      <Helmet>
        <title>
          Manajemen Pegawai - Sistem Informasi Kepegawaian KPU Kabupaten
          Sekadau{" "}
        </title>
      </Helmet>
      {/* MODAL FORM */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 w-full max-w-[70%] shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-black text-slate-800">
                {isEdit ? "Edit Pegawai" : "Tambah Pegawai"}
              </h2>
              <button
                onClick={handleCloseModal}
                disabled={isSubmitting}
                className="text-slate-400 hover:text-slate-600 disabled:opacity-30"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  Nama Lengkap
                </label>
                <input
                  type="text"
                  disabled={isSubmitting}
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all text-sm"
                  required
                />
              </div>

              {/* JABATAN SELECT */}
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  Jabatan
                </label>
                <select
                  value={formData.jabatan}
                  onFocus={handleSelectFocus}
                  onChange={(e) =>
                    setFormData({ ...formData, jabatan: e.target.value })
                  }
                  disabled={isSubmitting}
                  className="w-full p-3 border border-slate-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all text-sm lowercase capitalize"
                  required
                >
                  <option value="">
                    {isFetchingJabatan
                      ? "⏳ Memuat data jabatan..."
                      : "Pilih Jabatan"}
                  </option>
                  {jabatanList.map((jab) => (
                    <option key={jab.id} value={jab.id}>
                      {jab.nama_jabatan || jab.nama}
                    </option>
                  ))}
                </select>
              </div>

              {/* FILTER HIDE / SHOW NIP INPUT FIELD */}

              <div className="animate-fade-in">
                <label className="block text-sm font-bold text-slate-700 mb-1">
                  NIP / Nomor Identitas
                </label>
                <input
                  type="text"
                  disabled={isSubmitting}
                  value={formData.nip || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, nip: e.target.value })
                  }
                  className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all text-sm"
                />
              </div>

              <div className="flex items-center gap-4 py-2">
                <span className="font-bold text-slate-700 text-sm">
                  Status Aktif:
                </span>
                <label className="switch">
                  <input
                    type="checkbox"
                    disabled={isSubmitting}
                    checked={formData.isActive}
                    onChange={(e) =>
                      setFormData({ ...formData, isActive: e.target.checked })
                    }
                  />
                  <span className="slider"></span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-red-600 text-white py-3 rounded-xl font-bold hover:bg-red-700 active:scale-[0.98] transition shadow-md shadow-red-600/10 flex items-center justify-center gap-2 text-sm"
              >
                {isSubmitting && (
                  <svg
                    className="animate-spin h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                )}
                {isSubmitting ? "Menyimpan..." : "Simpan Data"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div className="bg-white rounded-3xl p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-800">
              Manajemen Pegawai
            </h1>
            <p className="text-slate-500 mt-1">
              Daftar pegawai KPU Kabupaten Sekadau
            </p>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="text"
              placeholder="Cari nama, jabatan, atau divisi..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="p-3 rounded-2xl outline-2 outline-red-400 border w-full lg:w-80 text-sm"
            />
            <button
              onClick={() => handleOpenModal()}
              className="bg-red-600 text-white p-3 rounded-2xl active:scale-95 transition shrink-0"
            >
              <Plus size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* NAVIGASI MENU */}
      <div className="flex gap-3 overflow-x-auto pb-2">
        {[
          { name: "Jabatan", path: "/dashboard/jabatan", icon: Briefcase },
          { name: "Subbagian", path: "/dashboard/subbagian", icon: Building2 },
        ].map((menu) => (
          <Link
            key={menu.name}
            to={menu.path}
            className="flex w-full items-center gap-2 bg-white px-5 py-3 rounded-2xl shadow-sm border border-slate-100 hover:border-red-200 transition-all group"
          >
            <menu.icon size={18} className="text-red-500" />
            <span className="font-bold text-slate-700 whitespace-nowrap text-sm">
              {menu.name}
            </span>
            <ChevronRight
              size={16}
              className="text-slate-300 group-hover:text-red-500 transition"
            />
          </Link>
        ))}
      </div>

      {/* NAVIGATION TABS */}
      <div className="flex border-b w-full items-center justify-center border-slate-200 gap-2">
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
            {isLoading
              ? "-"
              : activeTab === "active"
                ? filteredData.length
                : "-"}
          </span>
        </button>

        <button
          onClick={() => setActiveTab("inactive")}
          className={`flex items-center w-full justify-center text-center gap-2 pb-3.5 px-4 font-black text-sm tracking-wide transition-all border-b-2 outline-none
    ${activeTab === "inactive" ? "border-red-600  text-red-600" : "border-transparent text-slate-400 hover:text-slate-600"}`}
        >
          <XCircle size={16} />
          <span>Pegawai Inaktif (Arsip)</span>
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full rounded-tl-none leading-none transition-all
      ${activeTab === "inactive" ? "bg-red-100 text-red-600" : "bg-slate-100 text-slate-400"}`}
          >
            {isLoading
              ? "-"
              : activeTab === "inactive"
                ? filteredData.length
                : "-"}
          </span>
        </button>
      </div>

      {/* CONTAINER CARDS DENGAN INTERNAL LOADING TAB */}
      {isLoading ? (
        <div className="">
          <Loading />
        </div>
      ) : filteredData.length > 0 ? (
        <div className="grid cursor-pointer grid-cols-1 xl:grid-cols-2 gap-4 animate-fade-in">
          {filteredData.map((pegawai, index) => {
            const textJabatan =
              pegawai.jabatan?.nama_jabatan || pegawai.jabatan?.nama || "";
            const posisiStruktur = pegawai.strukturUnit?.[0]?.posisi || "";
            const namaSubbagian =
              pegawai.strukturUnit?.[0]?.unitKerja?.nama || "";

            return (
              <Link
                key={pegawai.id}
                to={`/dashboard/pegawai/${pegawai.id}`}
                className="bg-white rounded-3xl p-5 shadow-sm border border-transparent hover:border-red-100/60 transition-all flex flex-col justify-between"
              >
                <div className="flex items-start gap-4">
                  <img
                    src={
                      pegawai.avatar ||
                      "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                    }
                    alt={pegawai.name}
                    className="w-16 h-16 rounded-2xl object-cover bg-slate-50 border border-slate-100 p-1"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-black text-slate-800 text-lg leading-tight tracking-tight">
                          {pegawai.name}
                        </h3>
                        {pegawai.nip && !pegawai.nip.startsWith("KPU-") && (
                          <p className="text-slate-400 text-xs font-semibold mt-1">
                            NIP / ID : {pegawai.nip}
                          </p>
                        )}
                      </div>

                      <div className="flex gap-1 shrink-0">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleOpenModal(pegawai);
                          }}
                          className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleDelete(pegawai.id);
                          }}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                        <div className="flex flex-col gap-1 border-l border-slate-100 pl-2">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              // 'index' berasal dari map(pegawai, index)
                              moveUser(index, "up");
                            }}
                            disabled={index === 0 || isLoading}
                            className="p-0.5 text-slate-400 hover:text-red-600 disabled:opacity-20 transition"
                          >
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="3"
                            >
                              <path d="M18 15l-6-6-6 6" />
                            </svg>
                          </button>
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              moveUser(index, "down");
                            }}
                            disabled={
                              index === filteredData.length - 1 || isLoading
                            }
                            className="p-0.5 text-slate-400 hover:text-red-600 disabled:opacity-20 transition"
                          >
                            <svg
                              width="16"
                              height="16"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="3"
                            >
                              <path d="M6 9l6 6 6-6" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 space-y-2">
                      <div className="flex flex-wrap gap-1.5 items-center">
                        <span className="px-2.5 py-0.5 rounded-md bg-red-50 text-red-600 text-[11px] font-bold tracking-wide uppercase">
                          {textJabatan || "Umum"}
                        </span>

                        {posisiStruktur && (
                          <span className="px-2.5 py-0.5 rounded-md bg-amber-50 text-amber-700 text-[11px] font-black tracking-wide border border-amber-100/50">
                            {posisiStruktur
                              .replace("KASUBAG", "KASUBBAG")
                              .replace("_", " ")}
                          </span>
                        )}

                        {pegawai.role === "ADMIN" && (
                          <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-600 text-[10px] font-bold border border-purple-100 flex items-center gap-1">
                            <ShieldAlert size={10} /> Admin
                          </span>
                        )}
                      </div>

                      {namaSubbagian && (
                        <p className="text-slate-500 text-xs flex items-center gap-1.5 bg-slate-50 p-2 rounded-xl border border-slate-100/60 font-medium">
                          <Building2
                            size={13}
                            className="text-slate-400 shrink-0"
                          />
                          <span className="truncate">
                            {namaSubbagian}
                            {pegawai.strukturUnit.length > 1 &&
                              ` (+${pegawai.strukturUnit.length - 1} Subbagian)`}
                          </span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-3xl border border-slate-100 text-sm text-slate-400 italic font-medium">
          Tidak ada data pegawai{" "}
          {activeTab === "active" ? "aktif" : "inaktif (arsip)"} yang cocok
          dengan pencarian.
        </div>
      )}
    </div>
  );
};

export default LayaoutPegawai;
