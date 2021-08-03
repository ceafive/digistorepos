import { decodeBase64Image, postHandler } from "utils";
import { withSentry } from "@sentry/nextjs";

const fs = require("fs");
const path = require("path");

const FormData = require("form-data");

async function handler(req, res) {
  const form = new FormData();
  const payload = req.body.data;
  const url = `/products/product/update/mobile`;

  // console.log({ payload });
  Object.entries(payload).forEach(([key, value]) => {
    if (key === "image") {
      const dataURL = value?.dataURL;
      const name = value?.name;

      console.log({ dataURL, name });

      const imageBuffer = decodeBase64Image(dataURL);
      form.append(key, Buffer.from(imageBuffer.data, "base64"), { filename: name });
    } else {
      form.append(key, value);
    }
  });

  await postHandler(req, res, url, form, form?.getHeaders(), true);
}
export default withSentry(handler);
