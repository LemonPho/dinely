import { getCookie } from "./authentication";

export async function createUserReservation(reservationData) {
  let result = {
    error: false,
    status: null,
    reservation: null,
    validationErrors: null,
  };

  try {
    const csrftoken = getCookie("csrftoken");
    const apiResponse = await fetch('/api/user/create-reservation/', {
      method: "POST",
      credentials: "include",
      headers: {
        "X-CSRFTOKEN": csrftoken,
        "Content-type": "application/json",
      },
      body: JSON.stringify({
        name: reservationData.name || "",
        email: reservationData.email || "",
        phone_number: reservationData.phone_number || "",
        date_time: reservationData.date_time,
        table_area: reservationData.table_area || null,
        amount_people: parseInt(reservationData.amount_people),
        notes: reservationData.notes || "",
      }),
    });

    const apiResult = await apiResponse.json();

    if (apiResponse.status === 201) {
      result.reservation = apiResult;
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

export async function getTableAreas() {
  let response = {
    tableAreas: [],
    status: 0,
    error: false,
  };

  try {
    const apiResponse = await fetch(`/api/user/get-table-areas/`, {
      method: "GET",
      credentials: "include",
    });
    const apiResult = apiResponse.status === 200 ? await apiResponse.json() : false;

    response.error = apiResponse.status === 500;
    response.status = apiResponse.status;
    response.tableAreas = apiResponse.status === 200 ? apiResult.table_areas : [];
  } catch (error) {
    response.error = true;
  }

  return response;
}

export async function getUserReservation(code, email) {
  let response = {
    reservation: null,
    status: 0,
    error: false,
    errorMessage: null,
  };

  try {
    // Build query string with available parameters
    const params = new URLSearchParams();
    if (code) params.append("code", code);
    if (email) params.append("email", email);

    const apiResponse = await fetch(`/api/user/get-reservation/?${params.toString()}`, {
      method: "GET",
      credentials: "include",
    });

    const apiResult = await apiResponse.status === 200 ? await apiResponse.json() : null;

    if (apiResponse.status === 200) {
      response.reservation = apiResult;
    } else if (apiResponse.status === 400 || apiResponse.status === 404) {
      const errorData = await apiResponse.json().catch(() => ({}));
      response.errorMessage = errorData.error || "Reservation not found";
    }

    response.error = apiResponse.status === 500;
    response.status = apiResponse.status;
  } catch (error) {
    response.error = true;
    response.errorMessage = "Error al buscar la reservación";
  }

  return response;
}

export async function editUserReservation(reservationData) {
  let result = {
    error: false,
    status: null,
    reservation: null,
    validationErrors: null,
    errorMessage: null,
  };

  try {
    const csrftoken = getCookie("csrftoken");
    const apiResponse = await fetch('/api/user/edit-reservation/', {
      method: "POST",
      credentials: "include",
      headers: {
        "X-CSRFTOKEN": csrftoken,
        "Content-type": "application/json",
      },
      body: JSON.stringify({
        code: reservationData.code || null,
        email: reservationData.email || null,
        date_time: reservationData.date_time,
        table_area: reservationData.table_area || null,
        amount_people: parseInt(reservationData.amount_people),
        notes: reservationData.notes || "",
      }),
    });

    const apiResult = await apiResponse.json();

    if (apiResponse.status === 201) {
      result.reservation = apiResult;
    } else if (apiResponse.status === 400) {
      result.validationErrors = apiResult;
    } else if (apiResponse.status === 403 || apiResponse.status === 404) {
      result.errorMessage = apiResult.error || "Error al editar la reservación";
    }

    result.error = apiResponse.status === 500;
    result.status = apiResponse.status;
  } catch (error) {
    result.error = error;
  }

  return result;
}

export async function cancelUserReservation(code, email) {
  let result = {
    error: false,
    status: null,
    reservation: null,
    errorMessage: null,
  };

  try {
    const csrftoken = getCookie("csrftoken");
    const apiResponse = await fetch('/api/user/cancel-reservation/', {
      method: "POST",
      credentials: "include",
      headers: {
        "X-CSRFTOKEN": csrftoken,
        "Content-type": "application/json",
      },
      body: JSON.stringify({
        code: code || null,
        email: email || null,
      }),
    });

    const apiResult = await apiResponse.json();

    if (apiResponse.status === 201) {
      result.reservation = apiResult;
    } else if (apiResponse.status === 400 || apiResponse.status === 403 || apiResponse.status === 404) {
      result.errorMessage = apiResult.error || "Error al cancelar la reservación";
    }

    result.error = apiResponse.status === 500;
    result.status = apiResponse.status;
  } catch (error) {
    result.error = error;
  }

  return result;
}

