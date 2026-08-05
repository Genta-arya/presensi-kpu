import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  Users,
  ClipboardList,
  FilePlus,
  X,
  UserSquare2,
  BarChart3,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

import Container from "./Container";
import useCheckLogin from "../State/useLogin";
import Loading from "./Loading";
import BottomNav from "./BottomNav";
import Headers from "./Headers";
import { FaBell, FaMapPin } from "react-icons/fa";
import { toast } from "sonner";
import { MdDashboard } from "react-icons/md";
import DateTimeWeather from "./Weather";
import { Helmet } from "react-helmet-async";

/* SIMPLE FADE */
const fadeVariant = {
  hidden: { opacity: 0, y: 12 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
};

/* MENU CARD WITH DYNAMIC GRID SPANNING */
const MenuCard = ({ onClick, icon: Icon, color, label, isFullWidth }) => (
  <motion.div
    variants={fadeVariant}
    initial="hidden"
    animate="show"
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.96 }}
    onClick={onClick}
    className={`
      group flex flex-col items-center justify-center
      bg-white rounded-2xl p-4 border-2 border-red-500
      shadow-sm cursor-pointer transition-all duration-200
      h-[95px] text-center
      ${isFullWidth ? "col-span-3 flex-row gap-4 px-6 justify-start" : ""}
    `}
  >
    <div className={`p-2 rounded-xl bg-gray-50/50 group-hover:scale-105 transition-transform duration-300 shrink-0`}>
      <Icon className={`${color}`} size={24} />
    </div>

    <div className={`flex items-center mb-4 ${isFullWidth ? "text-left flex-1" : "mt-2 h-[28px] text-center"}`}>
      <p className="text-xs font-bold text-gray-700 leading-tight">
        {label}
      </p>
    </div>
  </motion.div>
);

/* MODERNIZED SWIPER INFO CARD */
const InfoCard = ({ date, title, content, onClick }) => (
  <motion.div
    onClick={onClick}
    variants={fadeVariant}
    initial="hidden"
    animate="show"
    className="
      bg-white rounded-2xl p-5 border border-gray-100
      shadow-[0_6px_20px_-6px_rgba(0,0,0,0.05)]
      h-[140px] flex flex-col relative overflow-hidden
      cursor-pointer group transition-all duration-300 hover:shadow-md
    "
  >
    <div className="absolute top-0 left-0 w-1.5 h-full bg-red-600 rounded-l-2xl" />
    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 px-1">
      {date}
    </p>
    <h3 className="text-sm font-extrabold text-gray-800 mb-1 px-1 group-hover:text-red-600 transition-colors line-clamp-1">
      {title}
    </h3>
    <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 px-1 pr-2">
      {content}
    </p>
    <span className="text-[11px] font-bold text-red-600 mt-auto px-1 flex items-center gap-1">
      Baca Selengkapnya <span className="transform group-hover:translate-x-1 transition-transform">→</span>
    </span>
  </motion.div>
);

const MainMenu = () => {
  const { isLoading, checkSession, user } = useCheckLogin();
 
  const navigate = useNavigate();
  const [activeInfo, setActiveInfo] = useState(null);
  const [showIframeModal, setShowIframeModal] = useState(false);

  const infoData = [
    {
      date: "05 Agustus 2026",
      title: "Ketentuan Jam Masuk dan Jam Pulang Pegawai",
      content: "Diberitahukan kepada seluruh staff KPU Kabupaten Sekadau bahwa jam masuk presensi dimulai pukul 07:30 WIB. Untuk jam pulang kantor ditetapkan pukul 16:00 WIB (Senin sampai Kamis) dan pukul 16:30 WIB (khusus hari Jumat). Harap seluruh pegawai memperhatikan ketentuan waktu kehadiran ini dengan disiplin.",
    },
  
  ];

  const menuList = [
    { path: "/data/rekap-absensi", icon: FileText, color: "text-green-600", label: "Presensi Saya" },
    { path: "/presensi-kegiatan", icon: Users, color: "text-orange-600", label: "Presensi Kegiatan" },
    { path: "/laporan-harian", icon: FileText, color: "text-teal-600", label: "Laporan Harian" },
    { path: "/pegawai", icon: UserSquare2, color: "text-blue-600", label: "Daftar Pegawai" },
    { type: "toast", icon: BarChart3, color: "text-purple-600", label: "Kenaikan Gaji Berkala" },
    { path: "/data/pengajuan-cuti", icon: FilePlus, color: "text-fuchsia-600", label: "Pengajuan Cuti" },
    { type: "iframe", icon: ClipboardList, color: "text-red-600", label: "Informasi Pelayanan" },
  ];

  useEffect(() => {
    checkSession();
  }, []);

  useEffect(() => {
    if (activeInfo || showIframeModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [activeInfo, showIframeModal]);

  if (isLoading || !user) {
    return <Loading />;
  }

  return (
    <Container>
      <Headers />
      <Helmet>
        <title>Sistem Informasi Kepegawaian KPU Kabupaten Sekadau</title>
      </Helmet>

      <DateTimeWeather />

      <div className="px-2">
        {/* SECTION PEMBERITAHUAN */}
        <motion.div
          variants={fadeVariant}
          initial="hidden"
          animate="show"
          className="mt-6 px-3"
        >
          <div className="flex gap-2 items-center mb-3">
            <FaBell className="text-red-600" />
            <h2 className="text-sm font-bold text-gray-700 ">
              Pemberitahuan ({infoData.length})
            </h2>
          </div>

          <Swiper
            modules={[Pagination, Autoplay]}
            pagination={{ clickable: true }}
            autoplay={{ delay: 4000, disableOnInteraction: false }}
            spaceBetween={12}
            slidesPerView={1}
            className="pb-7 custom-swiper"
          >
            {infoData.map((item, i) => (
              <SwiperSlide key={i}>
                <InfoCard {...item} onClick={() => setActiveInfo(item)} />
              </SwiperSlide>
            ))}
          </Swiper>
        </motion.div>

        {/* SECTION MENU DENGAN DETEKSI DATA TERAKHIR */}
        <motion.div
          variants={fadeVariant}
          initial="hidden"
          animate="show"
          className="mt-8 px-3"
        >
          <div className="flex gap-2 items-center mb-3">
            <MdDashboard size={18} className="text-gray-500" />
            <h2 className="text-sm font-bold text-gray-700 ">Menu</h2>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {menuList.map((menu, index) => {
              const isLastItem = index === menuList.length - 1;
              const isOddTotal = menuList.length % 3 !== 0; 
              const shouldBeFullWidth = isLastItem && isOddTotal;

              const handleMenuClick = () => {
                if (menu.type === "toast") {
                  toast.info("Fitur ini segera hadir");
                } else if (menu.type === "iframe") {
                  setShowIframeModal(true);
                } else {
                  navigate(menu.path);
                }
              };

              return (
                <MenuCard
                  key={index}
                  onClick={handleMenuClick}
                  icon={menu.icon}
                  color={menu.color}
                  label={menu.label}
                  isFullWidth={shouldBeFullWidth}
                />
              );
            })}
          </div>
        </motion.div>

        {/* INFO VERSI APLIKASI MINIMALIS */}
        <div className="mt-12 mb-6 flex flex-col items-center justify-center text-center space-y-1">
          <p className="text-[9px] font-black tracking-widest text-gray-400 uppercase">
            Sistem Informasi Kepegawaian
          </p>
          <p className="text-[8px] font-black tracking-widest text-gray-400 uppercase">
            KPU Kabupaten Sekadau
          </p>
          <div className="inline-flex mt-2 items-center bg-gray-100 border border-gray-200/60 px-2 py-0.5 rounded-full shadow-inner">
            <span className="text-[9px] font-black tracking-wider text-gray-500 font-mono">
              v1.0
            </span>
          </div>
        </div>
      </div>

      {/* MODAL FULL INFO */}
      <AnimatePresence>
        {activeInfo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/40 flex"
            onClick={() => setActiveInfo(null)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white w-full rounded-t-2xl h-[50vh] mt-auto flex flex-col"
            >
              <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto my-3" />
              <div className="flex justify-between items-center px-5 mt-8">
                <div className="flex gap-2 items-center">
                  <FaMapPin />
                  <h3 className="font-bold text-gray-700">{activeInfo.title}</h3>
                </div>
                <X className="text-gray-500 cursor-pointer" onClick={() => setActiveInfo(null)} />
              </div>
              <p className="text-xs text-gray-400 border-b-2 px-5 mt-1 pb-4">{activeInfo.date}</p>
              <div className="px-5 py-4 overflow-y-auto flex-1 pb-8 text-justify">
                <p className="text-sm text-gray-600 leading-relaxed">{activeInfo.content}</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MODAL BOTTOM SHEET IFRAME INFORMASI PELAYANAN */}
      <AnimatePresence>
        {showIframeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 flex"
            onClick={() => setShowIframeModal(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white w-full rounded-t-[28px] h-[85vh] mt-auto flex flex-col overflow-hidden shadow-2xl"
            >
              <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto my-3" />
              <div className="flex justify-between items-center px-5 py-2 border-b border-gray-100">
                <div>
                  <h3 className="font-black text-gray-800 text-lg">Informasi Pelayanan</h3>
                  <p className="text-xs text-gray-500">KPU Kabupaten Sekadau</p>
                </div>
                <button onClick={() => setShowIframeModal(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <X className="text-gray-500" size={20} />
                </button>
              </div>
              <div className="flex-1 bg-gray-50 relative">
                <iframe src="https://informasi.kpu-sekadau.my.id/" title="Informasi Pelayanan KPU Sekadau" className="w-full h-full border-0" allow="geolocation" />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <BottomNav />

      <style>{`
        .custom-swiper .swiper-pagination-bullet { background: #e5e7eb !important; opacity: 1 !important; width: 6px; height: 6px; transition: all 0.3s ease; }
        .custom-swiper .swiper-pagination-bullet-active { background: #dc2626 !important; width: 16px; border-radius: 4px; }
      `}</style>
    </Container>
  );
};

export default MainMenu;