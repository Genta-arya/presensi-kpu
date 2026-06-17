import React, { useEffect, useState } from "react";
import {
  GetLaporanByUser,
  DeleteLaporan,
} from "../../../service/Laporan/Laporan.services";
import { useParams } from "react-router-dom";
import {
  Trash2,
  ChevronDown,
  ChevronUp,
  FileText,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import Loading from "../../../components/Loading";

const DetailListLaporan = () => {
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [laporan, setLaporan] = useState([]);

  const today = new Date().toISOString().split("T")[0];
  const [filterDate, setFilterDate] = useState(today);
  const [expandedId, setExpandedId] = useState(null);

  const fetchLaporan = async (userId, date) => {
    setLoading(true);
    try {
      const response = await GetLaporanByUser(userId, date);
      setLaporan(response.data || []);
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Gagal memuat laporan.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchLaporan(id, filterDate);
  }, [id, filterDate]);

  const handleDelete = async (laporanId) => {
    toast.promise(DeleteLaporan(laporanId), {
      loading: "Menghapus laporan...",
      success: () => {
        fetchLaporan(id, filterDate); // Refresh data setelah sukses
        return "Laporan berhasil dihapus.";
      },
      error: "Terjadi kesalahan saat menghapus.",
    });
  };

  return (
    <div className="p-2 ">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div className="relative w-full">
          <input
            type="date"
            className="pl-4 w-full pr-10 py-2.5 rounded-xl border border-slate-200 bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all  font-medium"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
          />
        </div>
      </div>

      {/* List Section */}
      <div className="space-y-4">
        {loading ? (
         <Loading />
        ) : laporan.length > 0 ? (
          laporan.map((item) => (
            <div
              key={item.id}
              className="group bg-white rounded-2xl shadow-sm border border-slate-200 transition-all hover:shadow-md"
            >
              <div
                className="p-5 flex items-center justify-between cursor-pointer"
                onClick={() =>
                  setExpandedId(expandedId === item.id ? null : item.id)
                }
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-50 rounded-xl">
                    <FileText className="text-blue-600" size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg">
                      {item.judul}
                    </h3>
                    <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                      {new Date(item.tanggal).toLocaleDateString("id-ID", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(item.id);
                    }}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                  <div className="p-1 text-slate-400 bg-slate-100 rounded-lg">
                    {expandedId === item.id ? (
                      <ChevronUp size={20} />
                    ) : (
                      <ChevronDown size={20} />
                    )}
                  </div>
                </div>
              </div>

              {expandedId === item.id && (
                <div className="px-5 pb-5 pt-0 animate-in slide-in-from-top-2 duration-200">
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 prose prose-sm max-w-none text-slate-600">
                    <div dangerouslySetInnerHTML={{ __html: item.deskripsi }} />
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
            <AlertCircle className="mx-auto text-slate-400 mb-3" size={40} />
            <h3 className="text-lg font-medium text-slate-700">
              Tidak ada laporan
            </h3>
            <p className="text-slate-500">
              Belum ada aktivitas yang tercatat pada tanggal ini.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DetailListLaporan;
