import { postHandler } from "utils";
import { withSentry } from "@sentry/nextjs";

async function handler(req, res) {
  const data = req.body;
  const url = `/orders/order/process/delivery/route/distance/charge`;
  await postHandler(req, res, url, data);
}
export default withSentry(handler);
