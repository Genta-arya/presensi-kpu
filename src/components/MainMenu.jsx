import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarCheck,
  LogOut,
  FileText,
  Users,
  ClipboardList,
  FilePlus,
  X,
} from "lucide-react";
import { motion } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

import Container from "./Container";
import useCheckLogin from "../State/useLogin";
import Loading from "./Loading";
import BottomNav from "./BottomNav";
import Headers from "./Headers";

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

/* MENU CARD */
const MenuCard = ({ onClick, icon: Icon, color, label }) => (
  <motion.div
    variants={fadeVariant}
    initial="hidden"
    animate="show"
    whileHover={{ scale: 1.03 }}
    whileTap={{ scale: 0.94 }}
    onClick={onClick}
    className="
      group flex flex-col items-center justify-center
      bg-white rounded-xl p-4
      shadow cursor-pointer
      transition-all
      hover:-translate-y-1 hover:shadow-lg
    "
  >
    <Icon className={`mb-2 ${color}`} size={26} />
    <p className="text-xs font-semibold text-gray-700">{label}</p>
  </motion.div>
);

/* INFO CARD (SLIDER) */
const InfoCard = ({ date, title, content, onClick }) => (
  <motion.div
    onClick={onClick}
    variants={fadeVariant}
    initial="hidden"
    animate="show"
    className="
      bg-white rounded-xl p-4 shadow
      h-[130px] flex flex-col
      cursor-pointer
    "
  >
    <p className="text-[11px] text-gray-400 mb-1">{date}</p>
    <h3 className="text-sm font-bold text-gray-700 mb-1">{title}</h3>
    <p className="text-xs text-gray-600 leading-relaxed line-clamp-3">
      {content}
    </p>
    <span className="text-[11px] text-indigo-600 mt-auto">
      Lihat selengkapnya →
    </span>
  </motion.div>
);

const MainMenu = () => {
  const { isLoading, checkSession, user } = useCheckLogin();
  const navigate = useNavigate();
  const [activeInfo, setActiveInfo] = useState(null);

  const infoData = [
    {
      date: "5 Feb 2026",
      title: "Update Sistem Absensi",
      content:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    },
    {
      date: "3 Feb 2026",
      title: "Pengumuman Libur Nasional",
      content:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
    },
    {
      date: "1 Feb 2026",
      title: "Perubahan Jam Kerja",
      content:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
    },
  ];

  useEffect(() => {
    checkSession();
  }, []);

  if (isLoading) return <Loading />;

  return (
    <Container>
      <Headers />

      {/* INFORMASI */}
      <motion.div
        variants={fadeVariant}
        initial="hidden"
        animate="show"
        className="mt-6 px-3"
      >
        <h2 className="text-sm font-bold text-gray-700 mb-3">Informasi</h2>

        <Swiper
          modules={[Pagination, Autoplay]}
          pagination={{ clickable: true }}
          autoplay={{ delay: 4000 }}
          spaceBetween={12}
          slidesPerView={1}
          className="pb-6"
        >
          {infoData.map((item, i) => (
            <SwiperSlide key={i}>
              <InfoCard {...item} onClick={() => setActiveInfo(item)} />
            </SwiperSlide>
          ))}
        </Swiper>
      </motion.div>

      {/* MENU */}
      <motion.div
        variants={fadeVariant}
        initial="hidden"
        animate="show"
        className="mt-8 px-3"
      >
        <h2 className="text-sm font-bold text-gray-700 mb-3">Menu</h2>

        <div className="grid grid-cols-3 gap-3">
          <MenuCard
            onClick={() => navigate(`/absensi/${user?.id}`)}
            icon={ClipboardList}
            color="text-indigo-600"
            label="Presensi"
          />
          <MenuCard
            onClick={() => navigate("/presensi-kegiatan")}
            icon={Users}
            color="text-orange-600"
            label="Kegiatan"
          />
          <MenuCard
            onClick={() => navigate("/laporan-harian")}
            icon={FilePlus}
            color="text-teal-600"
            label="Laporan"
          />
        </div>
      </motion.div>

      {/* DATA ABSENSI */}
      <motion.div
        variants={fadeVariant}
        initial="hidden"
        animate="show"
        className="mt-6 px-3"
      >
        <h2 className="text-sm font-bold text-gray-700 mb-3">Data Absensi</h2>

        <div className="grid grid-cols-3 gap-3">
          <MenuCard
            onClick={() => navigate("/data/absen-masuk")}
            icon={CalendarCheck}
            color="text-blue-600"
            label="Masuk"
          />
          <MenuCard
            onClick={() => navigate("/data/absen-pulang")}
            icon={LogOut}
            color="text-red-600"
            label="Pulang"
          />
          <MenuCard
            onClick={() => navigate("/data/rekap-absensi")}
            icon={FileText}
            color="text-green-600"
            label="Rekap"
          />
        </div>
      </motion.div>

      {/* MODAL FULL INFO */}
      {activeInfo && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 bg-black/40 flex"
          onClick={() => setActiveInfo(null)}
        >
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            transition={{ type: "spring", damping: 25 }}
            onClick={(e) => e.stopPropagation()}
            className="
        bg-white w-full
        rounded-t-2xl
        h-[90vh]
        mt-auto
        flex flex-col
      "
          >
            {/* HANDLE */}
            <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto my-3" />

            {/* HEADER */}
            <div className="flex justify-between items-center px-5 mt-8">
              <h3 className="font-bold text-gray-700">{activeInfo.title}</h3>
              <X
                className="text-gray-500 cursor-pointer"
                onClick={() => setActiveInfo(null)}
              />
            </div>

            <p className="text-xs text-gray-400 px-5 mt-1">{activeInfo.date}</p>

            {/* CONTENT (SCROLL AREA) */}
            <div className="px-5 py-4 overflow-y-auto">
              <p className="text-sm text-gray-600 leading-relaxed">
                {activeInfo.content}
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}

      <BottomNav />
    </Container>
  );
};

export default MainMenu;
