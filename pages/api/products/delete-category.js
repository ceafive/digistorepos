import { deleteHandler } from "utils";
import { withSentry } from "@sentry/nextjs";

async function handler(req, res) {
  const { id } = req.body;
  const url = `/products/category/${id}`;
  await deleteHandler(req, res, url);
}

export default withSentry(handler);
