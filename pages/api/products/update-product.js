import { postHandler } from "utils";

export default async function handler(req, res) {
  const { data } = req.body;
  const url = `/products/product/update/mobile`;

  console.log({ data });
  await postHandler(req, res, url, data);
}
