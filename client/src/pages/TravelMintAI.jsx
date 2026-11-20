
import { useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";
import api from "../api/api";
import "./TravelMintAI.css";

function TravelMintAI() {
  const location = useLocation();
  const navigate = useNavigate();
  const initialQuestion = location.state?.initialQuestion || "";

  const [messages, setMessages] = useState([]);
  const [conversationId, setConversationId] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [error, setError] = useState("");

  const conversationIdRef = useRef(null);
  const initialRequestStarted = useRef(false);
  const chatEndRef = useRef(null);

  // Keep the conversation ID synchronized with the ref.
  const updateActiveConversation = (id) => {
    conversationIdRef.current = id;
    setConversationId(id);
  };

  // Load the user's conversation history.
  const fetchConversations = useCallback(async () => {
    try {
      const response = await api.get("/ai/conversations");
      setConversations(response.data?.conversations || []);
    } catch (err) {
      console.error("Could not load conversations:", err);
      setError("Could not load your conversation history.");
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Automatically scroll to the latest message.
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages, loading]);

  // Start a fresh chat. A database record is created when the first
  // message is sent.
  const handleNewChat = () => {
    if (loading) return;

    updateActiveConversation(null);
    setMessages([]);
    setQuestion("");
    setError("");
  };

  // Open an existing conversation and load its messages.
  const handleSelectConversation = async (id) => {
    if (loading || String(id) === String(conversationIdRef.current)) return;

    setError("");
    setQuestion("");
    setMessages([]);
    updateActiveConversation(id);
    setLoading(true);

    try {
      const response = await api.get(
        `/ai/conversations/${id}/messages`
      );

      setMessages(response.data?.messages || []);
    } catch (err) {
      console.error("Could not load conversation:", err);
      setError(
        err.response?.data?.message ||
          "Could not open this conversation. Please try again."
      );
      updateActiveConversation(null);
    } finally {
      setLoading(false);
    }
  };

  // Send a message to TravelMint AI.
  const sendMessage = useCallback(
    async (text) => {
      const trimmedQuestion = text.trim();

      if (!trimmedQuestion || loading) return;

      setMessages((current) => [
        ...current,
        { role: "user", content: trimmedQuestion },
      ]);

      setQuestion("");
      setError("");
      setLoading(true);

      try {
        let activeConversationId = conversationIdRef.current;

        // Create a database conversation for a new chat.
        if (!activeConversationId) {
          const createResponse = await api.post("/ai/conversations");

          activeConversationId =
            createResponse.data?.conversation?.id;

          if (!activeConversationId) {
            throw new Error("Could not create a new conversation.");
          }

          updateActiveConversation(activeConversationId);
        }

        // Send the question to the AI backend.
        const response = await api.post("/ai/ask", {
          question: trimmedQuestion,
          conversationId: activeConversationId,
        });

        const answer = response.data?.answer;

        if (!answer) {
          throw new Error("TravelMint AI returned an empty answer.");
        }

        setMessages((current) => [
          ...current,
          { role: "assistant", content: answer },
        ]);

        // Refresh the sidebar so the new title and latest activity appear.
        await fetchConversations();
      } catch (err) {
        console.error("TravelMint AI error:", err);

        setMessages((current) => [
          ...current,
          {
            role: "assistant",
            content:
              err.response?.data?.message ||
              err.message ||
              "TravelMint AI couldn't answer right now. Please try again.",
            isError: true,
          },
        ]);

        // Refresh history in case the conversation was created successfully.
        await fetchConversations();
      } finally {
        setLoading(false);
      }
    },
    [loading, fetchConversations]
  );

  // Handle a question passed from the Dashboard.
  useEffect(() => {
    if (!initialQuestion || initialRequestStarted.current) return;

    initialRequestStarted.current = true;
    handleNewChat();
    sendMessage(initialQuestion);
  }, [initialQuestion, sendMessage]);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!question.trim() || loading) return;

    sendMessage(question);
  };

  return (
    <main className="tm-ai-layout">
        <aside className="tm-ai-sidebar">
          <button
            type="button"
            className="tm-ai-new-chat"
            onClick={handleNewChat}
            disabled={loading}
          >
            <span>＋</span>
            New Chat
          </button>

          <div className="tm-ai-history-heading">
            RECENT CONVERSATIONS
          </div>

          <div className="tm-ai-history-list">
            {historyLoading ? (
              <p className="tm-ai-history-status">
                Loading conversations...
              </p>
            ) : conversations.length === 0 ? (
              <p className="tm-ai-history-status">
                Your conversations will appear here.
              </p>
            ) : (
              conversations.map((conversation) => (
                <button
                  type="button"
                  key={conversation.id}
                  className={`tm-ai-history-item ${
                    String(conversation.id) ===
                    String(conversationId)
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    handleSelectConversation(conversation.id)
                  }
                  disabled={loading}
                  title={conversation.title}
                >
                  <span className="tm-ai-history-icon">◷</span>
                  <span className="tm-ai-history-title">
                    {conversation.title || "New chat"}
                  </span>
                </button>
              ))
            )}
          </div>

          <div className="tm-ai-sidebar-footer">
            TRAVELMINT AI
            <span>Your journeys, one conversation at a time.</span>
          </div>
        </aside>

        <section className="tm-ai-main">
          <header className="tm-ai-topbar">
            <div className="tm-ai-header-left">
              <button
                type="button"
                className="tm-ai-back-icon"
                onClick={() => navigate("/dashboard")}
                aria-label="Back to Dashboard"
                title="Back to Dashboard"
              >
                ‹
              </button>

              <div>
                <span>TRAVELMINT</span>
                <h2>AI Assistant</h2>
              </div>
            </div>
          </header>

          <div className="tm-ai-chat">
            {messages.length === 0 && !loading && (
              <div className="tm-ai-intro">
                <span>✳</span>
                <h1>
                  Where will
                  <br />
                  <em>we take you?</em>
                </h1>
                <p>
                  Discover destinations, plan itineraries and find
                  inspiration for your next journey.
                </p>
              </div>
            )}

            {messages.map((message, index) => (
              <article
                key={`${conversationId || "new"}-${index}`}
                className={`tm-ai-message ${
                  message.role === "user"
                    ? "user-message"
                    : "assistant-message"
                }`}
              >
                <span className="tm-ai-message-label">
                  {message.role === "user" ? "YOU" : "TRAVELMINT AI"}
                </span>

                <div className="tm-ai-message-body">
                  {message.role === "assistant" ? (
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      rehypePlugins={[rehypeRaw, rehypeSanitize]}
                    >
                      {message.content}
                    </ReactMarkdown>
                  ) : (
                    <p>{message.content}</p>
                  )}
                </div>
              </article>
            ))}

            {loading && (
              <div className="tm-ai-thinking" role="status">
                <span>TRAVELMINT AI</span>
                <p>Thinking about your journey...</p>
                <div className="tm-ai-dots">
                  <i />
                  <i />
                  <i />
                </div>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {error && (
            <div aria-live="polite" className="tm-ai-error">
              {error}
            </div>
          )}

          <form className="tm-ai-form" onSubmit={handleSubmit}>
            <label htmlFor="tm-ai-question">
              MESSAGE TRAVELMINT AI
            </label>

            <div className="tm-ai-input-wrap">
              <textarea
                id="tm-ai-question"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask anything about your next journey..."
                maxLength={1500}
                rows={2}
                disabled={loading}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit(e);
                  }
                }}
              />

              <button
                type="submit"
                disabled={!question.trim() || loading}
                aria-label="Send message"
              >
                {loading ? "…" : "↗"}
              </button>
            </div>

            <p>
              Travel smarter. Discover more. Make every journey yours.
            </p>
          </form>
        </section>
    </main>
  );
}

export default TravelMintAI;
