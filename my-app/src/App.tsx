import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";
import LandingPage from "./pages/Landing/Landing";
import TutorialPage from "./pages/TutorialPage/TutorialPage";
import AnalyzePage from "./pages/AnalyzePage/AnalyzePage";
import CompeteAi from "./pages/CompeteAi/CompeteAi";
import ProfilePage from "./pages/ProfilePage/ProfilePage";
import Header from "./components/Header/Header";
import { ThemeProvider } from "./contexts/ThemeContext";

import "./index.css";
import "./App.css";

// This wrapper safely checks the current route *after* Router is initialized
const ScrollWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const scrollableRoutes = ["/competeAi", "/profile"];
  const isScrollable = scrollableRoutes.includes(location.pathname);

  return (
    <main className={`page-content ${isScrollable ? "scrollable" : ""}`}>
      {children}
    </main>
  );
};

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="fixed-header-wrapper">
          <Header />
        </div>
        <ScrollWrapper>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/tutorial" element={<TutorialPage />} />
            <Route path="/analyze" element={<AnalyzePage />} />
            <Route path="/competeAi" element={<CompeteAi />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Routes>
        </ScrollWrapper>
      </Router>
    </ThemeProvider>
  );
}

export default App;