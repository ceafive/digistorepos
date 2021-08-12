import { getHandler } from "utils";
import { withSentry } from "@sentry/nextjs";

async function handler(req, res) {
  const { merchant, customer_phone, start_date, end_date } = req.body;

  const url = `/orders/order/process/${merchant}/customer/${customer_phone}/list/${start_date}/${end_date}`;
  await getHandler(req, res, url);
}
export default withSentry(handler);
