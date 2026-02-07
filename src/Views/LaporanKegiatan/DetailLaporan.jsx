import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { GetlaporanById } from "../../service/Laporan/Laporan.services";
import { toast } from "sonner";
import useCheckLogin from "../../State/useLogin";
import Loading from "../../components/Loading";
import DOMPurify from "dompurify";
import { FaChevronLeft } from "react-icons/fa";

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

  // format tanggal ke: Hari, 7 Februari 2026
  const formattedDate = new Date(data.tanggal).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <>
      <div className="flex  z-20 w-full items-center justify-start gap-2  p-4 bg-red-600 text-white">
        <FaChevronLeft onClick={() => navigate("/laporan-harian")} />
        <span className="ml-2 text-lg font-bold ">Detail Laporan</span>
      </div>
      <div className="min-h-screen bg-gray-50 p-4 flex justify-center">
        <div className="w-full space-y-6">
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-gray-800">{data.judul}</h1>
            <p className="text-sm text-gray-500">{formattedDate}</p>
          </div>

          <hr />

          {/* Content */}
          <div
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: safeDescription }}
          />
        </div>
      </div>
    </>
  );
};

export default DetailLaporan;
