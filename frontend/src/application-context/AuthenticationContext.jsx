import React, { createContext, useEffect, useState, useContext } from "react";
import { getCsrfToken } from "../components/fetch/Authentication";
import { useMessagesContext } from "./MessagesContext";

export const AuthenticationContext = createContext();

export function AuthenticationProvider({ children }) {

    const { resetMessages, setLoadingMessage, setErrorMessage } = useMessagesContext();

    const [loading, setLoading] = useState(false);

    async function login() {
        if(loading){
            return;
        }

        setLoading(true);
        resetMessages();
        setLoadingMessage("Loading...");

        //api call

        resetMessages();
        setLoading(false);
    }

    async function register() {
        if(loading){
            return;
        }

        setLoading(true);
        resetMessages();
        setLoadingMessage("Loading...");

        //api call

        resetMessages();
        setLoading(false);
    }

    useEffect(() => {
        async function fetchData() {
            await getCsrfToken();
        }
        fetchData();
    }, []);

    return (
        <AuthenticationContext.Provider value={{}}>
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