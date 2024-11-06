import axios from "axios";

const URL = axios.create({
  baseURL: "http://api-gateway:9000",
});

export default URL;
