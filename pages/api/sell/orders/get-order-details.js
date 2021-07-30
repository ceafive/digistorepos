import { getHandler } from "utils";

export default async function handler(req, res) {
  const { merchant, orderNo } = req.body;
  const url = `/orders/order/process/${merchant}/${orderNo}`;
  await getHandler(req, res, url);
}
