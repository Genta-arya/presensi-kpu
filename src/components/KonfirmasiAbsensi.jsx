import React from "react";
import { motion, useDragControls } from "framer-motion";
import { FaTimes } from "react-icons/fa";
import { AlertCircle } from "lucide-react";
const KonfirmasiAbsensi = ({
  setShowConfirm,
  handleSave,
  swipeHandlers = useDragControls(),
}) => {
  return (
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
        className="bg-white w-full h-72 rounded-t-xl p-5 mx-auto relative"
      >
        <div className="mb-8 flex justify-center items-center">
          <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto" />
          <FaTimes
            className="cursor-pointer absolute right-4"
            onClick={() => {
              setShowConfirm(false);
            }}
          />
        </div>
        <div className="flex justify-center mb-4 text-red-600 animate-ping">
          <AlertCircle size={50} />
        </div>
        <h2 className="text-lg font-semibold mb-2 text-center ">Konfirmasi</h2>
        <p className="text-sm text-gray-600 mb-4 text-center">
          Pastikan lokasi dan tanda tangan kamu sesuai.
        </p>
        <div className="flex justify-center gap-4 mt-2">
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
  );
};

export default KonfirmasiAbsensi;
