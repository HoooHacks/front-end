import React, {
  useState,
  useEffect,
  useCallback,
  useImperativeHandle,
  forwardRef,
  useRef,
} from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import "./Chatbot.css";
import AiIcon from "../../assets/icon.jpeg";

interface ChatMessage {
  sender: "ai" | "user";
  text: string;
}

interface StartChatResponse {
  thread_id: string;
  ai_message: string;
}

interface ChatResponse {
  response: string;
}

interface SonarIssue {
  name: string;
  explanation: string;
  link: string;
}

interface ChatbotProps {
  initialCode: string;
  sonarIssues: { issues: SonarIssue[] } | null;
  isAnalyzing: boolean;
  onMessageRendered?: () => void;
}

const Chatbot = forwardRef((props: ChatbotProps, ref) => {
  const { initialCode, sonarIssues, isAnalyzing, onMessageRendered } = props;
  const [threadId, setThreadId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'ai' | 'sonarqube'>('ai');

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: "ai",
      text: `Your code has been successfully integrated!  
      Feel free to **highlight** and **then press** the bottom right buttons on your code screen:  
      1. Press **Analyze** for an AI analysis of your code  
      2. **Press *CompeteAI*** to improve your code optimization by competing against the AI  
      Happy Coding!`
    },
  ]);
  const [userMessage, setUserMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Track previous message count to detect new messages
  const prevMessageCountRef = useRef(messages.length);

  useEffect(() => {
    if (initialCode.trim()) {
      setThreadId(null);
      startChatThread(initialCode);
    }
  }, [initialCode]);

  const startChatThread = useCallback(async (codeSnippet: string) => {
    setIsLoading(true);
    try {
      const response = await fetch("http://127.0.0.1:5000/start_chat_thread", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: codeSnippet }),
      });
      if (!response.ok) {
        throw new Error("Failed to start chat thread");
      }
      const data: StartChatResponse = await response.json();
      setThreadId(data.thread_id);
      if (data.ai_message) {
        setMessages((prev) => [
          ...prev,
          { sender: "ai", text: data.ai_message },
        ]);
      }
    } catch (err: any) {
      console.error("Error starting chat thread:", err.message);
    } finally {
      setTimeout(() => setIsLoading(false), 0);
    }
  }, []);

  const sendChatMessage = useCallback(
    async (message: string) => {
      if (!threadId) return;
      setIsLoading(true);
      try {
        setMessages((prev) => [...prev, { sender: "user", text: message }]);
        const response = await fetch("http://127.0.0.1:5000/chat_in_thread", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ thread_id: threadId, message }),
        });
        if (!response.ok) {
          throw new Error("Chat in thread failed");
        }
        const data: ChatResponse = await response.json();
        setMessages((prev) => [...prev, { sender: "ai", text: data.response }]);
      } catch (err: any) {
        console.error("Error in chat thread:", err.message);
      } finally {
        setIsLoading(false);
      }
    },
    [threadId]
  );

  const handleSend = () => {
    if (!userMessage.trim()) return;
    sendChatMessage(userMessage);
    setUserMessage("");
  };

  useImperativeHandle(ref, () => ({
    addExternalMessage: (msg: string) => {
      setMessages((prev) => [...prev, { sender: "ai", text: msg }]);
    },
    setExternalLoading: (loading: boolean) => {
      setIsLoading(loading);
    },
  }));

  // Call the onMessageRendered callback when a new message is added while loading.
  useEffect(() => {
    if (
      prevMessageCountRef.current < messages.length &&
      isLoading &&
      onMessageRendered
    ) {
      onMessageRendered();
    }
    prevMessageCountRef.current = messages.length;
  }, [messages, isLoading, onMessageRendered]);

  return (
    <div className="chatbot-container fixed-height">
      <div className="chatbot-header">
        <h2>Coder Analyzer</h2>
      </div>
      <div className="chatbot-white-container">
        <div className="chatbot-top-buttons">
          <button
            className={`top-button ${activeTab === 'sonarqube' ? 'active' : ''}`}
            onClick={() => setActiveTab('sonarqube')}
          >
            SonarQube
          </button>
          <button
            className={`top-button ${activeTab === 'ai' ? 'active' : ''}`}
            onClick={() => setActiveTab('ai')}
          >
            AI
          </button>
        </div>
      </div>
      <div className="chatbot-content">
        {activeTab === 'ai' ? (
          <>
            <div className="chat-messages scrollable">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`chat-message ${msg.sender === "ai" ? "ai-message" : "user-message"}`}
                >
                  {msg.sender === "ai" && (
                    <div className="ai-icon">
                      <img src={AiIcon} alt="AI Icon" />
                    </div>
                  )}
                  <div className="message-bubble">
                    <ReactMarkdown
                      components={{
                        code({ node, inline, className, children, ...props }: any) {
                          const match = /language-(\w+)/.exec(className || '');
                          const language = match?.[1] || 'python';
                          return inline ? (
                            <code className={className} {...props}>
                              {children}
                            </code>
                          ) : (
                            <div className="code-block-wrapper">
                              <SyntaxHighlighter language={language} style={oneDark} PreTag="div">
                                {String(children).replace(/\n$/, '')}
                              </SyntaxHighlighter>
                            </div>
                          );
                        },
                        p(props: React.HTMLAttributes<HTMLParagraphElement>) {
                          return <div>{props.children}</div>;
                        },
                      }}
                    >
                      {msg.text}
                    </ReactMarkdown>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="chat-loading">
                  <div className="spinner"></div>
                  <p>
                    
                    <span className="spinner-dots">
                      <span>.</span>
                      <span>.</span>
                      <span>.</span>
                    </span>
                  </p>
                </div>
              )}
            </div>

            {threadId && (
              <div className="chat-input-wrapper">
                <button className="chat-input-button plus-icon" onClick={() => console.log("Plus button clicked")}>
                  +
                </button>
                <input
                  className="chat-input"
                  type="text"
                  placeholder="What can I help you with?"
                  value={userMessage}
                  onChange={(e) => setUserMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSend();
                  }}
                />
                <button className="chat-input-button mic-icon" onClick={handleSend}>
                    
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="sonarqube-wrapper">
            {isAnalyzing ? (
              <div className="chat-loading">
                <p>Analyzing SonarQube issues</p>
                <div className="chat-loading">
                  <div className="spinner"></div>
                    <span className="spinner-dots">
                      <span>.</span>
                      <span>.</span>
                      <span>.</span>
                    </span>
                </div>
              </div>
            ) : sonarIssues && sonarIssues.issues?.length > 0 ? (
              <div className="sonar-issue-list scrollable">
                {sonarIssues.issues.map((issue, idx) => (
                  <div key={idx} className="sonar-issue-item">
                    <h4>{idx + 1}. {issue.name}</h4>
                    <p>{issue.explanation}</p>
                    <a href={issue.link} target="_blank" rel="noopener noreferrer">
                      Watch An <span className="bold-text">Explanation</span> on Alt
                    </a>
                    <hr />
                  </div>
                ))}
              </div>
            ) : (
              <p>No parsed issues found or analysis not started.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
});

export default Chatbot;
