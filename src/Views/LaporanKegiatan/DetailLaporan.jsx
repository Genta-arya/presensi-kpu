import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { GetlaporanById } from "../../service/Laporan/Laporan.services";
import { toast } from "sonner";
import useCheckLogin from "../../State/useLogin";
import Loading from "../../components/Loading";
import DOMPurify from "dompurify";
import { FaChevronLeft, FaFileWord } from "react-icons/fa";
import { Helmet } from "react-helmet-async";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import { saveAs } from "file-saver";

const DetailLaporan = () => {
  const { id } = useParams();
  const [loading, setLoading] = React.useState(false);
  const [data, setData] = React.useState(null);
  const { user, isLoading } = useCheckLogin();
  const navigate = useNavigate();

  const fetchLaporanDetail = async () => {
    try {
      setLoading(true);
      const response = await GetlaporanById(id);
      setData(response?.data);
    } catch (error) {
      toast.error("Gagal mengambil detail laporan");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (id && isLoading === false) {
      fetchLaporanDetail();
    }
  }, [id, isLoading]);

  if (isLoading || loading) {
    return <Loading />;
  }

  if (!data) {
    return <div className="p-4">Data tidak ditemukan</div>;
  }

  const safeDescription = DOMPurify.sanitize(data.deskripsi || "");

  // Format tanggal ke: Hari, 7 Februari 2026
  const formattedDate = new Date(data.tanggal).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  // Helper untuk membersihkan deskripsi agar list angka & bullet tetap rapi
  const getCleanDescription = () => {
    return data.deskripsi
      ? data.deskripsi
          .replace(/<\/(ol|ul)>/g, "\n")
          .replace(/<ol[^>]*>([\s\S]*?)<\/ol>/gi, (match) => {
            let index = 1;
            return match.replace(
              /<li>([\s\S]*?)<\/li>/gi,
              () => `${index++}. $1\n`,
            );
          })
          .replace(/<ul>[\s\S]*?<\/ul>/gi, (match) => {
            return match.replace(/<li>([\s\S]*?)<\/li>/gi, "• $1\n");
          })
          .replace(/<li>/g, "• ")
          .replace(/<\/li>/g, "\n")
          .replace(/<\/p>/g, "\n")
          .replace(/<br\s*[\/]?>/gi, "\n")
          .replace(/<[^>]*>?/gm, "")
          .replace(/&nbsp;/g, " ")
          .trim()
      : "";
  };

  // --- FUNGSI EXPORT WORD MENGGUNAKAN TEMPLATE .DOCX ---
  const handleExportWord = async () => {
    try {
      const response = await fetch("/template_laporan_harian.docx");

      if (!response.ok) {
        throw new Error(
          "File template_laporan_harian.docx tidak ditemukan di folder public.",
        );
      }

      const templateArrayBuffer = await response.arrayBuffer();

      const zip = new PizZip(templateArrayBuffer);
      const doc = new Docxtemplater(zip, {
        paragraphLoop: true,
        linebreaks: true,
        delimiters: {
          start: "<<",
          end: ">>",
        },
      });

      const subbagianNama =
        data.user?.strukturUnit?.[0]?.unitKerja?.nama ||
        "Teknis Penyelenggaraan Pemilu dan Hukum";

      const cleanDescription = getCleanDescription();

      doc.render({
        nama: user?.name || data.user?.name || "-",
        nip: user?.nip || data.user?.nip || "-",
        subbag: subbagianNama,
        tanggal: formattedDate,
        isi: cleanDescription,
      });

      const out = doc.getZip().generate({
        type: "blob",
        mimeType:
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });

      saveAs(out, `Laporan_${user?.name || "Kegiatan"}.docx`);
      toast.success("Berhasil mengexport laporan");
    } catch (error) {
      console.error("Error Export Template:", error);
      toast.error(`Gagal memproses template: ${error.message}`);
    }
  };

  return (
    <>
      <Helmet>
        <title>Detail Laporan - {data.judul}</title>
      </Helmet>

      <style>{`
        .content-editor ol {
          list-style-type: decimal !important;
          padding-left: 1.5rem !important;
          margin-top: 0.5rem;
          margin-bottom: 0.5rem;
        }

        .content-editor ul {
          list-style-type: disc !important;
          padding-left: 1.5rem !important;
          margin-top: 0.5rem;
          margin-bottom: 0.5rem;
        }

        .content-editor li {
          list-style-position: outside !important;
          margin-bottom: 0.25rem;
        }

        .content-editor img, 
        .content-editor table, 
        .content-editor video {
          max-width: 100% !important;
          height: auto !important;
        }
      `}</style>

      {/* Header Navigasi Sederhana */}
      <div className="flex z-20 w-full items-center justify-between p-4 bg-red-600 text-white shadow">
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => navigate("/laporan-harian")}
        >
          <FaChevronLeft />
          <span className="ml-2 text-lg font-bold">Detail Laporan</span>
        </div>
      </div>

      {/* Konten Utama */}
      <div className="min-h-screen bg-gray-100 p-4 sm:p-8 flex justify-center pb-24">
        <div className="w-full max-w-3xl bg-white shadow-md rounded-lg p-6 sm:p-12 space-y-6 overflow-hidden">
          <div className="space-y-2 border-b pb-4 break-words">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
              {data.judul}
            </h1>
            <p className="text-sm text-gray-500">{formattedDate}</p>
          </div>

          <div
            className="content-editor prose max-w-none text-gray-700 leading-relaxed break-words overflow-x-auto"
            dangerouslySetInnerHTML={{ __html: safeDescription }}
          />
        </div>
      </div>

      {/* Floating Action Button (FAB) untuk Export Word */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
        <button
          onClick={handleExportWord}
          className="flex items-center justify-center gap-2 bg-blue-600 text-white w-12 h-12 sm:w-auto sm:h-auto sm:px-4 sm:py-3 rounded-full sm:rounded-lg shadow-lg hover:bg-blue-700 transition transform hover:scale-105 cursor-pointer"
          title="Export ke Word (Template)"
        >
          <FaFileWord className="text-lg" />
          <span className="hidden sm:inline font-semibold text-sm">
            Export Word
          </span>
        </button>
      </div>
    </>
  );
};

export default DetailLaporan;