import { getCookie } from "./authentication";

export async function createUser(formData, creating, editing) {
  console.log("starting fetch function");
  let result = {
    error: false,
    status: null,
    name: null,
    email: null,
    user_exists: null,
  };

  try {
    let fetchUrl;
    if (creating) {
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
  } catch (error) {
    result.error = error;
  }

  return result;
}

export async function createPlateCategory(category) {
  let result = {
    error: false,
    status: null,
    category: {},
  };

  try {

    const csrftoken = getCookie("csrftoken");
    const apiResponse = await fetch('/api/admin/create-plate-category/', {
      method: "POST",
      credentials: "include",
      headers: {
        "X-CSRFTOKEN": csrftoken,
        "Content-type": "application/json",
      },
      body: JSON.stringify({
        label: category
      }),
    });

    const apiResult = apiResponse.status === 201 ? await apiResponse.json() : null;

    console.log(apiResult);

    result.category = apiResult ? apiResult.category : null;
    result.error = apiResponse.status === 500;
    result.status = apiResponse.status;
  } catch (error) {
    result.error = error;
  }

  return result;
}

export async function getPlateCategories() {
  let response = {
    plateCategores: [],
    status: 0,
    error: false,
  }

  try {
    const apiResponse = await fetch(`/api/admin/get-plate-categories/`, {
      method: "GET",
      credentials: "include",
    });
    const apiResult = apiResponse.status === 200 ? await apiResponse.json() : false;

    response.error = apiResponse.status === 500;
    response.status = apiResponse.status;
    response.plateCategores = apiResponse.status === 200 ? apiResult.plate_categories : undefined;
  } catch (error) {
    response.error = true;
  }

  return response;
}