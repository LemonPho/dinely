import React, { createContext, useEffect, useState, useContext } from "react";
import { getCsrfToken, enviarLogin, submitRegistration, enviarLogout } from "../fetch/authentication";
import { useMessagesContext } from "./messages-context";

export const AuthenticationContext = createContext();

export function AuthenticationProvider({ children }) {

  const { resetMessages, setLoadingMessage, setErrorMessage, setSuccessMessage } = useMessagesContext();

  const [loading, setLoading] = useState(false);

  async function login(formData, navigate) {
    if (loading) {
      return;
    }

    setLoading(true);
    resetMessages();
    setLoadingMessage("Loading...");

    const loginResponse = await enviarLogin(formData);

    setLoadingMessage("");
    setLoading(false);

    if (loginResponse.error) {
      setErrorMessage("Error ingresando");
      return;
    }

    if (loginResponse.status == 400) {
      setErrorMessage("Credenciales invalidas");
      return;
    }

    if (loginResponse.status === 403) {
      setErrorMessage("Tu cuenta no esta activa");
      return;
    }

    if (loginResponse.status === 200) {
      setLoadingMessage("");
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
    setLoadingMessage("Loading...");

    const registerResponse = await submitRegistration(registerInput);

    if (registerResponse.error) {
      setErrorMessage("An error ocurred while submiting the account");
      setLoading(false);
      setLoadingMessage("");
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
      setErrorMessage(message);
      setLoading(false);
      setLoadingMessage("");
      return;
    }

    if (registerResponse.status === 200) {
      setSuccessMessage("Account created, check your email to finalize the creation");
      setLoading(false);
      setLoadingMessage("");
      return;
    }

    setErrorMessage("There was an error while submiting the account information");
    setLoading(false);
    setLoadingMessage("");
    return;
  }

  async function logout(navigate) {
    if (loading) {
      return;
    }

    setLoading(true);
    resetMessages();
    setLoadingMessage("Cerrando sesión...");

    const logoutResponse = await enviarLogout();

    setLoadingMessage("");
    setLoading(false);

    if (logoutResponse.error) {
      setErrorMessage("Error al cerrar sesión");
      return;
    }

    if (logoutResponse.status === 200 || logoutResponse.status === 204) {
      navigate("/");
      window.location.reload();
      return;
    }
  }

  useEffect(() => {
    async function fetchData() {
      await getCsrfToken();
    }
    fetchData();
  }, []);

  return (
    <AuthenticationContext.Provider value={{ login, register, logout, loading }}>
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