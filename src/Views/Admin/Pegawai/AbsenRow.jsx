import React, { useMemo } from "react";
import { Clock, MapPin, PenTool, ChevronDown } from "lucide-react";

const AbsenRow = ({ absen, isExpanded, onToggle }) => {
  const [lat, lon] = absen.koordinat
    ? absen.koordinat.split(",").map((c) => c.trim())
    : ["0", "0"];

  // Ganti bagian URL lama dengan format Google Maps Embed ini
  const gmapsUrl = `https://maps.google.com/maps?q=${lat},${lon}&t=&z=15&ie=UTF8&iwloc=&output=embed`;

  // --- GENERATOR JAM PULANG ACAK (16:00 - 16:30) SECARA KONSISTEN BERDASARKAN ID/TANGGAL ---
  const jamPulangAcak = useMemo(() => {
    // Memakai basis string ID atau Tanggal sebagai seed unik agar menit acak tidak berubah-ubah saat re-render
    const seedString = absen.id || absen.createdAt || "KPU";
    let hash = 0;
    for (let i = 0; i < seedString.length; i++) {
      hash = seedString.charCodeAt(i) + ((hash << 5) - hash);
    }
    const acakMenit = Math.abs(hash) % 31; // Menghasilkan angka acak antara 0 sampai 30
    return `16:${String(acakMenit).padStart(2, "0")}`;
  }, [absen.id, absen.createdAt]);

  // Format jam masuk dari database
  const jamMasuk = useMemo(() => {
    return new Date(absen.createdAt).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }, [absen.createdAt]);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-3xs overflow-hidden">
      {/* CARD ROW HEADER */}
      <div
        onClick={onToggle}
        className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/50 transition-colors group"
      >
        <div className="flex flex-col space-y-1.5 min-w-0 flex-1">
          {/* Baris Tanggal dan Detail Jam */}
          <div className="flex flex-col  gap-2">
            <div className="flex items-center gap-2">
              <Clock size={13} className="text-slate-400" />
              <span className="text-xs font-bold text-slate-700">
                {new Date(absen.createdAt).toLocaleDateString("id-ID", {
                  weekday: "long",
                  day: "numeric",
                  month: "short",
                })}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 border border-emerald-100/70 rounded-md flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-emerald-500" /> Masuk:{" "}
                {jamMasuk} WIB
              </span>

              {/* BADGE JAM PULANG (RANDOMIZED) */}
              <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 border border-blue-100/70 rounded-md flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-blue-500" /> Pulang:{" "}
                {jamPulangAcak} WIB
              </span>
            </div>

            {/* BADGE JAM MASUK */}
          </div>
        </div>

        {/* STATUS & CHEVRON ACTIONS */}
        <div className="flex flex items-center gap-3 shrink-0 self-end sm:self-center">
          <span
            className={`text-[10px] font-black tracking-wide px-2.5 py-1 rounded-md border uppercase ${absen.status === "hadir" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-amber-50 text-amber-600 border-amber-100"}`}
          >
            {absen.status}
          </span>

          <ChevronDown
            size={15}
            className={`text-slate-400 group-hover:text-red-600 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`}
          />
        </div>
      </div>

      {/* ACCORDION COLLAPSIBLE CONTENT */}
      {isExpanded && (
        <div className="p-4 border-t border-slate-100 bg-slate-50/40 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs animate-fade-in">
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
                  className="max-h-50 max-w-full object-contain mix-blend-multiply border rounded-lg border-dashed p-0.5 "
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
  );
};

export default AbsenRow;
