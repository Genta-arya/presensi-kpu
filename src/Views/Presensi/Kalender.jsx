import React from "react";
import Calendar from "react-calendar";
import { RotateCcw } from "lucide-react";

const AttendanceCalendar = ({
  data,
  selectedMonth,
  selectedYear,
  setSelectedMonth,
  setSelectedYear,
}) => {
  // Tentukan fokus bulan aktif berdasarkan filter panel luar
  const activeStartDate = React.useMemo(() => {
    const m = parseInt(selectedMonth) || new Date().getMonth() + 1;
    const y = parseInt(selectedYear) || new Date().getFullYear();
    return new Date(y, m - 1, 1);
  }, [selectedMonth, selectedYear]);

  // RESET CALENDAR
  const handleResetCalendar = () => {
    const today = new Date();
    setSelectedMonth(today.getMonth() + 1);
    setSelectedYear(today.getFullYear());
  };

  // CHECK ABSEN
  const checkAttendance = (date) => {
    if (!date || isNaN(date.getTime())) return null;

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const currentDate = `${year}-${month}-${day}`;

    return data.find((item) => {
      if (!item.createdAt) return false;
      const d = new Date(item.createdAt);
      if (isNaN(d.getTime())) return false;

      const itemYear = d.getFullYear();
      const itemMonth = String(d.getMonth() + 1).padStart(2, "0");
      const itemDay = String(d.getDate()).padStart(2, "0");
      const itemDate = `${itemYear}-${itemMonth}-${itemDay}`;

      return itemDate === currentDate;
    });
  };

  // WARNA STATUS
  const getStatusColor = (status) => {
    switch (status) {
      case "hadir":
        return "bg-emerald-500";
      case "izin":
        return "bg-yellow-400";
      case "sakit":
        return "bg-sky-500";
      default:
        return "bg-red-500";
    }
  };

  const getMonthName = (monthNumber) => {
    const months = [
      "Januari", "Februari", "Maret", "April", "Mei", "Juni",
      "Juli", "Agustus", "September", "Oktober", "November", "Desember",
    ];
    return months[parseInt(monthNumber) - 1] || "";
  };

  return (
    <>
      <div className="bg-white rounded-[32px] shadow-2xl p-6 mt-6 border border-gray-100 ">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            {/* Diubah dari text-sm menjadi text-xs */}
            <h2 className="text-xs font-black text-gray-800">
              Kalender Kehadiran
            </h2>
            <p className="text-red-600 font-extrabold text-xs mt-1 tracking-wide uppercase">
              {getMonthName(selectedMonth)} {selectedYear}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleResetCalendar}
             
              className="flex items-center gap-2 bg-gray-100 hover:bg-red-600 hover:text-white transition-all duration-200 px-4 py-2.5 rounded-xl font-semibold text-gray-700 text-xs"
            >
              <RotateCcw size={14} />
              Refresh
            </button>
          </div>
        </div>

        {/* CALENDAR */}
        <Calendar
          value={null}
          activeStartDate={activeStartDate}
          onActiveStartDateChange={null}
          prevLabel={null}
          prev2Label={null}
          nextLabel={null}
          next2Label={null}
          className="custom-calendar"
          tileClassName={({ date, view }) => {
            if (view === "month") {
              const day = date.getDay();
              if (day === 0 || day === 6) {
                return "text-holiday-red font-medium"; 
              }
            }
            return "";
          }}
          tileContent={({ date, view }) => {
            if (view === "month") {
              const attendance = checkAttendance(date);

              if (attendance) {
                return (
                  <div className="flex justify-center mt-1">
                    <div
                      className={`
                        w-2.5
                        h-2.5
                        rounded-full
                        shadow-md
                        ${getStatusColor(attendance.status)}
                      `}
                    />
                  </div>
                );
              }
            }
            return null;
          }}
        />

        {/* LEGEND */}
        <div className="grid grid-cols-2 gap-3 mt-8">
          <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-3 flex items-center gap-2.5">
            <div className="w-3 h-3 rounded-full bg-emerald-500 flex-shrink-0" />
            <div className="min-w-0">
              <p className="font-bold text-xs text-emerald-700">Hadir</p>
              <p className="text-xs text-emerald-600 truncate">Presensi masuk</p>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-100 rounded-2xl p-3 flex items-center gap-2.5">
            <div className="w-3 h-3 rounded-full bg-yellow-400 flex-shrink-0" />
            <div className="min-w-0">
              <p className="font-bold text-xs text-yellow-700">Izin</p>
              <p className="text-xs text-yellow-600 truncate">Tidak masuk izin</p>
            </div>
          </div>

          <div className="bg-sky-50 border border-sky-100 rounded-2xl p-3 flex items-center gap-2.5">
            <div className="w-3 h-3 rounded-full bg-sky-500 flex-shrink-0" />
            <div className="min-w-0">
              <p className="font-bold text-xs text-sky-700">Sakit</p>
              <p className="text-xs text-sky-600 truncate">Tidak masuk sakit</p>
            </div>
          </div>

          <div className="bg-red-50 border border-red-100 rounded-2xl p-3 flex items-center gap-2.5">
            <div className="w-3 h-3 rounded-full bg-red-500 flex-shrink-0" />
            <div className="min-w-0">
              <p className="font-bold text-xs text-red-700">Alpha</p>
              <p className="text-xs text-red-600 truncate">Tidak hadir</p>
            </div>
          </div>
        </div>
      </div>

      {/* CUSTOM CSS */}
      <style>
        {`
          .custom-calendar {
            width: 100%;
            border: none !important;
            background: transparent;
            font-family: inherit;
          }

          .react-calendar__navigation {
            display: none !important;
          }

          /* Teks hari (Sen, Sel, Rab, dst) disesuaikan ke 12px (text-xs) */
          .react-calendar__month-view__weekdays {
            text-transform: uppercase;
            font-size: 12px !important;
            font-weight: 700;
            color: #9ca3af;
            margin-bottom: 10px;
          }

          /* Warna teks header hari Sabtu dan Minggu */
          .react-calendar__month-view__weekdays__weekday:nth-child(6) abbr,
          .react-calendar__month-view__weekdays__weekday:nth-child(7) abbr {
            color: #dc2626 !important;
          }

          /* Teks angka tanggal diubah sizenya menjadi 12px (text-xs) */
          .react-calendar__tile {
            height: 64px; /* Dikecilkan sedikit agar serasi dengan text-xs */
            font-size: 12px !important;
            border-radius: 16px;
            transition: 0.2s;
            position: relative;
            color: #374151;
            pointer-events: none;
          }

          .react-calendar__tile:hover {
            background: #fef2f2 !important;
            transform: translateY(-2px);
          }

          .react-calendar__tile--active {
            background: transparent !important;
            color: inherit !important;
          }

          .text-holiday-red {
            color: #dc2626 !important;
          }

          .react-calendar__tile--now {
            background: #fee2e2 !important;
            color: #dc2626 !important;
            font-weight: bold;
          }

          .react-calendar__month-view__days__day--neighboringMonth {
            color: #d1d5db !important;
            opacity: 0.3;
          }
        `}
      </style>
    </>
  );
};

export default AttendanceCalendar;