import axios from "axios";

export const axiosIPAY = axios.create({
  baseURL: "https://manage.ipaygh.com/apidev/v1/gateway",
});
