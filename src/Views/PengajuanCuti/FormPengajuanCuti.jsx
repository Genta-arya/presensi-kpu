import React, { useState } from "react";
import { ArrowLeft, CalendarDays, Upload, FileText, X } from "lucide-react";
import { DateRange } from "react-date-range";
import { format, eachDayOfInterval } from "date-fns";
import idLocale from "date-fns/locale/id";
import { toast } from "sonner";

// DUA BARIS INI TIDAK BOLEH HILANG ATAU SALAH URUTAN:
import "react-date-range/dist/styles.css"; // main style file
import "react-date-range/dist/theme/default.css"; // theme css file
import { addPengajuanCuti } from "../../service/Auth/absen.service";
import useCheckLogin from "../../State/useLogin";

const FormAjukanCuti = ({ onCancel, onSubmit, refresh }) => {
  const [jenisCuti, setJenisCuti] = useState("Tahunan");
  const [keterangan, setKeterangan] = useState("");
  const [suratDokter, setSuratDokter] = useState(null);
  const [suratDokterPreview, setSuratDokterPreview] = useState("");
  const { user } = useCheckLogin();
  const [isLoading, setIsLoading] = useState(false);
  // State kalender booking range style
  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: "selection",
    },
  ]);

  // FUNGSI PEMBANTU: Hitung hanya hari kerja (Senin - Jumat)
  const hitungHariKerja = (start, end) => {
    if (!start || !end) return 0;
    try {
      // Mengambil susunan array dari setiap tanggal di dalam rentang terpilih
      const semuaTanggal = eachDayOfInterval({ start, end });

      // Filter tanggal yang bukan Sabtu (6) dan bukan Minggu (0)
      const hariKerja = semuaTanggal.filter((date) => {
        const day = date.getDay();
        return day !== 0 && day !== 6;
      });

      return hariKerja.length;
    } catch (error) {
      return 0;
    }
  };

  // Ambil total hari murni kerja secara real-time
  const totalHari = hitungHariKerja(
    dateRange[0].startDate,
    dateRange[0].endDate,
  );

  // Handle Input File Surat Dokter
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validasi format file (PDF, JPG, JPEG, PNG)
    const validTypes = [
      "application/pdf",
      "image/jpeg",
      "image/jpg",
      "image/png",
    ];
    if (!validTypes.includes(file.type)) {
      toast.error("Format file tidak didukung! Gunakan PDF, JPG, atau PNG.");
      return;
    }

    // Validasi ukuran file maksimal 2MB
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Ukuran file terlalu besar! Maksimal 2MB.");
      return;
    }

    setSuratDokter(file);
    setSuratDokterPreview(file.name);
  };

  const handleRemoveFile = () => {
    setSuratDokter(null);
    setSuratDokterPreview("");
  };

  // Submit Handler + Validasi Berlapis
  // Submit Handler + Validasi Berlapis
  const handleSubmitAction = async (e) => {
    e.preventDefault();

    // Validasi jika user memilih rentang yang isinya hanya Sabtu & Minggu (Total Hari Kerja = 0)
    if (totalHari === 0) {
      toast.error(
        "Gagal mengajukan! Rentang tanggal yang Anda pilih hanya berisi hari Sabtu/Minggu (Hari Libur).",
      );
      return;
    }

    // 1. VALIDASI ATURAN BATAS MAKSIMAL CUTI ASN (PP NO. 11/2017)
    if (jenisCuti === "Tahunan" && totalHari > 12) {
      toast.error(
        `Pengajuan ditolak! Cuti Tahunan ASN maksimal 12 hari kerja (Anda memilih ${totalHari} hari kerja).`,
      );
      return;
    }

    if (jenisCuti === "Sakit" && totalHari > 14) {
      toast.error(
        `Pengajuan ditolak! Cuti sakit mandiri di aplikasi maksimal 14 hari kerja.`,
      );
      return;
    }

    if (jenisCuti === "Melahirkan" && totalHari > 90) {
      toast.error(`Pengajuan ditolak! Cuti Melahirkan maksimal 90 hari kerja.`);
      return;
    }

    // Tambahan Validasi Cuti Alasan Penting (Maks 1 Bulan / 22 Hari Kerja)
    if (jenisCuti === "Alasan Penting" && totalHari > 22) {
      toast.error(
        `Pengajuan ditolak! Cuti Alasan Penting maksimal 1 bulan / 22 hari kerja (Anda memilih ${totalHari} hari kerja).`,
      );
      return;
    }

    // Tambahan Validasi Cuti Besar (Maks 3 Bulan / 66 Hari Kerja)
    if (jenisCuti === "Cuti Besar" && totalHari > 66) {
      toast.error(
        `Pengajuan ditolak! Cuti Besar maksimal 3 bulan / 66 hari kerja (Anda memilih ${totalHari} hari kerja).`,
      );
      return;
    }

    // 2. VALIDASI KHUSUS CUTI SAKIT > 1 HARI (WAJIB UPLOAD SURAT DOKTER)
    if (jenisCuti === "Sakit" && totalHari > 1 && !suratDokter) {
      toast.error(
        "⚠️ Pengajuan ditolak! Untuk Cuti Sakit lebih dari 1 hari kerja, Anda wajib mengunggah Surat Keterangan Dokter.",
      );
      return;
    }

    // Format tanggal untuk dikirim ke Backend/Parent
    const tanggalMulai = format(dateRange[0].startDate, "yyyy-MM-dd");
    const tanggalSelesai = format(dateRange[0].endDate, "yyyy-MM-dd");

    setIsLoading(true);

    // DATA PAYLOAD YANG AKAN DIKIRIM
    const payload = {
      userId: user?.id || null,
      jenisCuti,
      tanggalMulai: tanggalMulai,
      tanggalSelesai: tanggalSelesai,
      keterangan,
      totalHari,
      suratDokter: suratDokter, // Berisi file object (mentah) atau null jika bukan cuti sakit
    };

    try {
      await addPengajuanCuti(payload);
      toast.success("Pengajuan cuti berhasil dikirim!");
      refresh();
      onCancel(true);
    } catch (error) {
      console.error(
        error.response?.data?.message || "Gagal mengirim pengajuan.",
      );
      toast.error(error.response?.data?.message || "Gagal mengirim pengajuan.");
    } finally {
      setIsLoading(false);
    }
  };

  // Cek apakah kondisi melanggar aturan durasi maksimal
  const isOverLimit =
    (jenisCuti === "Tahunan" && totalHari > 12) ||
    (jenisCuti === "Sakit" && totalHari > 14) ||
    (jenisCuti === "Melahirkan" && totalHari > 90) ||
    (jenisCuti === "Alasan Penting" && totalHari > 22) ||
    (jenisCuti === "Cuti Besar" && totalHari > 66);

  // Cek apakah wajib upload surat sakit tapi file masih kosong
  const isFileRequiredButEmpty =
    jenisCuti === "Sakit" && totalHari > 1 && !suratDokter;

  return (
    <div className="bg-white rounded-3xl p-6 shadow-xl animate-fadeIn border border-gray-100 max-w-full overflow-hidden">
      {/* HEADER FORM */}
      <div className="flex items-center gap-3 mb-6">
        <button
          type="button"
          onClick={onCancel}
          className="p-2 hover:bg-gray-100 rounded-full transition text-gray-600"
        >
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-lg font-bold text-gray-800">
          Form Pengajuan Cuti Baru
        </h2>
      </div>

      {/* FORM FIELDS */}
      <form onSubmit={handleSubmitAction} className="space-y-5">
        {/* JENIS CUTI */}
        <div>
          <label className="text-sm font-semibold text-gray-600 block mb-1">
            Jenis Cuti
          </label>
          <select
            value={jenisCuti}
            onChange={(e) => {
              const selectedValue = e.target.value;
              setJenisCuti(selectedValue);

              if (selectedValue !== "Sakit") {
                handleRemoveFile();
              }

              setDateRange([
                {
                  startDate: new Date(),
                  endDate: new Date(),
                  key: "selection",
                },
              ]);
            }}
            required
            className="w-full px-4 py-3 rounded-xl border bg-white outline-none focus:ring-2 focus:ring-red-500 text-sm shadow-sm"
          >
            <option value="Tahunan">Cuti Tahunan (Maks. 12 Hari Kerja)</option>
            <option value="Sakit">Cuti Sakit (Maks. 14 Hari Kerja)</option>
            <option value="Alasan Penting">
              Cuti Alasan Penting (Maks. 1 Bulan / 22 Hari Kerja)
            </option>
            <option value="Cuti Besar">
              Cuti Besar (Maks. 3 Bulan / 66 Hari Kerja)
            </option>
            <option value="Melahirkan">
              Cuti Melahirkan (Maks. 90 Hari Kerja)
            </option>
          </select>
        </div>

        {/* BOX PREVIEW TANGGAL */}
        <div
          className={`rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 border ${
            isOverLimit
              ? "bg-amber-50 border-amber-200"
              : "bg-red-50 border-red-100"
          }`}
        >
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div
              className={`text-white p-2.5 rounded-xl ${isOverLimit ? "bg-amber-500" : "bg-red-600"}`}
            >
              <CalendarDays size={20} />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">
                Durasi Kalender
              </p>
              <p className="text-sm font-bold text-gray-800">
                {format(dateRange[0].startDate, "dd MMM yyyy", {
                  locale: idLocale,
                })}
                <span className="text-red-500 mx-2">➔</span>
                {format(dateRange[0].endDate, "dd MMM yyyy", {
                  locale: idLocale,
                })}
              </p>
            </div>
          </div>
          <div className="text-center sm:text-right w-full sm:w-auto bg-white sm:bg-transparent py-1 rounded-xl shadow-sm sm:shadow-none">
            <span className="text-xs text-gray-500 block font-medium">
              Total Hari Kerja
            </span>
            <span
              className={`text-base font-extrabold ${isOverLimit ? "text-amber-600" : "text-red-600"}`}
            >
              {totalHari} Hari
            </span>
          </div>
        </div>

        {/* NOTIFIKASI VALIDASI REAL-TIME */}
        {isOverLimit && (
          <p className="text-xs font-semibold text-amber-600 bg-amber-50 p-3 rounded-xl border border-amber-100 animate-pulse">
            ⚠️ Perhatian: Durasi ({totalHari} hari kerja) melewati batas
            maksimal ketentuan Cuti {jenisCuti}. Sistem akan menolak pengajuan
            ini.
          </p>
        )}

        {jenisCuti === "Sakit" && totalHari > 1 && (
          <p
            className={`text-xs font-semibold p-3 rounded-xl border ${
              suratDokter
                ? "text-green-600 bg-green-50 border-green-100"
                : "text-red-600 bg-red-50 border-red-100 animate-pulse"
            }`}
          >
            {suratDokter
              ? "✓ Surat keterangan dokter telah terlampir."
              : "⚠️ Wajib Lampiran: Pengajuan cuti sakit lebih dari 1 hari kerja memerlukan unggahan bukti Surat Keterangan Dokter."}
          </p>
        )}

        {/* KALENDER RANGE PICKER */}
        {/* 1. INPUT DISPLAY CUSTOM */}
        <div className="flex items-center justify-center gap-3 bg-white border border-gray-200 rounded-2xl p-3.5 shadow-sm mb-4">
          <div className="flex-1 text-center px-3 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm font-semibold text-gray-700">
            <span className="text-[10px] uppercase text-gray-400 block font-medium mb-0.5">
              Mulai
            </span>
            {format(dateRange[0].startDate, "dd MMM yyyy", {
              locale: idLocale,
            })}
          </div>

          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1 bg-gray-100 py-1 rounded-md text-[10px]">
            s/d
          </span>

          <div className="flex-1 text-center px-3 py-2.5 bg-gray-50 border border-gray-100 rounded-xl text-sm font-semibold text-gray-700">
            <span className="text-[10px] uppercase text-gray-400 block font-medium mb-0.5">
              Selesai
            </span>
            {format(dateRange[0].endDate, "dd MMM yyyy", { locale: idLocale })}
          </div>
        </div>

        {/* 2. KALENDER */}
        <div
          className="
            border border-gray-100 rounded-2xl p-4 bg-gray-50 shadow-inner w-full
            /* FORCE FULL WIDTH UNTUK ELEMEN INTERNAL KALENDER */
            [&_.rdrCalendarWrapper]:w-full
            [&_.rdrMonthWrapper]:w-full
            [&_.rdrMonth]:w-full
          "
        >
          <DateRange
            editableDateInputs={false}
            showDateDisplay={false}
            onChange={(item) => setDateRange([item.selection])}
            moveRangeOnFirstSelection={false}
            ranges={dateRange}
            months={1}
            direction="horizontal"
            locale={idLocale}
            rangeColors={isOverLimit ? ["#d97706"] : ["#dc2626"]}
            minDate={new Date()}
            className="text-sm font-medium bg-transparent w-full"
          />
        </div>

        {/* FORM UPLOAD SURAT DOKTER */}
        {jenisCuti === "Sakit" && (
          <div className="animate-fadeIn">
            <label className="text-sm font-semibold text-gray-600 block mb-1">
              Surat Keterangan Dokter{" "}
              {totalHari > 1 && <span className="text-red-500">*Wajib</span>}
            </label>

            {!suratDokterPreview ? (
              <label
                className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition ${
                  isFileRequiredButEmpty
                    ? "border-red-300 bg-red-50/30 hover:bg-red-50"
                    : "border-gray-300 bg-gray-50 hover:bg-gray-100"
                }`}
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                  <Upload
                    size={24}
                    className={`mb-2 ${isFileRequiredButEmpty ? "text-red-400" : "text-gray-400"}`}
                  />
                  <p className="text-xs font-semibold text-gray-500">
                    Klik untuk unggah Surat Dokter
                  </p>
                  <p className="text-[10px] text-gray-400 mt-1">
                    Format: PDF, JPG, PNG (Maks. 2MB)
                  </p>
                </div>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            ) : (
              <div className="flex items-center justify-between p-4 border border-green-200 bg-green-50/50 rounded-xl">
                <div className="flex items-center gap-2 text-green-700 truncate">
                  <FileText size={20} className="shrink-0" />
                  <span className="text-xs font-semibold truncate">
                    {suratDokterPreview}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="p-1 text-gray-400 hover:text-red-500 transition"
                >
                  <X size={18} />
                </button>
              </div>
            )}
          </div>
        )}

        {/* KETERANGAN ALASAN */}
        <div>
          <label className="text-sm font-semibold text-gray-600 block mb-1">
            Keterangan / Alasan
          </label>
          <textarea
            value={keterangan}
            onChange={(e) => setKeterangan(e.target.value)}
            required
            placeholder="Tuliskan alasan keperluan cuti..."
            className="w-full px-4 py-3 rounded-xl border outline-none focus:ring-2 focus:ring-red-500 text-sm h-24 resize-none shadow-sm"
          />
        </div>

        {/* TOMBOL AKSI */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold transition"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold transition shadow-md"
          >
            {isLoading ? "Loading..." : "Ajukan Cuti"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FormAjukanCuti;
