import { getHandler } from "utils";

export default async function handler(req, res) {
  const url = `/vendors/payment/services/active`;
  await getHandler(req, res, url);
}
