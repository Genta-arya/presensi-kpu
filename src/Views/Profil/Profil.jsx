import React, { useEffect, useRef, useState } from "react";
import Navigations from "../Navigation";
import useCheckLogin from "../../State/useLogin";
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
  Network,
  X,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import {
  updateAvatar,
  updateProfil,
  UploadImage,
} from "../../service/Auth/auth.service";
import { CgSpinner } from "react-icons/cg";
import { createReportData } from "../../service/ReportData/ReportData.services";
import Loading from "../../components/Loading";
import { Helmet } from "react-helmet-async";

// --- IMPORT LIBRARY & CSS REACT-IMAGE-CROP ---
import ReactCrop, { centerCrop, makeAspectCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

// Helper untuk membuat crop awal pas di tengah lingkaran
function centerAspectCrop(mediaWidth, mediaHeight, aspect) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: "%",
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight,
    ),
    mediaWidth,
    mediaHeight,
  );
}

const Profil = () => {
  const { user, setUser } = useCheckLogin();
  const [loading, setLoading] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [catatan, setCatatan] = useState("");
  const firstInputRef = useRef(null);

  // --- STATE UNTUK LIBRARY REACT-IMAGE-CROP ---
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [imgSrc, setImgSrc] = useState("");
  const [crop, setCrop] = useState();
  const [completedCrop, setCompletedCrop] = useState(null);
  const imgRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const [avatar, setAvatar] = useState(
    "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
  );

  const [formData, setFormData] = useState({
    name: "",
    nip: "",
    jabatan: "",
    golongan: "",
    gaji: "",
    npwp: "",
    email: "",
    noHp: "",
    strukturUnit: [],
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
        strukturUnit: user?.strukturUnit || [],
      });
      setAvatar(user?.avatar || "https://i.pravatar.cc/300");
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleEdit = () => {
    setIsEdit(true);
    setTimeout(() => {
      firstInputRef.current?.focus();
    }, 100);
  };

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

  // 1. PILIH FILE GAMBAR
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validImageTypes = ["image/jpeg", "image/jpg", "image/png"];
    if (!validImageTypes.includes(file.type)) {
      toast.error("Format file tidak didukung! Gunakan JPG, JPEG, atau PNG.");
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Ukuran file terlalu besar! Maksimal 5MB.");
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setImgSrc(reader.result);
      setIsCropModalOpen(true);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  // 2. SAAT GAMBAR DIMUAT DI MODAL CROP
  const onImageLoad = (e) => {
    const { width, height } = e.currentTarget;
    // Set aspect ratio 1:1 (kotak/lingkaran sempurna)
    const initialCrop = centerAspectCrop(width, height, 1);
    setCrop(initialCrop);
  };

  // 3. PROSES PEMOTONGAN MENGGUNAKAN CANVAS & LIBRARY
  const handleCropAndUpload = async () => {
    const image = imgRef.current;
    const canvas = canvasRef.current;
    if (!image || !canvas || !completedCrop) return;

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    const ctx = canvas.getContext("2d");
    const pixelRatio = window.devicePixelRatio || 1;

    canvas.width = completedCrop.width * scaleX * pixelRatio;
    canvas.height = completedCrop.height * scaleY * pixelRatio;

    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    ctx.imageSmoothingEnabled = true;

    const cropX = completedCrop.x * scaleX;
    const cropY = completedCrop.y * scaleY;
    const centerX = image.naturalWidth / 2;
    const centerY = image.naturalHeight / 2;

    ctx.save();
    ctx.translate(-cropX, -cropY);
    ctx.drawImage(
      image,
      0,
      0,
      image.naturalWidth,
      image.naturalHeight,
      0,
      0,
      image.naturalWidth,
      image.naturalHeight,
    );
    ctx.restore();

    // Konversi hasil canvas ke File Blob
    canvas.toBlob(
      async (blob) => {
        if (!blob) {
          toast.error("Gagal memproses gambar!");
          return;
        }

        const croppedFile = new File([blob], "avatar_cropped.jpg", {
          type: "image/jpeg",
        });

        setIsCropModalOpen(false);
        setIsUploading(true);
        const toastId = toast.loading("Sedang mengunggah foto profil...");

        try {
          const uploadCloud = await UploadImage(croppedFile);
          if (!uploadCloud || !uploadCloud.file_url) {
            throw new Error("Gagal mendapatkan URL gambar dari server.");
          }

          const img_url = uploadCloud.file_url;
          const response = await updateAvatar(user.id, { avatarUrl: img_url });
          if (response?.status === false || response?.data?.status === "error") {
            throw new Error(response?.message || "Gagal memperbarui database.");
          }

          setAvatar(img_url);
          setUser({ ...user, avatar: img_url });
          toast.success("Foto profil berhasil diperbarui!", { id: toastId });
        } catch (error) {
          console.error("Error Update Avatar:", error);
          toast.error(`Gagal perbarui foto: ${error.message}`, { id: toastId });
        } finally {
          setIsUploading(false);
        }
      },
      "image/jpeg",
      0.95,
    );
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

  const formCardStyle = `
    bg-gray-50 p-5 rounded-2xl w-full border border-gray-100 transition-all duration-200 focus-within:border-red-500 focus-within:ring-4 focus-within:ring-red-100
  `;

  if (loading || !user) {
    return <Loading />;
  }

  return (
    <>
      <Navigations title={"Profil"} />
      <Helmet>
        <title>Profil</title>
      </Helmet>

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

                  {/* TOMBOL UPLOAD */}
                  <label className="absolute bottom-2 right-2 bg-red-600 hover:bg-red-700 transition p-3 rounded-full cursor-pointer shadow-lg">
                    <ImagePlus size={20} color="white" />
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png"
                      disabled={isUploading}
                      className="hidden"
                      onChange={handleFileSelect}
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* CONTENT FORM */}
            <div className="pt-26 p-6">
              <div className="grid md:grid-cols-2 gap-5">
                <div className={formCardStyle}>
                  <label className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                    <User size={18} /> Nama Lengkap
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

                <div className={formCardStyle}>
                  <label className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                    <CreditCard size={18} /> NIP
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

                <div className={formCardStyle}>
                  <label className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                    <Briefcase size={18} /> Jabatan
                  </label>
                  <p className="text-sm font-semibold text-gray-800">
                    {formData.jabatan}
                  </p>
                </div>

                <div className={`${formCardStyle} md:col-span-2`}>
                  <label className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                    <Network size={18} /> Unit Kerja & Posisi
                  </label>
                  {formData.strukturUnit && formData.strukturUnit.length > 0 ? (
                    <div className="flex flex-col gap-2">
                      {formData.strukturUnit.map((item, index) => (
                        <div key={item.id || index} className="text-sm text-gray-800">
                          <span className="font-bold text-red-600">
                            [{item.posisi || "STAFF"}]
                          </span>{" "}
                          <span className="font-semibold">
                            {item.unitKerja?.nama || "-"}
                          </span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm font-semibold text-gray-800">-</p>
                  )}
                </div>

                <div className={formCardStyle}>
                  <label className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                    <Mail size={18} /> Email
                  </label>
                  {isEdit ? (
                    <input
                      type="email"
                      name="email"
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

                <div className={formCardStyle}>
                  <label className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                    <FileText size={18} /> NPWP
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
                    <p className="text-sm font-semibold text-gray-800">
                      {formData.npwp}
                    </p>
                  )}
                </div>

                <div className={formCardStyle}>
                  <label className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                    <Phone size={18} /> No. HP / WhatsApp
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

                <div className={formCardStyle}>
                  <label className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                    <FileText size={18} /> Golongan
                  </label>
                  <p className="text-sm font-semibold text-gray-800">
                    {formData.golongan}
                  </p>
                </div>
              </div>
            </div>

            {/* BUTTON ACTION */}
            <div className="px-6 pb-6 text-sm flex flex-col gap-3">
              {!isEdit ? (
                <button
                  onClick={handleEdit}
                  className="flex items-center justify-center gap-2 w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-2xl transition shadow-lg font-semibold cursor-pointer"
                >
                  <Pencil size={18} /> Ubah Profil
                </button>
              ) : (
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="flex items-center justify-center gap-2 w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-2xl transition shadow-lg font-semibold cursor-pointer"
                >
                  {loading ? (
                    <div className="animate-spin">
                      <CgSpinner size={18} />
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Save size={18} /> <p>Simpan Profil</p>
                    </div>
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* MODAL CROP MENGGUNAKAN LIBRARY REACT-IMAGE-CROP            */}
      {/* ========================================================= */}
      {isCropModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
          <div className="bg-white p-6 rounded-3xl w-full max-w-lg shadow-2xl flex flex-col items-center">
            <div className="flex items-center justify-between w-full mb-3">
              <h3 className="text-base font-bold text-gray-800">
                Pangkas & Sesuaikan Foto
              </h3>
              <button
                onClick={() => setIsCropModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>
            <p className="text-xs text-gray-500 mb-4 text-center">
              Seret kotak untuk mengatur bagian foto yang ingin dijadikan profil.
            </p>

            {/* KOTAK AREA CROP */}
            <div className="max-h-[60vh] overflow-auto flex justify-center w-full bg-gray-900 rounded-2xl p-2">
              {imgSrc && (
                <ReactCrop
                  crop={crop}
                  onChange={(c) => setCrop(c)}
                  onComplete={(c) => setCompletedCrop(c)}
                  aspect={1}
                  circularCrop
                >
                  <img
                    ref={imgRef}
                    src={imgSrc}
                    alt="Upload Crop"
                    onLoad={onImageLoad}
                    style={{ maxHeight: "50vh", display: "block" }}
                  />
                </ReactCrop>
              )}
            </div>

            {/* TOMBOL AKSI */}
            <div className="flex gap-3 w-full mt-6">
              <button
                onClick={() => setIsCropModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs transition cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleCropAndUpload}
                disabled={isUploading}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-xs transition shadow-md cursor-pointer"
              >
                {isUploading ? (
                  <CgSpinner size={16} className="animate-spin" />
                ) : (
                  <>
                    <Check size={16} />
                    <span>Potong & Unggah</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />
    </>
  );
};

export default Profil;