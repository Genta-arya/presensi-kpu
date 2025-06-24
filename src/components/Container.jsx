import React, { useEffect, useState } from "react";
import BottomNav from "./BottomNav";
import Navbar from "../Views/Navbar";
import { motion, AnimatePresence } from "framer-motion";
import icon from "../assets/logo.png";

const Container = ({ children }) => {
  const [showSplash, setShowSplash] = useState(false);

  useEffect(() => {
    const lastShown = localStorage.getItem("lastSplashTime");
    const now = Date.now();

    if (!lastShown || now - parseInt(lastShown) > 5 * 60 * 1000) {
      // Tampilkan splash jika belum pernah atau sudah lebih dari 5 menit
      setShowSplash(true);
      localStorage.setItem("lastSplashTime", now.toString());

      const timer = setTimeout(() => {
        setShowSplash(false);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <>
      <AnimatePresence>
        {showSplash && (
          <motion.div
            className="fixed inset-0 z-50 bg-white flex flex-col justify-center items-center text-center px-8"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.img
              src={icon}
              alt="Logo KPU"
              className="w-32 h-32 mb-6"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8 }}
            />

            <motion.h1
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
              className="text-2xl font-bold text-red-600 mb-2"
            >
              E-Presensi
            </motion.h1>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="text-sm font-bold text-gray-700"
            >
              Komisi Pemilihan Umum Kabupaten Sekadau
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>

      {!showSplash && (
        <>
          <Navbar />
          <div className="p-3 pt-28 min-h-screen bg-gradient-to-br from-red-100 to-red-200 lg:hidden">
            {children}
            <BottomNav />
          </div>
        </>
      )}
    </>
  );
};

export default Container;
