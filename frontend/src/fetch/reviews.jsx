import { getCookie } from "./authentication";

export async function getReviews() {
  let response = {
    reviews: [],
    user_has_reviewed: false,
    status: 0,
    error: false,
  };

  try {
    const apiResponse = await fetch(`/api/review/get-reviews/`, {
      method: "GET",
      credentials: "include",
    });
    const apiResult = apiResponse.status === 200 ? await apiResponse.json() : false;

    response.error = apiResponse.status === 500;
    response.status = apiResponse.status;
    response.reviews = apiResponse.status === 200 ? apiResult.reviews : [];
    response.user_has_reviewed = apiResponse.status === 200 ? (apiResult.user_has_reviewed || false) : false;
  } catch (error) {
    response.error = true;
  }

  return response;
}

export async function createReview(reviewData) {
  let result = {
    error: false,
    status: null,
    review: null,
    validationErrors: null,
    errorMessage: null,
  };

  try {
    const csrftoken = getCookie("csrftoken");
    const apiResponse = await fetch('/api/review/create-review/', {
      method: "POST",
      credentials: "include",
      headers: {
        "X-CSRFTOKEN": csrftoken,
        "Content-type": "application/json",
      },
      body: JSON.stringify({
        title: reviewData.title || null,
        content: reviewData.content || "",
        score: reviewData.score || null,
      }),
    });

    const apiResult = await apiResponse.json();

    if (apiResponse.status === 201) {
      result.review = apiResult;
    } else if (apiResponse.status === 400) {
      result.validationErrors = apiResult;
    } else {
      result.errorMessage = apiResult.error || "Error al crear la opinión";
    }

    result.error = apiResponse.status === 500;
    result.status = apiResponse.status;
  } catch (error) {
    result.error = true;
  }

  return result;
}

