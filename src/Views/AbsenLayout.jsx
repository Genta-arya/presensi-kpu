import React, { useEffect, useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";
import { useSwipeable } from "react-swipeable";
import { motion, useMotionValue, AnimatePresence } from "framer-motion";

import { toast } from "sonner";
import { FaCalendar, FaCheck, FaSync, FaTimes } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import Lottie from "lottie-react";
import successAnimation from "../assets/Sukses.json";
import { SingleUsers } from "../service/User/user.services";
import { createAbsen } from "../service/Auth/absen.service";
import Loading from "../components/Loading";
import { HandleLogin } from "../service/Auth/auth.service";
import Maps from "../components/Maps";
import SubmitPin from "../components/SubmitPin";
import AlreadyAbsen from "../components/AlreadyAbsen";
import LoadingLokasi from "../components/LoadingLokasi";
import LokasiCheck from "../components/LokasiCheck";
import KonfirmasiAbsensi from "../components/KonfirmasiAbsensi";
import { s } from "framer-motion/client";

const AbsenLayout = () => {
  const [dateNow, setDateNow] = useState("");
  const [data, setData] = useState([]);
  const [coords, setCoords] = useState({ lat: null, lng: null });
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [distance, setDistance] = useState(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [isAbsen, setIsAbsen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showPinModal, setShowPinModal] = useState(true);
  const sigCanvas = useRef();

  const navigate = useNavigate();
  const { id } = useParams();
  const [pin, setPin] = useState("");
  const x = useMotionValue(0);

  useEffect(() => {
    if (!showPinModal) {
      fetchDate();
    }
  }, [showPinModal]);
  const targetCoords = { lat: 0.009752495103421941, lng: 110.95552433438533 };

  const getCurrentLocation = () => {
    setIsLoadingLocation(true);

    if (!navigator.geolocation) {
      toast.error("Geolocation tidak didukung browser kamu.");
      setIsLoadingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCoords({ lat: latitude, lng: longitude });

        const jarak = getDistanceFromLatLonInMeters(
          latitude,
          longitude,
          targetCoords.lat,
          targetCoords.lng
        );
        setDistance(jarak);
        setIsLoadingLocation(false); // selesai loading
      },
      (error) => {
        console.error("Gagal ambil lokasi:", error);
        toast.error("Gagal ambil lokasi. Pastikan izin lokasi diaktifkan.");
        setIsLoadingLocation(false); // selesai loading
      }
    );
  };

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getDistanceFromLatLonInMeters = (lat1, lon1, lat2, lon2) => {
    const R = 6371000;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const fetchDate = async () => {
    setIsLoadingUser(true);
    try {
      const response = await SingleUsers(id);
      const tanggal = response?.data?.tanggal_sekarang || "";

      if (tanggal) {
        const hari = new Date(tanggal);
        const options = {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        };
        const formatter = new Intl.DateTimeFormat("id-ID", options);
        setDateNow(formatter.format(hari));
      } else {
        setDateNow("Tanggal tidak tersedia");
      }

      setData(response?.data || []);
    } catch (error) {
      setDateNow("Gagal ambil tanggal");
      if (error.response.status === 400) {
        toast.success(error.response.data.message);
        setIsAbsen(true);
      }
    } finally {
      setIsLoadingUser(false);
    }
  };

  const handleClear = () => {
    sigCanvas.current.clear();
  };

  const handleSave = async () => {
    if (sigCanvas.current.isEmpty()) {
      toast.error("Tanda tangan tidak boleh kosong!");
      return;
    }

    if (distance > 100) {
      toast.error("Lokasi kamu terlalu jauh dari titik kantor.");
      return;
    }

    setLoading(true);
    try {
      const ttdImage = sigCanvas.current.getCanvas().toDataURL("image/png");
      const koordinat = `${coords.lat},${coords.lng}`;
      await createAbsen({
        userId: id,
        img_ttd: ttdImage,
        koordinat,
        status: "hadir",
      });

      setShowSuccessModal(true);
    } catch (error) {
      toast.error("Gagal melakukan absensi. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const swipeHandlers = useSwipeable({
    onSwipedDown: () => setShowConfirm(false),
    preventScrollOnSwipe: true,
    trackMouse: true,
  });

  if (loading) return <Loading />;
  if (isAbsen) {
    return (
      <AlreadyAbsen navigate={navigate} successAnimation={successAnimation} />
    );
  }

  const handleSubmitPin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await HandleLogin({ id: id, password: pin });
      console.log("Login berhasil, lanjut handleSave");
      setShowPinModal(false);
    } catch (error) {
      if (error.response.status === 400) {
        toast.error(error.response.data.message);
        return;
      } else {
        toast.error("Gagal terhubung ke server. Silakan coba lagi.");
      }
    } finally {
      setLoading(false);
      setPin("");
      getCurrentLocation();
    }
  };

  if (showPinModal) {
    return (
      <SubmitPin
        handleSubmitPin={handleSubmitPin}
        pin={pin}
        setPin={setPin}
        navigate={navigate}
        setShowPinModal={setShowPinModal}
      />
    );
  }

  return (
    <div className="min-h-screen bg-white ">
      {isLoadingLocation ? (
        <LoadingLokasi />
      ) : (
        <>
          {coords.lat === null || coords.lng === null ? (
            <LokasiCheck getCurrentLocation={getCurrentLocation} />
          ) : (
            <Maps
              coords={coords}
              setDistance={setDistance}
              distance={distance}
              showPinModal={showPinModal}
              isLoadingUser={isLoadingUser}
              targetCoords={targetCoords}
              getCurrentLocation={getCurrentLocation}
              setCoords={setCoords}
              setIsLoadingLocation={setIsLoadingLocation}
            />
          )}
        </>
      )}

      <div className="mx-auto rounded-t-lg  bg-white px-5 pt-8 space-y-6">
        <div className="text-gray-700 font-bold text-sm border-b pb-2 mb-4 flex items-center gap-2">
          {isLoadingUser ? (
            <>
              <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse" />
              <div className="w-32 h-4 bg-gray-200 animate-pulse rounded" />
            </>
          ) : (
            <>
              <img src={data?.avatar} alt="" className="w-10 rounded-full" />
              {data?.name || "Pengguna Tidak Ditemukan"}
            </>
          )}
        </div>

        <div className="text-gray-700 text-sm border-b pb-2 mb-4 flex items-center gap-2">
          {isLoadingUser ? (
            <>
              <div className="w-5 h-5 rounded-md bg-gray-200 animate-pulse" />
              <div className="w-40 h-4 bg-gray-200 animate-pulse rounded" />
            </>
          ) : (
            <>
              <FaCalendar className="text-xl text-gray-500" />
              <p className="font-bold">{dateNow}</p>
            </>
          )}
        </div>
        {!isLoadingUser && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tanda Tangan:
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
                penColor="black"
                canvasProps={{ className: "w-full h-52 rounded-md" }}
                onEnd={() => {
                  const ttd = sigCanvas.current
                    .getCanvas()
                    .toDataURL("image/png");
                  localStorage.setItem("ttd_cache", ttd);
                }}
              />
            </div>

            {!isLoadingUser && (
              <div className="mt-4 pb-8">
                <button
                  disabled={coords.lat === null || coords.lng === null}
                  type="button"
                  onClick={() => setShowConfirm(true)}
                  className="bg-red-600 w-full disabled:bg-gray-500 text-white py-2 rounded-md hover:bg-red-500 flex items-center justify-center gap-2"
                >
                  <FaCheck size={20} />
                  Konfirmasi Absen
                </button>

                <button
                  type="button"
                  onClick={() => {
                    localStorage.removeItem("ttd_cache");
                    navigate("/");
                  }}
                  className="w-full text-xs mt-3 hover:opacity-75 border border-gray-400 text-black px-4 py-3 rounded"
                >
                  Kembali
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Sheet */}
      <AnimatePresence>
        {showConfirm && (
          <KonfirmasiAbsensi
            setShowPinModal={setShowPinModal}
            handleSave={handleSave}
            setShowConfirm={setShowConfirm}
            swipeHandlers={swipeHandlers}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSuccessModal && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-40 z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white rounded-xl p-6 w-11/12 max-w-sm text-center"
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
                Absensi Berhasil!
              </h2>
              <p className="text-gray-600 mb-4">
                Kamu telah melakukan absensi hari ini 🎉
              </p>
              <button
                onClick={() => {
                  navigate("/");
                  localStorage.removeItem("ttd_cache");
                }}
                className="bg-green-500 w-full text-white px-4 py-2 rounded-full hover:bg-green-600"
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

export default AbsenLayout;
