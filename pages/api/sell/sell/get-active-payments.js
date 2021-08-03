import { getHandler } from "utils";
import { withSentry } from "@sentry/nextjs";

async function handler(req, res) {
  const url = `/vendors/payment/services/active`;
  await getHandler(req, res, url);
}
export default withSentry(handler);
