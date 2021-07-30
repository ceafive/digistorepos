import { postHandler } from "utils";

export default async function handler(req, res) {
  const data = req.body;
  const url = `/orders/order/process/delivery/route/distance/charge`;
  await postHandler(req, res, url, data);
}
