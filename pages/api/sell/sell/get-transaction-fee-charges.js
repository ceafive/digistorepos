import { getHandler } from "utils";
import { withSentry } from "@sentry/nextjs";

async function handler(req, res) {
  const channel = req.body.channel;
  const amount = req.body.amount;
  const merchant = req.body.merchant;

  const url = `/vendors/service/charge/${channel}/${amount}/${merchant}`;
  await getHandler(req, res, url);
}
export default withSentry(handler);
