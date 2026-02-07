import { NavLink } from "react-router-dom";
import { FaHome } from "react-icons/fa";
import { FaGear } from "react-icons/fa6";

const BottomNav = () => {
  return (
    <div className="fixed bottom-0 left-0 right-0 border-red-600 bg-white border-t-2 shadow z-40">
      <div className="flex justify-around items-center h-16">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex flex-col items-center text-xs ${
              isActive ? "text-red-600" : "text-gray-500"
            }`
          }
        >
          <FaHome size={28} className="mb-1" />
          Beranda
        </NavLink>

        <NavLink
          to={`/pengaturan`}
          className={({ isActive }) =>
            `flex flex-col items-center text-xs ${
              isActive ? "text-red-600" : "text-gray-500"
            }`
          }
        >
          <FaGear size={28} className="mb-1" />
          Pengaturan
        </NavLink>
      </div>
    </div>
  );
};

export default BottomNav;
