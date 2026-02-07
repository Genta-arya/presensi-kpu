import React, { useEffect, useState } from "react";
import Navigations from "../Navigation";
import {
  Search,
  Plus,
  ArrowLeft,
  MoreVertical,
  Trash2,
  Edit,
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

const LaporanKegiatan = () => {
  const [search, setSearch] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [showEditor, setShowEditor] = useState(false);
  const [editorContent, setEditorContent] = useState("");
  const [judul, setJudul] = useState("");
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

          <input
            type="date"
            value={tanggal}
            onChange={(e) => setTanggal(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
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

      <div className="p-4 space-y-4 pt-20 ">
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
            className="w-full border pl-10 pr-3 py-2 rounded-lg"
          />
        </div>

        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full border px-3 py-2 rounded-lg"
        />

        {filteredData.length === 0 ? (
          <p className="text-center text-gray-400 text-sm">Tidak ada laporan</p>
        ) : (
          filteredData.map((item, index) => (
            <div
              key={item.id}
              className="bg-white hover:shadow hover:bg-gray-50 p-3 rounded-lg shadow flex justify-between items-center relative"
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
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-red-600 text-white flex items-center justify-center shadow-lg"
      >
        <Plus size={24} />
      </button>
    </>
  );
};

export default LaporanKegiatan;
