export function toggleDropdown(elementId, event, loggedIn){
    //finds the dropdown on the page, if it has the show class it closes the dropdowns, if not it adds show
    event.stopPropagation();

    const element = document.getElementById(elementId);

    if(element.classList.contains("show")){
        return;
    }

    if(elementId != undefined && (loggedIn == undefined || loggedIn == true)){
        element.classList.toggle("show");
    }
}

export function enterKeySubmit(event, method){    
    if(event.key == "Enter"){
        event.preventDefault();
        method();
    }
}

export function autoResizeTextarea(textarea){
    if(!textarea.classList.contains("textarea-expand")){
        return;
    }

    textarea.style.height = textarea.scrollHeight + "px";
}

export function toggleCardBody(div){
    if(!div || !div.classList.contains("card-body")){
        return;
    }

    div.classList.toggle("expanded");
}