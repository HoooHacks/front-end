// src/components/Chatbot/Chatbot.tsx
import React, { useState } from 'react';
import './Chatbot.css';

interface ChatMessage {
  sender: 'ai' | 'user';
  text: string;
}

const Chatbot: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { sender: 'ai', text: 'Hello! How can I help you today?' }
  ]);
  const [userMessage, setUserMessage] = useState('');

  const handleSend = () => {
    if (!userMessage.trim()) return;
    setMessages(prev => [
      ...prev,
      { sender: 'user', text: userMessage },
      { sender: 'ai', text: `You said: ${userMessage}` }
    ]);
    setUserMessage('');
  };

  return (
    <div className="chatbot-container">
      <div className="chatbot-header">
        <h2>Simple Chatbot</h2>
      </div>
      <div className="chatbot-messages">
        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.sender}`}>
            <div className="bubble">{msg.text}</div>
          </div>
        ))}
      </div>
      <div className="chatbot-input">
        <input
          type="text"
          value={userMessage}
          onChange={e => setUserMessage(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="Type your message..."
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
};

export default Chatbot;