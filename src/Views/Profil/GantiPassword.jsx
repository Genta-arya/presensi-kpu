import React, { useState } from "react";
import { Eye, EyeOff, Lock, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import useCheckLogin from "../../State/useLogin";
import Navigations from "../Navigation";
import { resetPassword } from "../../service/Auth/auth.service";

const GantiPassword = () => {
  const { user } = useCheckLogin();
  const [isLoading, setIsLoading] = useState(false);

  const [form, setForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.oldPassword || !form.newPassword || !form.confirmPassword) {
      toast.error("Semua kolom harus diisi!");
      return;
    }

    if (form.newPassword.length < 6) {
      toast.error("Kata sandi baru minimal harus 6 karakter!");
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      toast.error("Konfirmasi kata sandi baru tidak cocok!");
      return;
    }

    setIsLoading(true);
    try {
      await resetPassword({ userId: user?.id, ...form });
      
      toast.success("Kata sandi berhasil diperbarui!");
      setForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Gagal mengubah kata sandi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Navigations title="Kembali" />
      <div className="pt-20 p-4 min-h-screen bg-gray-50 flex flex-col justify-between pb-8">
        <div className="w-full mx-auto space-y-6">
          
          <div className="bg-gradient-to-br from-red-600 to-red-500 rounded-3xl p-5 text-white shadow-md">
            <h3 className="font-black text-xs uppercase tracking-wide">
              Perbarui Kata Sandi
            </h3>
            <p className="text-xs text-red-100 mt-1.5 leading-relaxed">
              Demi keamanan akun kamu, pastikan kata sandi baru tidak mudah ditebak dan kombinasikan dengan angka.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm space-y-4">
            
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider px-1">
                Kata Sandi Lama
              </label>
              <div className="relative flex items-center">
                <Lock className="absolute left-4 text-gray-400" size={16} />
                <input
                  type={showOld ? "text" : "password"}
                  name="oldPassword"
                  value={form.oldPassword}
                  onChange={handleChange}
                  placeholder="Masukkan kata sandi saat ini"
                  className="w-full bg-gray-50 border border-gray-200 text-gray-700 py-3 pl-11 pr-11 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500 text-xs font-bold transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowOld(!showOld)}
                  className="absolute right-4 text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showOld ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider px-1">
                Kata Sandi Baru
              </label>
              <div className="relative flex items-center">
                <Lock className="absolute left-4 text-gray-400" size={16} />
                <input
                  type={showNew ? "text" : "password"}
                  name="newPassword"
                  value={form.newPassword}
                  onChange={handleChange}
                  placeholder="Minimal 6 karakter"
                  className="w-full bg-gray-50 border border-gray-200 text-gray-700 py-3 pl-11 pr-11 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500 text-xs font-bold transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-4 text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider px-1">
                Konfirmasi Kata Sandi Baru
              </label>
              <div className="relative flex items-center">
                <Lock className="absolute left-4 text-gray-400" size={16} />
                <input
                  type={showConfirm ? "text" : "password"}
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Ulangi kata sandi baru"
                  className="w-full bg-gray-50 border border-gray-200 text-gray-700 py-3 pl-11 pr-11 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500 text-xs font-bold transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute right-4 text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

          </form>
        </div>

        <div className=" w-full mx-auto px-1 mt-6">
          <button
            type="button"
            disabled={isLoading}
            onClick={handleSubmit}
            className="w-full bg-red-600 text-white font-black py-3 px-4 rounded-2xl shadow-lg hover:bg-red-500 active:scale-[0.99] disabled:bg-gray-400 transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <CheckCircle2 size={16} />
                Simpan Perubahan
              </>
            )}
          </button>
        </div>

      </div>
    </>
  );
};

export default GantiPassword;