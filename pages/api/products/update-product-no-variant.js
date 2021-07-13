import { postHandler } from "utils";

export default async function handler(req, res) {
  const { data } = req.body;
  const url = `/products/product/update/mobile`;
  await postHandler(req, res, url, data);
}
