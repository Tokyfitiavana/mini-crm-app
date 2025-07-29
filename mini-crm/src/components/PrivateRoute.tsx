import { Navigate } from "react-router-dom";
import type { FC, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

const PrivateRoute: FC<Props> = ({ children }) => {
  const token = localStorage.getItem("authToken");
  return token ? <>{children}</> : <Navigate to="/Dashboard" replace />;
};

export default PrivateRoute;
