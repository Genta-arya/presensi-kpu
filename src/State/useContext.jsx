import { createContext, useContext, useEffect, useState } from "react";
import useCheckLogin from "./useLogin"; 

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const { user, isLoading, checkSession } = useCheckLogin(); 
  const [selectedUser, setSelectedUser] = useState(null);


  useEffect(() => {
    if (user) setSelectedUser(user);
  }, [user]);

  return (
    <UserContext.Provider
      value={{
        selectedUser,
        setSelectedUser, 
        isLoading,
        checkSession,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => useContext(UserContext);
