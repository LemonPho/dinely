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

export async function editPlateCategory(categoryId, label) {
  let result = {
    error: false,
    status: null,
    plateCategories: [],
    plates: [],
  };

  try {
    const csrftoken = getCookie("csrftoken");
    const apiResponse = await fetch('/api/admin/edit-plate-category/', {
      method: "POST",
      credentials: "include",
      headers: {
        "X-CSRFTOKEN": csrftoken,
        "Content-type": "application/json",
      },
      body: JSON.stringify({
        id: categoryId,
        label: label
      }),
    });

    const apiResult = apiResponse.status === 201 ? await apiResponse.json() : null;

    if (apiResult) {
      result.plateCategories = apiResult.plate_categories || [];
      result.plates = apiResult.plates || [];
    }

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

export async function createPlate(plateData) {
  let result = {
    error: false,
    status: null,
    plate: null,
    validationErrors: null,
  };

  try {
    const csrftoken = getCookie("csrftoken");
    const apiResponse = await fetch('/api/admin/create-plate/', {
      method: "POST",
      credentials: "include",
      headers: {
        "X-CSRFTOKEN": csrftoken,
        "Content-type": "application/json",
      },
      body: JSON.stringify({
        name: plateData.name,
        price: parseFloat(plateData.price),
        category: plateData.category,
        description: plateData.description,
      }),
    });

    const apiResult = await apiResponse.json();

    if (apiResponse.status === 201) {
      result.plate = apiResult;
    } else if (apiResponse.status === 400) {
      result.validationErrors = apiResult;
    }

    result.error = apiResponse.status === 500;
    result.status = apiResponse.status;
  } catch (error) {
    result.error = error;
  }

  return result;
}

export async function editPlate(plateData) {
  let result = {
    error: false,
    status: null,
    plate: null,
    validationErrors: null,
  };

  try {
    const csrftoken = getCookie("csrftoken");
    const apiResponse = await fetch('/api/admin/edit-plate/', {
      method: "POST",
      credentials: "include",
      headers: {
        "X-CSRFTOKEN": csrftoken,
        "Content-type": "application/json",
      },
      body: JSON.stringify({
        id: plateData.id,
        name: plateData.name,
        price: parseFloat(plateData.price),
        category: plateData.category,
        description: plateData.description,
      }),
    });

    const apiResult = await apiResponse.json();

    if (apiResponse.status === 201) {
      result.plate = apiResult;
    } else if (apiResponse.status === 400) {
      result.validationErrors = apiResult;
    }

    result.error = apiResponse.status === 500;
    result.status = apiResponse.status;
  } catch (error) {
    result.error = error;
  }

  return result;
}

export async function getPlates() {
  let response = {
    plates: [],
    status: 0,
    error: false,
  };

  try {
    const apiResponse = await fetch(`/api/admin/get-plates/`, {
      method: "GET",
      credentials: "include",
    });
    const apiResult = apiResponse.status === 200 ? await apiResponse.json() : false;

    response.error = apiResponse.status === 500;
    response.status = apiResponse.status;
    response.plates = apiResponse.status === 200 ? apiResult.plates : [];
  } catch (error) {
    response.error = true;
  }

  return response;
}

export async function deletePlateCategory(categoryId) {
  let result = {
    error: false,
    status: null,
  };

  try {
    const csrftoken = getCookie("csrftoken");
    const apiResponse = await fetch('/api/admin/delete-plate-category/', {
      method: "POST",
      credentials: "include",
      headers: {
        "X-CSRFTOKEN": csrftoken,
        "Content-type": "application/json",
      },
      body: JSON.stringify({
        id: categoryId
      }),
    });

    result.error = apiResponse.status === 500;
    result.status = apiResponse.status;
  } catch (error) {
    result.error = error;
  }

  return result;
}

export async function deletePlate(plateId) {
  let result = {
    error: false,
    status: null,
    errorMessage: null,
  };

  try {
    const csrftoken = getCookie("csrftoken");
    const apiResponse = await fetch('/api/admin/delete-plate/', {
      method: "POST",
      credentials: "include",
      headers: {
        "X-CSRFTOKEN": csrftoken,
        "Content-type": "application/json",
      },
      body: JSON.stringify({
        id: plateId
      }),
    });

    // Solo intentar parsear JSON si el status no es 201 (éxito sin contenido)
    let apiResult = null;
    if (apiResponse.status !== 201) {
      try {
        apiResult = await apiResponse.json();
        result.errorMessage = apiResult?.error || "Error al eliminar el platillo";
      } catch (e) {
        result.errorMessage = "Error al eliminar el platillo";
      }
    }

    result.error = apiResponse.status === 500;
    result.status = apiResponse.status;
  } catch (error) {
    result.error = error;
  }

  return result;
}

export async function fetchUsers() {
  let response = {
    users: [],
    status: 0,
    error: false,
  };

  try {
    const apiResponse = await fetch(`/api/admin/list-users/`, {
      method: "GET",
      credentials: "include",
    });
    const apiResult = apiResponse.status === 200 ? await apiResponse.json() : false;

    response.error = apiResponse.status === 500;
    response.status = apiResponse.status;
    response.users = apiResponse.status === 200 ? apiResult : [];
  } catch (error) {
    response.error = true;
  }

  return response;
}