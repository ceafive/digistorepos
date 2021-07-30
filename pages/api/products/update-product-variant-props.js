import { putHandler } from "utils";
import { withSentry } from "@sentry/nextjs";

async function handler(req, res) {
  const { data } = req.body;
  const url = `/products/product/property/variant`;
  await putHandler(req, res, url, data);
}
export default withSentry(handler);
