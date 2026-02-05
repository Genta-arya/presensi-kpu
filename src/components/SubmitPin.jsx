import React, { useState, useEffect, useRef } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import lock from "../assets/lock.png"
const SubmitPin = ({
  pin,
  setPin,
  handleSubmitPin,
  navigate,
  loadingPin,
  setShowPinModal,
}) => {
  const [showPin, setShowPin] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  return (
    <form
      onSubmit={handleSubmitPin}
      className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center text-center px-6"
    >
      <img
        src={lock}
        alt=""
        className="w-32 h-32 mb-4 animate-bounce bg-white rounded-full shadow-md p-2 border border-red-200"
      />
      <h2 className="text-lg font-bold text-red-600 mb-2">Masukkan PIN</h2>
      <p className="text-sm text-gray-600 mb-4">Untuk melanjutkan ke absensi</p>

      <div className="relative w-full">
        <input
          ref={inputRef}
          type={showPin ? "text" : "password"}
          inputMode="numeric"
          pattern="\d*"
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
          className="border border-red-500 px-4 py-2 pr-12 text-red-600 w-full rounded-md text-center text-2xl tracking-widest placeholder-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
          maxLength={8}
          placeholder="8 digit Angka PIN"
          required
        />
        <button
          type="button"
          onClick={() => setShowPin((prev) => !prev)}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-red-500"
        >
          {showPin ? <FaEyeSlash /> : <FaEye />}
        </button>
      </div>

      <button disabled={pin.length < 8} className="mt-4 disabled:bg-gray-500 bg-red-600 text-xs text-white px-4 py-2 w-full rounded hover:bg-red-500">
        Verifikasi
      </button>
      <button
        type="button"
        onClick={() => {
          // windows go back to previous page
          navigate("/");
          // setShowPinModal(false);
        }}
        className="mt-2 border border-gray-400 text-black text-xs  px-4 py-2 w-full rounded"
      >
        Batal
      </button>
    </form>
  );
};

export default SubmitPin;
