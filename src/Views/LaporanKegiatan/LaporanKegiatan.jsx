import React, { useEffect, useState } from "react";
import Navigations from "../Navigation";
import {
  Search,
  Plus,
  ArrowLeft,
  MoreVertical,
  Trash2,
  Edit,
  Calendar as CalendarIcon,
  X,
} from "lucide-react";
import Editor from "../../components/Editor";
import { toast } from "sonner";
import DOMPurify from "dompurify";
import useCheckLogin from "../../State/useLogin";
import Loading from "../../components/Loading";
import {
  GetLaporanByUser,
  PostLaporan,
  EditLaporan,
  DeleteLaporan,
} from "../../service/Laporan/Laporan.services";
import SkeletonLaporan from "./SkeletonLaporan";
import { FaChevronLeft, FaCircle, FaGlobe, FaTag } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";

const LaporanKegiatan = () => {
  const [search, setSearch] = useState("");
  // Jika ingin default langsung memuat semua laporan tanpa filter tanggal awal, ganti string kosong atau tetap hari ini.
  // Di sini kita buat default kosong atau bisa diisi string tanggal. Biar fleksibel, kita buat state date bisa null/kosong.
  const [date, setDate] = useState("");
  const [showEditor, setShowEditor] = useState(false);
  const [editorContent, setEditorContent] = useState("");
  const getFormattedDate = () => {
    const options = {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    };
    return new Date().toLocaleDateString("id-ID", options);
  };

  // Inisialisasi state dengan template dinamis
  const [judul, setJudul] = useState(`Laporan Harian, ${getFormattedDate()}`);
  const [tanggal, setTanggal] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [editingId, setEditingId] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const navigate = useNavigate();
  const { user, isLoading } = useCheckLogin();
  const [loading, setLoading] = useState(false);
  const [laporan, setLaporan] = useState([]);

  const filteredData = laporan.filter((item) => {
    const matchTitle = item.judul.toLowerCase().includes(search.toLowerCase());
    const itemDate = item.tanggal ? item.tanggal.split("T")[0] : "";
    const matchDate = date ? itemDate === date : true;
    return matchTitle && matchDate;
  });

  const fetchData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const response = await GetLaporanByUser(user.id);

      const data = Array.isArray(response?.data) ? response.data : [];

      // urutkan terbaru di atas
      data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      setLaporan(data);
    } catch {
      toast.error("Gagal memuat laporan.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!judul || !editorContent) {
      toast.error("Judul dan deskripsi tidak boleh kosong!");
      return;
    }

    let sanitizedContent = DOMPurify.sanitize(editorContent);
    const div = document.createElement("div");
    div.innerHTML = sanitizedContent;
    div.querySelectorAll("p").forEach((el) => {
      if (el.textContent.includes("Powered by")) el.remove();
    });
    sanitizedContent = div.innerHTML;

    try {
      setLoading(true);
      if (editingId) {
        await EditLaporan(editingId, {
          judul,
          date: tanggal,
          deskripsi: sanitizedContent,
        });
        toast.success("Laporan berhasil diperbarui!");
      } else {
        await PostLaporan({
          judul,
          date: tanggal,
          deskripsi: sanitizedContent,
          userId: user.id,
        });
        toast.success("Laporan berhasil dibuat!");
      }

      setShowEditor(false);
      setEditorContent("");
      setJudul("");
      setTanggal(new Date().toISOString().split("T")[0]);
      setEditingId(null);
      fetchData();
    } catch {
      toast.error("Gagal menyimpan laporan.");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setJudul(item.judul);
    setTanggal(item.tanggal.split("T")[0]);
    setEditorContent(item.deskripsi);
    setShowEditor(true);
  };

  const handleDelete = async (id) => {
    try {
      setLoading(true);
      await DeleteLaporan(id, { status: "deleted" });
      toast.success("Laporan berhasil dihapus!");
      fetchData();
    } catch {
      toast.error("Gagal menghapus laporan.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && !isLoading) fetchData();
  }, [user, isLoading]);

  useEffect(() => {
    const close = () => setOpenMenuId(null);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, []);

  if (isLoading) return <Loading />;

  if (loading) return <SkeletonLaporan />;

  // ================= EDITOR MODE =================
  if (showEditor) {
    return (
      <>
        <button
          onClick={() => {
            setShowEditor(false);
            setEditingId(null);
          }}
          className="flex  z-20 w-full items-center justify-start gap-2  p-4 bg-red-600 text-white"
        >
          <FaChevronLeft size={18} />
          <p className="ml-2 text-lg font-bold">
            {editingId ? "Edit Laporan" : "Buat Laporan Baru"}
          </p>
        </button>

        <div className="p-4 space-y-4">
          <div className="flex gap-2 items-center text-sm font-semibold">
            <FaCircle size={10} />
            <label className="">Judul Laporan</label>
          </div>
          <input
            type="text"
            placeholder="Judul laporan"
            value={judul}
            onChange={(e) => setJudul(e.target.value)}
            className="w-full px-3 py-2 outline-none border rounded-lg"
          />

          <div className="flex justify-between gap-2 items-center text-sm font-semibold mt-2">
            <div className="flex  gap-2 items-center">
              <FaCircle size={10} />
              <label className="">Tanggal Laporan</label>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {tanggal &&
                new Date(tanggal).toLocaleDateString("id-ID", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
            </p>
          </div>

          {/* Input Tanggal di Form Editor (Tetap menggunakan input date standar atau bisa disesuaikan, tapi di iOS form input biasanya aman asal diberi styling border/padding) */}
          <input
            type="date"
            value={tanggal}
            onChange={(e) => setTanggal(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg bg-white"
          />

          <div className="flex gap-2 items-center text-sm font-semibold mt-2">
            <FaCircle size={10} />
            <label className="">Deskripsi Laporan</label>
          </div>

          <Editor
            editorContent={editorContent}
            setEditorContent={setEditorContent}
          />

          <button
            onClick={handleSubmit}
            className="w-full bg-red-600 text-white py-3 rounded-xl font-semibold"
          >
            {editingId ? "Perbarui Laporan" : "Simpan Laporan"}
          </button>
        </div>
      </>
    );
  }

  // ================= LIST MODE =================
  return (
    <>
      <Navigations title="Laporan Harian" />
      <Helmet>
        <title>Laporan Harian</title>
      </Helmet>

      <div className="p-4 space-y-4 pt-20 ">
        {/* Input Pencarian Judul */}
        <div className="relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Cari laporan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border pl-10 pr-3 py-2 rounded-lg bg-white"
          />
        </div>

        {/* CUSTOM FILTER TANGGAL (RAMAH IPHONE / MOBILE) */}
        <div className="bg-white p-3 rounded-xl border shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-700 uppercase tracking-wider">
              <CalendarIcon size={14} className="text-red-600" />
              <span>Filter Tanggal</span>
            </div>

            {/* Tombol Clear / Reset Filter */}
            {date && (
              <button
                onClick={() => setDate("")}
                className="text-xs text-red-600 hover:text-red-700 font-semibold flex items-center gap-1 bg-red-50 px-2 py-1 rounded-md transition-colors"
              >
                <X size={12} /> Hapus Filter
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Input Date dengan Tampilan Custom Wrapper */}
            <div className="relative flex-1">
              <input
                type="date"
                placeholder="Pilih Tanggal"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full border px-3 py-2 rounded-lg text-sm bg-gray-50 text-gray-800 focus:outline-none focus:ring-2 focus:ring-red-500 appearance-none"
              />
            </div>

            {/* Quick Button: Hari Ini */}
            <button
              onClick={() => setDate(new Date().toISOString().split("T")[0])}
              className={`px-3 py-2 rounded-lg text-xs font-bold transition-all shrink-0 ${
                date === new Date().toISOString().split("T")[0]
                  ? "bg-red-600 text-white shadow-sm"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              Hari Ini
            </button>
          </div>

          {/* Keterangan Status Filter Aktif */}
        </div>

        {/* LIST LAPORAN */}
        {filteredData.length === 0 ? (
          <div className="text-center py-10 bg-white rounded-xl border border-dashed border-gray-200 p-6">
            <p className="text-gray-400 text-sm">Tidak ada laporan ditemukan</p>
            {date && (
              <button
                onClick={() => setDate("")}
                className="mt-2 text-xs text-red-600 font-semibold underline"
              >
                Tampilkan semua tanggal
              </button>
            )}
          </div>
        ) : (
          filteredData.map((item, index) => (
            <div
              key={item.id}
              className="bg-white hover:shadow hover:bg-gray-50 p-3 rounded-lg shadow flex justify-between items-center relative transition-all"
            >
              {/* AREA YANG BOLEH NAVIGATE */}
              <div
                onClick={() => navigate(`/laporan-harian/${item.id}`)}
                className="flex-1 cursor-pointer pb-5"
              >
                <p className="text-xs text-gray-400">Laporan #{index + 1}</p>

                <p className="font-semibold text-sm">
                  {item.judul.length > 100
                    ? item.judul.slice(0, 100) + "..."
                    : item.judul}
                </p>

                <p className="text-xs text-gray-400 mt-1">
                  {new Date(item.tanggal).toLocaleDateString("id-ID", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>

              {/* AREA MENU (ANTI NAVIGATE) */}
              <div className="relative bottom-8 right-0">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenMenuId(openMenuId === item.id ? null : item.id);
                  }}
                  className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <MoreVertical size={18} />
                </button>

                {openMenuId === item.id && (
                  <div className="absolute right-0 mt-2 bg-white border rounded-lg shadow w-32 z-20">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEdit(item);
                        setOpenMenuId(null);
                      }}
                      className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-100 w-full"
                    >
                      <Edit size={14} /> Edit
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(item.id);
                        setOpenMenuId(null);
                      }}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-gray-100 w-full"
                    >
                      <Trash2 size={14} /> Hapus
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <button
        onClick={() => setShowEditor(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg hover:bg-red-700 transition-transform active:scale-95"
      >
        <Plus size={24} />
      </button>
    </>
  );
};

export default LaporanKegiatan;
