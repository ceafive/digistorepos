import { getHandler } from "utils";
import { withSentry } from "@sentry/nextjs";

async function handler(req, res) {
  const { user: userDetails } = req.body;

  const url = `/orders/merchant/options/${userDetails["user_merchant_id"]}`;
  await getHandler(req, res, url);
}
export default withSentry(handler);
