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