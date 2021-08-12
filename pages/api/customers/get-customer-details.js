import { getHandler } from "utils";
import { withSentry } from "@sentry/nextjs";

async function handler(req, res) {
  const { merchant, customer_id } = req.body;

  const url = `/customers/merchant/${merchant}/customer/${customer_id}`;
  await getHandler(req, res, url);
}
export default withSentry(handler);
