import React, { createContext, useContext, useState } from "react";

const MessagesContext = createContext();

export function MessagesContextProvider( {children}){
    const [mensajeError, setMensajeError] = useState("");
    const [mensajeExito, setMensajeExito] = useState("");
    const [mensajeCarga, setMensajeCarga] = useState("");

    function resetMessages(){
        setMensajeError("");
        setMensajeExito("");
        setMensajeCarga("");
    }

    return(
        <MessagesContext.Provider value={{
            mensajeError, mensajeExito, mensajeCarga,
            setMensajeError, setMensajeExito, setMensajeCarga,
            resetMessages,
        }}>

            {children}

        </MessagesContext.Provider>
    )
}

export function useContextoMensajes(){
    const context = useContext(MessagesContext);
    if (!context){
        throw new Error("useUserContext must be within a UserContextProvider")
    }

    return context;
}