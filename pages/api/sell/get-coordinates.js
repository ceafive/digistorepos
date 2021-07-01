import axios from "axios";
const cors = require("cors")({ origin: true });

export default function handler(req, res) {
  return cors(req, res, async () => {
    if (req.method !== "POST") {
      return res.status(200).json({ success: false, message: "Invalid request" });
    }

    try {
      const { description } = req.body;

      const googleResponse = await axios({
        url: `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=%${description}&inputtype=textquery&fields=geometry&key=AIzaSyCwlbBlciY3kB52y5_h0k4Zxmi8Ho4zK3M`,
        method: "get",
        headers: {
          Accept: "application/json",
        },
      });

      const data = await googleResponse.data;
      return res.status(200).json(data);
    } catch (error) {
      return res.status(500).json(error);
    }
  });
}
