import React from "react";
import Navigations from "../Views/Navigation";
import Lottie from "lottie-react";
import comingsoon from "../assets/Comingsoon.json";
const ComingSoon = () => {
  return (
    <>
      <Navigations title="Kembali" />
      <div className=" flex flex-col justify-center items-center bg-white px-4">
        <div className="mt-32">
          <Lottie animationData={comingsoon} loop={true} />
        </div>
        <h1 className="text-2xl font-bold text-red-600 mb-2">
          Fitur Segera Hadir!
        </h1>
        <p className="text-gray-600 text-center max-w-md">
          Kami sedang mengembangkan fitur ini untukmu. Tunggu update
          selanjutnya, ya!
        </p>
      </div>
    </>
  );
};

export default ComingSoon;
