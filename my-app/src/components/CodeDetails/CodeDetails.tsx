import React, { useState } from 'react';
import CodeMirror from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import './CodeDetails.css';

interface CodeDetailsProps {
  filePath: string | null;
  onAnalyze: (selectedSnippet: string) => void;
}

const CodeDetails: React.FC<CodeDetailsProps> = ({ filePath, onAnalyze }) => {
  const [code, setCode] = useState('// Example code\nprint("Hello, World!")');
  const [selectedText, setSelectedText] = useState('');

  const handleMouseUp = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim() !== '') {
      setSelectedText(selection.toString());
    } else {
      setSelectedText('');
    }
  };

  const handleAnalyzeClick = () => {
    if (selectedText) {
      onAnalyze(selectedText);
    }
  };

  const handleCompeteClick = () => {
    alert('Stub: Compete AI triggered!');
  };

  if (!filePath) {
    return (
      <div className="code-details-container code-details-empty">
        <h4>Select a file to view its content.</h4>
      </div>
    );
  }

  return (
    <div className="code-details-container">
      <div className="code-details-header">
        <h3>Online Editor</h3>
      </div>
      <div className="code-content" onMouseUp={handleMouseUp}>
        <CodeMirror
          value={code}
          height="500px"
          theme="dark"
          extensions={[python()]}
          onChange={(val) => setCode(val)}
        />
      </div>
      <div className="code-details-footer">
        <button className="footer-button analyze-btn" onClick={handleAnalyzeClick} disabled={!selectedText}>
          Analyze
        </button>
        <button className="footer-button compete-btn" onClick={handleCompeteClick} disabled={!selectedText}>
          CompeteAI 🚀
        </button>
      </div>
    </div>
  );
};

export default CodeDetails;