import React, { useState, useRef, useEffect } from "react";
import { useLocation } from "react-router-dom";
import CodeMirror from "@uiw/react-codemirror";
import { python } from "@codemirror/lang-python";

import "./CompeteAi.css";
import aiIcon from "../../assets/icon.jpeg";
import { useAuth0 } from "@auth0/auth0-react";

interface JudgeResult {
  winner: string;
  user_pros: string;
  user_cons: string;
  ai_pros: string;
  ai_cons: string;
  reason: string;
}

const CompeteAi: React.FC = () => {
  const location = useLocation();
  const { getAccessTokenSilently } = useAuth0();

  const userSnippet = location.state?.userSnippet || "// No user snippet provided";
  const aiSnippetFromBackend = location.state?.aiSnippet || "// No AI snippet provided";

  const [previousCode] = useState(userSnippet);
  const [yourCode, setYourCode] = useState(userSnippet);
  const [aiCode] = useState(aiSnippetFromBackend);

  const [isFolded, setIsFolded] = useState(true);
  const [winStreak, setWinStreak] = useState<number | null>(null);
  const [loadingStreak, setLoadingStreak] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [judgeResult, setJudgeResult] = useState<JudgeResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const judgeResultRef = useRef<HTMLDivElement | null>(null);

  const toggleFold = () => setIsFolded(!isFolded);

  useEffect(() => {
    const fetchWinStreak = async () => {
      try {
        const token = await getAccessTokenSilently();
        const response = await fetch('http://localhost:8080/user/winStreak', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch win streak');
        }

        const streak: number = await response.json();
        setWinStreak(streak);
      } catch (error) {
        console.error('Error fetching win streak:', error);
      } finally {
        setLoadingStreak(false);
      }
    };

    fetchWinStreak();
  }, [getAccessTokenSilently]);

  const handleSubmit = async () => {
    if (!yourCode.trim() || !aiCode.trim()) {
      alert("Both your code and AI code must be present.");
      return;
    }

    try {
      setIsLoading(true);

      const response = await fetch("http://127.0.0.1:5000/judge_code_competition", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_code: yourCode, ai_code: aiCode }),
      });

      if (!response.ok) throw new Error("Failed to judge code.");

      const result: JudgeResult = await response.json();
      setJudgeResult(result);
      setSubmitted(true);

      const didUserWin = result.winner === "User";
      setWinStreak((prev) => didUserWin ? (prev !== null ? prev + 1 : 1) : 0);

      await sendResult(yourCode, aiCode, didUserWin);

      setTimeout(() => {
        judgeResultRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 100);
    } catch (err: any) {
      console.error("Judgment error:", err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const sendResult = async (yourCode: string, aiCode: string, didUserWin: boolean) => {
    try {
      const token = await getAccessTokenSilently();

      await fetch("http://localhost:8080/game", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userCode: yourCode, aiCode: aiCode, win: didUserWin }),
      });

      console.log("[INFO] Compete result submitted successfully");
    } catch (err: any) {
      console.error("[ERROR] Failed to submit result:", err.message);
    }
  };

  return (
    <div className="competeai-container">
      <h2 className="competeai-title">CompeteAI</h2>

      <div className="white-container">
        <div className="competeai-info-box">
          <div className="info-left">
            <h3>CompeteAI Info</h3>
            <p><strong>Selected Code Snippet Is Integrated</strong></p>
            <p>Your task in CompeteAI is to complete the following criteria better than the AI:</p>
          </div>
          <div className="info-right">
            <ol>
              <li>Reasonable Naming conventions</li>
              <li>Duplicated logic</li>
              <li>Modularity / readability</li>
              <li>Bugs or inefficiencies</li>
              <li>Maintainability │ Scalability</li>
              <li>Other common code smells</li>
            </ol>
          </div>
        </div>

        <div className={`previous-code-block ${isFolded ? "folded" : ""}`}>
          <div className="previous-code-header">
            <span className="code-label">Previous Code</span>
          </div>
          <div className="previous-code-content">
            <CodeMirror
              value={previousCode}
              theme="dark"
              extensions={[python()]}
              readOnly={true}
              basicSetup={{
                lineNumbers: true,
                highlightActiveLine: true,
                foldGutter: true,
              }}
            />
          </div>
          <div className="previous-code-toggle" onClick={toggleFold}>
            <span className={`chevron ${isFolded ? "down" : "up"}`}></span>
          </div>
        </div>

        <div className="code-grid">
          <div className="code-card user-card">
            <div className="code-card-header">
              <span>Your Code</span>
              <span className="win-streak">
                {loadingStreak ? "Loading..." : <>🔥 Win Streak: {winStreak}</>}
              </span>
            </div>
            <CodeMirror
              value={yourCode}
              theme="dark"
              extensions={[python()]}
              onChange={(value) => setYourCode(value)}
              basicSetup={{
                lineNumbers: true,
                highlightActiveLine: true,
                foldGutter: true,
              }}
            />
          </div>

          <div className="code-card ai-card">
            <div className="code-card-header">
              <img
                src={aiIcon}
                alt="AI Icon"
                style={{ height: "28px", borderRadius: "50%", objectFit: "cover" }}
              />
            </div>
            <CodeMirror
              value={aiCode}
              theme="dark"
              extensions={[python()]}
              readOnly={true}
              basicSetup={{
                lineNumbers: true,
                highlightActiveLine: true,
                foldGutter: true,
              }}
            />
          </div>
        </div>

        {!submitted && (
          <div className="submit-button-container">
            <button className="submit-button" onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? <><span className="spinner" /> Judging...</> : "Submit"}
            </button>
          </div>
        )}

        {submitted && judgeResult && (
          <div ref={judgeResultRef} className="judge-result-container">
            <h3 className="judge-winner">🏆 Winner: {judgeResult.winner}</h3>

            <div className="judge-columns">
              <div className="judge-column">
                <h4>🙋‍♂️ User</h4>
                <div className="pros-section">
                  <span className="section-title">✅ Pros</span>
                  <ul>
                    {(judgeResult.user_pros || "")
                      .split("---")
                      .filter((item) => item.trim() !== "")
                      .map((item, idx) => <li key={idx}>{item.trim()}</li>)}
                  </ul>
                </div>
                <div className="cons-section">
                  <span className="section-title">❌ Cons</span>
                  <ul>
                    {judgeResult.user_cons
                      .split("---")
                      .filter((item) => item.trim() !== "")
                      .map((item, idx) => <li key={idx}>{item.trim()}</li>)}
                  </ul>
                </div>
              </div>

              <div className="judge-column">
                <h4>🤖 AI</h4>
                <div className="pros-section">
                  <span className="section-title">✅ Pros</span>
                  <ul>
                    {judgeResult.ai_pros
                      .split("---")
                      .filter((item) => item.trim() !== "")
                      .map((item, idx) => <li key={idx}>{item.trim()}</li>)}
                  </ul>
                </div>
                <div className="cons-section">
                  <span className="section-title">❌ Cons</span>
                  <ul>
                    {judgeResult.ai_cons
                      .split("---")
                      .filter((item) => item.trim() !== "")
                      .map((item, idx) => <li key={idx}>{item.trim()}</li>)}
                  </ul>
                </div>
              </div>
            </div>

            <div className="final-thought-section">
              <img src={aiIcon} alt="AI Icon" className="ai-avatar" />
              <p><strong>🧠 Final Thought:</strong> {judgeResult.reason}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CompeteAi;