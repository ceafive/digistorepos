import { postHandler } from "utils";

const FormData = require("form-data");

export default async function handler(req, res) {
  const data = req.body.data;
  let config = req.body.config;
  const url = `/products/product`;

  await postHandler(req, res, url, data, config);
}
