import React, { useEffect, useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";
import { useSwipeable } from "react-swipeable";
import {
  motion,
  useAnimation,
  useMotionValue,
  useTransform,
  useMotionValueEvent,
  AnimatePresence,
} from "framer-motion";
import "leaflet.locatecontrol/dist/L.Control.Locate.min.css";
import "leaflet.locatecontrol";

import { ArrowRightCircle } from "lucide-react";
import { toast } from "sonner";
import {
  FaCalendar,
  FaCheck,
  FaSpellCheck,
  FaSync,
  FaTimes,
} from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import Lottie from "lottie-react";
import successAnimation from "../assets/Sukses.json";
import { SingleUsers } from "../service/User/user.services";
import { MapContainer, TileLayer, Marker, Circle, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import icon_user from "../assets/icon-user.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
import { createAbsen } from "../service/Auth/absen.service";
import Loading from "../components/Loading";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const AbsenLayout = () => {
  const [dateNow, setDateNow] = useState("");
  const [data, setData] = useState([]);
  const [coords, setCoords] = useState({ lat: null, lng: null });
  const [showText, setShowText] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [distance, setDistance] = useState(null);
  const mapRef = useRef();
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [isAbsen, setIsAbsen] = useState(false);
  const [loading, setLoading] = useState(false);
  const sigCanvas = useRef();
  const arrowControls = useAnimation();
  const navigate = useNavigate();
  const { id } = useParams();
  const x = useMotionValue(0);

  const popupRef = useRef();
  useEffect(() => {
    if (mapRef.current) {
      const map = mapRef.current;

      L.control
        .locate({
          position: "topleft",
          strings: {
            title: "Tampilkan lokasi saya",
          },
          flyTo: true,
        })
        .addTo(map);
    }
  }, [mapRef]);

  useEffect(() => {
    if (popupRef.current) {
      popupRef.current.openOn(mapRef.current); // buka popup di peta
    }
  }, []);

  const userIcon = new L.Icon({
    iconUrl: icon_user,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30],
  });

  const officeIcon = new L.Icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30],
  });

  const targetCoords = { lat: 0.009752495103421941, lng: 110.95552433438533 }; // Contoh: Jakarta

  const bgColor = useTransform(
    x,
    [-100, 0, 100, 300],
    ["#ef4444", "red", "#f87171", "#4ade80"]
  );

  useMotionValueEvent(x, "change", (latest) => {
    if (latest !== 0 && showText) {
      setShowText(false);
    }
  });

  useEffect(() => {
    fetchDate();
    getCurrentLocation();
  }, []);

  useEffect(() => {
    if (mapRef.current) {
      mapRef.current.setView([targetCoords.lat, targetCoords.lng], 18); // Zoom ke kantor
    }
  }, []);

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
      console.error(error);
    } finally {
      setIsLoadingUser(false);
    }
  };

  const goToOfficeLocation = () => {
    if (mapRef.current) {
      mapRef.current.setView([targetCoords.lat, targetCoords.lng], 17); // zoom ke kantor
    }
    getCurrentLocation();
  };

  const getCurrentLocation = () => {
    setIsLoadingLocation(true); // mulai loading

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

      localStorage.removeItem("ttd_cache"); // HAPUS CACHE
      setShowSuccessModal(true);
    } catch (error) {
      toast.error("Gagal melakukan absensi. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const swipeHandlers = useSwipeable({
    onSwipedRight: async () => {
      const screenWidth = window.innerWidth;
      await arrowControls.start({
        x: screenWidth - 100,
        transition: { duration: 0.2, ease: "easeInOut" },
      });
      setShowConfirm(true);
      await arrowControls.start({
        x: 0,
        transition: { type: "spring", stiffness: 200 },
      });
      setTimeout(() => setShowText(true), 100);
    },
    onSwipedDown: () => setShowConfirm(false),
    preventScrollOnSwipe: true,
    trackMouse: true,
  });

  const goToCurrentLocation = () => {
    if (coords.lat && coords.lng && mapRef.current) {
      mapRef.current.setView([coords.lat, coords.lng], 18); // Zoom 18 ke posisi device
    }
  };
  useEffect(() => {
    const savedTTD = localStorage.getItem("ttd_cache");
    if (savedTTD && sigCanvas.current) {
      // Tambahkan delay agar canvas siap sepenuhnya
      setTimeout(() => {
        try {
          sigCanvas.current.fromDataURL(savedTTD);
        } catch (err) {
          console.error("Gagal render TTD dari cache:", err);
        }
      }, 300); // 300ms cukup aman
    }
  }, []);

  if (loading) return <Loading />;
  if (isAbsen) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center text-center px-4 bg-white">
        <div className="w-48 h-48 mb-6">
          <Lottie animationData={successAnimation} loop={false} />
        </div>
        <h2 className="text-xl font-semibold text-green-600 mb-2">
          Kamu sudah absen hari ini 🎉
        </h2>
        <p className="text-gray-600 text-sm mb-6">
          Terima kasih telah melakukan absensi.
        </p>
        <button
          onClick={() => navigate("/")}
          className="bg-green-500 text-white px-4 py-2 rounded-full hover:bg-green-600"
        >
          Kembali ke Beranda
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white lg:hidden">
      {isLoadingLocation ? (
        <div className="w-full h-80 flex items-center justify-center text-sm text-gray-500">
          🔄 Mengambil lokasi kamu...
        </div>
      ) : (
        <>
          {coords.lat && coords.lng && (
            <div className="relative w-full h-96 z-0">
              <button
                onClick={goToCurrentLocation}
                className="absolute z-[999] top-2 right-2 bg-white shadow px-3 py-1 rounded-full text-xs text-gray-700 hover:bg-gray-100 border"
              >
                📍 Lokasi Saya
              </button>

              <button
                onClick={goToOfficeLocation}
                className="absolute z-[999] top-2 right-[120px] bg-white shadow px-3 py-1 rounded-full text-xs text-gray-700 hover:bg-gray-100 border"
              >
                🔄 Refresh
              </button>

              <MapContainer
                ref={mapRef}
                center={[targetCoords.lat, targetCoords.lng]} // Awalnya fokus ke kantor
                zoom={17}
                fadeAnimation={true}
                scrollWheelZoom={true}
                style={{ height: "100%", width: "100%" }}
              >
                <>
                  <TileLayer
                    attribution="&copy; OpenStreetMap contributors"
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />

                  {/* Circle radius kantor */}
                  <Circle
                    center={[targetCoords.lat, targetCoords.lng]}
                    radius={100}
                    pathOptions={{
                      color: "red", // warna garis pinggir
                      fillColor: "#ffc0cb", // pink muda
                      fillOpacity: 0.4, // transparansi 30%
                    }}
                  />

                  {/* Marker kantor */}
                  <Marker
                    position={[targetCoords.lat, targetCoords.lng]}
                    icon={officeIcon}
                    ref={(marker) => {
                      if (marker && marker._map) {
                        marker.openPopup(); // buka popup begitu marker mount
                      }
                    }}
                  >
                    <Popup>🏢 KPU Kabupaten Sekadau</Popup>
                  </Marker>

                  <Marker position={[coords.lat, coords.lng]} icon={userIcon}>
                    <Popup>📍 Lokasi Kamu Sekarang</Popup>
                  </Marker>
                </>
              </MapContainer>
              {distance !== null && !isLoadingUser && (
                <div className="absolute z-[999] bottom-2 left-1/2 transform -translate-x-1/2 bg-white bg-opacity-80 rounded-md px-4 py-1 text-center text-xs shadow">
                  <p className="text-black font-semibold">
                    Jarak kamu dari titik kantor:
                  </p>
                  <p
                    className={`mt-1 px-3 py-1 rounded-full text-white ${
                      distance > 100 ? "bg-red-600" : "bg-green-600"
                    }`}
                  >
                    {distance.toFixed(2)} meter
                  </p>
                </div>
              )}
            </div>
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
          <FaCalendar className="text-xl text-red-600" />
          {isLoadingUser ? (
            <div className="w-40 h-4 bg-gray-200 animate-pulse rounded" />
          ) : (
            dateNow
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
                {/* <motion.div
                  {...swipeHandlers}
                  style={{ backgroundColor: bgColor }}
                  className="flex items-center space-x-2 border rounded-md py-2 cursor-pointer transition overflow-hidden"
                >
                  <motion.div
                    drag="x"
                    dragConstraints={{ left: 0, right: 300 }}
                    style={{ x }}
                    animate={arrowControls}
                    className="flex items-center ml-10"
                  >
                    <ArrowRightCircle className="text-white" size={24} />
                  </motion.div>
                  {showText && (
                    <span className="text-white font-medium text-xs">
                      Geser ke kanan untuk konfirmasi
                    </span>
                  )}
                </motion.div> */}

                <button
                  onClick={() => setShowConfirm(true)}
                  className="bg-red-600 w-full text-white py-2 rounded-md hover:bg-red-500 flex items-center justify-center gap-2"
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
          <motion.div
            className="fixed inset-0 z-50 bg-black bg-opacity-40 flex justify-center items-end"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowConfirm(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              {...swipeHandlers}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white w-full h-64 rounded-t-xl p-5 mx-auto relative"
            >
              <div className="mb-8 flex justify-center items-center">
                <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto" />
                <FaTimes
                  className="cursor-pointer absolute right-4"
                  onClick={() => {
                    setShowConfirm(false);
                    setShowText(true);
                  }}
                />
              </div>
              <h2 className="text-lg font-semibold mb-2 text-center ">
                Konfirmasi
              </h2>
              <p className="text-sm text-gray-600 mb-4 text-center">
                Pastikan lokasi dan tanda tangan kamu sesuai.
              </p>
              <div className="flex justify-center gap-4 mt-10">
                <button
                  onClick={() => {
                    handleSave();
                    setShowConfirm(false);
                  }}
                  className="bg-red-600 w-full  text-white px-4 py-2 rounded-full hover:bg-red-500"
                >
                  Lanjutkan
                </button>
              </div>
            </motion.div>
          </motion.div>
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
