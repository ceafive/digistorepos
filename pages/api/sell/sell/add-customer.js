import { postHandler } from "utils";
import { withSentry } from "@sentry/nextjs";

async function handler(req, res) {
  const data = req.body;
  const url = `/customers/merchant/customer`;
  await postHandler(req, res, url, data);
}
export default withSentry(handler);
