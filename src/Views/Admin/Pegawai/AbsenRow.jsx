import React from "react";
import { Clock, MapPin, PenTool, ChevronDown } from "lucide-react";

// Helper fungsi untuk memformat waktu dari database ke WIB secara aman
const formatJamAsli = (timeString) => {
  if (!timeString) return "--:--";
  
  const date = new Date(timeString);
  if (isNaN(date.getTime())) return "--:--";

  // Geser milidetik ke waktu lokal WIB (+7 jam dari UTC) secara manual
  const wibDate = new Date(date.getTime() + (7 * 60 * 60 * 1000));

  return (
    wibDate.getUTCHours().toString().padStart(2, "0") +
    ":" +
    wibDate.getUTCMinutes().toString().padStart(2, "0")
  );
};

// Helper untuk format tanggal card agar konsisten dan tidak bergeser
const formatTanggalMurni = (timeString) => {
  if (!timeString) return "";
  const date = new Date(timeString);
  if (isNaN(date.getTime())) return "";

  return date.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "short",
    timeZone: "UTC", // Dikunci ke UTC agar akurat dengan database
  });
};

const AbsenRow = ({ absen, isExpanded, onToggle }) => {
  const [lat, lon] = absen.koordinat
    ? absen.koordinat.split(",").map((c) => c.trim())
    : ["0", "0"];

  const gmapsUrl = `https://maps.google.com/maps?q=${lat},${lon}&t=&z=15&ie=UTF8&iwloc=&output=embed`;

  // --- AMBIL JAM & TANGGAL ASLI DARI DATABASE ---
  const jamMasuk = formatJamAsli(absen.jam_masuk || absen.createdAt);
  const jamPulang = formatJamAsli(absen.jam_keluar);
  const tanggalCard = formatTanggalMurni(absen.jam_masuk || absen.createdAt);

  const statusStyles = {
    hadir: {
      bg: "bg-emerald-50",
      text: "text-emerald-600",
      border: "border-emerald-100",
    },
    absen: { bg: "bg-red-50", text: "text-red-600", border: "border-red-100" },
    izin: {
      bg: "bg-yellow-50",
      text: "text-yellow-600",
      border: "border-yellow-100",
    },
    sakit: { bg: "bg-sky-50", text: "text-sky-600", border: "border-sky-100" },
    cuti: {
      bg: "bg-purple-50",
      text: "text-purple-600",
      border: "border-purple-100",
    },
    cuti_luar: {
      bg: "bg-orange-50",
      text: "text-orange-600",
      border: "border-orange-100",
    },
    dinas_luar: {
      bg: "bg-blue-50",
      text: "text-blue-600",
      border: "border-blue-100",
    },
    tugas_belajar: {
      bg: "bg-indigo-50",
      text: "text-indigo-600",
      border: "border-indigo-100",
    },
  };

  const style = statusStyles[absen.status] || {
    bg: "bg-slate-50",
    text: "text-slate-600",
    border: "border-slate-100",
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-3xs overflow-hidden">
      {/* CARD ROW HEADER */}
      <div
        onClick={onToggle}
        className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/50 transition-colors group"
      >
        <div className="flex flex-col space-y-1.5 min-w-0 flex-1">
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Clock size={13} className="text-slate-400" />
              <span className="text-xs font-bold text-slate-700">
                {tanggalCard}
              </span>
            </div>

            {/* Jam asli muncul sesuai database jika hadir */}
            {absen.status === "hadir" && (
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 border border-emerald-100/70 rounded-md flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-emerald-500" />{" "}
                  Masuk: {jamMasuk}
                </span>
                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 border border-blue-100/70 rounded-md flex items-center gap-1">
                  <span className="w-1 h-1 rounded-full bg-blue-500" /> Pulang:{" "}
                  {jamPulang}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* STATUS BADGE DINAMIS */}
        <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
          <span
            className={`text-[10px] font-black tracking-wide px-2.5 py-1 rounded-md border uppercase ${style.bg} ${style.text} ${style.border}`}
          >
            {absen?.status ? absen.status.replace("_", " ") : "Libur"}
          </span>

          <ChevronDown
            size={15}
            className={`text-slate-400 group-hover:text-red-600 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
          />
        </div>
      </div>

      {/* ACCORDION COLLAPSIBLE CONTENT */}
      {isExpanded && (
        <div className="p-4 border-t border-slate-100 bg-slate-50/40 space-y-4 animate-fade-in">
          {/* KETERANGAN (Selalu tampil) */}
          <div className="bg-white p-3 rounded-xl border border-slate-100">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">
              Keterangan
            </span>
            <p className="text-xs text-slate-600 font-medium leading-relaxed">
              {absen.keterangan || (
                <span className="italic text-slate-400">
                  Tidak ada keterangan tambahan.
                </span>
              )}
            </p>
          </div>

          {/* HANYA TAMPILKAN TTD DAN MAPS JIKA STATUS 'HADIR' */}
          {absen.status === "hadir" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* BOX TANDA TANGAN */}
              <div className="bg-white p-3 rounded-xl border border-slate-100 flex flex-col justify-between min-h-[200px]">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                  <PenTool size={11} /> Tanda Tangan Digital
                </span>
                <div className="flex-1 flex items-center justify-center py-1">
                  {absen.img_ttd ? (
                    <img
                      src={absen.img_ttd}
                      alt="TTD"
                      className="max-h-50 max-w-full object-contain mix-blend-multiply border rounded-lg border-dashed p-0.5"
                    />
                  ) : (
                    <span className="text-slate-400 italic">Nihil</span>
                  )}
                </div>
              </div>

              {/* BOX GEOLOCATION GOOGLE MAPS */}
              <div className="bg-white p-3 rounded-xl border border-slate-100 flex flex-col min-h-[160px]">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 mb-2">
                  <MapPin size={11} className="text-red-500" />
                  Koordinat Presensi
                </span>

                <div className="flex-1 w-full h-24 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 relative">
                  {absen.koordinat ? (
                    <iframe
                      title={`gmaps-${absen.id}`}
                      width="100%"
                      frameBorder="0"
                      src={gmapsUrl}
                      scrolling="no"
                      className="absolute left-0 rounded-lg"
                      style={{
                        height: "calc(100% + 30px)",
                        top: "-5px",
                        marginBottom: "-30px",
                      }}
                    />
                  ) : (
                    <div className="h-full flex items-center justify-center text-slate-400 italic">
                      Data koordinat tidak tersedia
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AbsenRow;