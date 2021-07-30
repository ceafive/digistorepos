import { postHandler } from "utils";

export default async function handler(req, res) {
  const data = req.body;
  const url = `/customers/merchant/customer`;
  await postHandler(req, res, url, data);
}
