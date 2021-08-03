import { deleteHandler } from "utils";
import { withSentry } from "@sentry/nextjs";

async function handler(req, res) {
  const { id, username } = req.body;
  const url = `products/product/${id}/${username}`;
  await deleteHandler(req, res, url);
}
export default withSentry(handler);
