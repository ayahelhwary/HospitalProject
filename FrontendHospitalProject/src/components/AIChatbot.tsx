import { useState, useRef, useEffect } from "react";
import { Bot, X, Send, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { chatbot } from "@/lib/api";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", content: "Welcome! 👋 I'm the hospital's smart assistant. How can I help you?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;

    const userMsg: Message = { role: "user", content: trimmed };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const data = await chatbot.send(newMessages);
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, an error occurred. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 hero-gradient text-primary-foreground rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-110"
        aria-label="Smart Assistant"
      >
        {isOpen ? <X className="h-6 w-6" /> : <Bot className="h-6 w-6" />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[350px] max-h-[500px] bg-card border border-border rounded-2xl shadow-xl flex flex-col overflow-hidden animate-fade-in">
          {/* Header */}
          <div className="hero-gradient text-primary-foreground p-4 flex items-center gap-3">
            <Bot className="h-6 w-6" />
            <div>
              <h3 className="font-bold text-sm">Smart Assistant</h3>
              <p className="text-xs opacity-80">Available 24/7</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 max-h-[340px] hide-scrollbar">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-xl px-3 py-2 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  {msg.role === "assistant" ? (
                    <div className="prose prose-sm max-w-none dark:prose-invert [&>p]:m-0">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          a: ({ href, children }) => (
                            <a href={href} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
                              {children}
                            </a>
                          ),
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    msg.content
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-end">
                <div className="bg-secondary text-secondary-foreground rounded-xl px-3 py-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-border p-3 flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Type your message..."
              className="flex-1 bg-secondary text-secondary-foreground rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
              disabled={loading}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="w-9 h-9 hero-gradient text-primary-foreground rounded-lg flex items-center justify-center disabled:opacity-50 transition-transform hover:scale-105"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
