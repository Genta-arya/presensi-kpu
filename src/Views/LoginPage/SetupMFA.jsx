import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  GetQRForMFASetup,
  HandlePostMFASetup,
} from "../../service/Auth/auth.service";
import { toast } from "sonner";

const SetupMFA = () => {
  const { userId } = useParams();
  const navigate = useNavigate();

  const [qr, setQr] = useState(null);
  const [otp, setOtp] = useState("");

  useEffect(() => {
    if (!userId) return;

    const fetchQR = async () => {
      try {
        const response = await GetQRForMFASetup(userId);

        if (response.status === false) {
          toast.success("MFA sudah diaktifkan, silakan login");
          navigate("/login");
        } else {
          setQr(response.data.qr);
        }
      } catch (err) {
        console.log(err);
        toast.error("Gagal mengambil QR code, coba lagi");
      }
    };

    fetchQR();
  }, [userId]);

  const handleVerify = async () => {
    try {
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
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="bg-white p-8 rounded-xl shadow-lg w-96 space-y-4">
        <h2 className="text-xl font-semibold text-center">
          Setup Google Authenticator
        </h2>

        {qr ? (
          <img src={qr} alt="QR Code" className="mx-auto" />
        ) : (
          <p className="text-sm text-gray-500 text-center">Generate QR...</p>
        )}

        {/* Tutorial */}
        <div className="text-sm text-gray-600 space-y-2">
          <p className="font-medium">Cara setup:</p>
          <ol className="list-decimal ml-5 space-y-1">
            <li>
              Install aplikasi <b>Google Authenticator</b>
            </li>
            <li>
              Buka aplikasi → tekan tombol <b>+</b>
            </li>
            <li>
              Pilih <b>Scan QR code</b>
            </li>
            <li>Arahkan kamera ke QR di atas</li>
            <li>Masukkan kode 6 digit di bawah</li>
          </ol>
        </div>

        <input
          type="text"
          placeholder="Masukkan OTP 6 digit"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-red-500"
        />

        <button
          onClick={handleVerify}
          className="w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700"
        >
          Verifikasi & Aktifkan
        </button>
        <button
          onClick={() => (window.location.href = "/login")}
          className="w-full bg-gray-600 text-white py-2 rounded-lg hover:bg-gray-700"
        >
          Kembali
        </button>
      </div>
    </div>
  );
};

export default SetupMFA;
