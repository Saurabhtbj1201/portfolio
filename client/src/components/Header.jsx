import { useState, useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import ThemeContext from '../context/ThemeContext';
import AuthContext from '../context/AuthContext';
import '../styles/Header.css';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const publicNavLinks = [
    { name: 'Home', href: '#home' },
    { name: 'About', href: '#about' },
    { name: 'Skills', href: '#skills' },
    { name: 'Projects', href: '#projects' },
    { name: 'Experience', href: '#experience' },
    { name: 'Education', href: '#education' },
    { name: 'Certifications', href: '#certifications' },
    { name: 'Article', href: '#article' },
    { name: 'Awards', href: '#awards' },
    { name: 'Testimonials', href: '#testimonials' },
    { name: 'Contact', href: '#contact' }
  ];

  const adminNavLinks = [
    { name: 'Dashboard', href: '/admin/dashboard' },
    { name: 'Profile', href: '/admin/profile' },
    { name: 'Skills', href: '/admin/skills' },
    { name: 'Projects', href: '/admin/projects' },
    { name: 'Experience', href: '/admin/experience' },
    { name: 'Education', href: '/admin/education' },
    { name: 'Certifications', href: '/admin/certifications' },
    { name: 'Articles', href: '/admin/articles' },
    { name: 'Awards', href: '/admin/awards' },
    { name: 'Testimonials', href: '/admin/testimonials' },
    { name: 'Contact', href: '/admin/contact' }
  ];

  const navLinks = user ? adminNavLinks : publicNavLinks;

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  return (
    <header className="header">
      <div className="header-container">
        <Link to="/" className="logo">
          <span className="logo-text">Saurabh</span>
        </Link>

        <nav className={`nav ${isMenuOpen ? 'nav-open' : ''}`}>
          <ul className="nav-list">
            {navLinks.map((link, index) => (
              <li key={index} className="nav-item">
                {user ? (
                  <Link 
                    to={link.href} 
                    className={`nav-link ${location.pathname === link.href ? 'active' : ''}`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.name}
                  </Link>
                ) : (
                  <a 
                    href={link.href} 
                    className="nav-link"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.name}
                  </a>
                )}
              </li>
            ))}
          </ul>
        </nav>

        <div className="header-actions">
          <button 
            className="theme-toggle" 
            onClick={toggleTheme}
            aria-label="Toggle theme"
          >
            {isDarkMode ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/>
                <line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/>
                <line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            )}
          </button>

          {user && (
            <button 
              className="logout-btn" 
              onClick={handleLogout}
              aria-label="Logout"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              <span className="logout-text">Logout</span>
            </button>
          )}

          <button 
            className="hamburger" 
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            <span className={`hamburger-line ${isMenuOpen ? 'open' : ''}`}></span>
            <span className={`hamburger-line ${isMenuOpen ? 'open' : ''}`}></span>
            <span className={`hamburger-line ${isMenuOpen ? 'open' : ''}`}></span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
