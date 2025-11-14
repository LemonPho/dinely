import React from "react";

export default function Dropdown({ isOpen, children }){
    if(!isOpen) return null;

    return <>
        {children}
    </>;
}
