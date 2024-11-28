import { createContext, useState, useContext } from "react";

// Create a context for the JWT token
const AuthContext = createContext();
const redirectUri = "http://frontend-domain";

// function deleteAllCookies() {
//   const cookies = document.cookie.split(";");
//   for (let i = 0; i < cookies.length; i++) {
//     const cookie = cookies[i];
//     const eqPos = cookie.indexOf("=");
//     const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
//     document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
//   }
// }

// Create a provider component
function AuthProvider({ children }) {
  // Initialize state with token from localStorage or null if not present
  const [token, setToken] = useState(
    () => localStorage.getItem("token") || null
  );

  // Function to update the token (after getting it from Keycloak)
  const saveToken = (newToken) => {
    setToken(newToken);
    localStorage.setItem("token", newToken); // Save token to localStorage
  };

  // Function to clear the token (logout)
  const logout = () => {
    setToken(null);
    localStorage.removeItem("token"); // Remove token from localStorage
    //deleteAllCookies();
    //window.location.href = "/"; // Redirect to login page (or whatever path you prefer)
    window.location.href = `http://keycloak-domain/realms/spring-microservices-security-realm/protocol/openid-connect/logout?post_logout_redirect_uri=${redirectUri}&client_id=spring-client-individual-id`; // Redirect to Keycloak's login page after logout
  };

  // Optional: Automatically logout if token is invalid or expired (this can be implemented)
  // useEffect(() => {
  //   // Here you can check the token expiry if you want
  //   // For example, you can decode the JWT and check its expiration time
  // }, [token]);

  return (
    <AuthContext.Provider value={{ token, saveToken, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error("WAS USED OUTSIDE AUTHPROVIDER");
  return context;
}

// Custom hook to use the AuthContext in other components
export { AuthProvider, useAuth };
