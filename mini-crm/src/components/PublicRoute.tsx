import { Navigate } from "react-router-dom";

const PublicRoute = ({ children }: { children: JSX.Element }) => {
  const token = localStorage.getItem("authToken");
  return token ? <Navigate to="/dashboard" replace /> : children;
};

export default PublicRoute;
