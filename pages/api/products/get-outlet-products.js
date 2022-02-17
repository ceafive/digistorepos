import { getHandler } from "utils";
import { withSentry } from "@sentry/nextjs";

async function handler(req, res) {
  const { merchant, outlet } = req.body;
  // const url = `/stores/merchant/${merchant}/store/outlet/${outlet}/products`;
  // const url = `/products/product/${merchant}/mobile/list`;
  const url = `/products/product/${merchant}/outlet/${outlet}/list`;
  // console.log(url);
  await getHandler(req, res, url);
}
export default withSentry(handler);
