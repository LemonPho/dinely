export async function getPlateCategories() {
  let response = {
    plateCategories: [],
    status: 0,
    error: false,
  };

  try {
    const apiResponse = await fetch(`/api/plates/get-plate-categories/`, {
      method: "GET",
      credentials: "include",
    });
    const apiResult = apiResponse.status === 200 ? await apiResponse.json() : false;

    response.error = apiResponse.status === 500;
    response.status = apiResponse.status;
    response.plateCategories = apiResponse.status === 200 ? apiResult.plate_categories : [];
  } catch (error) {
    response.error = true;
  }

  return response;
}

export async function getPlates() {
  let response = {
    plates: [],
    status: 0,
    error: false,
  };

  try {
    const apiResponse = await fetch(`/api/plates/get-plates/`, {
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
