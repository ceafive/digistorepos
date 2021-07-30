import { getHandler } from "utils";

export default async function handler(req, res) {
  const { user: userDetails } = req.body;

  const url = `/products/category/${userDetails["user_merchant_id"]}/list`;
  await getHandler(req, res, url);
}
