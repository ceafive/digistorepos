import { getHandler } from "utils";
import { withSentry } from "@sentry/nextjs";

async function handler(req, res) {
  const { merchant, orderNo } = req.body;
  const url = `/orders/order/process/${merchant}/${orderNo}`;
  await getHandler(req, res, url);
}
export default withSentry(handler);
