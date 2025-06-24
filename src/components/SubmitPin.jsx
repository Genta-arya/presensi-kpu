import React from "react";

const SubmitPin = ({
  pin,
  setPin,
  handleSubmitPin,
  navigate,
  setShowPinModal,
}) => {
  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col items-center justify-center text-center px-6">
      <img
        src="https://cdn4.iconfinder.com/data/icons/web-ui-color/128/Lock_red-512.png"
        alt=""
        className="w-16 h-16 mb-4"
      />
      <h2 className="text-lg font-bold text-red-600 mb-2">Masukkan PIN</h2>
      <p className="text-sm text-gray-600 mb-4">Untuk melanjutkan ke absensi</p>
      <input
        type="password"
        value={pin}
        onChange={(e) => setPin(e.target.value)}
        className="border px-4 py-2 w-full rounded-md text-center text-lg tracking-widest"
        maxLength={8}
        placeholder="••••"
      />
      <button
        onClick={handleSubmitPin}
        className="mt-4 bg-red-600 text-xs text-white px-4 py-2 w-full rounded hover:bg-red-500"
      >
        Verifikasi
      </button>
      <button
        onClick={() => {
          navigate("/");
          setShowPinModal(false);
        }}
        className="mt-2 border border-gray-400 text-black text-xs  px-4 py-2 w-full rounded "
      >
        Batal
      </button>
    </div>
  );
};

export default SubmitPin;
