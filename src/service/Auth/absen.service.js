import axiosInstance from "../axiosInstance";

export const createAbsen = async (data) => {
  try {
    const response = await axiosInstance.post("/absen", {
      ...data,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateAbsenPulang = async (data) => {
  try {
    const response = await axiosInstance.post("/absen/pulang", {
      ...data,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getAllAbsensi = async ({ status, month, year }) => {
  try {
    const response = await axiosInstance.get("/absen", {
      params: {
        status, // Tambahkan status di sini ("active" atau "inactive")
        month,
        year,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getAbsenByUserId = async (userId, month, year) => {
  try {
    // Menambahkan query parameters ?month=...&year=... jika parameter dikirimkan
    const response = await axiosInstance.get(`/absen/${userId}`, {
      params: {
        month,
        year,
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateStatusAbsensi = async (data) => {
  try {
    const response = await axiosInstance.post(`/absen/update`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const addPengajuanCuti = async (data) => {
  try {
    const response = await axiosInstance.post(`/absen/pengajuan-cuti`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getPengajuanCutiSingle = async (id, filterTahun) => {
  try {
    const response = await axiosInstance.get(
      `/absen/pengajuan-cuti/${id}?tahun=${filterTahun}`,
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};
export const getPengajuanCutiKasubagSingle = async (id, filterTahun) => {
  try {
    const response = await axiosInstance.get(
      `/absen/kasubag/pengajuan-cuti/${id}?tahun=${filterTahun}`,
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getRiwayatCuti = async (id, filterTahun) => {
  try {
    const response = await axiosInstance.get(
      `/absen/sekretaris/pengajuan-cuti/${id}?tahun=${filterTahun}`,
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateStatusCuti = async (id, data) => {
  try {
    const response = await axiosInstance.post(
      `/absen/update-pengajuan-cuti/${id}`,
      data,
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const cancelCuti = async (id, data) => {
  try {
    const response = await axiosInstance.post(
      `/absen/cancel-pengajuan-cuti/${id}`,
      data,
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};
