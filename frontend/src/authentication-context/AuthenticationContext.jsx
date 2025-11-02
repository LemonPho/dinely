import React, { createContext, useEffect, useState } from "react";
import { getCsrfToken } from "./fetch";

export const AuthenticationContext = createContext(null);

export function AuthenticationProvider({ children }) {

  async function retrieveCsrfToken(){
    const tokenResponse = await getCsrfToken();
  }

  useEffect(() => {
    async function fetchData(){
        await retrieveCsrfToken();
    }
    fetchData();
  }, []);

  return (
    <AuthenticationContext.Provider value={{    }}>
      {children}
    </AuthenticationContext.Provider>
  );
}