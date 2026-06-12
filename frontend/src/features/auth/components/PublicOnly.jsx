import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useAuth } from "../hook/useAuth";

const PublicOnly = ({ children }) => {
  const { getCurrentUser } = useAuth();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [checkingAuth, setCheckingAuth] = useState(!isAuthenticated);

  useEffect(() => {
    let isMounted = true;

    if (isAuthenticated && user) {
      setCheckingAuth(false);
      return;
    }

    setCheckingAuth(true);
    getCurrentUser()
      .catch(() => {})
      .finally(() => {
        if (isMounted) {
          setCheckingAuth(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [getCurrentUser, isAuthenticated, user]);

  if (checkingAuth) {
    return null;
  }

  if (isAuthenticated && user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export default PublicOnly;
