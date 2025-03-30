import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import CodeTree from '../../components/CodeTree/CodeTree';
import CodeDetails from '../../components/CodeDetails/CodeDetails';
import Chatbot from '../../components/Chatbot/Chatbot';
import './AnalyzePage.css';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const AnalyzePage: React.FC = () => {
  const location = useLocation();
  const { token, repo, fileTree, sonarResult } = (location.state as {
    token: string;
    repo: string;
    fileTree: string;
    sonarResult: string;
  }) || { token: '', repo: '', fileTree: '', sonarResult: '' };

  const [selectedFilePath, setSelectedFilePath] = useState<string | null>(null);
  const [selectedSnippet, setSelectedSnippet] = useState<string | null>(null);
  const [parsedSonarIssues, setParsedSonarIssues] = useState<any>(null);
  const hasStartedAnalysis = useRef(false);
  const isAnalyzing = useRef(true);

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [leftWidth, setLeftWidth] = useState(20);
  const [middleWidth, setMiddleWidth] = useState(40);
  const [rightWidth, setRightWidth] = useState(40);
  const chatbotRef = useRef<any>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  const handleFileSelect = (filePath: string) => {
    setSelectedFilePath(filePath);
  };

  const handleAnalyze = async (code: string) => {
    setSelectedSnippet(code);
    chatbotRef.current?.setExternalLoading?.(true); // Show loading
    try {
      const res = await fetch("http://127.0.0.1:5000/code_review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      if (!res.ok) throw new Error("Code review failed");
      const data = await res.json();
      console.log(data);
      const reviewMessage = [
        "**Code Snippet Analysis Complete!**",
        ``,
        `**Score:** ${data.score}/100`,
        ``,
        `**Feedback:**`,
        `${data.feedback}`,
        ``,
        `**Suggested Revised Code:**`,
        '```python',
        data.revised_code.trim(),
        '```',
        ``,
        `**Recommended YouTube Video:** [Watch here](${data.youtube_link})`
      ].join('\n');
      chatbotRef.current?.addExternalMessage?.(reviewMessage);
    } catch (err) {
      console.error("Code review error:", err);
      chatbotRef.current?.addExternalMessage?.("Something went wrong during analysis.");
    } finally {
      // Do not hide loading here; Chatbot will trigger the callback once the message is rendered.
    }
  };

  useEffect(() => {
    const analyzeSonarQube = async () => {
      try {
        console.log('[🔍] Starting SonarQube analysis...');
        const blob = new Blob([sonarResult], { type: 'application/json' });
        const formData = new FormData();
        formData.append('file', blob, 'sonar-result.json');

        const response = await fetch('http://127.0.0.1:5000/analyze_sonarqube', {
          method: 'POST',
          mode: 'cors',
          body: formData,
        });

        if (!response.ok) {
          throw new Error('Failed to analyze SonarQube result');
        }

        const data = await response.json();
        console.log('[✅] SonarQube parsed:', data.parsed_issues);
        isAnalyzing.current = false;
        setParsedSonarIssues(data.parsed_issues);
      } catch (error) {
        console.error('[❌] Analyzing SonarQube failed:', error);
      }
    };

    if (sonarResult && !hasStartedAnalysis.current) {
      hasStartedAnalysis.current = true;
      analyzeSonarQube();
    }
  }, [sonarResult]);
  
  const toggleCodeTree = () => {
    if (isCollapsed) {
      setLeftWidth(20);
      setMiddleWidth(40);
    } else {
      setLeftWidth(0);
      setMiddleWidth(60);
    }
    setIsCollapsed(!isCollapsed);
  };

  const onMouseDownLeftResizer = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    const startX = e.clientX;
    const containerWidth = containerRef.current?.getBoundingClientRect().width || 1;
    const startLeft = leftWidth;
    const startMiddle = middleWidth;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaPercent = (deltaX / containerWidth) * 100;
      let newLeft = startLeft + deltaPercent;
      let newMiddle = startMiddle - deltaPercent;

      if (newLeft < 5) { newLeft = 0; newMiddle = startLeft + startMiddle; setIsCollapsed(true); }
      if (newMiddle < 10) { newMiddle = 10; newLeft = startLeft + startMiddle - 10; }

      setLeftWidth(newLeft);
      setMiddleWidth(newMiddle);
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  const onMouseDownRightResizer = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    const startX = e.clientX;
    const containerWidth = containerRef.current?.getBoundingClientRect().width || 1;
    const startMiddle = middleWidth;
    const startRight = rightWidth;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const deltaX = moveEvent.clientX - startX;
      const deltaPercent = (deltaX / containerWidth) * 100;
      let newMiddle = startMiddle + deltaPercent;
      let newRight = startRight - deltaPercent;

      if (newMiddle < 10) { newMiddle = 10; newRight = startMiddle + startRight - 10; }
      if (newRight < 10) { newRight = 10; newMiddle = startMiddle + startRight - 10; }

      setMiddleWidth(newMiddle);
      setRightWidth(newRight);
    };

    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  return (
    <div ref={containerRef} className="analyze-page-container">
      {/* CodeTree Panel */}
      <div
        className="code-tree-panel"
        style={{
          width: `${leftWidth}%`,
          display: isCollapsed ? 'none' : 'block',
          transition: 'width 0.3s',
        }}
      >
        <CodeTree
          githubToken={token}
          githubRepo={repo}
          fileTree={fileTree}
          onFileSelect={(path) => setSelectedFilePath(path)}
        />
      </div>

      {/* Left Resizer */}
      <div className="resizer left-resizer" onMouseDown={onMouseDownLeftResizer}>
        <button className="collapse-button" onClick={toggleCodeTree}>
          {isCollapsed ? <ChevronRight size={40} /> : <ChevronLeft size={40} />}
        </button>
      </div>

      {/* CodeDetails Panel */}
      <div
        className="code-details-panel"
        style={{ width: `${middleWidth}%`, transition: 'width 0.3s' }}
      >
        <CodeDetails filePath={selectedFilePath} onAnalyze={handleAnalyze} />
      </div>

      {/* Right Resizer */}
      <div className="resizer" onMouseDown={onMouseDownRightResizer} />

      {/* Chatbot Panel */}
      <div
        className="gpt-response-panel"
        style={{ width: `${rightWidth}%`, transition: 'width 0.3s' }}
      >
        <Chatbot
          ref={chatbotRef}
          initialCode={selectedSnippet || ''}
          sonarIssues={parsedSonarIssues}
          isAnalyzing={isAnalyzing.current}
          onMessageRendered={() => chatbotRef.current?.setExternalLoading(false)}
        />
      </div>
    </div>
  );
};

export default AnalyzePage;
