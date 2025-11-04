export async function submitLogin(isUsername, primaryKey, password){
    let response = {
        error: false,
        status: 0,
    }

    try {
        let csrfTokenStatus = await loadCsrfToken();
        if(csrfTokenStatus.error){
            response.error = true;
            return response;
        }

        const apiResponse = await fetch(`${baseUrl}/authentication/login/`, {
            method: "POST",
            credentials: "include",
            headers: {
                "X-CSRF-TOKEN": csrfTokenStatus.token,
                "Content-type": "application/json",
            },
            body: JSON.stringify({
                IsUsername: isUsername,
                LoginKey: primaryKey,
                Password: password,
            }),
        });

        response.status = apiResponse.status;
        response.error = apiResponse.status === 500;
    } catch(error) {
        response.error = true;
    }

    return response;
}

export async function getCsrfToken(){
    let response = {
        error: false,
        csrfToken: "",
        status: null
    };

    try{
        const apiResponse = await fetch("http://localhost:8000/api/csrf/", {
            credentials: "include"
        });
        const apiResult = apiResponse.status === 200 ? await apiResponse.json() : false;

        response.error = apiResponse.status === 500 ? apiResponse : false;
        response.csrfToken = apiResponse.status === 200 ? apiResult : false;
        response.status = apiResponse.status;
    } catch(error){
        response.error = error;
    }

    return response;
}