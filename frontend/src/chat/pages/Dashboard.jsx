import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useAuth } from "../../features/auth/hook/useAuth";
import { useEffect } from "react";
import {useChat} from "../../chat/hooks/useChat";
import "../../css/buttons.css";

const Dashboard = () => {
  const chat = useChat();

  useEffect(() => {
    chat.initializeSocketCoonection();
  }, []);
  const navigate = useNavigate();
  const { logoutUser } = useAuth();
  const username = useSelector((state) => state.auth.user?.username);

  const handleLogout = async () => {
    try {
      await logoutUser();
    } finally {
      navigate("/login");
    }
  };

  return (
    <main className="dashboard-page">
      <div className="dashboard-actions">
        {username && <span className="dashboard-username">{username}</span>}
        <button type="button" className="logout-button" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </main>
  );
};

export default Dashboard;
