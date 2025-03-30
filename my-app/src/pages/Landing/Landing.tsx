import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import "./Landing.css";

const Landing: React.FC = () => {
  const navigate = useNavigate();
  const { loginWithRedirect, logout, isAuthenticated, isLoading, user } =
    useAuth0();

  console.log("isAuthenticated:", isAuthenticated);
  console.log("user:", user);

  const handleGoToAnalyze = () => {
    navigate("/analyze");
  };
  const handleGoToTutorial = () => {
    navigate("/tutorial");
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="landing">
      <div className="hero">
        <h1 className="title">CodeMate</h1>
        <p className="subtitle">
          Your AI Code Coach — and Sparring Partner
        </p>

        <div className="button-group">
          {!isAuthenticated ? (
            <button className="btn primary" onClick={() => loginWithRedirect()}>
              Log In
            </button>
          ) : (
            <>
              <button className="btn secondary" onClick={handleGoToTutorial}>
                Connect to GitHub
              </button>
              {/* <button className="btn logout" onClick={() => logout({ returnTo: window.location.origin })}>Log Out</button> */}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Landing;
