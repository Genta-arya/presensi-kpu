import React, { useEffect, useRef, useState } from "react";
import Navigations from "../Navigation";
import useCheckLogin from "../../State/useLogin";
import logo from "../../assets/logo.png";
import {
  User,
  CreditCard,
  Briefcase,
  BadgeDollarSign,
  FileText,
  Save,
  Pencil,
  ImagePlus,
  Phone,
  Mail,
  Network, // Icon tambahan untuk Struktur Unit
} from "lucide-react";
import { toast } from "sonner";
import {
  updateAvatar,
  updateProfil,
  UploadImage,
} from "../../service/Auth/auth.service";
import { CgSpinner } from "react-icons/cg";
import { createReportData } from "../../service/ReportData/ReportData.services";

const Profil = () => {
  const { user, setUser } = useCheckLogin();
  const [loading, setLoading] = useState(false);
  // EDIT MODE
  const [isEdit, setIsEdit] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [catatan, setCatatan] = useState("");
  const firstInputRef = useRef(null);

  useEffect(() => {
    // auto scroll ke atas
    window.scrollTo(0, 0);
  }, []);

  // DATA FORM
  const [avatar, setAvatar] = useState(
    "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
  );

  // DATA FORM - Pembaruan field sesuai JSON terbaru
  const [formData, setFormData] = useState({
    name: "",
    nip: "",
    jabatan: "",
    golongan: "",
    gaji: "",
    npwp: "",
    email: "",
    noHp: "",
    strukturUnit: [], // Tambahkan ini untuk menampung array unit kerja
  });

  const handleSendReport = async () => {
    if (!catatan.trim()) {
      toast.error("Mohon isi catatan kesalahan data!");
      return;
    }
    try {
      setLoading(true);
      await createReportData({
        catatan,
        userId: user.id,
      });
      toast.success("Laporan berhasil dikirim!");
      setCatatan("");
      setIsModalOpen(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Gagal mengirim laporan!");
    } finally {
      setLoading(false);
    }
  };

  // LOAD USER - Update pemetaan data dari JSON response
  useEffect(() => {
    if (user) {
      setFormData({
        name: user?.name || "-",
        nip: user?.nip || "-",
        jabatan:
          user?.jabatan?.nama ||
          user?.jabatan?.nama_jabatan ||
          user?.jabatan ||
          "-",
        golongan: user?.golongan || "-",
        gaji: user?.gaji || "-",
        npwp: user?.npwp || "-",
        email: user?.email || "-",
        noHp: user?.noHp || "-",
        strukturUnit: user?.strukturUnit || [], // Ambil array strukturUnit dari user
      });
      setAvatar(user?.avatar || "https://i.pravatar.cc/300");
    }
  }, [user]);

  // HANDLE INPUT
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // MODE EDIT
  const handleEdit = () => {
    setIsEdit(true);
    setTimeout(() => {
      firstInputRef.current?.focus();
    }, 100);
  };

  // SIMPAN
  const handleSave = async () => {
    try {
      if (!validateForm()) return;
      setLoading(true);
      const response = await updateProfil(user.id, {
        name: formData.name,
        nip: formData.nip,
        jabatan: formData.jabatan,
        golongan: formData.golongan,
        gaji: formData.gaji,
        npwp: formData.npwp,
        email: formData.email,
        noHp: formData.noHp,
      });
      setUser(response.data);
      toast.success("Data berhasil diperbarui!");
      setIsEdit(false);
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || "Gagal memperbarui data");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePhoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validImageTypes = ["image/jpeg", "image/jpg", "image/png"];
    if (!validImageTypes.includes(file.type)) {
      toast.error("Format file tidak didukung! Gunakan JPG, JPEG, atau PNG.");
      e.target.value = "";
      return;
    }

    const maxSizeInBytes = 2 * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
      toast.error(
        "Ukuran file terlalu besar! Maksimal batas ukuran adalah 2MB.",
      );
      e.target.value = "";
      return;
    }

    setIsUploading(true);
    const toastId = toast.loading("Sedang mengunggah foto profil...");

    try {
      const uploadCloud = await UploadImage(file);
      if (!uploadCloud || !uploadCloud.file_url) {
        throw new Error("Gagal mendapatkan URL gambar dari server.");
      }

      const img_url = uploadCloud.file_url;
      if (!user?.id) {
        throw new Error("Sesi pengguna tidak valid.");
      }

      const response = await updateAvatar(user.id, { avatarUrl: img_url });
      if (response?.status === false || response?.data?.status === "error") {
        throw new Error(response?.message || "Gagal memperbarui database.");
      }

      setAvatar(img_url);
      toast.success("Foto profil berhasil diperbarui!", { id: toastId });
    } catch (error) {
      console.error("Error Update Avatar:", error);
      toast.error(`Gagal perbarui foto: ${error.message}`, { id: toastId });
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const validateForm = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Format email tidak valid!");
      return false;
    }

    const phoneRegex = /^\d+$/;
    if (
      !phoneRegex.test(formData.noHp) ||
      formData.noHp.length < 10 ||
      formData.noHp.length > 16
    ) {
      toast.error(
        "No. HP harus berupa angka dan berjumlah antara 10 hingga 16 karakter!",
      );
      return false;
    }

    return true;
  };

  // STYLE CARD FORM
  const formCardStyle = `
    bg-gray-50
    p-5
    rounded-2xl
    border
    border-gray-100
    transition-all
    duration-200
    focus-within:border-red-500
    focus-within:ring-4
    focus-within:ring-red-100
  `;

  return (
    <>
      <Navigations title={"Profil"} />

      <div className="min-h-screen bg-gray-100 pt-20 px-4 pb-10">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white rounded-3xl shadow-xl overflow-hidden">
            {/* HEADER */}
            <div className="bg-gradient-to-r from-red-600 via-red-500 to-red-400 h-72 relative overflow-hidden">
              <div className="absolute left-1/2 top-16 transform -translate-x-1/2">
                <div className="relative">
                  <img
                    src={avatar}
                    alt="Avatar"
                    className="w-40 h-40 rounded-full border-4 object-center border-white object-cover shadow-2xl"
                  />

                  {/* UPDATE FOTO */}
                  <label className="absolute bottom-2 right-2 bg-red-600 hover:bg-red-700 transition p-3 rounded-full cursor-pointer shadow-lg">
                    <ImagePlus size={20} color="white" />
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png"
                      disabled={isUploading}
                      className="hidden"
                      onChange={handleUpdatePhoto}
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* CONTENT */}
            <div className="pt-26 p-6">
              {/* TOP INFO */}
              <div className="text-center mb-8">
                <h1 className="text-xl font-bold text-gray-800">
                  {formData.name || "Nama Pegawai"}
                </h1>
                <p className="text-gray-500 mt-1">
                  {formData.jabatan || "Jabatan"}
                </p>
              </div>

              {/* FORM GRID */}
              <div className="grid md:grid-cols-2 gap-5">
                {/* NAMA */}
                <div className={formCardStyle}>
                  <label className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                    <User size={18} />
                    Nama Lengkap
                  </label>
                  {isEdit ? (
                    <input
                      ref={firstInputRef}
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full bg-transparent border-b-2 outline-none text-sm font-semibold text-gray-800"
                    />
                  ) : (
                    <p className="text-sm font-semibold text-gray-800 break-words">
                      {formData.name}
                    </p>
                  )}
                </div>

                {/* NIP */}
                <div className={formCardStyle}>
                  <label className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                    <CreditCard size={18} />
                    NIP
                  </label>
                  {isEdit ? (
                    <input
                      type="text"
                      name="nip"
                      value={formData.nip}
                      onChange={handleChange}
                      className="w-full bg-transparent border-b-2 outline-none text-sm font-semibold text-gray-800"
                    />
                  ) : (
                    <p className="text-sm font-semibold text-gray-800">
                      {formData.nip}
                    </p>
                  )}
                </div>

                {/* JABATAN */}
                <div className={formCardStyle}>
                  <label className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                    <Briefcase size={18} />
                    Jabatan
                  </label>
                  <p className="text-sm font-semibold text-gray-800">
                    {formData.jabatan}
                  </p>
                </div>

                {/* STRUKTUR UNIT / UNIT KERJA (FIELD BARU) */}
                <div className={`${formCardStyle} md:col-span-2`}>
                  <label className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                    <Network size={18} />
                    Unit Kerja & Posisi
                  </label>
                  {formData.strukturUnit && formData.strukturUnit.length > 0 ? (
                    <div className="flex flex-col gap-2">
                      {formData.strukturUnit.map((item, index) => (
                        <div
                          key={item.id || index}
                          className="text-sm text-gray-800"
                        >
                          <span className="font-bold text-red-600">
                            [{item.posisi || "STAFF"}]
                          </span>{" "}
                          <span className="font-semibold">
                            {item.unitKerja?.nama || "-"}
                          </span>
                          <span className="text-xs text-gray-400 block mt-0.5">
                            Kode Unit: {item.unitKerja?.kode || "-"}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm font-semibold text-gray-800">-</p>
                  )}
                </div>

                {/* EMAIL */}
                <div className={formCardStyle}>
                  <label className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                    <Mail size={18} />
                    Email
                  </label>
                  {isEdit ? (
                    <input
                      type="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full bg-transparent border-b-2 outline-none text-sm font-semibold text-gray-800"
                    />
                  ) : (
                    <p className="text-sm font-semibold text-gray-800">
                      {formData.email}
                    </p>
                  )}
                </div>

                {/* NPWP */}
                <div className={formCardStyle}>
                  <label className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                    <FileText size={18} />
                    NPWP
                  </label>
                  {isEdit ? (
                    <input
                      type="text"
                      name="npwp"
                      value={formData.npwp}
                      onChange={handleChange}
                      className="w-full bg-transparent border-b-2 outline-none text-sm font-semibold text-gray-800"
                    />
                  ) : (
                    <p className="text-sm font-semibold text-gray-800 break-words">
                      {formData.npwp}
                    </p>
                  )}
                </div>

                {/* NO HP / WHATSAPP */}
                <div className={formCardStyle}>
                  <label className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                    <Phone size={18} />
                    No. HP / WhatsApp
                  </label>
                  {isEdit ? (
                    <input
                      type="text"
                      name="noHp"
                      value={formData.noHp}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "");
                        setFormData({ ...formData, noHp: val });
                      }}
                      className="w-full bg-transparent border-b-2 outline-none text-sm font-semibold text-gray-800"
                    />
                  ) : (
                    <p className="text-sm font-semibold text-gray-800">
                      {formData.noHp || "-"}
                    </p>
                  )}
                </div>

                {/* GOLONGAN */}
                <div className={formCardStyle}>
                  <label className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                    <FileText size={18} />
                    Golongan
                  </label>
                  <p className="text-sm font-semibold text-gray-800">
                    {formData.golongan}
                  </p>
                </div>

                {/* GAJI */}
                <div className={formCardStyle}>
                  <label className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                    <BadgeDollarSign size={18} />
                    Gaji
                  </label>
                  <p className="text-sm font-semibold text-gray-800">
                    {formData.gaji || "-"}
                  </p>
                </div>
              </div>
            </div>

            {/* BUTTON ACTION */}
            <div className="px-6 pb-6 text-sm flex flex-col gap-3">
              {!isEdit ? (
                <button
                  onClick={handleEdit}
                  className="flex items-center justify-center gap-2 w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-2xl transition shadow-lg font-semibold"
                >
                  <Pencil size={18} />
                  Ubah Profil
                </button>
              ) : (
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="flex items-center justify-center gap-2 w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-2xl transition shadow-lg font-semibold"
                >
                  {loading ? (
                    <div className="animate-spin">
                      <CgSpinner size={18} />
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Save size={18} />
                      <p>Simpan Profil</p>
                    </div>
                  )}
                </button>
              )}

              <button
                onClick={() => setIsModalOpen(true)}
                className="text-gray-500 hover:text-red-600 underline text-center"
              >
                Laporkan kesalahan data
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL LAPOR */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
          <div className="bg-white p-6 rounded-3xl w-full max-w-md shadow-2xl">
            <h2 className="text-lg font-bold mb-4 text-gray-800">
              Laporkan Kesalahan
            </h2>
            <textarea
              value={catatan}
              onChange={(e) => setCatatan(e.target.value)}
              className="w-full border border-gray-300 rounded-xl p-3 mb-4 h-32 focus:ring-2 focus:ring-red-500 outline-none"
              placeholder="Tuliskan detail kesalahan data Anda di sini..."
            />
            <div className="flex gap-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 transition"
              >
                Batal
              </button>
              <button
                onClick={handleSendReport}
                className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white transition"
              >
                Kirim Laporan
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Profil;
