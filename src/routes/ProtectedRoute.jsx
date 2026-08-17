import { Navigate } from "react-router-dom";

function ProtectedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem("token");
  const loggedIn = localStorage.getItem("loggedIn");
  const rawRole = localStorage.getItem("userRole") || "ROLE_ADMIN";

  if (!token && loggedIn !== "true") {
    return <Navigate to="/login" replace />;
  }

  // Normalize role string (e.g. "ROLE_ADMIN", "ADMIN", "admin")
  let userRole = "ROLE_ADMIN";
  if (rawRole.toUpperCase().includes("COUNSELLOR") || rawRole.toUpperCase().includes("COUNSELOR")) {
    userRole = "ROLE_COUNSELLOR";
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const normalizedAllowed = allowedRoles.map(r => r.toUpperCase());
    const isAllowed = normalizedAllowed.some(r => r.includes(userRole.replace("ROLE_", "")) || userRole.includes(r.replace("ROLE_", "")));

    if (!isAllowed) {
      // Redirect restricted user back to dashboard
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
}

export default ProtectedRoute;