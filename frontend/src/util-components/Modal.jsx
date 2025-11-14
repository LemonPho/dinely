import React from "react";
import { useOpenersContext } from "../application-context/openers-context.jsx";

export default function Modal({ isOpen, children }){
    if(!isOpen) return null;

    const { closeModal } = useOpenersContext();

    return <>
        <div id="background-blur" className="overlay" onClick={(e) => {e.stopPropagation(); closeModal();}}></div>
        {children}
    </>;
}
