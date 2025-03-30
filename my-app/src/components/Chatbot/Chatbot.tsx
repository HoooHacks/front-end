// src/components/Chatbot/Chatbot.tsx
import React, { useState, useEffect } from "react";
import "./Chatbot.css";

interface ChatMessage {
  sender: "ai" | "user";
  text: string;
}

interface ChatbotProps {
  initialCode: string;
}

const Chatbot: React.FC<ChatbotProps> = ({ initialCode }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [threadId, setThreadId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialCode) {
      startThread(initialCode);
    }
  }, [initialCode]);

  const startThread = async (code: string) => {
    try {
      const res = await fetch("http://127.0.0.1:5000/start_chat_thread", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      setThreadId(data.thread_id);
      setMessages([{ sender: "ai", text: data.ai_message }]);
    } catch (err) {
      console.error("Start thread failed", err);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || !threadId) return;
    setMessages((prev) => [...prev, { sender: "user", text: input }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("http://127.0.0.1:5000/chat_in_thread", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ thread_id: threadId, message: input }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { sender: "ai", text: data.response }]);
    } catch (err) {
      console.error("Chat failed", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chatbot-basic">
      <div className="chat-area">
        {messages.map((msg, i) => (
          <div key={i} className={msg.sender}>
            <div className="bubble">{msg.text}</div>
          </div>
        ))}
        {loading && <div className="ai bubble">Thinking...</div>}
      </div>
      <div className="input-area">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Ask something..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

export default Chatbot;