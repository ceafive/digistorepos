import { getHandler } from "utils";

export default async function handler(req, res) {
  const { user: userDetails, trxID } = req.body;

  const url = `/paybills/payment/gateway/status/${userDetails["user_merchant_key"]}/${trxID}`;
  await getHandler(req, res, url);
}
