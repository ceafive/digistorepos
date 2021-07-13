import { putHandler } from "utils";

export default async function handler(req, res) {
  const data = req.body;
  const url = `/products/category`;

  await putHandler(req, res, url, data);
}
