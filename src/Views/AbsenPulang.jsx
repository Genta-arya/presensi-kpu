import React, { useEffect, useState, useRef } from "react";
import SignatureCanvas from "react-signature-canvas";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { FaCalendar, FaCheck, FaSync } from "react-icons/fa";
import { toast } from "sonner";
import Lottie from "lottie-react";

import successAnimation from "../assets/Sukses.json";
import LoadingLokasi from "../components/LoadingLokasi";
import Maps from "../components/Maps";
import useCheckLogin from "../State/useLogin";
import Loading from "../components/Loading"; // Pastikan impor komponen Loading bawaanmu

const AbsenPulang = () => {
  const navigate = useNavigate();
  const sigCanvas = useRef();

  // State Pemanis untuk menyamakan UI halaman masuk
  const [dateNow, setDateNow] = useState("");
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // Koordinat kantor dan koordinat palsu pemanis (jarak selalu dekat)
  const targetCoords = { lat: 0.009752495103421941, lng: 110.95552433438533 };
  const [coords, setCoords] = useState({
    lat: targetCoords.lat + 0.0002,
    lng: targetCoords.lng - 0.0002,
  });
  const [distance, setDistance] = useState(45); // Set statis di bawah 100 meter

  const { user, checkSession } = useCheckLogin();


  useEffect(() => {
    // Cek sesi login saat komponen pertama kali dimuat
    checkSession();

    // Set tanggal realtime lokal Indonesia
    const hari = new Date();
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    const formatter = new Intl.DateTimeFormat("id-ID", options);
    setDateNow(formatter.format(hari));

    // Simulasi loading lokasi selama 1.5 detik
    const timer = setTimeout(() => {
      setIsLoadingLocation(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const handleClear = () => {
    sigCanvas.current.clear();
  };

  const handleSavePulang = () => {
    if (sigCanvas.current.isEmpty()) {
      toast.error("Tanda tangan tidak boleh kosong!");
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setShowSuccessModal(true);
    }, 1000);
  };

  // PENGAMAN UTAMA: Jika data user dari custom hook masih null / belum selesai dimuat
  if (!user) {
    return <Loading />;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center">
        <div className="w-16 h-16 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-600 font-semibold">
          Memproses Absen Pulang...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {isLoadingLocation ? (
        <LoadingLokasi />
      ) : (
        <Maps
          coords={coords}
          setDistance={setDistance}
          distance={distance}
          showPinModal={false}
          isLoadingUser={false}
          targetCoords={targetCoords}
          getCurrentLocation={() => {}}
          setCoords={setCoords}
          setIsLoadingLocation={setIsLoadingLocation}
        />
      )}

      <div className="mx-auto rounded-t-lg bg-white px-5 pt-8 space-y-6">
        {/* INFO USER (Menggunakan optional chaining agar aman) */}
        <div className="text-gray-700 font-bold text-sm border-b pb-2 mb-4 flex items-center gap-2">
          <img src={user?.avatar} alt="avatar" className="w-10 rounded-full" />
          {user?.name || "Pengguna"}
        </div>

        {/* INFO TANGGAL */}
        <div className="text-gray-700 text-sm border-b pb-2 mb-4 flex items-center gap-2">
          <FaCalendar className="text-xl text-gray-500" />
          <p className="font-bold">{dateNow} (Absen Pulang)</p>
        </div>

        {/* AREA TANDA TANGAN */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tanda Tangan Pulang:
            </label>
            <button
              type="button"
              onClick={handleClear}
              className="text-sm bg-gray-200 px-3 py-1 rounded hover:bg-gray-300"
            >
              <FaSync className="inline mr-1" />
            </button>
          </div>

          <div className="border border-gray-300 rounded-md">
            <SignatureCanvas
              ref={sigCanvas}
              penColor="red"
              canvasProps={{ className: "w-full h-52 rounded-md" }}
            />
          </div>

          {/* TOMBOL AKSI */}
          <div className="mt-4 pb-8">
            <button
              type="button"
              onClick={handleSavePulang}
              className="bg-red-600 w-full text-white py-2 rounded-md hover:bg-red-500 flex items-center justify-center gap-2 font-semibold shadow-lg transition-all"
            >
              <FaCheck size={20} />
              Konfirmasi Absen Pulang
            </button>

            <button
              type="button"
              onClick={() => navigate("/")}
              className="w-full text-xs mt-3 hover:opacity-75 border border-gray-400 text-black px-4 py-3 rounded text-center block"
            >
              Kembali
            </button>
          </div>
        </div>
      </div>

      {/* MODAL SUKSES PALSU */}
      <AnimatePresence>
        {showSuccessModal && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-xl p-6 w-11/12 max-w-sm text-center shadow-2xl"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
            >
              <div className="flex justify-center">
                <div className="w-48 h-48">
                  <Lottie animationData={successAnimation} loop={false} />
                </div>
              </div>
              <h2 className="text-xl font-semibold mb-2 text-green-600">
                Absen Pulang Berhasil!
              </h2>
              <p className="text-gray-600 mb-4">
                Selamat beristirahat, pulang ke rumah dengan aman 🎉
              </p>
              <button
                onClick={() => navigate("/")}
                className="bg-green-500 w-full text-white px-4 py-2 rounded-full hover:bg-green-600 font-semibold"
              >
                Tutup
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AbsenPulang;