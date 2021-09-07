import * as Sentry from "@sentry/nextjs";
import { axiosIPAY } from "services/axios";
import { cors } from "services/middlewares";

import { configureVariables, fetchFeeCharges, onAddPayment, onRaiseOrder, onSendNotification } from "./components/processSale";
import { sidebarRoutes } from "./routes";

const qs = require("qs");
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
    res.status(400).json(errorResponse);
    return sentryErrorLogger(error);
  }
}

export async function postHandler(req, res, url, data, additionalHeaders = {}, useFirst = false) {
  try {
    // console.log({ ...getHeaders(), ...additionalHeaders });
    await cors(req, res);

    const iPayResponse = await axiosIPAY.post(url, useFirst ? data : qs.stringify(data), {
      headers: { ...getHeaders(), ...additionalHeaders },
    });

    // console.log(iPayResponse);

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
    res.status(400).json(errorResponse);
    return sentryErrorLogger(error);
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
    res.status(400).json(errorResponse);
    return sentryErrorLogger(error);
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
    res.status(400).json(errorResponse);
    return sentryErrorLogger(error);
  }
}

function decodeBase64Image(dataString) {
  var matches = dataString.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
    response = {};

  if (matches?.length !== 3) {
    return new Error("Invalid input string");
  }

  response.type = matches[1];
  response.data = new Buffer(matches[2], "base64");

  return response;
}

const paymentOptions = [
  { name: "CASH", img: "https://payments2.ipaygh.com/app/webroot/img/logo/IPAY-CASH.png", label: "CASH" },
  // { name: "VISAG", img: "https://payments2.ipaygh.com/app/webroot/img/logo/IPAY-VISAG.png", label: "VISA AND MASTERCARD" },
  { name: "QRPAY", img: "https://payments2.ipaygh.com/app/webroot/img/logo/IPAY-QRPAY.png", label: "GHQR PAY" },
  { name: "BNKTR", img: "https://payments2.ipaygh.com/app/webroot/img/logo/IPAY-BNKTR.png", label: "BANK TRANSFER" },
  { name: "MTNMM", img: "https://payments2.ipaygh.com/app/webroot/img/logo/IPAY-MTNMM.png", label: "MTN MOBILE MONEY" },
  { name: "TIGOC", img: "https://payments2.ipaygh.com/app/webroot/img/logo/IPAY-TIGOC.png", label: "AIRTELTIGO MONEY" },
  { name: "VODAC", img: " https://payments2.ipaygh.com/app/webroot/img/logo/IPAY-VODAC.png", label: "VODAFONE CASH" },
  { name: "GCBMM", img: "https://payments2.ipaygh.com/app/webroot/img/logo/IPAY-GCBMM.png", label: "GCB MOBILE MONEY" },
];

const paymentOptionNames = paymentOptions.reduce(
  (acc, val) => ({
    ...acc,
    [val?.name]: val?.label,
  }),
  {}
);

const merchantUserDeliveryOptions = [
  { name: "Walk In" },
  { name: "Dine In" },
  { name: "Pickup" },
  {
    name: "Delivery",
  },
];

const loyaltyTabs = ["Loyalty", "Layby", "Store Credit", "On Account"];

/**
 * @return one of brown: #4C2B24
gold: #937433
green: #3E8460
deep blue: #1B354E
some orange: #C65A11
purple/violet: #7030A0
 */
const categoryColors = ["#4C2B24", "#937433", "#3E8460", "#1B354E", "#C65A11", "#7030A0"];

const categoryTabColors = (productCategories) => {
  return Array.from({ length: productCategories?.length + 1 }, () => {
    const randomIndex = Math.floor(Math.random() * categoryColors.length);
    return categoryColors[randomIndex];
  });
};

function repeatFor(size) {
  let no = -1;
  var newArr = new Array(size);

  for (var i = 0; i < size; i++) {
    if (no === categoryColors.length - 1) no = 0;
    else no++;

    newArr[i] = categoryColors[no];
  }

  return newArr;
}

export const sentryErrorLogger = (...params) => {
  Sentry.captureException(...params);
};

export const sentrySetUser = (...params) => {
  Sentry.setUser(...params);
};

export {
  categoryColors,
  categoryTabColors,
  configureVariables,
  decodeBase64Image,
  fetchFeeCharges,
  loyaltyTabs,
  merchantUserDeliveryOptions,
  onAddPayment,
  onRaiseOrder,
  onSendNotification,
  paymentOptionNames,
  paymentOptions,
  repeatFor,
  sidebarRoutes,
};
