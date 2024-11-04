// import { useAuth } from "../contexts/AuthContext"; // Update with the correct path

// const useAxios = () => {
//   const { token } = useAuth(); // Access token from AuthContext

//   // Set up a request interceptor
//   URL.interceptors.request.use(
//     (config) => {
//       if (token) {
//         config.headers.Authorization = `Bearer ${token}`;
//       }
//       return config;
//     },
//     (error) => {
//       return Promise.reject(error);
//     }
//   );

//   return URL;
// };

// export default useAxios;
