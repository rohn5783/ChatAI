import { useEffect, useMemo, useState, useRef } from "react";
import { useSelector } from "react-redux";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";

import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../features/auth/hook/useAuth";
import { useChat } from "../hooks/useChat";
import {
  getChatMessages,
  getChats,
  sendChatMessage,
} from "../service/chat.scoket";
import FileUpload from "../../features/files/components/FileUpload";
import "../../css/dashboard.css";

const navItems = ["Home", "Discover", "Library"];
const answerSources = [];

const Dashboard = () => {
  // const { initializeSocketCoonection } = useChat();
  const navigate = useNavigate();
  const { logoutUser } = useAuth();
  const username = useSelector((state) => state.auth.user?.username);
  const email = useSelector((state) => state.auth.user?.email);

  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "night");
  const [chats, setChats] = useState([]);
  const [showSettings, setShowSettings] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const settingsRef = useRef(null);
  const profileRef = useRef(null);

  useEffect(() => {
    document.documentElement.className = theme === "day" ? "theme-day" : "theme-night";
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Close settings and profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (settingsRef.current && !settingsRef.current.contains(event.target)) {
        setShowSettings(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfile(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "day" ? "night" : "day"));
  };
  const [messages, setMessages] = useState([]);
  const [attachedFiles, setAttachedFiles] = useState([]);
  
  const [activeChatId, setActiveChatId] = useState(null);
  const [prompt, setPrompt] = useState("");
  const [isLoadingChats, setIsLoadingChats] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");

  // useEffect(() => {
  //   initializeSocketCoonection();
  // }, [initializeSocketCoonection]);
 

  const loadChats = async () => {
    try {
      setIsLoadingChats(true);
      setError("");
      const response = await getChats();
      setChats(response.chats ?? []);
    } catch (err) {
      setError(err.message ?? "Unable to load your library.");
    } finally {
      setIsLoadingChats(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    getChats()
      .then((response) => {
        if (!isMounted) return;
        setChats(response.chats ?? []);
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err.message ?? "Unable to load your library.");
      })
      .finally(() => {
        if (!isMounted) return;
        setIsLoadingChats(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const sortedChats = useMemo(() => {
    return [...chats].sort((a, b) => {
      return new Date(b.updatedAt ?? b.createdAt) - new Date(a.updatedAt ?? a.createdAt);
    });
  }, [chats]);

  const activeChat = useMemo(() => {
    return chats.find((chat) => chat._id === activeChatId);
  }, [activeChatId, chats]);

  const handleLogout = async () => {
    try {
      await logoutUser();
    } finally {
      navigate("/login");
    }
  };

  const handleNewThread = () => {
    setActiveChatId(null);
    setMessages([]);
    setPrompt("");
    setError("");
  };

  const handleSelectChat = async (chatId) => {
    try {
      setActiveChatId(chatId);
      setError("");
      const response = await getChatMessages(chatId);
      setMessages(response.messages ?? []);
    } catch (err) {
      setError(err.message ?? "Unable to open this chat.");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const message = prompt.trim();
    if (!message || isSending) return;

    // Check if any attached files are still in flight
    const isStillUploading = attachedFiles.some(
      (file) => file.processingStatus === "uploading" || file.processingStatus === "processing"
    );
    if (isStillUploading) {
      setError("Please wait for all files to complete uploading and processing.");
      return;
    }

    const optimisticMessage = {
      _id: `local-${Date.now()}`,
      content: message,
      role: "user",
      files: [...attachedFiles],
    };

    try {
      setPrompt("");
      setAttachedFiles([]);
      setIsSending(true);
      setError("");
      setMessages((currentMessages) => [...currentMessages, optimisticMessage]);

      const fileIds = optimisticMessage.files
        .filter((file) => !file._id.startsWith("temp-") && file.processingStatus !== "failed")
        .map((file) => file._id);

      const response = await sendChatMessage({
        message,
        chatId: activeChatId,
        fileIds,
      });

      const nextChatId = response.chatId ?? response.chat?._id ?? activeChatId;
      setActiveChatId(nextChatId);
      setMessages((currentMessages) => [
        ...currentMessages.filter((item) => item._id !== optimisticMessage._id),
        response.userMessage,
        response.aiMessage,
      ]);

      await loadChats();
    } catch (err) {
      setMessages((currentMessages) => {
        return currentMessages.filter((item) => item._id !== optimisticMessage._id);
      });
      setPrompt(message);
      setError(err.message ?? "AI response failed. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <main className="dashboard-page">
      <aside className="dashboard-sidebar" aria-label="Chat history">
        <div className="dashboard-brand">
          <span className="dashboard-brand-mark">P</span>
          <span>ChatAI</span>
        </div>

        <button type="button" className="dashboard-new-thread" onClick={handleNewThread}>
          <span aria-hidden="true">+</span>
          New Thread
        </button>

        <nav className="dashboard-nav" aria-label="Primary navigation">
          <button
            type="button"
            className="dashboard-nav-link"
            onClick={handleNewThread}
          >
            Home
          </button>
          <button
            type="button"
            className="dashboard-nav-link dashboard-nav-link-active"
          >
            Library
          </button>
          <button
            type="button"
            className="dashboard-nav-link"
            style={{ display: "flex", alignItems: "center", gap: "6px" }}
            onClick={() => navigate("/memory")}
          >
            🧠 AI Memory
          </button>
        </nav>

        <nav className="dashboard-chat-list" aria-label="Saved chats">
          <p className="dashboard-section-label">Library</p>
          {isLoadingChats && (
            <p className="dashboard-library-empty">Loading chats...</p>
          )}
          {!isLoadingChats && sortedChats.length === 0 && (
            <p className="dashboard-library-empty">No saved chats yet.</p>
          )}
          {sortedChats.map((chat) => (
            <button
              type="button"
              className={`dashboard-chat-link ${
                chat._id === activeChatId ? "dashboard-chat-link-active" : ""
              }`}
              key={chat._id}
              onClick={() => handleSelectChat(chat._id)}
            >
              {chat.title || "New Chat"}
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
            {/* Settings Dropdown */}
            <div className="settings-dropdown-wrapper" ref={settingsRef}>
              <button
                type="button"
                className="header-icon-btn"
                onClick={() => setShowSettings(!showSettings)}
                aria-label="Settings"
                title="Settings"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3"></circle>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                </svg>
              </button>
              {showSettings && (
                <div className="settings-dropdown">
                  <button type="button" className="logout-btn-dropdown" onClick={handleLogout}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                      <polyline points="16 17 21 12 16 7"></polyline>
                      <line x1="21" y1="12" x2="9" y2="12"></line>
                    </svg>
                    Logout
                  </button>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="profile-dropdown-wrapper" ref={profileRef}>
              <button
                type="button"
                className={`header-icon-btn ${showProfile ? "header-icon-btn-active" : ""}`}
                onClick={() => setShowProfile(!showProfile)}
                aria-label="Profile"
                title={username ? `Logged in as ${username}` : "Profile"}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M12 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"></path>
                  <path d="M18 19c0-3.3-2.7-6-6-6s-6 2.7-6 6"></path>
                </svg>
              </button>
              {showProfile && (
                <div className="profile-dropdown">
                  <div className="profile-dropdown-header">
                    <div className="profile-dropdown-avatar">
                      {username ? username.charAt(0).toUpperCase() : "U"}
                    </div>
                    <div className="profile-dropdown-info">
                      <p className="profile-dropdown-label">User Profile</p>
                      <h4 className="profile-dropdown-username">{username || "User"}</h4>
                      <p className="profile-dropdown-email">{email || "No email provided"}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Theme Toggle Icon */}
            <button
              type="button"
              className="header-icon-btn theme-toggle-btn"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === "day" ? "night" : "day"} mode`}
              title={`Switch to ${theme === "day" ? "Night" : "Day"} mode`}
            >
              {theme === "day" ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5"></circle>
                  <line x1="12" y1="1" x2="12" y2="3"></line>
                  <line x1="12" y1="21" x2="12" y2="23"></line>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                  <line x1="1" y1="12" x2="3" y2="12"></line>
                  <line x1="21" y1="12" x2="23" y2="12"></line>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                </svg>
              )}
            </button>
          </div>
        </header>

        <section className="dashboard-conversation" aria-label="Current chat">
          <div className="dashboard-chat-title">
            {activeChat?.title }
          </div>

          {messages.length === 0 && (
            <article className="dashboard-empty-state">
              <h1>What do you want to know?</h1>
              <p>
                Ask anything from the AI.
              </p>
            </article>
          )}

          {messages.map((message) => {
            const isUser = message.role === "user";

            return isUser ? (
              <div className="dashboard-user-message" key={message._id}>
                <div>{message.content}</div>
                {message.files && message.files.length > 0 && (
                  <div className="message-attachments-row">
                    {message.files.map((file) => (
                      <span key={file._id} className="message-attachment-badge" title={file.fileName}>
                        <span className="message-attachment-icon">
                          {file.fileType === "application/pdf" ? "📄" : "🖼️"}
                        </span>
                        {file.fileName}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <article className="dashboard-response-panel" key={message._id}>
                <div className="dashboard-response-heading">
                  {/* <span className="dashboard-ai-mark">P</span> */}
                  <h2>Answer</h2>
                </div>
                <div className="markdown-content">
  <ReactMarkdown
    remarkPlugins={[remarkGfm]}
    components={{
      code({ inline, className, children, ...props }) {
        const match = /language-(\w+)/.exec(className || "");

        return !inline && match ? (
          <SyntaxHighlighter
            style={oneDark}
            language={match[1]}
            PreTag="div"
            {...props}
          >
            {String(children).replace(/\n$/, "")}
          </SyntaxHighlighter>
        ) : (
          <code className={className} {...props}>
            {children}
          </code>
        );
      },
    }}
  >
    {message.content}
  </ReactMarkdown>
</div>
                <div className="dashboard-source-row" aria-label="Sources">
                  {answerSources.map((source) => (
                    <span className="dashboard-source" key={source}>
                      {source}
                    </span>
                  ))}
                </div>
              </article>
            );
          })}

          {isSending && (
            <article className="dashboard-response-panel dashboard-response-loading">
              <div className="dashboard-response-heading">
                {/* <span className="dashboard-ai-mark"></span> */}
                <h2>Thinking...</h2>
              </div>
              <p>Generating an answer for your question.</p>
            </article>
          )}

          {error && <p className="dashboard-error">{error}</p>}
        </section>

        <form className="dashboard-composer" onSubmit={handleSubmit}>
          {attachedFiles.length > 0 && (
            <div className="composer-previews-row">
              <FileUpload
                mode="previews"
                attachedFiles={attachedFiles}
                setAttachedFiles={setAttachedFiles}
              />
            </div>
          )}
          <div className="composer-input-row">
            <FileUpload
              mode="button"
              attachedFiles={attachedFiles}
              setAttachedFiles={setAttachedFiles}
            />
            <textarea
              aria-label="Chat input"
              className="dashboard-chat-input"
              disabled={isSending}
              value={prompt}
              placeholder="Ask anything..."
              rows={1}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
            />
            <button
              type="submit"
              className="dashboard-send-button"
              disabled={isSending || !prompt.trim()}
            >
              {isSending ? "Asking" : "Ask"}
            </button>
          </div>
        </form>
      </section>
    </main>
  );
};

export default Dashboard;
