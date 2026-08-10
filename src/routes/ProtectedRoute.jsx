import { Navigate } from "react-router-dom";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  const loggedIn = localStorage.getItem("loggedIn");

  if (!token && loggedIn !== "true") {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default ProtectedRoute;