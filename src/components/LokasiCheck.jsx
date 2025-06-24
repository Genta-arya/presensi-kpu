import React from "react";

const LokasiCheck = ({
    getCurrentLocation,
}) => {
  return (
    <div className="w-full border-b h-80 flex flex-col items-center justify-center text-sm text-gray-500">
      <svg
        className="h-6 w-6 text-red-500 mb-2"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <path
          stroke="currentColor"
          strokeWidth="2"
          d="M12 2a10 10 0 100 20 10 10 0 000-20zm1 5h-2v6h2V7zm0 8h-2v2h2v-2z"
        ></path>
      </svg>
      <p className="text-red-500 font-bold">Lokasi kamu tidak ditemukan.</p>
      <p className="text-gray-500">Pastikan izin lokasi diaktifkan.</p>
      <button
        onClick={getCurrentLocation}
        className="mt-4 bg-red-600 text-xs text-white px-4 py-2 rounded hover:bg-red-500"
      >
        Coba lagi
      </button>
    </div>
  );
};

export default LokasiCheck;
