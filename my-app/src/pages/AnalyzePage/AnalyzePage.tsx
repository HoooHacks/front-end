import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import CodeTree from '../../components/CodeTree/CodeTree';
import CodeDetails from '../../components/CodeDetails/CodeDetails';
import Chatbot from '../../components/Chatbot/Chatbot';
import './AnalyzePage.css';

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

  const handleAnalyze = async (code: string) => {
    setSelectedSnippet(code);

    try {
      const res = await fetch('http://127.0.0.1:5000/code_review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });

      const data = await res.json();
      console.log('[✅ Code Review]', data);
    } catch (err) {
      console.error('[❌ Code Review Error]', err);
    }
  };

  useEffect(() => {
    const analyzeSonar = async () => {
      try {
        const blob = new Blob([sonarResult], { type: 'application/json' });
        const formData = new FormData();
        formData.append('file', blob, 'sonar-result.json');

        const res = await fetch('http://127.0.0.1:5000/analyze_sonarqube', {
          method: 'POST',
          body: formData,
        });

        const data = await res.json();
        console.log('[✅ SonarQube]', data.parsed_issues);
      } catch (err) {
        console.error('[❌ SonarQube Error]', err);
      }
    };

    if (sonarResult) {
      analyzeSonar();
    }
  }, [sonarResult]);

  return (
    <div className="analyze-page-container">
      <div className="code-tree-panel">
        <CodeTree
          githubToken={token}
          githubRepo={repo}
          fileTree={fileTree}
          onFileSelect={setSelectedFilePath}
        />
      </div>

      <div className="code-details-panel">
        <CodeDetails filePath={selectedFilePath} onAnalyze={handleAnalyze} />
      </div>

      <div className="chatbot-panel">
        <Chatbot initialCode={selectedSnippet || ''} />
      </div>
    </div>
  );
};

export default AnalyzePage;