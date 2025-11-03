import { Navigate, useLocation } from "react-router-dom";
import { useAuthContext } from "../auth/AuthContext";

type Props = {
  children: React.ReactElement;
};

export const ProtectedRoute = ({ children }: Props) => {
  const location = useLocation();
  const { isAuthenticated } = useAuthContext();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};
