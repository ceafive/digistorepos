import { getHandler } from "utils";
import { withSentry } from "@sentry/nextjs";

async function handler(req, res) {
  const { productID } = req.body;
  const url = `/products/product/${productID}`;
  await getHandler(req, res, url);
}
export default withSentry(handler);
