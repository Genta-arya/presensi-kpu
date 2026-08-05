import React, { useMemo, useState } from "react";
import Calendar from "react-calendar";
import { RotateCcw, X } from "lucide-react";
import { updateStatusAbsensi } from "../../../service/Auth/absen.service";
import { toast } from "sonner";
import { useParams } from "react-router-dom";

const AttendanceCalendar = ({
  data,
  month,
  year,
  setMonth,
  setYear,
  onRefreshData,
}) => {
  const [calendarValue, setCalendarValue] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null); // Menyimpan format "YYYY-MM-DD"
  const [selectedStatus, setSelectedStatus] = useState("hadir");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [keterangan, setKeterangan] = useState("");

  // Opsi lengkap mencakup seluruh enum dari database
  const statusOptionsAll = [
    { value: "hadir", label: "Hadir" },
    { value: "absen", label: "Absen" },
    { value: "izin", label: "Izin" },
    { value: "sakit", label: "Sakit" },
    { value: "cuti", label: "Cuti" },
    { value: "cuti_luar", label: "CLT" },
    { value: "dinas_luar", label: "Dinas Luar" },
    { value: "tugas_belajar", label: "Tugas Belajar" },
    { value: "tidak_hadir", label: "Tidak Hadir" },
    { value: "libur", label: "Libur" },
  ];

  // AMAN: Filter opsi agar Admin TIDAK BISA mengubah status absen menjadi cuti/cuti_luar secara manual
  const statusOptionsForAdmin = useMemo(() => {
    return statusOptionsAll.filter(
      (opt) => opt.value !== "cuti" && opt.value !== "cuti_luar",
    );
  }, []);

  const activeStartDate = useMemo(
    () => new Date(year, month - 1, 1),
    [month, year],
  );

  const { id } = useParams();

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

  // Sesuai dengan seluruh enum StatusAbsen di database Anda
  const colors = {
    hadir: "bg-emerald-500",
    absen: "bg-red-500",
    izin: "bg-yellow-400",
    sakit: "bg-sky-500",
    cuti: "bg-purple-500",
    cuti_luar: "bg-orange-500",
    dinas_luar: "bg-blue-500",
    tugas_belajar: "bg-indigo-500",
    tidak_hadir: "bg-rose-400",
    libur: "bg-slate-400",
  };

 const getAttendance = (date) => {
    // 1. Format tanggal kotak kalender menjadi "YYYY-MM-DD" murni
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const calendarDateStr = `${year}-${month}-${day}`;

    return data.find((i) => {
      // ✅ Gunakan jam_masuk jika ada, jika tidak ada (seperti cuti/izin/libur), gunakan createdAt
      const targetDateStr = i.jam_masuk || i.createdAt;
      if (!targetDateStr) return false;

      // 2. Buat objek Date, lalu ambil tanggal lokalnya di browser (WIB)
      const d = new Date(targetDateStr);
      const dbYear = d.getFullYear();
      const dbMonth = String(d.getMonth() + 1).padStart(2, "0");
      const dbDay = String(d.getDate()).padStart(2, "0");
      const dbDateStr = `${dbYear}-${dbMonth}-${dbDay}`;

      // 3. Bandingkan string tanggal lokalnya secara langsung
      return dbDateStr === calendarDateStr;
    });
  };
  const handleDayClick = (date) => {
    const existingAttendance = getAttendance(date);

    // ✅ Ekstraksi string lokal YYYY-MM-DD secara presisi tanpa geser zona waktu UTC
    const yearVal = date.getFullYear();
    const monthStr = String(date.getMonth() + 1).padStart(2, "0");
    const dayStr = String(date.getDate()).padStart(2, "0");
    const localDateString = `${yearVal}-${monthStr}-${dayStr}`;

    setSelectedDate(localDateString); // Simpan string murni "YYYY-MM-DD"
    setCalendarValue(date);
    setSelectedStatus(existingAttendance ? existingAttendance.status : "hadir");
    setIsModalOpen(true);
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();

    // Validasi double-check sisi client sebelum hit API
    if (["cuti", "cuti_luar"].includes(selectedStatus)) {
      toast.error(
        "Akses ditolak! Status cuti hanya bisa diubah melalui sistem modul persetujuan cuti.",
      );
      return;
    }

    const userId = data && data.length > 0 ? data[0].userId : id;

    setIsSubmitting(true);
    try {
      await updateStatusAbsensi({
        userId: userId,
        status: selectedStatus,
        keterangan,
        tanggal: selectedDate, // Sudah berupa string lokal "YYYY-MM-DD" yang akurat
      });

      toast.success("Kehadiran berhasil diperbarui");
      onRefreshData();
      setIsModalOpen(false);
    } catch (error) {
      toast.error("Gagal mengupdate status");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-[24px] border border-slate-100 p-5 w-full relative">
      <style>{`
        .custom-calendar .react-calendar__tile {
          cursor: pointer !important;
          pointer-events: auto !important;
          position: relative !important;
          overflow: visible !important;
          background: none !important;
          color: #334155 !important;
          border-radius: 12px !important;
        }
        .custom-calendar .react-calendar__tile * {
          pointer-events: none !important;
        }
        .react-calendar__month-view__days {
          pointer-events: auto !important;
        }
        .custom-calendar .react-calendar__tile--active {
          background-color: #fee2e2 !important;
          color: #dc2626 !important;
          font-weight: 900 !important;
          border: 2px solid #ef4444 !important;
        }
        .custom-calendar .react-calendar__tile:hover {
          background-color: #f1f5f9 !important;
        }
      `}</style>

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
            setCalendarValue(null);
          }}
          className="flex items-center gap-1.5 bg-slate-50 hover:bg-red-50 p-2 rounded-xl font-bold text-gray-600 text-xs border border-slate-100 transition-all"
        >
          <RotateCcw size={12} /> Reset
        </button>
      </div>

      <Calendar
        value={calendarValue}
        onChange={setCalendarValue}
        activeStartDate={activeStartDate}
        prevLabel={null}
        prev2Label={null}
        nextLabel={null}
        next2Label={null}
        className="custom-calendar"
        onClickDay={handleDayClick}
        tileClassName={({ date, view }) =>
          view === "month" && [0, 6].includes(date.getDay())
            ? "text-holiday-red font-medium cursor-pointer"
            : "cursor-pointer"
        }
       tileContent={({ date, view }) => {
          const res = view === "month" && getAttendance(date);
          if (!res) return null;

          // Helper untuk memaksa konversi ke WIB (UTC +7) secara presisi
          const getWibTimeString = (dateString) => {
            if (!dateString) return null;
            const d = new Date(dateString);
            if (isNaN(d.getTime())) return null;

            // Tambahkan manual 7 jam ke milidetik UTC agar menjadi waktu WIB
            const wibDate = new Date(d.getTime() + 7 * 60 * 60 * 1000);
            const hours = String(wibDate.getUTCHours()).padStart(2, "0");
            const minutes = String(wibDate.getUTCMinutes()).padStart(2, "0");
            return `${hours}:${minutes}`;
          };

          const jamMasukWib = getWibTimeString(res.jam_masuk);

          return (
            <div className="flex flex-col items-center mt-1">
              {/* Titik warna status */}
              <div
                className={`w-2 h-2 rounded-full ${colors[res.status] || "bg-slate-400"}`}
              />
              
              {/* Jam masuk yang sudah dipaksa akurat ke WIB */}
              {res.status === "hadir" && jamMasukWib && (
                <span className="text-[8px] font-bold text-slate-500 mt-0.5 scale-90">
                  {jamMasukWib}
                </span>
              )}
            </div>
          );
        }}
      />
      <div className="flex items-center justify-center mb-3">
        <p className="text-[10px] text-slate-400 font-medium italic">
          * Klik pada tanggal kalender untuk menambah atau mengubah status
          kehadiran
        </p>
      </div>

      {/* Legenda Indikator Bawah (Menampilkan Seluruh Status Enum) */}
      <div className="grid border-dashed grid-cols-2 sm:grid-cols-4 gap-2 rounded-md border-t border-slate-300 p-4">
        {statusOptionsAll.map((opt) => (
          <div key={opt.value} className="flex items-center gap-2">
            <div
              className={`w-3 h-3 rounded-full ${colors[opt.value] || "bg-slate-400"}`}
            />
            <span className="text-[10px] font-bold text-slate-600">
              {opt.label}
            </span>
          </div>
        ))}
      </div>

      {/* --- MODAL UPDATE STATUS KEHADIRAN --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl shadow-xl border border-slate-100 w-[70%] overflow-hidden transform transition-all scale-100">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <div>
                <h3 className="text-base font-black text-slate-800 tracking-tight">
                  Update Kehadiran
                </h3>
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  {selectedDate
                    ? new Date(selectedDate + "T00:00:00").toLocaleDateString(
                        "id-ID",
                        {
                          weekday: "long",
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        },
                      )
                    : ""}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Form Modal Body */}
            <form onSubmit={handleUpdateStatus} className="p-5 space-y-4">
              <div className="space-y-2.5">
                <label className="text-xs font-black text-slate-400 uppercase tracking-wider">
                  Pilih Status Kehadiran
                </label>

                {/* Loop radio button menggunakan statusOptionsForAdmin (Tanpa Cuti & Cuti Luar) */}
                <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1">
                  {statusOptionsForAdmin.map((opt) => (
                    <label
                      key={opt.value}
                      className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                        selectedStatus === opt.value
                          ? "border-red-500 bg-red-50 text-red-700 font-bold"
                          : "border-slate-200 text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <span className="text-xs">{opt.label}</span>
                      <input
                        type="radio"
                        name="attendanceStatus"
                        value={opt.value}
                        checked={selectedStatus === opt.value}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="accent-red-600"
                      />
                    </label>
                  ))}
                </div>

                {!["hadir", "absen", "libur", "tidak_hadir"].includes(
                  selectedStatus,
                ) && (
                  <div className="pt-2">
                    <label className="text-xs font-black text-slate-400 uppercase block mb-1.5">
                      Keterangan Tambahan
                    </label>
                    <textarea
                      value={keterangan}
                      onChange={(e) => setKeterangan(e.target.value)}
                      placeholder="Masukkan keterangan..."
                      className="w-full p-3 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none"
                      rows="2"
                      required
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-2.5 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-black py-2.5 rounded-2xl transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-red-600 hover:bg-red-700 disabled:bg-slate-300 text-white text-sm font-black py-2.5 rounded-2xl shadow-sm transition-colors"
                >
                  {isSubmitting ? "Menyimpan..." : "Simpan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceCalendar;