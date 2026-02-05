import axios from "axios";

 const axiosInstance = axios.create({
//  baseURL: "http://localhost:8080/api/v1",
  baseURL: "https://api-presensi.kpu-sekadau.my.id/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

export default axiosInstance;
