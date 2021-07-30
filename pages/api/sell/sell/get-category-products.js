import { getHandler } from "utils";

export default async function handler(req, res) {
  const userDetails = req.body.user;
  const category = req.body.category;

  const url = `/stores/merchant/${userDetails["user_merchant_id"]}/store/outlet/${userDetails?.user_assigned_outlets[0]}/category/${category}/products`;
  await getHandler(req, res, url);
}
