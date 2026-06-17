import axios from "axios";
import axiosInstance from "../axiosInstance";

export const HandleLogin = async (data) => {
  try {
    const response = await axiosInstance.post("/auth/verifikasi", {
      ...data,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};
export const resetPassword = async (data) => {
  try {
    const response = await axiosInstance.post("/auth/reset-password", {
      ...data,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};
export const HandleLoginPage = async (data) => {
  try {
    const response = await axiosInstance.post("/auth/login", { ...data });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const HandleSession = async (data) => {
  try {
    const response = await axiosInstance.post("/auth/session", {
      ...data,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const HandleVerifyMFA = async (data) => {
  try {
    const response = await axiosInstance.post("/auth/mfa/verify", {
      ...data,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const GetQRForMFASetup = async (userId) => {
  try {
    const response = await axiosInstance.get(`/auth/mfa/setup/${userId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const HandlePostMFASetup = async (data) => {
  try {
    const response = await axiosInstance.post("/auth/mfa/verify-setup", {
      ...data,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const ResetMFA = async (userId) => {
  try {
    const response = await axiosInstance.post(`/auth/mfa/reset`, {
      nip: userId.nip,
      password: userId.password,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const UpdateSingleUser = async (id, data) => {
  try {
    const response = await axiosInstance.post(`/auth/update-user/${id}`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};


export const UploadImage = async (file) => {
  console.log(file);
  try {
    const response = await axios.post(
      "https://bucket.mgentaarya.my.id/uploads.php",
      { file: file },
      {
        headers: {
          "Content-Type": "multipart/form-data",
          genta: "Genta@456",
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateAvatar = async (id, data) => {
  try {
    const response = await axiosInstance.post(`/auth/update-avatar/${id}`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateProfil = async (id, data) => {
  try {
    const response = await axiosInstance.post(`/auth/update-profil/${id}`, data);
    return response.data;
  } catch (error) {
    throw error;
  }
  
}
