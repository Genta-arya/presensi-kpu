import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  HandleLoginPage,
  ResetMFA,
  HandleVerifyMFA,
} from "../../service/Auth/auth.service";
import { toast } from "sonner";
import Loading from "../../components/Loading";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import {
  FiUser,
  FiLock,
  FiShield,
  FiArrowLeft,
  FiLoader,
  FiCheckCircle,
  FiAlertCircle,
  FiCpu,
} from "react-icons/fi";

const LoginPage = () => {
  const [nip, setNip] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [otp, setOtp] = useState(Array(6).fill(""));
  const otpRef = useRef([]);
  const [userId, setUserId] = useState(null);
  const [showOtp, setShowOtp] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!nip || !password) return toast.error("Isi semua data untuk login");

    try {
      setLoading(true);
      const res = await HandleLoginPage({ nip, security: password });

      if (res.data?.mfa === "setup") {
        navigate(`/mfa-setup/${res.data.userId}`);
      } else if (res.data?.mfa === "verify") {
        setShowOtp(true);
        setUserId(res.data.userId);
      } else if (res.data?.token) {
        localStorage.setItem("token", res.data.token);
        navigate("/");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Login ditolak");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "KPU Secure Gateway";
    if (otp.every((slot) => slot !== "") && showOtp) handleVerifyOtp();
  }, [otp]);

  const handleOtpChange = (val, idx) => {
    if (!/^[0-9]?$/.test(val)) return;
    const newOtp = [...otp];
    newOtp[idx] = val;
    setOtp(newOtp);
    if (val && idx < 5) otpRef.current[idx + 1].focus();
  };

  const handleOtpKey = (e, idx) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0)
      otpRef.current[idx - 1].focus();
  };

  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();
    const otpValue = otp.join("");
    if (otpValue.length < 6) return;

    try {
      setLoading(true);
      const res = await HandleVerifyMFA({ userId, otp: otpValue });
      if (!res.status) throw new Error();

      if (res.secretCode) {
        localStorage.removeItem("token");
        window.location.href = `https://dashboard-eppid.vercel.app/login?secret=${res.secretCode}&issuer=E-Presensi`;
      } else {
        localStorage.setItem("token", res.token);
        navigate("/");
        toast.success("Akses Diberikan");
      }
    } catch {
      toast.error("Kode Keamanan Tidak Valid");
    } finally {
      setLoading(false);
    }
  };

  const handleResetMFA = async () => {
    if (!nip || !password) return toast.error("Isi data untuk reset");
    try {
      setLoading(true);
      const res = await ResetMFA({ nip, password });
      if (res.status) navigate(`/mfa-setup/${res.userId}`);
    } catch {
      toast.error("Gagal mereset keamanan");
    } finally {
      setLoading(false);
    }
  };
  const handlePaste = (e) => {
    e.preventDefault();
    const data = e.clipboardData.getData("text").trim();

    // Pastikan yang di-copas adalah angka dan panjangnya sesuai (6 digit)
    if (!/^\d+$/.test(data)) return;

    const pasteData = data.split("").slice(0, 6); // Ambil 6 karakter pertama
    const newOtp = [...otp];

    pasteData.forEach((char, index) => {
      if (index < 6) {
        newOtp[index] = char;
      }
    });

    setOtp(newOtp);

    // Pindahkan fokus ke input terakhir atau input setelah data yang terisi
    const lastIndex = Math.min(pasteData.length - 1, 5);
    otpRef.current[lastIndex].focus();
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f172a] relative overflow-hidden font-sans">
      {/* Cinematic Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none"></div>
      <div className="absolute w-[800px] h-[800px] bg-red-600/20 rounded-full blur-[150px] -top-96 -left-96 animate-pulse"></div>
      <div className="absolute w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px] -bottom-48 -right-48"></div>

      <div className="relative z-10 w-full lg:max-w-[50%] p-4">
        <div className="bg-[#1e293b]/80 backdrop-blur-2xl p-8 md:p-12 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-slate-700/50">
          {/* Top Brand Branding */}
          <div className="flex flex-col items-center mb-10">
            <div className="relative group mb-6">
              <div className="absolute inset-0 bg-red-500 rounded-full blur-xl opacity-20 group-hover:opacity-40 transition-opacity"></div>
              <img
                src="/logo.png"
                alt="Logo"
                className="w-24 bg-white p-1 h-24 rounded-2xl relative z-10 transform transition-transform group-hover:scale-110 duration-500"
              />
            </div>

            <div className="text-center">
              <h1 className="text-white text-2xl font-black tracking-tighter uppercase flex items-center gap-2">
                Secure <span className="text-red-500">Gateway</span>
              </h1>
              <p className="text-slate-400 text-[10px] font-bold tracking-[0.3em] uppercase mt-1">
                Portal KPU Sekadau
              </p>
            </div>
          </div>

          {!showOtp ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Input NIP */}
              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    NIP Access
                  </label>
                  <FiCpu className="text-slate-500 text-sm" />
                </div>
                <div className="relative group">
                  <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-red-500 transition-colors" />
                  <input
                    type="text"
                    value={nip}
                    onChange={(e) => setNip(e.target.value)}
                    placeholder="Enter ID Number"
                    className="w-full bg-[#0f172a]/50 border border-slate-600 rounded-2xl px-12 py-4 text-white outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all placeholder:text-slate-600"
                  />
                </div>
              </div>

              {/* Input Password */}
              <div className="space-y-2">
                <div className="flex justify-between items-center ">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Secret Key
                  </label>
                  <FiLock className="text-slate-500 text-sm" />
                </div>
                <div className="relative group">
                  <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-red-500 transition-colors" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#0f172a]/50 border border-slate-600 rounded-2xl px-12 py-4 text-white outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all placeholder:text-slate-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                  >
                    {showPassword ? (
                      <AiFillEye size={20} />
                    ) : (
                      <AiFillEyeInvisible size={20} />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full relative overflow-hidden group bg-gradient-to-r from-red-600 to-rose-700 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-red-900/20 active:scale-[0.98] transition-all"
              >
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                {loading ? (
                  <FiLoader className="animate-spin mx-auto text-xl" />
                ) : (
                  "Authorize Access"
                )}
              </button>

              <button
                type="button"
                onClick={handleResetMFA}
                className="w-full text-center text-[10px] font-black text-slate-500 hover:text-red-400 transition-colors uppercase tracking-[0.2em]"
              >
                System Reset MFA
              </button>
            </form>
          ) : (
            <form
              onSubmit={handleVerifyOtp}
              className="space-y-8 animate-in zoom-in-95 duration-500"
            >
              <div className="bg-red-500/5 border border-red-500/20 p-4 rounded-2xl flex items-center gap-3">
                <FiShield className="text-red-500 text-xl shrink-0" />
                <p className="text-[11px] text-slate-300 leading-tight">
                  Sistem mendeteksi autentikasi multi-faktor. Masukkan kode dari
                  perangkat seluler Anda.
                </p>
              </div>

              <div className="flex justify-between gap-1">
                {otp.map((v, i) => (
                  <input
                    key={i}
                    ref={(el) => (otpRef.current[i] = el)}
                    type="text"
                    maxLength={1}
                    autoComplete="one-time-code"
                    inputMode="numeric"
                    value={v}
                    onChange={(e) => handleOtpChange(e.target.value, i)}
                    onPaste={handlePaste}
                    onKeyDown={(e) => handleOtpKey(e, i)}
                    className="w-full h-16 text-center bg-[#0f172a] border-2 border-slate-700 rounded-xl text-2xl font-black text-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none transition-all"
                  />
                ))}
              </div>

              <div className="flex flex-col gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-red-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-red-900/30 active:scale-[0.98] transition-all"
                >
                  {loading ? (
                    <FiLoader className="animate-spin mx-auto text-xl" />
                  ) : (
                    "Verify Identity"
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => window.location.reload()}
                  className="text-slate-400 font-bold text-xs uppercase flex items-center justify-center gap-2 hover:text-white transition-colors"
                >
                  <FiArrowLeft /> kembali ke login
                </button>
              </div>
            </form>
          )}

          {/* Footer Security Badge */}
          <div className="mt-12 flex flex-col items-center gap-4">
            <div className="flex items-center gap-2 px-4 py-1.5 bg-slate-900 rounded-full border border-slate-700/50">
              <FiCheckCircle className="text-emerald-500 text-[10px]" />
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                End-to-End Encrypted
              </span>
            </div>
            <p className="text-[9px] text-slate-600 font-medium text-center">
              INTERNAL ACCESS ONLY • KPU SEKADAU SYSTEM SECURITY
              <br />
              &copy; {new Date().getFullYear()} ALL RIGHTS RESERVED
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
