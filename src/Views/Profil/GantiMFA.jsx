import React, { useEffect, useState } from "react";
import {
  Eye,
  EyeOff,
  Lock,
  User,
  CheckCircle2,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import useCheckLogin from "../../State/useLogin";
import Navigations from "../Navigation";
import { AnimatePresence } from "framer-motion";
import { HandleLoginPage, ResetMFA } from "../../service/Auth/auth.service";
import { Link } from "react-router-dom";

const GantiMFA = () => {
  const { user } = useCheckLogin();
  const [isLoading, setIsLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false); // State penanda verifikasi NIP & Password sukses
  const [verifyForm, setVerifyForm] = useState({
    nip: "",
    password: "",
  });

  useEffect(() => {
    if (user) {
      setIsVerified(false); // Reset status verifikasi saat user berubah
      setVerifyForm({ nip: user.nip, password: "" });
    }
  }, [user]);

  // State untuk toggle lihat password
  const [showPassword, setShowPassword] = useState(false);

  const handleVerifyChange = (e) => {
    setVerifyForm({ ...verifyForm, [e.target.name]: e.target.value });
  };

  // 1. Fungsi Handle Verifikasi Akun Awal
  const handleVerifyAccount = async (e) => {
    e.preventDefault();

    if (!verifyForm.nip || !verifyForm.password) {
      toast.error("Password harus diisi!");
      return;
    }

    setIsLoading(true);
    try {
      const response = await HandleLoginPage({
        nip: verifyForm.nip,
        security: verifyForm.password,
      });

      if (response.data.mfa === "verify") {
        toast.success("Verifikasi berhasil! Silakan reset MFA Anda.");
        setIsVerified(true); // Membuka gerbang ke langkah berikutnya
      } else {
        toast.error("NIP atau Password salah. Verifikasi gagal.");
        setIsVerified(false); // Pastikan tetap di langkah verifikasi jika gagal
      }
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || "NIP atau Password salah.");
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Fungsi Eksekusi Reset MFA
  const handleResetMFA = async () => {
    setIsLoading(true);
    try {
      await ResetMFA({ nip: verifyForm.nip, password: verifyForm.password });

      toast.success(
        "MFA Berhasil di-reset! Anda akan diarahkan untuk setup ulang pada login berikutnya.",
      );
      setIsVerified(false);
      setVerifyForm({ nip: user.nip, password: "" });
    } catch (error) {
      console.error(error);
      toast.error(error?.response?.data?.message || "Gagal mereset MFA.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Navigations title="Reset MFA" />
      <div className="pt-20 p-4 min-h-screen bg-gray-50 flex flex-col justify-between pb-8">
        <div className="w-full mx-auto space-y-6 ">
          
          {/* HEADER INFORMASI */}
          <div className="bg-gradient-to-br from-red-600 to-red-500 rounded-3xl p-5 text-white shadow-md">
            {/* Diubah dari text-lg menjadi text-xs font-black */}
            <h3 className="font-black text-xs uppercase tracking-wide">
              Reset Multi-Factor Authentication
            </h3>
            <p className="text-xs text-red-100 mt-1.5 leading-relaxed">
              Untuk mengamankan ketat hak akses ini, sistem mewajibkan
              verifikasi kredensial NIP dan Kata Sandi akun Anda terlebih
              dahulu.
            </p>
          </div>

          <AnimatePresence mode="wait">
            {!isVerified ? (
              /* LANGKAH 1: FORM VERIFIKASI NIP & PASSWORD */
              <form
                onSubmit={handleVerifyAccount}
                className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm space-y-4"
              >
                {/* INPUT NIP */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider px-1">
                    Nomor Induk Pegawai (NIP)
                  </label>
                  <div className="relative flex items-center">
                    <User className="absolute left-4 text-gray-400" size={16} />
                    {/* Diubah dari text-sm menjadi text-xs */}
                    <input
                      type="text"
                      name="nip"
                      disabled
                      value={verifyForm.nip}
                      onChange={handleVerifyChange}
                      placeholder="Masukkan NIP Anda"
                      className="w-full bg-gray-50 border border-gray-200 text-gray-700 py-3 pl-11 pr-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500 text-xs font-bold transition-all"
                    />
                  </div>
                </div>

                {/* INPUT PASSWORD */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-wider px-1">
                    Kata Sandi Akun
                  </label>
                  <div>
                    <div className="relative flex items-center">
                      <Lock className="absolute left-4 text-gray-400" size={16} />
                      {/* Diubah dari text-sm menjadi text-xs */}
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={verifyForm.password}
                        onChange={handleVerifyChange}
                        placeholder="Masukkan kata sandi Anda"
                        className="w-full bg-gray-50 border border-gray-200 text-gray-700 py-3 pl-11 pr-11 rounded-2xl focus:outline-none focus:ring-2 focus:ring-red-500 text-xs font-bold transition-all"
                      />

                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 text-gray-400 hover:text-gray-600 focus:outline-none"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    <Link
                      to={`/profil/ganti-password/${user?.id || "me"}`}
                      className="text-center flex justify-center mt-3 text-gray-400 hover:text-gray-600 focus:outline-none text-xs font-semibold"
                    >
                      Lupa kata sandi?
                    </Link>
                  </div>
                </div>
              </form>
            ) : (
              /* LANGKAH 2: TOMBOL KONFIRMASI RESET JIKA SUDAH TERVERIFIKASI */
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm text-center space-y-4">
                <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mx-auto">
                  <ShieldCheck className="text-green-600" size={28} />
                </div>
                <div>
                  {/* Diubah dari text-sm menjadi text-xs */}
                  <h4 className="text-xs font-black text-gray-800 uppercase tracking-wide">
                    Identitas Terverifikasi
                  </h4>
                  <p className="text-xs text-gray-500 mt-1.5 leading-relaxed px-2">
                    Akun Anda sah. Klik tombol di bawah ini untuk mereset data
                    autentikator MFA Anda saat ini.
                  </p>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* AREA TOMBOL SUBMIT STRATEGIS DI BAWAH LAYOUT */}
        <div className=" w-full mx-auto px-1 mt-6">
          {!isVerified ? (
            <button
              type="button"
              disabled={isLoading}
              onClick={handleVerifyAccount}

              className="w-full bg-red-600 text-white font-black py-3 px-4 rounded-2xl shadow-lg hover:bg-red-500 active:scale-[0.99] disabled:bg-gray-400 transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <CheckCircle2 size={16} />
                  Verifikasi Akun
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              disabled={isLoading}
              onClick={handleResetMFA}
            
              className="w-full bg-orange-500 text-white font-black py-3 px-4 rounded-2xl shadow-lg hover:bg-orange-600 active:scale-[0.99] disabled:bg-gray-400 transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <RefreshCw size={14} className="animate-spin-slow" />
                  Reset MFA Sekarang
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default GantiMFA;