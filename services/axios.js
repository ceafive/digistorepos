import axios from "axios";

export const axiosIPAY = axios.create({
  baseURL: process.env.BASE_URI,
  timeout: 60000,
});
