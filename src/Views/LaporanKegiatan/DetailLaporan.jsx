import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { GetlaporanById } from "../../service/Laporan/Laporan.services";
import { toast } from "sonner";
import useCheckLogin from "../../State/useLogin";
import Loading from "../../components/Loading";
import DOMPurify from "dompurify";
import { FaChevronLeft, FaPrint, FaFileWord } from "react-icons/fa";
import { Helmet } from "react-helmet-async";

const DetailLaporan = () => {
  const { id } = useParams();
  const [loading, setLoading] = React.useState(false);
  const [data, setData] = React.useState(null);
  const { isLoading } = useCheckLogin();
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

  // Fungsi Cetak / Simpan ke PDF (Menggunakan Print Bawaan Browser ukuran A4)
  const handlePrintOrPDF = () => {
    window.print();
  };

  // Fungsi Export ke Microsoft Word (.doc format ukuran A4)
  const handleExportWord = () => {
    const header = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head>
        <meta charset='utf-8'>
        <title>${data.judul}</title>
        <style>
          @page WordSection1 {
            size: 21cm 29.7cm; /* Ukuran A4 */
            margin: 2.5cm 2cm 2.5cm 2cm;
            mso-page-orientation: portrait;
          }
          div.WordSection1 {
            page: WordSection1;
          }
          body {
            font-family: 'Times New Roman', Times, serif;
            font-size: 12pt;
            line-height: 1.5;
            color: #000;
          }
          h1 {
            font-size: 18pt;
            font-weight: bold;
            margin-bottom: 5px;
          }
          .date {
            font-size: 11pt;
            color: #555;
            margin-bottom: 20px;
          }
        </style>
      </head>
      <body>
      <div class="WordSection1">
    `;
    
    const footer = `
      </div>
      </body>
      </html>
    `;

    const sourceHTML = header + `<h1>${data.judul}</h1><div class="date">${formattedDate}</div><hr/><br/>` + safeDescription + footer;
    
    const source = 'data:application/vnd.ms-word;charset=utf-8,' + encodeURIComponent(sourceHTML);
    const fileDownload = document.createElement("a");
    document.body.appendChild(fileDownload);
    fileDownload.href = source;
    fileDownload.download = `${data.judul || "Laporan"}.doc`;
    fileDownload.click();
    document.body.removeChild(fileDownload);
    toast.success("Berhasil mengexport ke file Word");
  };

  return (
    <>
      <Helmet>
        <title>Detail Laporan - {data.judul}</title>
      </Helmet>

      {/* CSS Khusus untuk cetak PDF / Print agar otomatis ukuran A4 */}
      <style>{`
        @media print {
          body {
            background: white !important;
          }
          .no-print {
            display: none !important;
          }
          .print-container {
            box-shadow: none !important;
            padding: 0 !important;
            margin: 0 !important;
            width: 100% !important;
          }
          @page {
            size: A4;
            margin: 20mm;
          }
        }
      `}</style>

      {/* Header Navigasi */}
      <div className="flex z-20 w-full items-center justify-between p-4 bg-red-600 text-white no-print">
        <div className="flex items-center gap-2">
          <FaChevronLeft className="cursor-pointer" onClick={() => navigate("/laporan-harian")} />
          <span className="ml-2 text-lg font-bold">Detail Laporan</span>
        </div>
        
        {/* Tombol Aksi Cetak & Export */}
        <div className="flex items-center gap-2">
          <button 
            onClick={handlePrintOrPDF}
            className="flex items-center gap-1 bg-white text-red-600 px-3 py-1.5 rounded text-sm font-semibold hover:bg-gray-100 transition shadow"
            title="Cetak atau Simpan sebagai PDF"
          >
            <FaPrint /> Cetak / PDF
          </button>
          <button 
            onClick={handleExportWord}
            className="flex items-center gap-1 bg-blue-600 text-white px-3 py-1.5 rounded text-sm font-semibold hover:bg-blue-700 transition shadow"
            title="Download ke Microsoft Word"
          >
            <FaFileWord /> Export Word
          </button>
        </div>
      </div>

      {/* Konten Utama (A4 Layout Look) */}
      <div className="min-h-screen bg-gray-100 p-4 sm:p-8 flex justify-center">
        <div className="print-container w-full max-w-3xl bg-white shadow-md rounded-lg p-8 sm:p-12 space-y-6">
          {/* Judul & Tanggal */}
          <div className="space-y-2 border-b pb-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">{data.judul}</h1>
            <p className="text-sm text-gray-500">{formattedDate}</p>
          </div>

          {/* Isi Deskripsi Laporan */}
          <div
            className="prose max-w-none text-gray-700 leading-relaxed"
            dangerouslySetInnerHTML={{ __html: safeDescription }}
          />
        </div>
      </div>
    </>
  );
};


export default DetailLaporan;