import axios from "axios";

const URL = axios.create({
  baseURL: "https://gateway-domain",
});

export default URL;
