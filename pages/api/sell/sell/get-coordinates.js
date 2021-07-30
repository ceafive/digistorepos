import { getHandler } from "utils";

export default async function handler(req, res) {
  const { description } = req.body;

  const url = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${description}&inputtype=textquery&fields=geometry&key=AIzaSyCwlbBlciY3kB52y5_h0k4Zxmi8Ho4zK3M`;
  await getHandler(req, res, url);
}
