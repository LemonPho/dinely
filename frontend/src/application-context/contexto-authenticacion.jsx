import React, { createContext, useEffect, useState, useContext } from "react";
import { getCsrfToken, submitLogin, submitRegistration } from "../fetch/authentication";
import { useContextoMensajes } from "./contexto-mensajes";

export const AuthenticationContext = createContext();

export function AuthenticationProvider({ children }) {

  const { resetMessages, setMensajeCarga, setMensajeError, setMensajeExito } = useContextoMensajes();

  const [loading, setLoading] = useState(false);

  async function login(loginInput, retrieveCurrentUser, navigate) {
    if (loading) {
      return;
    }

    setLoading(true);
    resetMessages();
    setMensajeCarga("Loading...");

    const loginResponse = await submitLogin(loginInput);

    setMensajeCarga("");
    setLoading(false);

    if (loginResponse.error) {
      setMensajeError("Error logging in");
      return;
    }

    if (loginResponse.status == 400) {
      setMensajeError("Invalid credentials");
      return;
    }

    if (loginResponse.status === 403) {
      setMensajeError("Your account is not active");
      return;
    }

    if (loginResponse.status === 200) {
      setMensajeCarga("");
      setLoading(false);
      navigate("/");
      return;
    }
  }

  async function register(registerInput, setEmailInvalid, setPasswordInvalid) {
    if (loading) {
      return;
    }

    setLoading(true);
    resetMessages();
    setEmailInvalid(false);
    setPasswordInvalid(false);
    setMensajeCarga("Loading...");

    const registerResponse = await submitRegistration(registerInput);

    if (registerResponse.error) {
      setMensajeError("An error ocurred while submiting the account");
      setLoading(false);
      setMensajeCarga("");
      return;
    }

    if (registerResponse.status === 400) {
      let message = registerResponse.usernameUnique ? "" : "Username is already taken\n";
      message += registerResponse.usernameValid ? "" : "Username isn't valid, be sure to use only numbers and letters\n";
      message += registerResponse.emailUnique ? "" : "Email is already in use\n";
      message += registerResponse.emailValid ? "" : "Email isn't valid\n";
      message += registerResponse.passwordsMatch ? "" : "Passwords don't match\n";
      message += registerResponse.passwordValid ? "" : "Passwords need at least 8 characters and can't be 'simple'\n";
      message += registerResponse.invalidData ? "Make sure the password is not simple (atleast 8 characters in length with 2 numbers)\n" : "";

      if (!registerResponse.emailUnique || !registerResponse.emailValid) {
        setEmailInvalid(true);
      }

      if (!registerResponse.passwordValid || !registerResponse.passwordsMatch) {
        setPasswordInvalid(true);
      }

      if (registerResponse.usernameUnique && registerResponse.usernameValid && registerResponse.emailUnique && registerResponse.emailValid && registerResponse.passwordValid && registerResponse.passwordsMatch && registerResponse.invalidData) {
        setPasswordInvalid(true);
      }
      setMensajeError(message);
      setLoading(false);
      setMensajeCarga("");
      return;
    }

    if (registerResponse.status === 200) {
      setMensajeExito("Account created, check your email to finalize the creation");
      setLoading(false);
      setMensajeCarga("");
      return;
    }

    setMensajeError("There was an error while submiting the account information");
    setLoading(false);
    setMensajeCarga("");
    return;
  }

  useEffect(() => {
    async function fetchData() {
      await getCsrfToken();
    }
    fetchData();
  }, []);

  return (
    <AuthenticationContext.Provider value={{ login, register, loading }}>
      {children}
    </AuthenticationContext.Provider>
  );
}

export function useAuthenticationContext() {
  const context = useContext(AuthenticationContext);
  if (!context) {
    throw new Error("useUserContext must be within a UserContextProvider")
  }

  return context;
}