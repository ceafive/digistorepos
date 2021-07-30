import { getHandler } from "utils";

export default async function handler(req, res) {
  const { user: userDetails } = req.body;

  const url = `/stores/merchant/${userDetails["user_merchant_id"]}/store/outlets/mobile/list`;
  await getHandler(req, res, url);
}
