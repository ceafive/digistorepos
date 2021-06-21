export const verifyToken = (response) => {
  response = JSON.parse(response);
  const { status, message } = response;

  if (status && status === "99") {
    return {
      error: message,
      success: false,
    };
  }

  if (status && status === "0") {
    sessionStorage.setItem("IPAYPOSUSER", JSON.stringify(response));
    const returnData = {
      error: false,
      success: message,
    };

    if ("sid" in response) {
      returnData["verified"] = true;
    }
    return returnData;
  }
};
