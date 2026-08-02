import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  GetQRForMFASetup,
  HandlePostMFASetup,
} from "../../service/Auth/auth.service";
import { toast } from "sonner";
import Loading from "../../components/Loading";

const SetupMFA = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [qr, setQr] = useState(null);
  const [secret, setSecret] = useState("");
  const [otp, setOtp] = useState("");

  useEffect(() => {
    if (!userId) return;

    const fetchQR = async () => {
      try {
        setLoading(true);
        const response = await GetQRForMFASetup(userId);

        if (response.status === false) {
          toast.success("MFA sudah diaktifkan, silakan login");
          navigate("/login");
        } else {
          setQr(response.data.qr);
          setSecret(response.data.secret);
        }
      } catch (err) {
        console.log(err);
        toast.error("Gagal mengambil QR code, coba lagi");
      } finally {
        setLoading(false);
      }
    };

    fetchQR();
  }, [userId]);

  const handleCopySecret = () => {
    if (!secret) return;
    navigator.clipboard.writeText(secret);
    toast.success("Setup Key berhasil disalin!");
  };

  const handleVerify = async () => {
    try {
      setLoading(true);
      const response = await HandlePostMFASetup({
        userId,
        otp,
      });

      if (response.status) {
        toast.success("MFA berhasil diaktifkan");
        navigate("/login");
      } else {
        toast.error("OTP salah");
      }
    } catch (err) {
      toast.error("Gagal verifikasi OTP, coba lagi");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loading />;
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-md space-y-4">
        <h2 className="text-xl font-semibold text-center">
          Setup Google Authenticator
        </h2>

        {qr ? (
          <img src={qr} alt="QR Code" className="mx-auto w-48 h-48 object-contain" />
        ) : (
          <p className="text-sm text-gray-500 text-center">Generate QR...</p>
        )}

        {/* Fitur Tampil & Salin Setup Key Manual secara utuh */}
        {secret && (
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 space-y-1">
            <span className="text-xs text-slate-500 block font-medium">
              Atau gunakan Setup Key (Manual):
            </span>
            <div className="flex items-center justify-between gap-2">
              <code className="text-xs bg-white px-2 py-1.5 rounded border border-slate-200 text-slate-700 font-mono break-all w-full select-all">
                {secret}
              </code>
              <button
                type="button"
                onClick={handleCopySecret}
                className="bg-slate-800 text-white text-xs px-3 py-1.5 rounded hover:bg-slate-900 transition-colors shrink-0"
              >
                Salin
              </button>
            </div>
          </div>
        )}

        {/* Tutorial / Arahan Penggunaan */}
        <div className="text-sm text-gray-600 space-y-2 bg-blue-50/50 p-3 rounded-lg border border-blue-100">
          <p className="font-medium text-blue-900">Cara Penggunaan:</p>
          <ol className="list-decimal ml-5 space-y-1 text-xs text-slate-700">
            <li>
              Buka aplikasi <b>Google Authenticator</b> (atau Microsoft Authenticator).
            </li>
            <li>
              Tekan tombol ikon <b>+</b> di aplikasi.
            </li>
            <li>
              <b>Jika pakai 2 device:</b> Pilih <i>Scan QR code</i> dan arahkan kamera ke gambar di atas.
            </li>
            <li>
              <b>Jika cuma punya 1 HP:</b> Pilih <i>Enter a setup key</i>, lalu <b>Salin & Tempel</b> kode di atas pada kolom kunci.
            </li>
            <li>Masukkan kode 6 digit yang muncul ke kolom di bawah ini.</li>
          </ol>
        </div>

        <input
          type="text"
          placeholder="Masukkan OTP 6 digit"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500 text-center tracking-widest font-mono text-lg"
          maxLength={6}
        />

        <button
          onClick={handleVerify}
          className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-colors font-medium"
        >
          Verifikasi & Aktifkan
        </button>
        <button
          onClick={() => navigate("/login")}
          className="w-full bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm"
        >
          Kembali
        </button>
      </div>
    </div>
  );
};

export default SetupMFA;