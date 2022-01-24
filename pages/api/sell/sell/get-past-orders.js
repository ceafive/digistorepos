import { getHandler } from "utils";
import { withSentry } from "@sentry/nextjs";

async function handler(req, res) {
  const { merchant, date } = req.body;

  const url = `/orders/bookings/check/slots/${merchant}/${date}`;
  await getHandler(req, res, url);
}

export default withSentry(handler);
