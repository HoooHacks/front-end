// src/pages/TutorialPage/TutorialPage.tsx
import React, { useState } from 'react';
import './TutorialPage.css';

const TutorialPage: React.FC = () => {
  const [token, setToken] = useState('');
  const [repo, setRepo] = useState('');

  const handleSubmit = () => {
    alert(`Token: ${token}\nRepo: ${repo}`);
  };

  return (
    <div className="tutorial-page">
      <div className="tutorial-overlay">
        <h1 className="title">GitHub Token Setup Guide</h1>

        <ol className="steps">
          <li>
            <a href="https://github.com/settings/tokens" target="_blank" rel="noopener noreferrer">
              Go to this link
            </a>
          </li>
          <li>Sign in to your GitHub account</li>
          <li>Choose a token name, expiration, repo access, and permissions</li>
          <li>Click <strong>Generate Token</strong></li>
          <li>Copy and paste the token below</li>
          <li>Paste the GitHub repository URL below</li>
        </ol>

        <div className="input-section">
          <label>Access Token</label>
          <input
            type="text"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            placeholder="Paste your GitHub token here"
          />

          <label>Repository Link</label>
          <input
            type="text"
            value={repo}
            onChange={(e) => setRepo(e.target.value)}
            placeholder="e.g., https://github.com/yourname/yourrepo"
          />

          <button className="btn primary" onClick={handleSubmit}>
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default TutorialPage;