// export default TutorialPage;

// src/pages/TutorialPage/TutorialPage.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './TutorialPage.css';
import { useAuth0 } from '@auth0/auth0-react';

const TutorialPage: React.FC = () => {
  const [token, setToken] = useState('');
  const [repo, setRepo] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { getAccessTokenSilently } = useAuth0(); 

  const handleSubmit = async () => {
    setErrorMessage(null);
    setIsLoading(true);
  
    try {
      const accessToken = await getAccessTokenSilently();
      const baseUrl = 'http://localhost:8080/github/analyze';
      const url = new URL(baseUrl);
      url.searchParams.append('url', repo);
      url.searchParams.append('branch', 'main');
      url.searchParams.append('token', token);
  
      const res = await fetch(url.toString(), {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });
  
      if (!res.ok) {
        const errorText = await res.text();
        console.error('Backend error:', errorText);
        throw new Error('Invalid credentials or network error');
      }
  
      const data = await res.json();
  
      navigate('/analyze', {
        state: { token, repo, fileTree: data.fileTree, sonarResult: data.sonarResult },
      });
    } catch (err: any) {
      console.error('Validation error:', err.message);
      setErrorMessage('Failed to validate GitHub token/repo. Please check your info.');
    } finally {
      setIsLoading(false);
    }
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
          <li>
            Choose any token name, pick any expiration date, choose a repo you want to analyze, and give permission
          </li>
          <li>Click <strong>Generate Token</strong></li>
          <li>Copy the access token and paste it below</li>
          <li>Input the GitHub repository link you'd like to analyze</li>
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

          <button className="btn primary" onClick={handleSubmit} disabled={isLoading}>
            {isLoading ? (
              <>
                <span className="spinner" />
                Submitting...
              </>
            ) : (
              'Submit'
            )}
          </button>

          {errorMessage && <p className="error-message">{errorMessage}</p>}
        </div>
      </div>
    </div>
  );
};

export default TutorialPage;
