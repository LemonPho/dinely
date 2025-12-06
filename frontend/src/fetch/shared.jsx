import { getCookie } from "./authentication";

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

export async function getBills() {
  let response = {
    bills: [],
    status: 0,
    error: false,
  };

  try {
    const apiResponse = await fetch(`/api/admin/get-bills/`, {
      method: "GET",
      credentials: "include",
    });
    const apiResult = apiResponse.status === 200 ? await apiResponse.json() : false;

    response.error = apiResponse.status === 500;
    response.status = apiResponse.status;
    response.bills = apiResponse.status === 200 ? apiResult.bills : [];
  } catch (error) {
    response.error = true;
  }

  return response;
}

export async function getWaiterBills() {
  let response = {
    bills: [],
    status: 0,
    error: false,
  };

  try {
    const apiResponse = await fetch(`/api/waiter/get-bills/`, {
      method: "GET",
      credentials: "include",
    });
    const apiResult = apiResponse.status === 200 ? await apiResponse.json() : false;

    response.error = apiResponse.status === 500;
    response.status = apiResponse.status;
    response.bills = apiResponse.status === 200 ? apiResult.bills : [];
  } catch (error) {
    response.error = true;
  }

  return response;
}

export async function getWaiterBill(billId) {
  let response = {
    bill: null,
    status: 0,
    error: false,
    errorMessage: null,
  };

  try {
    const apiResponse = await fetch(`/api/waiter/get-bill/${billId}/`, {
      method: "GET",
      credentials: "include",
    });

    const apiResult = await apiResponse.status === 200 ? await apiResponse.json() : null;

    if (apiResponse.status === 200) {
      response.bill = apiResult;
    } else if (apiResponse.status === 404) {
      const errorData = await apiResponse.json().catch(() => ({}));
      response.errorMessage = errorData.error || "Cuenta no encontrada";
    } else if (apiResponse.status === 401) {
      response.errorMessage = "No autorizado para ver esta cuenta";
    }

    response.error = apiResponse.status === 500;
    response.status = apiResponse.status;
  } catch (error) {
    response.error = true;
    response.errorMessage = "Error al obtener la cuenta";
  }

  return response;
}

export async function addPlateToBill(billId, plateId, quantity, notes = "") {
  let response = {
    bill: null,
    status: 0,
    error: false,
    errorMessage: null,
    errors: {},
  };

  try {
    const csrftoken = getCookie("csrftoken");
    const apiResponse = await fetch(`/api/waiter/add-plate-to-bill/${billId}/`, {
      method: "POST",
      credentials: "include",
      headers: {
        "X-CSRFTOKEN": csrftoken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        plate_id: plateId,
        quantity: quantity,
        notes: notes,
      }),
    });

    const apiResult = await apiResponse.status === 200 ? await apiResponse.json() : null;

    if (apiResponse.status === 200) {
      response.bill = apiResult;
    } else {
      const errorData = await apiResponse.json().catch(() => ({}));
      
      // Extract error messages from validation result
      // Fields are: bill_valid, plate_valid, quantity_valid, notes_valid
      // Values are either True (valid) or error message strings (invalid)
      const errorMessages = [];
      for (const [key, value] of Object.entries(errorData)) {
        if (value && typeof value === "string") {
          // Only include string values (error messages), skip True values
          response.errors[key] = value;
          errorMessages.push(value);
        }
      }
      
      response.errorMessage = errorMessages.length > 0 
        ? errorMessages.join(", ") 
        : "Error al agregar platillo";
    }

    response.error = apiResponse.status === 500;
    response.status = apiResponse.status;
  } catch (error) {
    response.error = true;
    response.errorMessage = "Error al agregar platillo";
  }

  return response;
}

export async function finalizeBill(billId, amountPaid, tipPercentage) {
  let response = {
    bill: null,
    status: 0,
    error: false,
    errorMessage: null,
    errors: {},
  };

  try {
    const csrftoken = getCookie("csrftoken");
    const apiResponse = await fetch(`/api/waiter/finalize-bill/${billId}/`, {
      method: "POST",
      credentials: "include",
      headers: {
        "X-CSRFTOKEN": csrftoken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount_paid: amountPaid,
        tip_percentage: tipPercentage,
      }),
    });

    const apiResult = apiResponse.status === 200 ? await apiResponse.json() : null;

    if (apiResponse.status === 200) {
      response.bill = apiResult;
    } else {
      const errorData = await apiResponse.json().catch(() => ({}));
      
      // Extract error messages from validation result
      // Fields are: bill_valid, amount_paid_valid, tip_percentage_valid, amount_sufficient_valid
      // Values are either True (valid) or error message strings (invalid)
      const errorMessages = [];
      for (const [key, value] of Object.entries(errorData)) {
        if (value && typeof value === "string") {
          // Only include string values (error messages), skip True values
          response.errors[key] = value;
          errorMessages.push(value);
        }
      }
      
      response.errorMessage = errorMessages.length > 0 
        ? errorMessages.join(", ") 
        : "Error al finalizar cuenta";
    }

    response.error = apiResponse.status === 500;
    response.status = apiResponse.status;
  } catch (error) {
    response.error = true;
    response.errorMessage = "Error al finalizar cuenta";
  }

  return response;
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

export async function getTables() {
  let response = {
    tables: [],
    status: 0,
    error: false,
  };

  try {
    const apiResponse = await fetch(`/api/admin/get-tables/`, {
      method: "GET",
      credentials: "include",
    });
    const apiResult = apiResponse.status === 200 ? await apiResponse.json() : false;

    response.error = apiResponse.status === 500;
    response.status = apiResponse.status;
    response.tables = apiResponse.status === 200 ? apiResult.tables : [];
  } catch (error) {
    response.error = true;
  }

  return response;
}

export async function getWaiterReservations() {
  let response = {
    reservations: [],
    status: 0,
    error: false,
  };

  try {
    const apiResponse = await fetch(`/api/waiter/get-reservations/`, {
      method: "GET",
      credentials: "include",
    });
    const apiResult = apiResponse.status === 200 ? await apiResponse.json() : false;

    response.error = apiResponse.status === 500;
    response.status = apiResponse.status;
    response.reservations = apiResponse.status === 200 ? apiResult.reservations : [];
  } catch (error) {
    response.error = true;
  }

  return response;
}

export async function assignTableToReservation(reservationId, tableCode) {
  let response = {
    reservation: null,
    status: 0,
    error: false,
    errorMessage: null,
    errors: {},
  };

  try {
    const csrftoken = getCookie("csrftoken");
    const apiResponse = await fetch(`/api/waiter/assign-table-to-reservation/${reservationId}/`, {
      method: "POST",
      credentials: "include",
      headers: {
        "X-CSRFTOKEN": csrftoken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        table_code: tableCode,
      }),
    });

    const apiResult = await apiResponse.status === 200 ? await apiResponse.json() : null;

    if (apiResponse.status === 200) {
      response.reservation = apiResult;
    } else {
      const errorData = await apiResponse.json().catch(() => ({}));
      
      // Extract error messages from validation result
      // Fields are: reservation_valid, table_code_valid
      // Values are either True (valid) or error message strings (invalid)
      const errorMessages = [];
      for (const [key, value] of Object.entries(errorData)) {
        if (value && typeof value === "string") {
          // Only include string values (error messages), skip True values
          response.errors[key] = value;
          errorMessages.push(value);
        }
      }
      
      response.errorMessage = errorMessages.length > 0 
        ? errorMessages.join(", ") 
        : "Error al asignar mesa";
    }

    response.error = apiResponse.status === 500;
    response.status = apiResponse.status;
  } catch (error) {
    response.error = true;
    response.errorMessage = "Error al asignar mesa";
  }

  return response;
}
