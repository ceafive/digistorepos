import { deleteHandler } from "utils";

export default async function handler(req, res) {
  const { id, username } = req.body;
  const url = `products/product/${id}/${username}`;
  await deleteHandler(req, res, url);
}
