import React, { createContext, useContext, useState } from "react";

const MessagesContext = createContext();

export function ProveedorMensajesContexto( {children}){
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [loadingMessage, setLoadingMessage] = useState("");

    function resetMessages(){
        setErrorMessage("");
        setSuccessMessage("");
        setLoadingMessage("");
    }

    return(
        <MessagesContext.Provider value={{
            errorMessage, successMessage, loadingMessage,
            setErrorMessage, setSuccessMessage, setLoadingMessage,
            resetMessages,
        }}>

            {children}

        </MessagesContext.Provider>
    )
}

export function useMessagesContext(){
    const context = useContext(MessagesContext);
    if (!context){
        throw new Error("useUserContext must be within a UserContextProvider")
    }

    return context;
}