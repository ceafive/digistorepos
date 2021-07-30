import { postHandler, getHandler } from "utils";
import { withSentry } from "@sentry/nextjs";

async function handler(req, res) {
  const data = req.body;

  let url;
  switch (data?.isAdmin) {
    case true:
      url = `/orders/order/process/${data?.merchant}/list/${data?.start_date}/${data?.end_date}`;
      await getHandler(req, res, url);
      break;
    default:
      url = `/orders/order/process/outlet/list`;
      await postHandler(req, res, url, data);
  }

  // console.log(url);
  // console.log({ data, isAdmin });
}
export default withSentry(handler);
