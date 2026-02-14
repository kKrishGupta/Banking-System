import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
function ProtectedRoute({ children }) {
  const { user } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}
export {
  ProtectedRoute as default
};
