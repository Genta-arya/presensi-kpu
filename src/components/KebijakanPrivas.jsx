import React from "react";
import { Shield, Eye, Lock, FileText, CheckCircle, Server } from "lucide-react";
import Navigations from "../Views/Navigation";
import { Helmet } from "react-helmet-async";

const KebijakanPrivas = () => {
  const lastUpdated = "21 Mei 2026";

  const privacyPoints = [
    {
      title: "Data Kepegawaian yang Dikelola",
      description: "Sistem mengumpulkan dan mengelola data internal kepegawaian KPU Kabupaten Sekadau yang mencakup Nama, NIP, Foto Profil, Log Riwayat Kehadiran harian, Laporan Harian Tugas, serta berkas digital terkait administrasi kepegawaian Anda.",
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Keamanan Sistem & Enkripsi",
      description: "Setiap data sensitif pegawai KPU Sekadau, termasuk kata sandi (Security) dan spesimen tanda tangan digital, dilindungi secara ketat menggunakan metode enkripsi hashing standar industri sebelum disimpan ke dalam pusat database.",
      icon: Lock,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      title: "Akses Geolocation Presensi",
      description: "Fitur pelacakan lokasi (GPS) hanya aktif dan berjalan secara realtime saat Anda menekan tombol konfirmasi presensi untuk memastikan kesesuaian koordinat dengan area kantor KPU Kabupaten Sekadau, dan tidak melacak pergerakan Anda di luar sistem kerja.",
      icon: Shield,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },
    {
      title: "Penyimpanan Database & Infrastruktur",
      description: "Seluruh basis data manajemen kepegawaian disimpan dengan aman menggunakan infrastruktur cloud pihak ketiga terpercaya yang terenkripsi. Akses ke lingkungan data ini dibatasi secara ketat dan hanya digunakan demi kepentingan administrasi internal KPU Kabupaten Sekadau.",
      icon: Server,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
    },
  ];

  return (
    <>
      <Navigations title="Kebijakan Privasi" />
      <Helmet>
        <title>Kebijakan Privasi - KPU Kabupaten Sekadau</title>
      </Helmet>
      <div className="pt-20 p-4 min-h-screen bg-gray-50 flex flex-col justify-between pb-8">
        <div className=" space-y-6">
          
          {/* BANNER UTAMA */}
          <div className="bg-gradient-to-br from-red-600 to-red-500 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
            <div className="absolute -right-6 -bottom-6 opacity-10 text-9xl font-black">
              🛡️
            </div>
            <div className="relative z-10 space-y-2">
              <div className="bg-white/20 p-2.5 rounded-xl backdrop-blur w-fit">
                <Eye size={24} />
              </div>
              <h3 className="font-black text-xl tracking-wide">Komitmen Privasi Pegawai</h3>
              <p className="text-xs text-red-100 leading-relaxed">
                Halaman ini menjelaskan transparansi penuh mengenai alur pengumpulan, pengelolaan, serta perlindungan data kepegawaian Anda di lingkungan KPU Kabupaten Sekadau.
              </p>
              <div className="pt-2 text-[10px] text-red-200 font-medium">
                Terakhir Diperbarui: {lastUpdated}
              </div>
            </div>
          </div>

          {/* DAFTAR POIN KEBIJAKAN */}
          <div className="space-y-4">
            {privacyPoints.map((point, index) => {
              const Icon = point.icon;
              return (
                <div 
                  key={index} 
                  className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex gap-4 items-start"
                >
                  <div className={`p-3 rounded-2xl ${point.bgColor} shrink-0`}>
                    <Icon className={point.color} size={22} />
                  </div>
                  <div className="space-y-1.5">
                    <h4 className="text-sm font-bold text-gray-800">{point.title}</h4>
                    <p className="text-xs text-gray-500 leading-relaxed text-justify">
                      {point.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* PERNYATAAN PERSETUJUAN */}
          <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4 flex items-start gap-3">
            <CheckCircle className="text-emerald-600 shrink-0 mt-0.5" size={18} />
            <p className="text-xs text-emerald-800 leading-relaxed font-medium">
              Dengan mengakses aplikasi pengelolaan kepegawaian ini, Anda menyatakan menyetujui seluruh mekanisme regulasi privasi data internal KPU Kabupaten Sekadau yang berlaku.
            </p>
          </div>

        </div>
      </div>
    </>
  );
};

export default KebijakanPrivas;