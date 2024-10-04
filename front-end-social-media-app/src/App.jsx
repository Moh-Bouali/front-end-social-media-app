import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom"; // Update import
import { AuthProvider } from "./contexts/AuthContext";
import LoginRedirect from "./pages/LoginRedirect";
import MainPage from "./pages/MainPage";

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/callback" element={<LoginRedirect />} />{" "}
          {/* Login redirect route */}
          <Route path="/" element={<Navigate to="/callback" />} />{" "}
          {/* Redirect root to callback */}
          <Route path="/main-page" element={<MainPage />} />{" "}
          {/* Main page route */}
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
