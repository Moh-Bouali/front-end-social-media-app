import axios from "axios";

const URL = axios.create({
  baseURL: "http://localhost:9000",
});

export default URL;
