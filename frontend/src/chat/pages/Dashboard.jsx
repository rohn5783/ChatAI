import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useAuth } from "../../features/auth/hook/useAuth";
import { useEffect } from "react";
import { useChat } from "../../chat/hooks/useChat";
import "../../css/dashboard.css";

const chatTitles = [
  "React dashboard layout",
  "Socket connection notes",
  "Auth flow cleanup",
  "Search UI inspiration",
  "Backend API plan",
];

const navItems = [];

const sources = ["Frontend guide", "Socket docs", "Auth notes"];

const Dashboard = () => {
  const { initializeSocketCoonection } = useChat();

  useEffect(() => {
    initializeSocketCoonection();
  }, [initializeSocketCoonection]);

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

  const handleSubmit = (event) => {
    event.preventDefault();
  };

  return (
    <main className="dashboard-page">
      <aside className="dashboard-sidebar" aria-label="Chat history">
        <div className="dashboard-brand">
          <span className="dashboard-brand-mark">P</span>
          <span>Perplexity</span>
        </div>

        <button type="button" className="dashboard-new-thread">
          New Thread
        </button>

        <nav className="dashboard-nav" aria-label="Primary navigation">
          {navItems.map((item) => (
            <button type="button" className="dashboard-nav-link" key={item}>
              {item}
            </button>
          ))}
        </nav>

        <nav className="dashboard-chat-list" aria-label="Previous chats">
          <p className="dashboard-section-label">Recent</p>
          {chatTitles.map((title, index) => (
            <button
              type="button"
              className="dashboard-chat-link"
              key={`${title}-${index}`}
            >
              {title}
            </button>
          ))}
        </nav>
      </aside>

      <section className="dashboard-chat-shell" aria-label="Chat workspace">
        <header className="dashboard-topbar">
          <button type="button" className="dashboard-mode-button">
            Pro Search
          </button>
          <div className="dashboard-actions">
            {username && <span className="dashboard-username">{username}</span>}
            <button type="button" className="logout-button" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </header>

        <section className="dashboard-conversation" aria-label="Current chat">
          <div className="dashboard-user-message"></div>

          <article className="dashboard-response-panel">
            <div className="dashboard-response-heading">
              <span className="dashboard-ai-mark">P</span>
              <h1>Build a focused chat workspace</h1>
            </div>
            <p>
              Start with a calm navigation rail for history, keep the active
              conversation centered, and let the composer stay ready at the
              bottom. The interface should feel clean, fast, and research-first.
            </p>
            <div className="dashboard-source-row" aria-label="Sources">
              {sources.map((source) => (
                <span className="dashboard-source" key={source}>
                  {source}
                </span>
              ))}
            </div>
          </article>
        </section>

        <form className="dashboard-composer" onSubmit={handleSubmit}>
          <input
            aria-label="Chat input"
            className="dashboard-chat-input"
            placeholder="Ask anything..."
            type="text"
          />
          <button type="submit" className="dashboard-send-button">
            Ask
          </button>
        </form>
      </section>
    </main>
  );
};

export default Dashboard;
