import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { UserProvider } from "./State/useContext";

import LoginPage from "./Views/LoginPage/LoginPage";
import SetupMFA from "./Views/LoginPage/SetupMFA";
import MainMenu from "./components/MainMenu";
import ListUser from "./Views/ListUser";
import AbsenLayout from "./Views/AbsenLayout";
import ComingSoon from "./components/ComingSoon";
import ProtectedRoute from "./State/ProtectedRoute";
import LaporanKegiatan from "./Views/LaporanKegiatan/LaporanKegiatan";
import DetailLaporan from "./Views/LaporanKegiatan/DetailLaporan";
import Berita from "./Views/Berita/Berita";

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        {/* PUBLIC */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/mfa-setup/:userId" element={<SetupMFA />} />

        {/* PRIVATE */}
        <Route
          path="/*"
          element={
            <UserProvider>
              <Routes>
                <Route
                  path="/"
                  element={<ProtectedRoute element={<MainMenu />} />}
                />
                <Route
                  path="/presensi-harian"
                  element={<ProtectedRoute element={<ListUser />} />}
                />
                <Route
                  path="/berita"
                  element={<ProtectedRoute element={<Berita/>} />}
                />
                <Route
                  path="/presensi-kegiatan"
                  element={<ProtectedRoute element={<ComingSoon />} />}
                />
                <Route
                  path="/laporan-harian"
                  element={<ProtectedRoute element={<LaporanKegiatan />} />}
                />
                <Route
                  path="/laporan-harian/:id"
                  element={<ProtectedRoute element={<DetailLaporan />} />}
                />
                <Route
                  path="/pegawai"
                  element={<ProtectedRoute element={<ListUser />} />}
                />
                <Route
                  path="/data/absen-masuk"
                  element={<ProtectedRoute element={<ComingSoon />} />}
                />
                <Route
                  path="/data/absen-pulang"
                  element={<ProtectedRoute element={<ComingSoon />} />}
                />
                <Route
                  path="/data/rekap-absensi"
                  element={<ProtectedRoute element={<ComingSoon />} />}
                />
                <Route
                  path="/absensi/:id"
                  element={<ProtectedRoute element={<AbsenLayout />} />}
                />
              </Routes>
            </UserProvider>
          }
        />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
