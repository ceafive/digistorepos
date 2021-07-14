import { putHandler } from "utils";

export default async function handler(req, res) {
  const { data } = req.body;
  const url = `/products/product/property/variant`;
  await putHandler(req, res, url, data);
}
