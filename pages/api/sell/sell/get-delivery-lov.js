import { getHandler } from "utils";
import { withSentry } from "@sentry/nextjs";

async function handler(req, res) {
  const { user: userDetails } = req.body;

  const url = `/orders/delivery/route/${userDetails["user_merchant_id"]}/lov`;
  await getHandler(req, res, url);
}
export default withSentry(handler);
