import { getHandler } from "utils"

export default async function handler(req, res) {
  const phoneNumber = req.body.phoneNumber

  const url = `/customers/customer/lookup/${phoneNumber}`
  await getHandler(req, res, url)
}
