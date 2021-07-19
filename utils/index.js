import { axiosIPAY } from "services/axios";
import { cors } from "services/middlewares";

import { configureVariables, fetchFeeCharges, onAddPayment, onRaiseOrder, onSendNotification } from "./components/processSale";
import { sidebarRoutes } from "./routes";

const qs = require("querystring");

const crypto = require("crypto");

const productColors = [
  "#ff000f",
  "#fedede",
  "#eefefd",
  "#aeffff",
  "#4362ce",
  "#a0b5c3",
  "#aaa385",
  "#0a4585",
  "#49a397",
  "#d8af11",
  "#59b1bf",
  "#dc8394",
  "#b1ccfe",
  "#2df5b0",
];

const productTabColors = (productsDisplay) => {
  return Array.from({ length: productsDisplay?.length + 1 }, () => {
    const randomIndex = Math.floor(Math.random() * productColors.length);
    return productColors[randomIndex];
  });
};

export function microtime() {
  return (Date.now ? Date.now() : new Date().getTime()) / 1000;
  // return now - 74545;
}

export function getHash(string, key) {
  var hmac = crypto.createHmac("sha512", key);
  hmac.update(string);
  return hmac.digest("hex");
}

export function getHeaders() {
  const timestamp = Math.round(microtime());
  const stringedTimestamp = String(timestamp);
  const appID = process.env.APP_ID;
  const appKey = process.env.APP_KEY;
  const authData = `${appID}:${stringedTimestamp}`;
  const authSecret = getHash(authData, appKey);

  return {
    Application: appID,
    Time: stringedTimestamp,
    Authentication: authSecret,
    Accept: "application/json",
    "content-type": "application/x-www-form-urlencoded",
  };
}

export async function deleteHandler(req, res, url) {
  try {
    await cors(req, res);

    const iPayResponse = await axiosIPAY({
      url,
      method: "delete",
      headers: getHeaders(),
    });
    const iPayData = await iPayResponse.data;
    return res.status(200).json(iPayData);
  } catch (error) {
    let errorResponse = "";
    if (error.response) {
      errorResponse = error.response.data;
    } else if (error.request) {
      errorResponse = error.request;
    } else {
      errorResponse = { error: error.message };
    }
    return res.status(error.response.status).json(errorResponse);
  }
}

export async function postHandler(req, res, url, data, additionalHeaders = {}) {
  try {
    // console.log({ ...getHeaders(), ...additionalHeaders });
    await cors(req, res);

    // const iPayResponse = await axiosIPAY({
    //   url,
    //   method: "post",
    //   data: qs.stringify(data),
    //   headers: { ...getHeaders(), ...additionalHeaders },
    // });

    const iPayResponse = await axiosIPAY.post(url, data, {
      headers: { ...getHeaders(), ...additionalHeaders },
    });

    // console.log(iPayResponse);

    const iPayData = await iPayResponse.data;
    return res.status(200).json(iPayData);
  } catch (error) {
    // console.log(error);
    let errorResponse = "";
    if (error.response) {
      errorResponse = error.response.data;
    } else if (error.request) {
      errorResponse = error.request;
    } else {
      errorResponse = { error: error.message };
    }
    return res.status(error.response.status).json(errorResponse);
  }
}

export async function putHandler(req, res, url, data, additionalHeaders = {}) {
  try {
    await cors(req, res);

    const iPayResponse = await axiosIPAY({
      url,
      method: "put",
      data: qs.stringify(data),
      headers: { ...getHeaders(), ...additionalHeaders },
    });

    // console.log(iPayResponse);

    const iPayData = await iPayResponse.data;
    return res.status(200).json(iPayData);
  } catch (error) {
    // console.log(error);
    let errorResponse = "";
    if (error.response) {
      errorResponse = error.response.data;
    } else if (error.request) {
      errorResponse = error.request;
    } else {
      errorResponse = { error: error.message };
    }
    return res.status(error.response.status).json(errorResponse);
  }
}

export async function getHandler(req, res, url) {
  try {
    await cors(req, res);

    const iPayResponse = await axiosIPAY({
      url,
      method: "get",
      headers: getHeaders(),
    });
    const iPayData = await iPayResponse.data;
    return res.status(200).json(iPayData);
  } catch (error) {
    let errorResponse = "";
    if (error.response) {
      errorResponse = error.response.data;
    } else if (error.request) {
      errorResponse = error.request;
    } else {
      errorResponse = { error: error.message };
    }
    return res.status(error.response.status).json(errorResponse);
  }
}

export { configureVariables, fetchFeeCharges, onAddPayment, onRaiseOrder, onSendNotification, sidebarRoutes };
