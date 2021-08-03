import { getHandler } from "utils";
import { withSentry } from "@sentry/nextjs";

async function handler(req, res) {
  const { user: userDetails } = req.body;
  const url = `/products/product/${userDetails["user_merchant_id"]}/mobile/list`;
  await getHandler(req, res, url);
}
export default withSentry(handler);
