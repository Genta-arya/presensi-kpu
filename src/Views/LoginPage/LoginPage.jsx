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
    try {
      setLoading(true);
      const res = await HandleLoginPage({ nip, security: password });

      if (res.data?.mfa === "setup") {
        navigate(`/mfa-setup/${res.data.userId}`);
      }

      if (res.data?.mfa === "verify") {
        setShowOtp(true);
        setUserId(res.data.userId);
      }

      if (res.data?.token) {
        localStorage.setItem("token", res.data.token);
        navigate("/");
      }
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          "Terjadi kesalahan Login gagal, coba lagi",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = "Login - Aplikasi Presensi KPU";
  }, []);

  // OTP handler
  const handleOtpChange = (val, idx) => {
    if (!/^[0-9]?$/.test(val)) return;

    const newOtp = [...otp];
    newOtp[idx] = val;
    setOtp(newOtp);

    if (val && idx < 5) {
      otpRef.current[idx + 1].focus();
    }
  };

  const handleOtpKey = (e, idx) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) {
      otpRef.current[idx - 1].focus();
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const otpValue = otp.join("");

    if (otpValue.length < 6) {
      toast.error("OTP belum lengkap");
      return;
    }

    try {
      setLoading(true);
      const res = await HandleVerifyMFA({ userId, otp: otpValue });

      if (!res.status) {
        toast.error("OTP salah");
        return;
      }

      localStorage.setItem("token", res.token);
      navigate("/");
    } catch {
      toast.error("Verifikasi OTP gagal, coba lagi");
    } finally {
      setLoading(false);
    }
  };

  const handleResetMFA = async () => {
    if (!nip || !password) {
      toast.error(
        "Masukkan NIP dan Password terlebih dahulu sebelum reset MFA",
      );
      return;
    }

    try {
      setLoading(true);
      const res = await ResetMFA({ nip, password });
      if (res.status) {
        toast.success("MFA berhasil di-reset. Silakan setup ulang.");
        navigate(`/mfa-setup/${res.userId}`);
      } else {
        toast.error(res.message || "Gagal reset MFA");
      }
    } catch {
      toast.error("Reset MFA gagal, coba lagi");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="min-h-screen  flex items-center justify-center bg-slate-100">
      <div className="bg-white p-5  rounded-xl shadow-lg w-[90%] lg:w-[50%] md:w-[80%]">
        <div className="flex gap-4 items-center justify-center mb-6">
          <img src="/logo.png" alt="" className="w-12" />
          <div className="flex flex-col ">
            {showOtp ? (
              <h2 className="text-2xl font-semibold">Verifikasi OTP</h2>
            ) : (
              <>
                <h1 className="text-base lg:text-lg font-bold text-red-600">
                  Komisi Pemilihan Umum
                </h1>
                <p className="font-bold text-xs lg:text-base">
                  Kabupaten Sekadau
                </p>
              </>
            )}
          </div>
        </div>

        {!showOtp ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm mb-1">NIP</label>
              <input
                type="text"
                placeholder="Masukkan NIP"
                value={nip}
                onChange={(e) => setNip(e.target.value)}
                className="w-full border rounded-lg px-3 py-2 focus:ring-2 outline-none focus:ring-red-500"
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Masukkan Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 pr-10 outline-none focus:ring-2 focus:ring-red-500"
                />
                <span
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                >
                  {showPassword ? <AiFillEye /> : <AiFillEyeInvisible />}
                </span>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-red-600 text-white py-2 rounded-lg"
            >
              Login
            </button>

            <button
              type="button"
              onClick={handleResetMFA}
              className="w-full text-center mt-2 text-sm text-red-600 hover:underline"
            >
              Reset MFA
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <label className="block text-sm mb-1">
              Kode OTP (Google Authenticator)
            </label>

            <div className="flex justify-between gap-2">
              {otp.map((v, i) => (
                <input
                  key={i}
                  ref={(el) => (otpRef.current[i] = el)}
                  type="text"
                  maxLength={1}
                  value={v}
                  onChange={(e) => handleOtpChange(e.target.value, i)}
                  onKeyDown={(e) => handleOtpKey(e, i)}
                  className="w-full text-center border-2 rounded-lg py-2 text-lg focus:ring-2 focus:ring-red-500"
                />
              ))}
            </div>

            <button
              type="submit"
              className="w-full bg-red-600 text-white py-2 rounded-lg"
            >
              Verifikasi
            </button>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="w-full bg-gray-600 text-white py-2 rounded-lg"
            >
              Kembali
            </button>
          </form>
        )}

        <div className="mt-10 text-center text-gray-500 text-xs">
          <span className="text-bold text-red-600 font-bold">E-Presensi</span>{" "}
          &copy; {new Date().getFullYear()} Komisi Pemilihan Umum Kabupaten
          Sekadau. All rights reserved.
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
