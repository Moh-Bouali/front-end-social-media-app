import axios from "axios";

const URL = axios.create({
  baseURL: "http://gateway-domain",
});

export default URL;
