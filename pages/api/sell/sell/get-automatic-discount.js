import { getHandler } from "utils";
import { withSentry } from "@sentry/nextjs";

async function handler(req, res) {
  const userDetails = req.body.user;

  const url = `/discounts/discount/${userDetails?.user_merchant_id}/automatic/isavailable`;
  await getHandler(req, res, url);
}
export default withSentry(handler);
