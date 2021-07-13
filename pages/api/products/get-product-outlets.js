import { getHandler } from "utils";

export default async function handler(req, res) {
  const { user: userDetails, product_id } = req.body;
  const url = `/products/product/${userDetails["user_merchant_id"]}/${product_id}/outlets/ids/list`;

  console.log(url);
  await getHandler(req, res, url);
}
