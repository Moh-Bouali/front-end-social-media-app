import { useEffect } from "react";
import { useAuth } from "../contexts/AuthContext"; // Import the AuthContext

const LoginRedirect = () => {
  const { saveToken } = useAuth(); // Get the function to save the token
  const clientId = "spring-client-individual-id";
  const redirectUri = "http://frontend-domain/callback";
  // Correct Keycloak URL
  const keycloakUrl = `http://keycloak-domain/realms/spring-microservices-security-realm/protocol/openid-connect/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(
    redirectUri
  )}&response_type=token`;

  useEffect(() => {
    // Check if the token is already present
    const params = new URLSearchParams(window.location.hash.slice(1));
    const token = params.get("access_token"); // Extract token from URL fragment

    if (token) {
      saveToken(token); // Save the token in the context
      console.log("I am in Loginredirect" + token);
      // Redirect to the main page
      window.location.href = "/main-page";
    } else {
      // If no token, redirect to Keycloak for authentication
      window.location.href = keycloakUrl; // This redirects to the Keycloak login page
    }
  }, [saveToken, keycloakUrl]);

  return <div>Logging in...</div>; // Show some loading state
};

export default LoginRedirect;
