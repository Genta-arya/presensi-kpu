import React, { useState, useEffect } from "react";
import ContainerDashboard from "../components/ContainerDashboard";
import {
  createJabatan,
  deleteJabatan,
  getJabatan,
  updateJabatan,
} from "../../../service/Jabatan/Jabatan.services";
import Loading from "../../../components/Loading";
import { Helmet } from "react-helmet-async";

const LayoutJabatan = () => {
  // State Utama Data & Loading Fetching
  const [dataJabatan, setDataJabatan] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // State Anti-Spam Tombol (Proses CRUD)
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State Modal CRUD
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [inputNama, setInputNama] = useState("");

  // ==========================================
  // API SERVICES INTEGRATION
  // ==========================================

  // 1. READ: Ambil Data dari API
  const fetchJabatan = async () => {
    setLoading(true);
    try {
      const response = await getJabatan();

      // 1. Ambil data mentah (pastikan fallback ke array kosong [] jika null/undefined)
      // CATATAN: Jika API kamu membungkus datanya dalam properti 'data' lagi,
      // ubah bagian ini menjadi: response.data.data || []
      const rawData = response.data || [];

      // 2. Lakukan pengecekan apakah rawData benar-benar sebuah Array sebelum di-sort
      if (Array.isArray(rawData)) {
        const sortedData = [...rawData].sort((a, b) => {
          // Gunakan optional chaining (?.) untuk menghindari crash jika nama_jabatan kosong
          const nameA = (a.nama_jabatan || a.nama || "").toLowerCase();
          const nameB = (b.nama_jabatan || b.nama || "").toLowerCase();

          if (nameA < nameB) return -1;
          if (nameA > nameB) return 1;
          return 0;
        });

        setDataJabatan(sortedData);
      } else {
        console.warn("Format data dari API bukan sebuah Array:", rawData);
        setDataJabatan([]);
      }
    } catch (error) {
      console.error("Gagal mengambil data jabatan:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJabatan();
  }, []);

  // 2. CREATE & UPDATE: Handle Submit Form di Modal
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputNama.trim() || isSubmitting) return; // Kunci jika sedang submit

    setIsSubmitting(true); // Aktifkan proteksi anti-spam
    try {
      if (currentId) {
        // Mode UPDATE/EDIT
        await updateJabatan(currentId, { nama_jabatan: inputNama });
      } else {
        // Mode CREATE/TAMBAH
        await createJabatan({ nama_jabatan: inputNama });
      }

      closeModal();
      await fetchJabatan(); // Refresh data utama
    } catch (error) {
      console.error("Gagal menyimpan data:", error);
    } finally {
      setIsSubmitting(false); // Buka kunci proteksi
    }
  };

  // 3. DELETE: Hapus Data
  const handleDelete = async (id) => {
    if (isSubmitting) return; // Mencegah hapus ganda berjalan bersamaan

    if (window.confirm("Apakah Anda yakin ingin menghapus jabatan ini?")) {
      setIsSubmitting(true);
      try {
        await deleteJabatan(id);
        await fetchJabatan();
      } catch (error) {
        console.error("Gagal menghapus data:", error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // ==========================================
  // HELPER MODAL CONTROL
  // ==========================================
  const openModal = (jabatan = null) => {
    if (jabatan) {
      setCurrentId(jabatan.id);
      setInputNama(jabatan.nama_jabatan || jabatan.nama || "");
    } else {
      setCurrentId(null);
      setInputNama("");
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (isSubmitting) return; // Mencegah tutup modal paksa saat API loading
    setIsModalOpen(false);
    setCurrentId(null);
    setInputNama("");
  };

  const filteredJabatan = dataJabatan.filter((jabatan) => {
    const nameData = jabatan.nama_jabatan || jabatan.nama || "";
    return nameData.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <ContainerDashboard>
      <Helmet>
            <title>Manajemen Jabatan - Sistem Informasi Kepegawaian KPU Kabupaten Sekadau </title>
         </Helmet>
      <div className="space-y-6 w-full ">
        {/* HEADER SECTION */}
        <div className="flex flex-col w-full sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800 tracking-tight">
              Manajemen Jabatan
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Kelola daftar nama jabatan dengan mudah dan cepat.
            </p>
          </div>

          <button
            onClick={() => openModal()}
            disabled={isSubmitting || loading}
            className="flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 active:scale-95 disabled:opacity-50 disabled:scale-100 disabled:pointer-events-none text-white px-4 py-2.5 rounded-xl font-medium text-sm transition-all shadow-sm shadow-red-500/20 whitespace-nowrap"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
              className="w-4 h-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
            Tambah Jabatan
          </button>
        </div>

        {/* SEARCH BAR */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center">
          <div className="relative w-full ">
            <span className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-4 h-4 text-gray-400"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.604 10.604z"
                />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Cari nama jabatan..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              disabled={loading}
              className="w-full text-xs sm:text-sm bg-gray-50 text-gray-800 pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all disabled:opacity-60"
            />
          </div>
        </div>

        {/* DATA TABLE / LIST AREA */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden min-h-[200px] flex flex-col justify-center">
          {loading ? (
            <div className="py-10 flex justify-center items-center w-full">
              <Loading />
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block overflow-x-auto w-full">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100 text-gray-600 text-xs uppercase font-semibold tracking-wider">
                      <th className="px-6 py-4 w-20 text-center">No</th>
                      <th className="px-6 py-4">Nama Jabatan</th>
                      <th className="px-6 py-4 text-right w-32">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                    {filteredJabatan.length > 0 ? (
                      filteredJabatan.map((row, index) => (
                        <tr
                          key={row.id}
                          className="hover:bg-gray-50/70 transition-colors"
                        >
                          <td className="px-6 py-4 text-center font-medium text-gray-400">
                            {index + 1}
                          </td>
                          <td className="px-6 py-4 font-semibold text-gray-900 capitalize">
                            {row.nama_jabatan || row.nama}
                          </td>
                          <td className="px-6 py-4 text-right">
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => openModal(row)}
                                disabled={isSubmitting}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-40 disabled:pointer-events-none"
                                title="Edit"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  strokeWidth={2}
                                  stroke="currentColor"
                                  className="w-4 h-4"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                                  />
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDelete(row.id)}
                                disabled={isSubmitting}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-40 disabled:pointer-events-none"
                                title="Hapus"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/xl"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  strokeWidth={2}
                                  stroke="currentColor"
                                  className="w-4 h-4"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                                  />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="3"
                          className="text-center py-10 text-gray-400 text-sm"
                        >
                          Data jabatan tidak ditemukan.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile List View */}
              <div className="block md:hidden divide-y divide-gray-100 w-full">
                {filteredJabatan.length > 0 ? (
                  filteredJabatan.map((row, index) => (
                    <div
                      key={row.id}
                      className="p-4 hover:bg-gray-50/50 transition-colors flex items-center justify-between gap-4"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-semibold text-gray-400 bg-gray-50 w-7 h-7 flex items-center justify-center rounded-lg border border-gray-100">
                          {index + 1}
                        </span>
                        <h4 className="font-semibold text-gray-900 text-sm">
                          {row.nama_jabatan || row.nama}
                        </h4>
                      </div>

                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={() => openModal(row)}
                          disabled={isSubmitting}
                          className="p-1.5 text-blue-600 bg-blue-50 rounded-lg text-xs font-medium disabled:opacity-40"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(row.id)}
                          disabled={isSubmitting}
                          className="p-1.5 text-red-600 bg-red-50 rounded-lg text-xs font-medium disabled:opacity-40"
                        >
                          Hapus
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-xs text-gray-400">
                    Data jabatan tidak ditemukan.
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* MODAL COMPONENT */}
        {isModalOpen && (
          <div className="fixed inset-[-50px] bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 p-4 transition-all animate-fade-in">
            <div className="bg-white rounded-2xl max-w-md w-full shadow-xl overflow-hidden transform transition-all scale-100 border border-gray-100">
              <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-base sm:text-lg font-bold text-gray-800">
                  {currentId ? "Edit Nama Jabatan" : "Tambah Jabatan Baru"}
                </h3>
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={isSubmitting}
                  className="text-gray-400 hover:text-gray-600 rounded-lg p-1 hover:bg-gray-200/60 transition-all disabled:opacity-30"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2.5}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      Nama Jabatan
                    </label>
                    <input
                      type="text"
                      required
                      value={inputNama}
                      onChange={(e) => setInputNama(e.target.value)}
                      disabled={isSubmitting}
                      placeholder="Contoh: Kasubag Teknis"
                      className="w-full text-sm bg-gray-50 text-gray-800 px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all disabled:opacity-60"
                    />
                  </div>
                </div>

                <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={closeModal}
                    disabled={isSubmitting}
                    className="px-4 py-2 text-xs sm:text-sm font-medium text-gray-600 hover:text-gray-800 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl transition-all disabled:opacity-40"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 text-xs sm:text-sm font-medium text-white bg-red-500 hover:bg-red-600 active:scale-95 disabled:opacity-50 disabled:scale-100 disabled:pointer-events-none rounded-xl transition-all shadow-sm shadow-red-500/10 flex items-center gap-2"
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
                    {isSubmitting
                      ? "Menyimpan..."
                      : currentId
                        ? "Simpan Perubahan"
                        : "Simpan Jabatan"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </ContainerDashboard>
  );
};

export default LayoutJabatan;
