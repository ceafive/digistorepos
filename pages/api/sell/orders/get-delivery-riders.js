import { getHandler } from "utils";
import { withSentry } from "@sentry/nextjs";

async function handler(req, res) {
  const { merchant } = req.body;
  const url = `/orders/delivery/rider/${merchant}/lov`;
  await getHandler(req, res, url);
}
export default withSentry(handler);
