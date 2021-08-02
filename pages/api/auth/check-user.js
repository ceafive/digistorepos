import { getHandler } from "utils";
import { withSentry } from "@sentry/nextjs";

async function handler(req, res) {
  const { username } = req.body;

  const url = `/login/pin/user/${username}`;
  console.log(url);
  await getHandler(req, res, url);
}
export default withSentry(handler);
