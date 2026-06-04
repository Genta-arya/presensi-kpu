import React, { useEffect, useMemo, useState } from "react";
import Select from "react-select";
import { ArrowLeft, UserPlus, Trash2, Users } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getSubbagianById,
  addUsersToSubbagian,
  assignSubbagianToJabatan,
  unAssingn,
} from "../../../service/Subbagian/Subbagian.services";
import { listUser } from "../../../service/User/user.services";
import Loading from "../../../components/Loading";
import { toast } from "sonner";

const DetailUnitKerja = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoadedUsers, setHasLoadedUsers] = useState(false);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const resDetail = await getSubbagianById(id);
      setData(resDetail.data);
    } catch (error) {
      toast.error("Gagal memuat detail subbagian");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  // SINKRONISASI FILTER DROPDOWN: Hanya Sekretaris yang boleh ganda subbagian
  const handleMenuOpen = async () => {
    if (hasLoadedUsers) return;
    try {
      const response = await listUser();

      // 1. Ambil list ID user yang saat ini SUDAH berada di dalam subbagian aktif ini
      const currentSubbagUserIds =
        data?.strukturUnits?.map((s) => s.userId) || [];

      const filtered = (response.data || []).filter((user) => {
        // Jika user sudah ada di subbagian yang SEDANG DIBUKA saat ini, sembunyikan (agar tidak double add)
        if (currentSubbagUserIds.includes(user.id)) return false;

        // Cek nama jabatan atau role user
        const namaJabatan = (
          user.jabatan?.nama_jabatan ||
          user.jabatan?.nama ||
          ""
        ).toLowerCase();
        const isSekretaris =
          namaJabatan.includes("sekretaris") || user.role === "SEKRETARIS";

        // Jika dia SEKRETARIS, lolos filter (boleh masuk ke subbagian mana pun tanpa batas)
        if (isSekretaris) return true;

        // Jika BUKAN sekretaris, cek apakah dia sudah punya subbagian lain di tabel pivot db
        // Jika array strukturUnit miliknya sudah berisi data (> 0), sembunyikan dari pilihan
        const sudahPunyaSubbagian =
          user.strukturUnit && user.strukturUnit.length > 0;

        return !sudahPunyaSubbagian;
      });

      setAllUsers(filtered.map((u) => ({ value: u.id, label: u.name })));
      setHasLoadedUsers(true);
    } catch (error) {
      toast.error("Gagal memuat pegawai");
    }
  };

  const handleAddUser = async () => {
    if (selectedUsers.length === 0)
      return toast.error("Pilih pegawai terlebih dahulu");
    try {
      setIsLoading(true);
      await addUsersToSubbagian(id, {
        userIds: selectedUsers.map((u) => u.value),
      });
      toast.success("Pegawai berhasil ditambahkan ke subbagian");
      setSelectedUsers([]);
      setHasLoadedUsers(false); // Reset list agar dropdown memicu filter ulang
      fetchData();
    } catch (error) {
      toast.error("Gagal menambahkan pegawai");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssignPosisi = async (userId, posisi) => {
    if (!posisi) return toast.error("Silakan pilih jabatan");
    try {
      await assignSubbagianToJabatan(id, { subbagianId: id, userId, posisi });
      toast.success(`Posisi berhasil diperbarui`);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Gagal memperbarui posisi");
    }
  };

  const sortedStrukturUnits = useMemo(() => {
    if (!data?.strukturUnits) return [];

    return [...data.strukturUnits].sort((a, b) => {
      const weight = { KEPALA_DIVISI: 1, KASUBAG: 2, SEKRETARIS: 3, STAFF: 4 };
      const wA = weight[a.posisi] || 5;
      const wB = weight[b.posisi] || 5;
      return wA - wB;
    });
  }, [data]);

  const removeAssign = async (userId) => {
    if (
      window.confirm(
        "Apakah Anda yakin ingin mengeluarkan pegawai ini dari subbagian?",
      )
    ) {
      try {
        await unAssingn(id, { userIds: [userId] }); // Mengirim array userIds (Sudah Sinkron!)
        toast.success("Pegawai berhasil dihapus dari subbagian");
        fetchData();
      } catch (error) {
        toast.error("Gagal menghapus pegawai");
      }
    }
  };

  if (isLoading) return <Loading />;

  return (
    <div className="space-y-6 ">
      {/* HEADER DETAIL */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2.5 hover:bg-slate-100 rounded-xl text-slate-600 transition-colors border border-slate-100"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <span className="text-xs font-bold text-red-600 uppercase tracking-widest bg-red-50 rounded-md">
            Subbagian / Unit Kerja
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-slate-800 mt-1 leading-tight">
            {data?.nama}
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-medium">
            Kode: {data?.kode}
          </p>
        </div>
      </div>

      {/* ASSIGN / ADD USER SECTION */}
      <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-4 items-end">
        <div className="flex-1 w-full">
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Pilih Staff / Pegawai
          </label>
          <Select
            isMulti
            options={allUsers}
            value={selectedUsers}
            onChange={setSelectedUsers}
            onMenuOpen={handleMenuOpen}
            placeholder="Cari dan pilih nama staf..."
            className="w-full text-sm"
            styles={{
              control: (base) => ({
                ...base,
                borderRadius: "12px",
                padding: "3px",
                border: "1px solid #E2E8F0",
                boxShadow: "none",
                backgroundColor: "#F9FAFB",
                "&:hover": { border: "1px solid #CBD5E1" },
              }),
            }}
          />
        </div>
        <button
          onClick={handleAddUser}
          className="w-full sm:w-auto bg-red-600 text-white px-6 py-3.5 rounded-xl font-bold hover:bg-red-700 transition active:scale-95 text-sm flex items-center justify-center gap-2 whitespace-nowrap shadow-md shadow-red-600/10"
        >
          <UserPlus size={16} /> Tambah Anggota
        </button>
      </div>

      {/* LIST DATA PEGAWAI */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
        <h3 className="font-bold text-slate-800 text-base mb-4 flex items-center gap-2 border-b border-slate-50 pb-3">
          <Users size={18} className="text-red-500" /> Daftar Pegawai Terdaftar
          ({sortedStrukturUnits.length})
        </h3>

        {sortedStrukturUnits.length > 0 ? (
          <ul className="space-y-3">
            {sortedStrukturUnits.map((item) => {
              const userObj = item.user;
              if (!userObj) return null;

              return (
                <li
                  key={item.id}
                  className="p-4 bg-slate-50/70 border border-slate-100 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={
                        userObj.avatar ||
                        "https://cdn-icons-png.flaticon.com/512/3135/3135715.png"
                      }
                      alt={userObj.name}
                      className="w-10 h-10 rounded-xl object-cover border bg-white p-0.5"
                    />
                    <div>
                      <span className="font-bold text-slate-800 text-sm block">
                        {userObj.name}
                      </span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[8px] text-slate-400 font-medium">
                         {userObj.id}
                        </span>
                        <span className="text-slate-300">•</span>

                        <span
                          className={`text-[9px] uppercase font-black tracking-wider px-2 py-0.5 rounded-md 
                          ${
                            item.posisi === "KEPALA_DIVISI"
                              ? "bg-blue-50 text-blue-600 border border-blue-100"
                              : item.posisi === "KASUBAG"
                                ? "bg-red-50 text-red-600 border border-red-100"
                                : item.posisi === "SEKRETARIS"
                                  ? "bg-amber-50 text-amber-700 border border-amber-100"
                                  : "bg-slate-200/70 text-slate-600"
                          }`}
                        >
                          {item.posisi
                            .replace("KASUBAG", "KASUBBAG")
                            .replace("_", " ")}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-200/50">
                    <select
                      value={item.posisi}
                      onChange={(e) =>
                        handleAssignPosisi(userObj.id, e.target.value)
                      }
                      className="text-xs border border-slate-200 rounded-lg p-2 bg-white outline-none font-semibold text-slate-700 focus:border-red-500 transition-all"
                    >
                      <option value="KEPALA_DIVISI">Kepala Divisi</option>
                      <option value="KASUBAG">Kasubbag</option>
                      <option value="STAFF">Staff</option>
                      <option value="SEKRETARIS">Sekretaris</option>
                    </select>

                    <button
                      onClick={() => removeAssign(userObj.id)}
                      className="text-slate-400 hover:text-red-600 p-2 hover:bg-red-50 rounded-xl transition-colors shrink-0"
                      title="Keluarkan Pegawai"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <div className="text-center py-10 text-xs text-slate-400 italic">
            Belum ada pegawai yang dimasukkan ke subbagian ini.
          </div>
        )}
      </div>
    </div>
  );
};

export default DetailUnitKerja;
