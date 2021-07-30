import { getHandler } from "utils";
import { withSentry } from "@sentry/nextjs";

async function handler(req, res) {
  const phoneNumber = req.body.phoneNumber;

  const url = `/customers/customer/lookup/${phoneNumber}`;
  await getHandler(req, res, url);
}
export default withSentry(handler);
