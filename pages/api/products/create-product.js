import { postHandler } from "utils";

export default async function handler(req, res) {
  const data = req.body;
  const url = `/products/product`;
  await postHandler(req, res, url, data);
}
