import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Header.css';
import icon from '../../assets/icon.jpeg';

const Header: React.FC = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <header className="app-header">
      <Link to="/" className="logo-link">
        <img src={icon} alt="Analyzai Logo" className="logo-icon" />
      </Link>
      <nav className="nav-links">
        <Link to="/analyze" className={`nav-link ${isActive('/analyze') ? 'active' : ''}`}>Analyze</Link>
        <Link to="/competeAi" className={`nav-link ${isActive('/competeAi') ? 'active' : ''}`}>CompeteAI</Link>
        <Link to="/profile" className={`nav-link ${isActive('/profile') ? 'active' : ''}`}>Profile</Link>
      </nav>
    </header>
  );
};

export default Header;