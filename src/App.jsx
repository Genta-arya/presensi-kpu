import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ListUser from "./Views/ListUser";
import AbsenLayout from "./Views/AbsenLayout";
import MainMenu from "./components/MainMenu";
import ComingSoon from "./components/ComingSoon";

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainMenu />} />
        <Route path="/presensi-harian" element={<ListUser />} />
        <Route path="/presensi-apel" element={<ComingSoon />} />
        <Route path="/presensi-rapat" element={<ComingSoon />} />
         <Route path="/pengajuan" element={<ComingSoon />} />
        <Route path="/absensi/:id" element={<AbsenLayout />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
