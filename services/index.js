import { format } from "date-fns";
import { sentrySetUser } from "utils";

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
      sentrySetUser({ id: response?.sid, name: response?.login, loginDate: format(new Date(), "iii, d MMM yy h:mmaaa") });
    }
    return returnData;
  }
};
