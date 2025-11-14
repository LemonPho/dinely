export function obtenerCookie(name) {
  let cookieValue = null;
  if (document.cookie && document.cookie !== '') {
    const cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i].trim();
      // Does this cookie string begin with the name we want?
      if (cookie.substring(0, name.length + 1) === (name + '=')) {
        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
        break;
      }
    }
  }
  return cookieValue;
}

export async function enviarLogin(formData) {
  let response = {
    error: false,
    status: 0,
  }

  try {
    const csrftoken = obtenerCookie("csrftoken");

    const apiResponse = await fetch(`/api/authentication/login/`, {
      method: "POST",
      credentials: "include",
      headers: {
        "X-CSRFTOKEN": csrftoken,
        "Content-type": "application/json",
      },
      body: JSON.stringify({
        email: formData.email,
        password: formData.password,
      }),
    });

    response.status = apiResponse.status;
    response.error = apiResponse.status === 500;
  } catch (error) {
    response.error = true;
  }

  return response;
}

export async function getCsrfToken() {
  let response = {
    error: false,
    csrfToken: "",
    status: null
  };

  try {
    const apiResponse = await fetch("/api/authentication/csrf/", {
      credentials: "include",
    });
    const apiResult = apiResponse.status === 200 ? await apiResponse.json() : false;

    response.error = apiResponse.status === 500 ? apiResponse : false;
    response.csrfToken = apiResponse.status === 200 ? apiResult : false;
    response.status = apiResponse.status;
  } catch (error) {
    response.error = error;
  }

  return response;
}

export async function getCurrentUser() {
  let response = {
    user: {},
    status: 0,
    error: false,
  }

  try {
    const apiResponse = await fetch(`/api/user/get-current-user/`, {
      method: "GET",
      credentials: "include",
    });
    const apiResult = apiResponse.status === 200 ? await apiResponse.json() : false;

    response.error = apiResponse.status === 500;
    response.status = apiResponse.status;
    response.user = apiResponse.status === 200 ? apiResult.user : undefined;
  } catch (error) {
    response.error = true;
  }

  return response;
}

export async function enviarLogout() {
  let response = {
    error: false,
    status: 0,
  }

  try {
    const csrftoken = obtenerCookie("csrftoken");

    const apiResponse = await fetch(`/api/authentication/logout/`, {
      method: "POST",
      credentials: "include",
      headers: {
        "X-CSRFTOKEN": csrftoken,
        "Content-type": "application/json",
      },
    });

    response.status = apiResponse.status;
    response.error = apiResponse.status === 500;
  } catch (error) {
    response.error = true;
  }

  return response;
}

export async function submitRegistration(registerInput) {
  let response = {
    error: false,
    emailUnique: null,
    emailValid: null,
    passwordsMatch: null,
    passwordValid: null,
    invalidData: null,
    status: null,
  }

  try {
    const csrftoken = obtenerCookie("csrftoken");
    const apiResponse = await fetch(`/api/authentication/register/`, {
      method: "POST",
      headers: {
        "X-CSRFToken": csrftoken,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: registerInput.email,
        password: registerInput.password, 
        passwordConfirmation: registerInput.passwordConfirmation,
      })
    });
    const apiResult = apiResponse.status === 200 || apiResponse.status === 400 ? await apiResponse.json() : false;

    if (apiResult) {
      response.emailUnique = apiResult.email_unique;
      response.emailValid = apiResult.email_valid;
      response.passwordsMatch = apiResult.passwords_match;
      response.passwordValid = apiResult.password_valid;
      response.invalidData = apiResult.invalid_data;
    }
    response.status = apiResponse.status;

  } catch (error) {
    response.error = error;
  }

  return response;
}