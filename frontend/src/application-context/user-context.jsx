import { createContext, useContext, useState, useEffect } from "react";
import { getCurrentUser } from "../fetch/authentication";

const UserContext = createContext();

export function UserContextProvider({ children }) {
  const [user, setUser] = useState(undefined);
  const [userLoading, setUserLoading] = useState(false);

  async function retrieveCurrentUser() {
    setUserLoading(true);
    const userResponse = await getCurrentUser();
    setUser(userResponse.user);
    setUserLoading(false);
  }

  useEffect(() => {
    async function fetchData() {
      await retrieveCurrentUser();
    }

    fetchData();
  }, []);

  return (
    <UserContext.Provider value={{
      user, userLoading,
      retrieveCurrentUser,
    }}>

      {children}

    </UserContext.Provider>
  );
}

export function useUserContext() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUserContext must be within a UserContextProvider")
  }

  return context;
}