import React, { useEffect, useState, useRef } from "react";
import useCheckLogin from "../../State/useLogin";
import Loading from "../../components/Loading";
import { ArrowUp, ImageOff, Search, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { FaChevronLeft } from "react-icons/fa";
import { toast } from "sonner";
import BottomNav from "../../components/BottomNav";

const Berita = () => {
  const { isLoading } = useCheckLogin();

  const [loading, setLoading] = useState(false);
  const [berita, setBerita] = useState([]);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [showTop, setShowTop] = useState(false);

  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [type, setType] = useState("terkini");

  const searchRef = useRef(null);
  const navigate = useNavigate();

  const fetchData = async (pageNumber = 1, newsType = type) => {
    try {
      setLoading(true);
      const res = await fetch(
        `https://bucket.mgentaarya.my.id/berita.php?page=${pageNumber}&type=${newsType}`,
      );
      const data = await res.json();

      if (!Array.isArray(data) || data.length === 0) {
        toast.info(
          `Tidak ada berita lagi untuk ditampilkan, halaman hanya tersedia sampai ${pageNumber - 1}`,
        );
        if (pageNumber > 1) setPage((prev) => prev - 1);
        return;
      }

      setBerita(data);
    } catch (error) {
      console.error("Error fetch berita:", error);
      setError("Gagal memuat berita");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(page, type);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [page, type]);

  useEffect(() => {
    const handleScroll = () => {
      setShowTop(window.scrollY > 300);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (showSearch && searchRef.current) {
      searchRef.current.focus();
    }
  }, [showSearch]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const filteredBerita = berita.filter((item) =>
    item.title.toLowerCase().includes(search.toLowerCase()),
  );

  if (isLoading || loading) return <Loading />;
  if (error) return <div className="p-4 text-center text-red-600">{error}</div>;

  return (
    <>
      {/* HEADER */}
      <div className="fixed z-20 w-full bg-red-600 text-white ">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-2">
            {" "}
            <div className="flex items-center gap-2">
              <img
                src="/logo.png"
                alt=""
                className="w-12 rounded-full bg-white p-1"
              />

              {/* hide jika search */}
              {!showSearch && (
                <div>
                  <h1 className="text-base lg:text-lg font-bold">
                    Komisi Pemilihan Umum
                  </h1>
                  <p className="font-bold text-xs lg:text-base">
                    Kabupaten Sekadau
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* SEARCH */}
          <div className="flex items-center gap-2">
            {showSearch ? (
              <>
                <input
                  ref={searchRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari berita..."
                  className="px-3 py-1 rounded-lg text-sm text-gray-800"
                />
                <X
                  size={20}
                  className="cursor-pointer"
                  onClick={() => {
                    setShowSearch(false);
                    setSearch("");
                  }}
                />
              </>
            ) : (
              <Search
                size={22}
                className="cursor-pointer"
                onClick={() => setShowSearch(true)}
              />
            )}
          </div>
        </div>

        {/* FILTER SELECT */}
        <div className="px-4 pb-3">
          <select
            value={type}
            onChange={(e) => {
              setType(e.target.value);
              setPage(1);
            }}
            className="w-full px-3 py-2 rounded-lg text-sm text-gray-800"
          >
            <option value="terkini">Berita Terkini</option>
            <option value="umum">Umum</option>
            <option value="opini">Opini</option>
            <option value="sosialisasi">Sosialisasi</option>
          </select>
        </div>
      </div>

      {/* CONTENT */}
      <div className="p-4 pt-36 space-y-4 pb-28">
        {filteredBerita.length === 0 ? (
          <p className="text-gray-400 text-sm text-center">Tidak ada berita</p>
        ) : (
          <>
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
              {filteredBerita.map((item, i) => (
                <a
                  key={i}
                  href={item.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block bg-white rounded-xl shadow hover:shadow-lg transition overflow-hidden"
                >
                  <div className="relative w-full h-40 bg-gray-100 flex items-center justify-center">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-40 object-cover"
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.nextSibling.style.display = "flex";
                        }}
                      />
                    ) : null}

                    {/* BROKEN IMAGE */}
                    <div className="hidden w-full h-40 items-center justify-center text-gray-400">
                      <ImageOff size={40} />
                    </div>

                    {/* DATE BADGE */}
                    <div
                      className="
    absolute bottom-0 right-0
    bg-red-700 text-white font-bold
    text-[10px] px-2 py-1
    shadow
  "
                    >
                      {item.date}
                    </div>
                  </div>

                  <div className="p-3 space-y-2">
                    <h2 className="font-semibold text-sm text-red-600 line-clamp-2">
                      {item.title}
                    </h2>
                    <p className="text-sm text-gray-600 line-clamp-3">
                      {item.snippet}
                    </p>
                  </div>
                </a>
              ))}
            </div>

            {/* PAGINATION */}
            {!search && (
              <>
                <div className="flex justify-center items-center gap-4 pt-6">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 rounded-lg bg-gray-200 text-sm disabled:opacity-40"
                  >
                    <FaChevronLeft />
                  </button>

                  <span className="text-sm font-semibold">Halaman {page}</span>

                  <button
                    onClick={() => setPage((p) => p + 1)}
                    className="px-4 py-2 rounded-lg bg-gray-200 text-sm"
                  >
                    <FaChevronLeft className="rotate-180" />
                  </button>
                </div>
                {page > 1 && (
                  <p
                    onClick={() => setPage(1)}
                    className="text-center text-sm text-gray-500 pt-4 cursor-pointer hover:text-red-600"
                  >
                    Kembali ke halaman awal
                  </p>
                )}
              </>
            )}
          </>
        )}
      </div>

      {/* SCROLL TO TOP */}
      {showTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-20 right-4 z-50 w-12 h-12 rounded-full bg-red-600 text-white shadow-lg flex items-center justify-center"
        >
          <ArrowUp size={20} />
        </button>
      )}
      <BottomNav />
    </>
  );
};

export default Berita;
