import { getHandler } from "utils";

export default async function handler(req, res) {
  const { user: userDetails } = req.body;

  const url = `/orders/merchant/options/${userDetails["user_merchant_id"]}`;
  await getHandler(req, res, url);
}
