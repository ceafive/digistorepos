import { deleteHandler } from "utils";

export default async function handler(req, res) {
  const { id } = req.body;
  const url = `/products/category/${id}`;
  await deleteHandler(req, res, url);
}
