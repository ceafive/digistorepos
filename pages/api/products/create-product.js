import { postHandler } from "utils";

const fs = require("fs");

const FormData = require("form-data");

export default async function handler(req, res) {
  const payload = req.body.data;
  let config = req.body.config;
  const url = `/products/product`;

  // console.log({ payload });

  const form = new FormData();
  form.append("image", Buffer.from(payload?.image, "base64"), { filename: "temp.jpg" });
  form.append("name", payload?.name);
  form.append("desc", payload?.desc);
  form.append("price", payload?.price);
  form.append("cost", payload?.cost);
  form.append("quantity", payload?.quantity);
  form.append("category", payload?.category);
  form.append("tag", payload?.tag);
  form.append("taxable", payload?.taxable);
  form.append("sku", payload?.sku);
  form.append("weight", payload?.weight);
  form.append("barcode", payload?.barcode);
  form.append("is_price_global", payload?.is_price_global);
  form.append("outlet_list", payload?.outlet_list);
  form.append("merchant", payload?.merchant);
  form.append("mod_by", payload?.mod_by);

  await postHandler(req, res, url, form, form?.getHeaders());
}
