import { useEffect, useMemo, useState } from "react";
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
import "../../css/dashboard.css";

const navItems = ["Home", "Discover", "Library"];
const answerSources = [];

const Dashboard = () => {
  // const { initializeSocketCoonection } = useChat();
  const navigate = useNavigate();
  const { logoutUser } = useAuth();
  const username = useSelector((state) => state.auth.user?.username);

  const [chats, setChats] = useState([]);
  const [messages, setMessages] = useState([]);
  
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

    const optimisticMessage = {
      _id: `local-${Date.now()}`,
      content: message,
      role: "user",
    };

    try {
      setPrompt("");
      setIsSending(true);
      setError("");
      setMessages((currentMessages) => [...currentMessages, optimisticMessage]);

      const response = await sendChatMessage({
        message,
        chatId: activeChatId,
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
          {navItems.map((item) => (
            <button
              type="button"
              className={`dashboard-nav-link ${
                item === "Library" ? "dashboard-nav-link-active" : ""
              }`}
              key={item}
            >
              {item}
            </button>
          ))}
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
            {username && (
              <div className="dashboard-user-chip">
                <span className="dashboard-brand-mark dashboard-avatar">
                  {username.charAt(0).toUpperCase()}
                </span>
                <span className="dashboard-username">{username}</span>
              </div>
            )}
            <button type="button" className="logout-button" onClick={handleLogout}>
              Logout
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
                {message.content}
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
        </form>
      </section>
    </main>
  );
};

export default Dashboard;
