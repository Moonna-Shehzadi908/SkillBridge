import { useEffect, useRef, useState } from "react";
import {
  Bot,
  MessageCircle,
  Send,
  X,
  Loader2,
  Trash2,
} from "lucide-react";

const API_URL = "http://127.0.0.1:8000";

interface Message {
  id: number;
  sender: "user" | "assistant";
  message: string;
  created_at: string;
}

interface Conversation {
  id: number;
  title: string;
  messages: Message[];
}

function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [conversation, setConversation] =
    useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const token = localStorage.getItem("access_token");

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  const createConversation = async () => {
    if (!token) return;

    try {
      setInitializing(true);

      const response = await fetch(`${API_URL}/api/chatbot/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: "SkillBridge Assistant",
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create conversation");
      }

      const data: Conversation = await response.json();

      setConversation(data);
      setMessages([]);
    } catch (error) {
      console.error("Chatbot error:", error);
    } finally {
      setInitializing(false);
    }
  };

  const openChat = async () => {
    setIsOpen(true);

    if (!conversation) {
      await createConversation();
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || !conversation || !token || loading) {
      return;
    }

    const userText = input.trim();

    setInput("");
    setLoading(true);

    try {
      const response = await fetch(
        `${API_URL}/api/chatbot/${conversation.id}/messages/`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            message: userText,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      const data = await response.json();

      setMessages((previous) => [
        ...previous,
        data.user_message,
        data.assistant_message,
      ]);
    } catch (error) {
      console.error("Message error:", error);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = async () => {
    if (!conversation || !token) return;

    try {
      await fetch(
        `${API_URL}/api/chatbot/${conversation.id}/`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setConversation(null);
      setMessages([]);

      await createConversation();
    } catch (error) {
      console.error("Clear chat error:", error);
    }
  };

  if (!token) {
    return null;
  }

  return (
    <>
     {/* Floating AI Assistant Button */}
{!isOpen && (
  <button
    onClick={openChat}
    className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-full px-4 py-3 shadow-lg transition-all duration-200 hover:scale-105 hover:opacity-90"
    style={{
      background: "var(--primary)",
      color: "white",
    }}
    title="Open SkillBridge AI Assistant"
  >
    <Bot size={21} />

    <span className="hidden sm:inline text-sm font-semibold">
      AI Assistant
    </span>
  </button>
)}
      {/* Chat Window */}
      {isOpen && (
        <div
          className="fixed bottom-6 right-6 z-50 flex w-[360px] max-w-[calc(100vw-2rem)] flex-col overflow-hidden rounded-2xl border shadow-2xl"
          style={{
            background: "var(--surface)",
            borderColor: "var(--border)",
            height: "520px",
          }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{
              background: "var(--primary)",
              color: "white",
            }}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
                <Bot size={21} />
              </div>

              <div>
                <h3 className="font-semibold">
                  SkillBridge Assistant
                </h3>
                <p className="text-xs opacity-80">
                  Your career & learning assistant
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={clearChat}
                className="rounded-lg p-2 transition hover:bg-white/10"
                title="Clear chat"
              >
                <Trash2 size={17} />
              </button>

              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-2 transition hover:bg-white/10"
                title="Close"
              >
                <X size={19} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div
            className="flex-1 space-y-3 overflow-y-auto p-4"
            style={{
              background: "var(--bg)",
            }}
          >
            {initializing ? (
              <div
                className="flex h-full items-center justify-center"
                style={{ color: "var(--text-light)" }}
              >
                <Loader2
                  size={24}
                  className="animate-spin"
                />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <div
                  className="mb-3 flex h-14 w-14 items-center justify-center rounded-full"
                  style={{
                    background: "var(--surface-soft)",
                    color: "var(--primary)",
                  }}
                >
                  <Bot size={28} />
                </div>

                <h4
                  className="mb-1 font-semibold"
                  style={{ color: "var(--text-heading)" }}
                >
                  Hi! I'm your SkillBridge Assistant 🤖
                </h4>

                <p
                  className="max-w-[270px] text-sm"
                  style={{ color: "var(--text-light)" }}
                >
                  Ask me about careers, skills, learning resources,
                  skill gaps or opportunities.
                </p>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.sender === "user"
                      ? "justify-end"
                      : "justify-start"
                  }`}
                >
                  <div
                    className="max-w-[80%] whitespace-pre-line rounded-2xl px-4 py-2.5 text-sm"
                    style={
                      message.sender === "user"
                        ? {
                            background: "var(--primary)",
                            color: "white",
                            borderBottomRightRadius: "5px",
                          }
                        : {
                            background: "var(--surface-soft)",
                            color: "var(--text)",
                            borderBottomLeftRadius: "5px",
                          }
                    }
                  >
                    {message.message}
                  </div>
                </div>
              ))
            )}

            {loading && (
              <div className="flex justify-start">
                <div
                  className="flex items-center gap-2 rounded-2xl px-4 py-3"
                  style={{
                    background: "var(--surface-soft)",
                    color: "var(--text-light)",
                  }}
                >
                  <Loader2
                    size={16}
                    className="animate-spin"
                  />
                  <span className="text-sm">
                    Thinking...
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div
            className="border-t p-3"
            style={{
              background: "var(--surface)",
              borderColor: "var(--border)",
            }}
          >
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(event) =>
                  setInput(event.target.value)
                }
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    sendMessage();
                  }
                }}
                placeholder="Ask me something..."
                disabled={loading || initializing}
                className="min-w-0 flex-1 rounded-xl border px-3 py-2.5 text-sm outline-none"
                style={{
                  background: "var(--surface-soft)",
                  color: "var(--text)",
                  borderColor: "var(--border)",
                }}
              />

              <button
                onClick={sendMessage}
                disabled={
                  !input.trim() ||
                  loading ||
                  initializing
                }
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                style={{
                  background: "var(--primary)",
                  color: "white",
                }}
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Chatbot;