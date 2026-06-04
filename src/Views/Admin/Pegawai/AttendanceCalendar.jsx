import React, { useMemo } from "react";
import Calendar from "react-calendar";
import { RotateCcw } from "lucide-react";

const AttendanceCalendar = ({ data, month, year, setMonth, setYear }) => {
  const activeStartDate = useMemo(
    () => new Date(year, month - 1, 1),
    [month, year],
  );
  const months = [
    "Januari",
    "Februari",
    "Maret",
    "April",
    "Mei",
    "Juni",
    "Juli",
    "Agustus",
    "September",
    "Oktober",
    "November",
    "Desember",
  ];
  const colors = {
    hadir: "bg-emerald-500",
    izin: "bg-yellow-400",
    sakit: "bg-sky-500",
    default: "bg-red-500",
  };

  const getAttendance = (date) => {
    const f = (d) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
    return data.find(
      (i) => i.createdAt && f(new Date(i.createdAt)) === f(date),
    );
  };

  return (
    <div className="bg-white rounded-[24px] border border-slate-100 p-5 w-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-red-600 font-black text-sm mt-0.5">
            {months[month - 1]} {year}
          </p>
        </div>
        <button
          onClick={() => {
            setMonth(new Date().getMonth() + 1);
            setYear(new Date().getFullYear());
          }}
          className="flex items-center gap-1.5 bg-slate-50 hover:bg-red-50 p-2 rounded-xl font-bold text-gray-600 text-xs border border-slate-100 transition-all"
        >
          <RotateCcw size={12} /> Reset
        </button>
      </div>
      <Calendar
        value={null}
        activeStartDate={activeStartDate}
        prevLabel={null}
        prev2Label={null}
        nextLabel={null}
        next2Label={null}
        className="custom-calendar"
        tileClassName={({ date, view }) =>
          view === "month" && [0, 6].includes(date.getDay())
            ? "text-holiday-red font-medium"
            : ""
        }
        tileContent={({ date, view }) => {
          const res = view === "month" && getAttendance(date);
          return res ? (
            <div className="flex justify-center mt-1">
              <div
                className={`w-2 h-2 rounded-full ${colors[res.status] || colors.default}`}
              />
            </div>
          ) : null;
        }}
      />
      <div className="grid grid-cols-4 gap-2 mt-6 border-t border-slate-50 pt-4 text-[10px] font-bold text-center">
        {["Hadir", "Izin", "Sakit", "Alpha"].map((t, idx) => (
          <div
            key={t}
            className={`p-1.5 rounded-lg ${["bg-emerald-50 text-emerald-700", "bg-yellow-50 text-yellow-700", "bg-sky-50 text-sky-700", "bg-red-50 text-red-700"][idx]}`}
          >
            {t}
          </div>
        ))}
      </div>
    </div>
  );
};
export default AttendanceCalendar;
