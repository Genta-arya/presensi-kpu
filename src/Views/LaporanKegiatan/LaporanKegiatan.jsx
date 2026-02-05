import React, { useState } from "react";
import Navigations from "../Navigation";
import { Search, Plus, ArrowLeft } from "lucide-react";
import Editor from "../../components/Editor";

const dummyData = [
  { id: 1, title: "Monitoring Lapangan", date: "2026-02-05" },
  { id: 2, title: "Rapat Koordinasi", date: "2026-02-04" },
  { id: 3, title: "Input Data Kegiatan", date: "2026-02-03" },
];

const LaporanKegiatan = () => {
  const [search, setSearch] = useState("");
  const [date, setDate] = useState("");
  const [showEditor, setShowEditor] = useState(false);
  const [editorContent, setEditorContent] = useState("");

  const filteredData = dummyData.filter((item) => {
    const matchTitle = item.title.toLowerCase().includes(search.toLowerCase());
    const matchDate = date ? item.date === date : true;
    return matchTitle && matchDate;
  });

  // ================= MODE EDITOR =================
  if (showEditor) {
    return (
      <>
        <button
          onClick={() => setShowEditor(false)}
          className="flex bg-red-600 p-4 items-center gap-2 border-b w-full pb-4 text-sm text-white"
        >
          <ArrowLeft size={18} />
          <p>Kembali</p>
        </button>
        <div className="p-4 space-y-4">
          {/* JUDUL */}
          <div className="space-y-1">
            <label className="block text-sm font-semibold text-gray-700">
              Judul Laporan
            </label>
            <input
              type="text"
              placeholder="Masukkan judul laporan..."
              className="w-full px-3 py-2 border rounded-lg text-sm"
            />
          </div>

          {/* TANGGAL */}
          <div className="space-y-1">
            <label className="block text-sm font-semibold text-gray-700">
              Tanggal Kegiatan
            </label>
            <input
              type="date"
              className="w-full px-3 py-2 border rounded-lg text-sm"
            />
          </div>

          {/* ISI */}
          <div className="space-y-1">
            <label className="block text-sm font-semibold text-gray-700">
              Deskripsi Kegiatan
            </label>
            <Editor
              editorContent={editorContent}
              setEditorContent={setEditorContent}
            />
          </div>

          <button className="w-full bg-red-600 text-white py-3 rounded-xl font-semibold">
            Simpan Laporan
          </button>
        </div>
      </>
    );
  }

  // ================= MODE LIST =================
  return (
    <>
      <Navigations title="Laporan Harian" />

      <div className="p-4 space-y-4 pt-20">
        {/* SEARCH */}
        <div className="relative">
          <Search className="absolute left-3 top-3 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Cari laporan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full outline-none pl-10 pr-3 py-2 border rounded-lg text-sm"
          />
        </div>

        {/* FILTER DATE */}
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full border rounded-lg py-2 px-3 text-sm"
        />

        {/* LIST */}
        <div className="space-y-2">
          {filteredData.length === 0 ? (
            <p className="text-center text-gray-400 text-sm">
              Tidak ada laporan
            </p>
          ) : (
            filteredData.map((item) => (
              <div
                key={item.id}
                className="bg-white p-3 rounded-lg shadow flex justify-between items-center"
              >
                <div>
                  <p className="font-semibold text-gray-700 text-sm">
                    {item.title}
                  </p>
                  <p className="text-xs text-gray-400">{item.date}</p>
                </div>
                <span className="text-xs text-indigo-600">Detail →</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* FLOATING ACTION BUTTON */}
      <button
        onClick={() => setShowEditor(true)}
        className="
          fixed bottom-6 right-6
          w-14 h-14 rounded-full
          bg-red-600 text-white
          flex items-center justify-center
          shadow-lg
          hover:shadow-xl
          active:scale-95
          transition
          group
        "
      >
        <Plus size={24} />
        <span
          className="
            absolute right-16
            bg-black text-white text-xs
            px-2 py-1 rounded
            opacity-0 group-hover:opacity-100
            transition
            whitespace-nowrap
          "
        >
          Buat Laporan
        </span>
      </button>
    </>
  );
};

export default LaporanKegiatan;
