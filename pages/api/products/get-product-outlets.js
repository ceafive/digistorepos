import { getHandler } from "utils";
import { withSentry } from "@sentry/nextjs";

async function handler(req, res) {
  const { user: userDetails, product_id } = req.body;
  const url = `/products/product/${userDetails["user_merchant_id"]}/${product_id}/outlets/ids/list`;

  await getHandler(req, res, url);
}
export default withSentry(handler);
