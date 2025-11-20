import { getCookie } from "./Authentication";

export async function createUser(formData, creating, editing){
    console.log("starting fetch function");
    let result = {
        error: false,
        status: null,
        name: null,
        email: null,
        user_exists: null,
    };

    try{
        let fetchUrl;
        if(creating){
            fetchUrl = '/api/admin/create-user/';
        } else {
            fetchUrl = '/api/admin/edit-user/';
        }

        const csrftoken = getCookie("csrftoken");
        const apiResponse = await fetch(fetchUrl, {
            method: "POST",
            credentials: "include",
            headers: {
                "X-CSRFTOKEN": csrftoken,
                "Content-type": "application/json",
            },
            body: JSON.stringify({
                email: formData.email,
                name: formData.name,
                is_admin: formData.is_admin,
                is_waiter: formData.is_waiter,
                is_kitchen: formData.is_kitchen,
            }),
        });

        const apiResult = apiResponse.status !== 201 ? await apiResponse.json() : null;

        console.log(apiResult);

        result.name = apiResult ? apiResult.name : null;
        result.email = apiResult ? apiResult.email : null;
        result.user_exists = apiResult ? apiResult.user_exists : null;

        result.error = apiResponse.status === 500;
        result.status = apiResponse.status;
    } catch(error) {
        result.error = error;
    }

    return result;
}