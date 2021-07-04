import { axiosIPAY } from "services/axios";

const cors = require("cors")({ origin: true });
const crypto = require("crypto");

function microtime(getAsFloat) {
  return (Date.now ? Date.now() : new Date().getTime()) / 1000;
  // return now - 74545;
}

function getHash(string, key) {
  var hmac = crypto.createHmac("sha512", key);
  hmac.update(string);
  return hmac.digest("hex");
}

export default function handler(req, res) {
  return cors(req, res, async () => {
    if (req.method !== "POST") {
      return res.status(200).json({ success: false, message: "Invalid request" });
    }

    try {
      const timestamp = Math.round(microtime());
      const stringedTimestamp = String(timestamp);
      const appID = process.env.APP_ID;
      const appKey = process.env.APP_KEY;
      const authData = `${appID}:${stringedTimestamp}`;
      const authSecret = getHash(authData, appKey);

      const userDetails = req.body.user;
      const category = req.body.category;
      const outletSelected = req.body.outletSelected;

      const iPayResponse = await axiosIPAY({
        url: `/stores/merchant/${userDetails["user_merchant_id"]}/store/outlet/${userDetails?.user_assigned_outlets[0]}/category/${category}/products`,
        method: "get",
        headers: {
          Application: appID,
          Time: stringedTimestamp,
          Authentication: authSecret,
          Accept: "application/json",
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      const iPayData = await iPayResponse.data;
      return res.status(200).json(iPayData);
    } catch (error) {
      return res.status(500).json(error);
    }
  });
}
