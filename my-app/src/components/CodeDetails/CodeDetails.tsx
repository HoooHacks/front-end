import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery } from 'react-query';
import { useNavigate } from 'react-router-dom';
import CodeMirror from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import { useAuth0 } from '@auth0/auth0-react';


import './CodeDetails.css';

interface CodeDetailsProps {
  filePath: string | null;
  onAnalyze: (selectedSnippet: string) => void;
}

const CodeDetails: React.FC<CodeDetailsProps> = ({ filePath, onAnalyze }) => {
  const [selectedText, setSelectedText] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const {getAccessTokenSilently} = useAuth0();

  const fetchFileContent = async (filePath: string): Promise<string> => {
    const token = await getAccessTokenSilently();
    const marker = 'src/';
    const idx = filePath.indexOf(marker);
    const relativePath = idx !== -1 ? filePath.substring(idx) : filePath;
  
    return fetch(`http://localhost:8080/github/code?path=${encodeURIComponent(relativePath)}`, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) {
          return res.text().then((text) => {
            console.error('Backend error:', text);
            throw new Error('Network response was not ok');
          });
        }
        return res.text();
      });
  };

  // const { data: fileContent, isLoading, error } = useQuery<string, Error>(
  //   ['fileContent', filePath],
  //   () => (filePath ? fetchFileContent(filePath) : Promise.resolve('')),
  //   { enabled: !!filePath, staleTime: Infinity, cacheTime: Infinity }
  // );

  const { data: fileContent, isLoading, error } = useQuery<string, Error>(
    ['fileContent', filePath],
    () => (filePath ? fetchFileContent(filePath) : Promise.resolve('')),
    {
      enabled: !!filePath,
      staleTime: Infinity,
      cacheTime: Infinity,
      onSuccess: (data) => setCode(data),
    }
  );

  // Reset the selection whenever the filePath changes.
  useEffect(() => {
    setSelectedText('');
  }, [filePath]);

  const handleMouseUp = useCallback(() => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim() !== '') {
      setSelectedText(selection.toString());
    } else {
      setSelectedText('');
    }
  }, []);

  // "Analyze" button sends the selected snippet to the parent.
  const handleAnalyzeClick = useCallback(() => {
    if (selectedText) {
      onAnalyze(selectedText);
    }
  }, [selectedText, onAnalyze]);

  // "CompeteAI" button calls backend and navigates to the CompeteAI page.
  const handleCompeteAIClick = useCallback(async () => {
    if (!selectedText) return;
    try {
      const response = await fetch('http://127.0.0.1:5000/generate_ai_challenger_code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: selectedText }),
      });
      if (!response.ok) {
        throw new Error('Failed to generate AI challenger code');
      }
      const data = await response.json();
      navigate('/competeAi', {
        state: {
          userSnippet: selectedText,
          aiSnippet: data.ai_challenger_code,
        },
      });
    } catch (err: any) {
      console.error('Error calling generate_ai_challenger_code:', err.message);
    }
  }, [selectedText, navigate]);

  

  if (!filePath) {
    return (
      <div className="code-details-container code-details-empty">
        <h4>Select a file to view its content.</h4>        
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="code-details-container code-details-loading">
        Loading file content...
      </div>
    );
  }

  if (error) {
    return (
      <div className="code-details-container code-details-error">
        Error loading file: {error.message}
      </div>
    );
  }

  return (
    <div ref={containerRef} className="code-details-container">
      <div className="code-details-header">
        <h3>Online Editor</h3>
      </div>
      <div className="code-content" onMouseUp={handleMouseUp}>
      <CodeMirror
          value={code}
          height="650px" // editor size
          theme="dark" 
          extensions={[python()]}
          onChange={(value) => setCode(value)}
          basicSetup={{
            lineNumbers: true,
            highlightActiveLine: true,
            foldGutter: true,
          }}
        />
      </div>
      <div className="code-details-footer">
      <button
        className="footer-button analyze-btn"
        onClick={handleAnalyzeClick}
        disabled={!selectedText}
      >
        Analyze
      </button>
      <button
        className="footer-button compete-btn"
        onClick={handleCompeteAIClick}
        disabled={!selectedText}
      >
        CompeteAI 🚀
      </button>
      </div>
    </div>
  );

};

export default CodeDetails;
