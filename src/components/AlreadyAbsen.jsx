import { tr } from 'framer-motion/client'
import Lottie from 'lottie-react'
import React from 'react'

const AlreadyAbsen = ({ navigate , successAnimation}) => {
  return (
 <div className="min-h-screen flex flex-col justify-center items-center text-center px-4 bg-white">
        <div className="w-48 h-48 mb-6">
          <Lottie animationData={successAnimation} loop={true} />
        </div>
        <h2 className="text-xl font-semibold text-green-600 mb-2">
          Kamu sudah absen hari ini 🎉
        </h2>
        <p className="text-gray-600 text-sm mb-6">
          Terima kasih telah melakukan absensi.
        </p>
        <button
          onClick={() => navigate("/")}
          className="bg-green-500 w-full  text-white px-4 py-2 rounded-full hover:bg-green-600"
        >
          Kembali
        </button>
      </div>
  )
}

export default AlreadyAbsen