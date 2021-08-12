import { getHandler } from "utils";
import { withSentry } from "@sentry/nextjs";

async function handler(req, res) {
  const { merchant, customer_phone, start_date, end_date } = req.body;

  const url = `/customers/merchant/${merchant}/customer/${customer_phone}/payment/${start_date}/${end_date}`;
  await getHandler(req, res, url);
}
export default withSentry(handler);
