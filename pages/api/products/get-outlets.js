import { getHandler } from "utils";

export default async function handler(req, res) {
  const { user } = req.body;

  const url = `/stores/merchant/${user["user_merchant_id"]}/store/outlets/mobile/list`;
  await getHandler(req, res, url);
}
