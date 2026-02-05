import { useEffect, useState, useCallback } from "react";
import { HandleSession } from "../service/Auth/auth.service";
import { toast } from "sonner";

const useCheckLogin = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkSession = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Token tidak ditemukan");

      const res = await HandleSession({ token });
      if (res.data.status_login) {
        setUser(res.data);
      } else {
        setUser(null);
        localStorage.removeItem("token");
        toast.error("Sesi berakhir, silakan login kembali");
        window.location.href = "/login"; // redirect manual
      }
    } catch (err) {
      setUser(null);
      localStorage.removeItem("token");
      toast.error("Terjadi kesalahan, silakan login kembali");
      window.location.href = "/login"; // redirect manual
    } finally {
      setIsLoading(false);
    }
  }, []); 

  useEffect(() => {
    checkSession();
  }, []);

  return { user, isLoading, checkSession };
};

export default useCheckLogin;
