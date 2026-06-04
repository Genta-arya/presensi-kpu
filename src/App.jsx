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
import AbsenPulang from "./Views/AbsenPulang";
import Profil from "./Views/Profil/Profil";

import GantiPassword from "./Views/Profil/GantiPassword";
import GantiMFA from "./Views/Profil/GantiMFA";
import KebijakanPrivas from "./components/KebijakanPrivas";
import Dashboard from "./Views/Admin/Dashboard/Dashboard";
import MainDashboard from "./Views/Admin/Dashboard/MainDashboard";
import ListPegawai from "./Views/Admin/Pegawai/LayaoutPegawai";
import LayaoutPegawai from "./Views/Admin/Pegawai/LayaoutPegawai";
import LayoutPresensi from "./Views/Admin/Presensi/LayoutPresensi";
import ListPresensi from "./Views/Presensi/ListPresensi";
import Pengaturan from "./Views/Pengaturan/Pengaturan";
import LayoutJabatan from "./Views/Admin/Pegawai/LayoutJabatan";
import LayoutUnitKerja from "./Views/Admin/Pegawai/LayoutUnitKerja";
import LayoutRole from "./Views/Admin/Pegawai/LayoutRole";
import DetailUnitKerja from "./Views/Admin/Pegawai/DetailUnitKerja";
import DetailPegawai from "./Views/Admin/Pegawai/DetailPegawai";

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
                  path="/dashboard"
                  element={
                    <ProtectedRoute
                      allowedRoles={["SUPER_ADMIN", "ADMIN"]}
                      element={<Dashboard />}
                    />
                  }
                >
                  <Route index element={<MainDashboard />} />

                  <Route path="pegawai" element={<LayaoutPegawai />} />

                  <Route path="laporan" element={<LaporanKegiatan />} />

                  <Route path="presensi" element={<LayoutPresensi />} />
                  <Route path="jabatan" element={<LayoutJabatan />} />
                  <Route path="subbagian" element={<LayoutUnitKerja />} />
                  <Route path="role" element={<LayoutRole />} />
                  <Route
                    path="subbagian/detail/:id"
                    element={<DetailUnitKerja />}
                  />
                  <Route
                    path="pegawai/:id"
                    element={<DetailPegawai />}
                  />
                </Route>
                <Route
                  path="/presensi-harian"
                  element={<ProtectedRoute element={<ListUser />} />}
                />
                <Route
                  path="/berita"
                  element={<ProtectedRoute element={<Berita />} />}
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
                  path="/profil/:id"
                  element={<ProtectedRoute element={<Profil />} />}
                />
                <Route
                  path="/profil/ganti-password/:id"
                  element={<ProtectedRoute element={<GantiPassword />} />}
                />
                <Route
                  path="/profil/ganti-mfa/:id"
                  element={<ProtectedRoute element={<GantiMFA />} />}
                />
                <Route
                  path="/data/absen-masuk"
                  element={<ProtectedRoute element={<ComingSoon />} />}
                />
                <Route
                  path="/data/absen-pulang"
                  element={<ProtectedRoute element={<AbsenPulang />} />}
                />
                <Route
                  path="/data/rekap-absensi"
                  element={<ProtectedRoute element={<ListPresensi />} />}
                />
                <Route
                  path="/pengaturan"
                  element={<ProtectedRoute element={<Pengaturan />} />}
                />
                <Route
                  path="/absensi/:id"
                  element={<ProtectedRoute element={<AbsenLayout />} />}
                />
                <Route
                  path="/kebijakan-privasi"
                  element={<KebijakanPrivas />}
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
