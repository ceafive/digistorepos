import { getHandler } from "utils"

export default async function handler(req, res) {
  const { user: userDetails } = req.body

  const url = `/orders/delivery/route/${userDetails["user_merchant_id"]}/lov`
  await getHandler(req, res, url)
}
