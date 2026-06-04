import React, { useEffect, useState } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Users,
  X,
  Save,
  Eye,
  Building2,
  UserCheck,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  createSubbagian,
  deleteSubbagian,
  getSubbagian,
  updateSubbagian,
} from "../../../service/Subbagian/Subbagian.services";
import Loading from "../../../components/Loading";
import ContainerDashboard from "../components/ContainerDashboard";

const LayoutUnitKerja = () => {
  const navigate = useNavigate();

  const [data, setData] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState(null);
  const [namaInput, setNamaInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const fetchSubbagian = async () => {
    try {
      setIsLoading(true);
      const response = await getSubbagian();
      // Pastikan array fallback aman jika response kosong
      setData(response.data || []);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Gagal mengambil data subbagian"
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubbagian();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!namaInput.trim()) return toast.error("Nama subbagian tidak boleh kosong");

    try {
      setIsLoading(true);
      if (editingUnit) {
        await updateSubbagian(editingUnit.id, { nama_subbagian: namaInput  });
        toast.success("Data berhasil diperbarui");
      } else {
        await createSubbagian({ nama_subbagian: namaInput });
        toast.success("Data berhasil disimpan");
      }
      closeModal();
      fetchSubbagian();
    } catch (error) {
      toast.error(error.response?.data?.message || "Gagal menyimpan data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus subbagian ini? Data yang dihapus tidak dapat dikembalikan.")) {
      try {
        setIsLoading(true);
        await deleteSubbagian(id);
        toast.success("Subbagian berhasil dihapus");
        fetchSubbagian();
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Gagal menghapus subbagian"
        );
      } finally {
        setIsLoading(false);
      }
    }
  };

  const openModal = (unit = null) => {
    setEditingUnit(unit);
    setNamaInput(unit ? unit.nama : "");
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setEditingUnit(null);
    setNamaInput("");
  };

  return (
    <ContainerDashboard>
      <div className="space-y-6 w-full p-1">
        {/* HEADER SECTION */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white p-6 rounded-3xl border border-gray-100 shadow-sm gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-red-50 text-red-600 rounded-2xl shrink-0">
              <Building2 size={24} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-slate-800">Subbagian</h1>
              <p className="text-xs sm:text-sm text-slate-500">
                Manajemen data struktur subbagian KPU Kabupaten Sekadau
              </p>
            </div>
          </div>
          <button
            onClick={() => openModal()}
            className="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white px-5 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-red-600/10 transition-all active:scale-95 text-sm"
          >
            <Plus size={18} /> Tambah Subbagian
          </button>
        </div>

        {/* MODAL COMPONENT */}
        {isOpen && (
          <div className="fixed inset-[-50px] bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-fade-in">
            <div className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-lg shadow-2xl border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg sm:text-xl font-black text-slate-800">
                  {editingUnit ? "Edit Subbagian" : "Tambah Subbagian Baru"}
                </h2>
                <button onClick={closeModal} className="text-slate-400 hover:text-slate-600 transition-colors">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleSave} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Nama Subbagian / Unit Kerja
                  </label>
                  <input
                    required
                    value={namaInput}
                    onChange={(e) => setNamaInput(e.target.value)}
                    placeholder="Contoh: Teknis Penyelenggaraan Pemilu dan Hukum"
                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all text-sm text-slate-800"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-red-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-all shadow-md shadow-red-600/10 text-sm"
                >
                  <Save size={18} /> Simpan Data
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TABLE DATA CONTAINER */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden min-h-[250px] flex flex-col justify-center">
          {isLoading ? (
            <div className="py-12 flex justify-center items-center w-full">
              <Loading />
            </div>
          ) : (
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="bg-slate-50/70 border-b border-gray-100">
                    <th className="p-5 font-bold text-slate-400 uppercase text-[11px] tracking-widest text-center w-20">No</th>
                    <th className="p-5 font-bold text-slate-400 uppercase text-[11px] tracking-widest">Nama Subbagian</th>
                    <th className="p-5 font-bold text-slate-400 uppercase text-[11px] tracking-widest">Kepala Subbag / Pimpinan</th>
                    <th className="p-5 font-bold text-slate-400 uppercase text-[11px] tracking-widest w-32">Total Staf</th>
                    <th className="p-5 font-bold text-slate-400 uppercase text-[11px] tracking-widest text-right w-36">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm text-slate-700">
                  {data.length > 0 ? (
                    data.map((item, index) => {
                      // Ambil pimpinan dari hasil mapping backend jika ada
                      const namaPimpinan = item.pimpinan || "Belum Ditentukan";

                      return (
                        <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-5 text-center text-slate-400 font-medium">#{index + 1}</td>
                          <td className="p-5 font-bold text-slate-800 leading-snug tracking-tight max-w-xs sm:max-w-none truncate sm:whitespace-normal">
                            {item.nama}
                          </td>
                          <td className="p-5 text-slate-600 font-semibold">
                            <div className="flex items-center gap-2">
                              <UserCheck size={15} className={namaPimpinan !== "Belum Ditentukan" ? "text-amber-500" : "text-slate-300"} />
                              <span className={namaPimpinan === "Belum Ditentukan" ? "text-slate-400 italic font-normal" : "text-slate-700 font-bold"}>
                                {namaPimpinan}
                              </span>
                            </div>
                          </td>
                          <td className="p-5 text-slate-600 font-bold">
                            <div className="flex items-center gap-2 bg-slate-100/70 px-2.5 py-1 rounded-lg w-max text-xs text-slate-700">
                              <Users size={14} className="text-slate-400" />
                              <span>{item.jumlahPegawai || 0} Orang</span>
                            </div>
                          </td>
                          <td className="p-5 text-right">
                            <div className="inline-flex items-center gap-1 bg-slate-50 p-1 rounded-xl border border-slate-100">
                              <button
                                onClick={() => navigate(`/dashboard/subbagian/detail/${item.id}`)}
                                className="p-2 text-slate-400 hover:text-emerald-600 hover:bg-white rounded-lg transition-all shadow-xs"
                                title="Lihat Detail Staf"
                              >
                                <Eye size={15} />
                              </button>
                              <button
                                onClick={() => openModal(item)}
                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-white rounded-lg transition-all shadow-xs"
                                title="Edit Subbagian"
                              >
                                <Edit2 size={15} />
                              </button>
                              <button
                                onClick={() => handleDelete(item.id)}
                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-white rounded-lg transition-all shadow-xs"
                                title="Hapus Subbagian"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan="5" className="text-center py-12 text-slate-400 font-medium">
                        Data subbagian tidak ditemukan.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </ContainerDashboard>
  );
};

export default LayoutUnitKerja;