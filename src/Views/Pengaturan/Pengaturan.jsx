import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  User, 
  ShieldCheck, 
  ChevronRight, 
  ChevronDown, 
  FileLock2, 
  LogOut,
  KeyRound,
  RefreshCw
} from "lucide-react";
import Navigations from "../Navigation";
import useCheckLogin from "../../State/useLogin";
import { Helmet } from "react-helmet-async";

const Pengaturan = () => {
  const navigate = useNavigate();
  const { user } = useCheckLogin();
  
  const [openSections, setOpenSections] = useState({ 0: true, 1: true });
  // State untuk melacak apakah submenu "Kata Sandi & Keamanan" sedang terbuka
  const [openSecuritySubmenu, setOpenSecuritySubmenu] = useState(false);

  const toggleSection = (index) => {
    setOpenSections((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const handleLogout = () => {
    localStorage.clear(); 
    navigate("/login");
  };

  const menuSections = [
    {
      title: "Keamanan Akun",
      items: [
        {
          label: "Profil",
          icon: User,
          color: "text-blue-600",
          bgColor: "bg-blue-50",
          action: () => navigate("/profil/" + (user?.id || "me")),
        },
        {
          label: "Kata Sandi & Keamanan",
          icon: ShieldCheck,
          color: "text-indigo-600",
          bgColor: "bg-indigo-50",
          hasSubmenu: true,
          action: () => setOpenSecuritySubmenu(!openSecuritySubmenu),
        },
      ],
    },
    {
      title: "Aplikasi & Lainnya",
      items: [
        {
          label: "Kebijakan Privasi",
          icon: FileLock2,
          color: "text-teal-600",
          bgColor: "bg-teal-50",
          action: () => navigate("/kebijakan-privasi"),
        },
        {
          label: "Keluar Akun",
          icon: LogOut,
          color: "text-red-600",
          bgColor: "bg-red-50",
          action: handleLogout,
          isLogout: true,
        },
      ],
    },
  ];

  return (
    <>
      <Navigations title="Pengaturan" />
      <Helmet>
        <title>Pengaturan</title>
      </Helmet>
      <div className="pt-20 p-4 min-h-screen bg-gray-50">
        <div className="mx-auto space-y-4 ">
          {menuSections.map((section, index) => {
            const isOpen = openSections[index];
            
            return (
              <div key={index} className="space-y-2">
                {/* TOMBOL HEADER SECTION */}
                <button
                  onClick={() => toggleSection(index)}
                  className="w-full flex items-center justify-between px-2 py-1 text-left focus:outline-none"
                >
                  <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    {section.title}
                  </h2>
                  {isOpen ? (
                    <ChevronDown className="text-gray-400" size={14} />
                  ) : (
                    <ChevronRight className="text-gray-400" size={14} />
                  )}
                </button>

                {/* MENU ITEMS CONTAINER */}
                {isOpen && (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300">
                    {section.items.map((item, itemIdx) => {
                      const Icon = item.icon;
                      return (
                        <div key={itemIdx} className="w-full">
                          <button
                            onClick={item.action}
                            className="w-full flex items-center justify-between p-3.5 hover:bg-gray-50 active:bg-gray-100 transition-colors border-b border-gray-50 last:border-0 text-left"
                          >
                            <div className="flex items-center gap-3">
                              <div className={`p-2 rounded-xl ${item.bgColor}`}>
                                <Icon className={item.color} size={16} />
                              </div>
                              {/* Diubah dari text-sm menjadi text-xs */}
                              <span className={`text-xs font-bold ${item.isLogout ? "text-red-600" : "text-gray-700"}`}>
                                {item.label}
                              </span>
                            </div>
                            
                            {!item.isLogout && (
                              item.hasSubmenu ? (
                                openSecuritySubmenu ? <ChevronDown className="text-gray-400" size={16} /> : <ChevronRight className="text-gray-400" size={16} />
                              ) : (
                                <ChevronRight className="text-gray-400" size={16} />
                              )
                            )}
                          </button>

                          {/* SUBMENU AREA */}
                          {item.hasSubmenu && openSecuritySubmenu && (
                            <div className="bg-gray-50/70 border-b border-gray-50 pl-6 pr-4 py-1.5 space-y-1">
                              {/* SUBMENU 1: GANTI KATA SANDI */}
                              <button
                                onClick={() => navigate("/profil/ganti-password/" + (user?.id || "me"))}
                                className="w-full flex items-center justify-between py-2.5 px-3 hover:bg-gray-100/80 rounded-xl transition-colors text-left"
                              >
                                <div className="flex items-center gap-2.5">
                                  <div className="p-1.5 bg-white rounded-lg border border-gray-100">
                                    <KeyRound className="text-gray-500" size={14} />
                                  </div>
                                  <span className="text-xs font-semibold text-gray-600">Ganti Kata Sandi</span>
                                </div>
                                <ChevronRight className="text-gray-400" size={14} />
                              </button>

                              {/* SUBMENU 2: RESET MFA */}
                              <button
                                onClick={() => navigate("/profil/ganti-mfa/" + (user?.id || "me"))}
                                className="w-full flex items-center justify-between py-2.5 px-3 hover:bg-gray-100/80 rounded-xl transition-colors text-left"
                              >
                                <div className="flex items-center gap-2.5">
                                  <div className="p-1.5 bg-white rounded-lg border border-gray-100">
                                    <RefreshCw className="text-gray-500" size={14} />
                                  </div>
                                  <span className="text-xs font-semibold text-gray-600">Reset MFA</span>
                                </div>
                                <ChevronRight className="text-gray-400" size={14} />
                              </button>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
};

export default Pengaturan;