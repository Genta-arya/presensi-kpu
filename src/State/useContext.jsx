import { createContext, useContext, useEffect, useState } from "react";
import useCheckLogin from "./useLogin"; // hook lo yang ngecek session

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const { user, isLoading, checkSession } = useCheckLogin(); // ambil data user dari hook
  const [selectedUser, setSelectedUser] = useState(null);

  // update selectedUser otomatis kalau user berhasil login
  useEffect(() => {
    if (user) setSelectedUser(user);
  }, [user]);

  return (
    <UserContext.Provider
      value={{
        selectedUser, // user yang bisa diakses semua komponen
        setSelectedUser, // kalau mau diubah dari komponen lain
        isLoading,
        checkSession,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => useContext(UserContext);
