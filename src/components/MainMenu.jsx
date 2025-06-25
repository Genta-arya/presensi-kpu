import React from "react";
import { useNavigate } from "react-router-dom";
import { CalendarCheck, Users, Mic2, FilePlus } from "lucide-react";
import Container from "./Container";

const menuItems = [
  {
    name: "Absen Harian",
    icon: <CalendarCheck size={52} />,
    href: "/presensi-harian",
  },
  { name: "Absen Apel", icon: <Users size={52} />, href: "/presensi-apel" },
  { name: "Absen Rapat", icon: <Mic2 size={52} />, href: "/presensi-rapat" },
  { name: "Pengajuan", icon: <FilePlus size={52} />, href: "/pengajuan" }, // Tambahkan route ini kalau belum ada
];

const MainMenu = () => {
  const navigate = useNavigate();

  return (
    <Container>
      <div className="flex flex-col items-center justify-center ">
        <div className="grid grid-cols-2 gap-4 mt-40">
          {menuItems.map((item, index) => (
            <div
              key={index}
              onClick={() => navigate(item.href)}
              className="bg-white rounded-2xl shadow-md p-6 flex flex-col items-center justify-center gap-2 text-center hover:bg-gray-100  cursor-pointer transition"
            >
              <p className="text-red-600">{item.icon}</p>
              <span className="text-lg font-semibold">{item.name}</span>
            </div>
          ))}
        </div>
      </div>
    </Container>
  );
};

export default MainMenu;
