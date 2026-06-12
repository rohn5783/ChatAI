import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { useAuth } from "../hook/useAuth";

const Protected = ({ children }) => {
  const location = useLocation();
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

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return children;
};

export default Protected;
