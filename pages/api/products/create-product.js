import { decodeBase64Image, postHandler } from "utils";
import { withSentry } from "@sentry/nextjs";

const fs = require("fs");
const path = require("path");

const FormData = require("form-data");

async function handler(req, res) {
  const form = new FormData();
  const payload = req.body.data;
  const url = `/products/product`;

  // console.log({ payload });
  Object.entries(payload).forEach(([key, value]) => {
    if (key === "image") {
      const dataURL = value?.dataURL;
      const name = value?.name;

      const imageBuffer = decodeBase64Image(dataURL);
      // fs.writeFileSync(path.join(__dirname, "_product_images", name), imageBuffer.data);
      // form.append("image", fs.createReadStream(path.join(__dirname, "_product_images", name))); // add images async
      // fs.unlinkSync(path.join(__dirname, "_product_images", name));
      form.append(key, Buffer.from(imageBuffer.data, "base64"), { filename: name });
    } else {
      form.append(key, value);
    }
  });

  await postHandler(req, res, url, form, form?.getHeaders(), true);
}

export default withSentry(handler);
