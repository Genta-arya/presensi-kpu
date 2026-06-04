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
} from "lucide-react";
import { toast } from "sonner";

const Profil = () => {
  const { user } = useCheckLogin();

  // EDIT MODE
  const [isEdit, setIsEdit] = useState(false);

  // REF INPUT PERTAMA
  const firstInputRef = useRef(null);
  useEffect(() => {
    // auto scroll ke atas
    window.scrollTo(0, 0);
  }, []);

  // DATA FORM
  const [formData, setFormData] = useState({
    name: "",
    nip: "",
    jabatan: "",
    golongan: "",
    gaji: "",
    npwp: "",
  });

  // FOTO PROFIL
  const [avatar, setAvatar] = useState(
    "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
  );

  // LOAD USER
  useEffect(() => {
    if (user) {
      setFormData({
        name: user?.name || "-",
        nip: user?.nip || "-",
        jabatan: user?.jabatan || "-",
        golongan: user?.golongan || "-",
        gaji: user?.gaji || "-",
        npwp: user?.npwp || "-",
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

  // UPDATE FOTO
  const handleUpdatePhoto = (e) => {
    const file = e.target.files[0];

    if (file) {
      const imageUrl = URL.createObjectURL(file);

      setAvatar(imageUrl);

      alert("Foto profil berhasil diperbarui!");
    }
  };

  // SIMPAN
  const handleSave = () => {
    console.log(formData);

    toast.success("Profil berhasil diperbarui!");

    setIsEdit(false);
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
              <div className="absolute top-5 left-6 flex items-center gap-3">
                <img
                  src={logo}
                  alt="Logo KPU"
                  className="w-14 h-14 object-contain drop-shadow-lg"
                />

                <div className="text-white">
                  <h2 className="font-bold uppercase text-lg leading-tight">
                    Komisi Pemilihan Umum
                  </h2>

                  <p className="text-xs font-bold opacity-90">KAB. SEKADAU</p>
                </div>
              </div>
              <div className="absolute left-1/2 top-24 transform -translate-x-1/2">
                <div className="relative">
                  <img
                    src={avatar}
                    alt="Avatar"
                    className="w-40 h-40 rounded-full border-4 border-white object-cover shadow-2xl"
                  />

                  {/* UPDATE FOTO */}
                  <label className="absolute bottom-2 right-2 bg-red-600 hover:bg-red-700 transition p-3 rounded-full cursor-pointer shadow-lg">
                    <ImagePlus size={20} color="white" />

                    <input
                      type="file"
                      accept="image/*"
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
                      className="
        w-full
        bg-transparent
        border-b-2
        outline-none
        text-sm
        font-semibold
        text-gray-800
      "
                    />
                  ) : (
                    <p
                      className="
        text-sm
        font-semibold
        text-gray-800
        break-words
      "
                    >
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
                      className="
                        w-full
                        bg-transparent
                        border-b-2
                        outline-none
                        text-sm
                        font-semibold
                        text-gray-800
                      "
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

                  {isEdit ? (
                    <input
                      type="text"
                      name="jabatan"
                      value={formData.jabatan}
                      onChange={handleChange}
                      className="
                        w-full
                        bg-transparent
                        border-b-2
                        outline-none
                        text-sm
                        font-semibold
                        text-gray-800
                      "
                    />
                  ) : (
                    <p className="text-sm font-semibold text-gray-800">
                      {formData.jabatan}
                    </p>
                  )}
                </div>

                {/* GOLONGAN */}
                <div className={formCardStyle}>
                  <label className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                    <FileText size={18} />
                    Golongan
                  </label>

                  {isEdit ? (
                    <input
                      type="text"
                      name="golongan"
                      value={formData.golongan}
                      onChange={handleChange}
                      className="
                        w-full
                        bg-transparent
                        border-b-2
                        outline-none
                        text-sm
                        font-semibold
                        text-gray-800
                      "
                    />
                  ) : (
                    <p className="text-sm font-semibold text-gray-800">
                      {formData.golongan}
                    </p>
                  )}
                </div>

                {/* GOLONGAN */}

                {/* GAJI */}
                <div className={formCardStyle}>
                  <label className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                    <BadgeDollarSign size={18} />
                    Gaji
                  </label>

                  {isEdit ? (
                    <input
                      type="text"
                      name="gaji"
                      value={formData.gaji}
                      onChange={handleChange}
                      className="
                        w-full
                        bg-transparent
                        border-b-2
                        outline-none
                        text-sm
                        font-semibold
                        text-gray-800
                      "
                    />
                  ) : (
                    <p className="text-sm font-semibold text-gray-800">
                      {formData.gaji}
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
                      className="
        w-full
        bg-transparent
        border-b-2
        outline-none
        text-sm
        font-semibold
        text-gray-800
      "
                    />
                  ) : (
                    <p
                      className="
        text-sm
        font-semibold
        text-gray-800
        break-words
      "
                    >
                      {formData.npwp}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* BUTTON */}
            <div className="px-6 pb-6 text-sm">
              {!isEdit ? (
                <button
                  onClick={handleEdit}
                  className="
                    flex
                    items-center
                    justify-center
                    gap-2
                    w-full
                    bg-red-600
                    hover:bg-red-700
                    text-white
                    py-2
                    rounded-2xl
                    transition
                    shadow-lg
                    font-semibold
                  "
                >
                  <Pencil size={18} />
                  Ubah Profil
                </button>
              ) : (
                <button
                  onClick={handleSave}
                  className="
                    flex
                    items-center
                    justify-center
                    gap-2
                    w-full
                    bg-red-600
                    hover:bg-red-700
                    text-white
                    py-2
                    rounded-2xl
                    transition
                    shadow-lg
                    font-semibold
                  "
                >
                  <Save size={18} />
                  Simpan Profil
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profil;
