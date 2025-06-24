import React from "react";

const LoadingLokasi = () => {
  return (
    <div className="w-full border-b h-80 flex flex-col items-center justify-center text-sm text-gray-500">
      <svg
        className="animate-spin h-6 w-6 text-red-500 mb-2"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        ></circle>
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v8z"
        ></path>
      </svg>

      <p>Sedang Mengambil lokasi kamu...</p>
    </div>
  );
};

export default LoadingLokasi;
