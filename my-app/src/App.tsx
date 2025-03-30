import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Landing from "./pages/Landing/Landing";
import TutorialPage from "./pages/TutorialPage/TutorialPage";
import AnalyzePage from "./pages/AnalyzePage/AnalyzePage";
import "./index.css";
import "./App.css";
import { ThemeProvider } from "./contexts/ThemeContext";

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/tutorial" element={<TutorialPage />} />
          <Route path="/analyze" element={<AnalyzePage />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;