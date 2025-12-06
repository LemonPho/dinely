import { getCookie } from "./authentication";

export async function createUser(formData) {
  let result = {
    error: false,
    status: null,
    user: null,
    name: null,
    email: null,
    user_exists: null,
  };

  try {
    const csrftoken = getCookie("csrftoken");
    const apiResponse = await fetch('/api/admin/create-user/', {
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

    const apiResult = await apiResponse.json();

    if (apiResponse.status === 201) {
      result.user = apiResult;
    } else {
      result.name = apiResult.name !== undefined ? apiResult.name : null;
      result.email = apiResult.email !== undefined ? apiResult.email : null;
      result.user_exists = apiResult.user_exists !== undefined ? apiResult.user_exists : null;
    }

    result.error = apiResponse.status === 500;
    result.status = apiResponse.status;
  } catch (error) {
    result.error = error;
  }

  return result;
}

export async function editUser(formData) {
  let result = {
    error: false,
    status: null,
    user: null,
    name: null,
    email: null,
    user_exists: null,
    valid_id: null,
  };

  try {
    const csrftoken = getCookie("csrftoken");
    const apiResponse = await fetch('/api/admin/edit-user/', {
      method: "POST",
      credentials: "include",
      headers: {
        "X-CSRFTOKEN": csrftoken,
        "Content-type": "application/json",
      },
      body: JSON.stringify({
        id: formData.id,
        email: formData.email,
        name: formData.name,
        is_admin: formData.is_admin,
        is_waiter: formData.is_waiter,
        is_kitchen: formData.is_kitchen,
      }),
    });

    const apiResult = apiResponse.status === 400 || apiResponse.status === 201 ? await apiResponse.json() : false;

    if (apiResponse.status === 201) {
      result.user = apiResult;
    } else {
      result.name = apiResult.name !== undefined ? apiResult.name : null;
      result.email = apiResult.email !== undefined ? apiResult.email : null;
      result.user_exists = apiResult.user_exists !== undefined ? apiResult.user_exists : null;
      result.valid_id = apiResult.valid_id !== undefined ? apiResult.valid_id : null;
    }

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

export async function deleteUser(userId) {
  let result = {
    error: false,
    status: null,
  };

  try {
    const csrftoken = getCookie("csrftoken");
    const apiResponse = await fetch('/api/admin/delete-user/', {
      method: "POST",
      credentials: "include",
      headers: {
        "X-CSRFTOKEN": csrftoken,
        "Content-type": "application/json",
      },
      body: JSON.stringify({
        id: userId
      }),
    });

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

export async function createTableArea(area) {
  let result = {
    error: false,
    status: null,
    area: {},
  };

  try {
    const csrftoken = getCookie("csrftoken");
    const apiResponse = await fetch('/api/admin/create-table-area/', {
      method: "POST",
      credentials: "include",
      headers: {
        "X-CSRFTOKEN": csrftoken,
        "Content-type": "application/json",
      },
      body: JSON.stringify({
        label: area
      }),
    });

    const apiResult = apiResponse.status === 201 ? await apiResponse.json() : null;

    result.area = apiResult ? apiResult.area : null;
    result.error = apiResponse.status === 500;
    result.status = apiResponse.status;
  } catch (error) {
    result.error = error;
  }

  return result;
}

export async function editTableArea(areaId, label) {
  let result = {
    error: false,
    status: null,
    tableAreas: [],
    tables: [],
  };

  try {
    const csrftoken = getCookie("csrftoken");
    const apiResponse = await fetch('/api/admin/edit-table-area/', {
      method: "POST",
      credentials: "include",
      headers: {
        "X-CSRFTOKEN": csrftoken,
        "Content-type": "application/json",
      },
      body: JSON.stringify({
        id: areaId,
        label: label
      }),
    });

    const apiResult = apiResponse.status === 201 ? await apiResponse.json() : null;

    if (apiResult) {
      result.tableAreas = apiResult.table_areas || [];
      result.tables = apiResult.tables || [];
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
  }

  try {
    const apiResponse = await fetch(`/api/admin/get-table-areas/`, {
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

export async function createTable(tableData) {
  let result = {
    error: false,
    status: null,
    table: null,
    validationErrors: null,
  };

  try {
    const csrftoken = getCookie("csrftoken");
    const apiResponse = await fetch('/api/admin/create-table/', {
      method: "POST",
      credentials: "include",
      headers: {
        "X-CSRFTOKEN": csrftoken,
        "Content-type": "application/json",
      },
      body: JSON.stringify({
        code: tableData.code,
        capacity: parseInt(tableData.capacity),
        state: tableData.state,
        area: tableData.area,
        notes: tableData.notes || "",
      }),
    });

    const apiResult = await apiResponse.json();

    if (apiResponse.status === 201) {
      result.table = apiResult;
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

export async function editTable(tableData) {
  let result = {
    error: false,
    status: null,
    table: null,
    validationErrors: null,
  };

  try {
    const csrftoken = getCookie("csrftoken");
    const apiResponse = await fetch('/api/admin/edit-table/', {
      method: "POST",
      credentials: "include",
      headers: {
        "X-CSRFTOKEN": csrftoken,
        "Content-type": "application/json",
      },
      body: JSON.stringify({
        id: tableData.id,
        code: tableData.code,
        capacity: parseInt(tableData.capacity),
        state: tableData.state,
        area: tableData.area,
        notes: tableData.notes || "",
      }),
    });

    const apiResult = await apiResponse.json();

    if (apiResponse.status === 201) {
      result.table = apiResult;
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

export async function deleteTableArea(areaId) {
  let result = {
    error: false,
    status: null,
  };

  try {
    const csrftoken = getCookie("csrftoken");
    const apiResponse = await fetch('/api/admin/delete-table-area/', {
      method: "POST",
      credentials: "include",
      headers: {
        "X-CSRFTOKEN": csrftoken,
        "Content-type": "application/json",
      },
      body: JSON.stringify({
        id: areaId
      }),
    });

    result.error = apiResponse.status === 500;
    result.status = apiResponse.status;
  } catch (error) {
    result.error = error;
  }

  return result;
}

export async function deleteTable(tableId) {
  let result = {
    error: false,
    status: null,
    errorMessage: null,
  };

  try {
    const csrftoken = getCookie("csrftoken");
    const apiResponse = await fetch('/api/admin/delete-table/', {
      method: "POST",
      credentials: "include",
      headers: {
        "X-CSRFTOKEN": csrftoken,
        "Content-type": "application/json",
      },
      body: JSON.stringify({
        id: tableId
      }),
    });

    // Solo intentar parsear JSON si el status no es 201 (éxito sin contenido)
    let apiResult = null;
    if (apiResponse.status !== 201) {
      try {
        apiResult = await apiResponse.json();
        result.errorMessage = apiResult?.error || "Error al eliminar la mesa";
      } catch (e) {
        result.errorMessage = "Error al eliminar la mesa";
      }
    }

    result.error = apiResponse.status === 500;
    result.status = apiResponse.status;
  } catch (error) {
    result.error = error;
  }

  return result;
}

export async function createReservation(reservationData) {
  let result = {
    error: false,
    status: null,
    reservation: null,
    validationErrors: null,
  };

  try {
    const csrftoken = getCookie("csrftoken");
    const apiResponse = await fetch('/api/admin/create-reservation/', {
      method: "POST",
      credentials: "include",
      headers: {
        "X-CSRFTOKEN": csrftoken,
        "Content-type": "application/json",
      },
      body: JSON.stringify({
        name: reservationData.name,
        email: reservationData.email || "",
        phone_number: reservationData.phone_number || "",
        date_time: reservationData.date_time,
        table: reservationData.table || null,
        amount_people: parseInt(reservationData.amount_people),
        state: reservationData.state,
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

export async function editReservation(reservationData) {
  let result = {
    error: false,
    status: null,
    validationErrors: null,
  };

  try {
    const csrftoken = getCookie("csrftoken");
    const apiResponse = await fetch('/api/admin/edit-reservation/', {
      method: "POST",
      credentials: "include",
      headers: {
        "X-CSRFTOKEN": csrftoken,
        "Content-type": "application/json",
      },
      body: JSON.stringify({
        id: reservationData.id,
        name: reservationData.name,
        email: reservationData.email || "",
        phone_number: reservationData.phone_number || "",
        date_time: reservationData.date_time,
        table: reservationData.table || null,
        amount_people: parseInt(reservationData.amount_people),
        state: reservationData.state,
        notes: reservationData.notes || "",
      }),
    });

    if (apiResponse.status === 400) {
      const apiResult = await apiResponse.json();
      result.validationErrors = apiResult;
    }

    result.error = apiResponse.status === 500;
    result.status = apiResponse.status;
  } catch (error) {
    result.error = error;
  }

  return result;
}

export async function deleteReservation(reservationId) {
  let result = {
    error: false,
    status: null,
  };

  try {
    const csrftoken = getCookie("csrftoken");
    const apiResponse = await fetch('/api/admin/delete-reservation/', {
      method: "POST",
      credentials: "include",
      headers: {
        "X-CSRFTOKEN": csrftoken,
        "Content-type": "application/json",
      },
      body: JSON.stringify({
        id: reservationId
      }),
    });

    result.error = apiResponse.status === 500;
    result.status = apiResponse.status;
  } catch (error) {
    result.error = error;
  }

  return result;
}

export async function getReservations() {
  let response = {
    reservations: [],
    status: 0,
    error: false,
  };

  try {
    const apiResponse = await fetch(`/api/admin/get-reservations/`, {
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

// ===============================
// Bills (cuentas)
// ===============================

export async function getBills() {
  let result = {
    error: false,
    status: null,
    bills: [],
  };

  try {
    const apiResponse = await fetch(`/api/admin/list-bills/`, {
      method: "GET",
      credentials: "include",
    });

    const apiResult = apiResponse.status === 200 ? await apiResponse.json() : false;

    result.error = apiResponse.status === 500;
    result.status = apiResponse.status;
    result.bills = apiResponse.status === 200 ? apiResult : [];
  } catch (error) {
    result.error = true;
  }

  return result;
}

export async function createBill(billData) {
  let result = {
    error: false,
    status: null,
    bill: null,
    validationErrors: null,
  };

  try {
    const csrftoken = getCookie("csrftoken");
    const apiResponse = await fetch(`/api/admin/create-bill/`, {
      method: "POST",
      credentials: "include",
      headers: {
        "X-CSRFTOKEN": csrftoken,
        "Content-type": "application/json",
      },
      body: JSON.stringify({
        table: billData.table,   // ID de la mesa
        waiter: billData.waiter,  // ID del mesero
        state: billData.state,    // estado: current, closed, etc.
      }),
    });

    const apiResult = await apiResponse.json();

    if (apiResponse.status === 201) {
      result.bill = apiResult;
    } else if (apiResponse.status === 400) {
      result.validationErrors = apiResult;
    }

    result.error = apiResponse.status === 500;
    result.status = apiResponse.status;
  } catch (error) {
    result.error = true;
  }

  return result;
}

export async function editBill(billData) {
  let result = {
    error: false,
    status: null,
    bill: null,
    validationErrors: null,
  };

  try {
    const csrftoken = getCookie("csrftoken");
    const apiResponse = await fetch(`/api/admin/edit-bill/`, {
      method: "POST",
      credentials: "include",
      headers: {
        "X-CSRFTOKEN": csrftoken,
        "Content-type": "application/json",
      },
      body: JSON.stringify({
        id: billData.id,
        table: billData.table,   // ID de la mesa (opcional)
        waiter: billData.waiter,  // ID del mesero (opcional)
        state: billData.state,    // estado (opcional)
      }),
    });

    const apiResult = await apiResponse.json();

    if (apiResponse.status === 201) {
      result.bill = apiResult;
    } else if (apiResponse.status === 400) {
      result.validationErrors = apiResult;
    }

    result.error = apiResponse.status === 500;
    result.status = apiResponse.status;
  } catch (error) {
    result.error = true;
  }

  return result;
}

export async function deleteBill(billId) {
  let result = {
    error: false,
    status: null,
  };

  try {
    const csrftoken = getCookie("csrftoken");
    const apiResponse = await fetch(`/api/admin/delete-bill/`, {
      method: "POST",
      credentials: "include",
      headers: {
        "X-CSRFTOKEN": csrftoken,
        "Content-type": "application/json",
      },
      body: JSON.stringify({
        id: billId,
      }),
    });

    result.error = apiResponse.status === 500;
    result.status = apiResponse.status;
  } catch (error) {
    result.error = true;
  }

  return result;
}
