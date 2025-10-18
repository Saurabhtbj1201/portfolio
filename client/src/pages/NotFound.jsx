import { Link } from 'react-router-dom';
import { useEffect } from 'react';
import '../styles/NotFound.css';

const NotFound = () => {
  useEffect(() => {
    // Update page title for SEO
    document.title = '404 - Page Not Found | Saurabh Kumar Portfolio';
    
    // Add meta description for 404 page
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 'The page you are looking for does not exist. Return to Saurabh Kumar\'s portfolio homepage to explore projects and skills.');
    }
    
    // Track 404 errors in analytics
    if (window.gtag) {
      window.gtag('event', 'page_view', {
        page_title: '404 Error',
        page_location: window.location.href,
        content_group1: 'Error Page'
      });
    }
  }, []);

  const handleGoHome = () => {
    // Track user action
    if (window.gtag) {
      window.gtag('event', 'click', {
        event_category: '404 Page',
        event_label: 'Go Home Button'
      });
    }
  };

  const handleGoBack = () => {
    // Track user action
    if (window.gtag) {
      window.gtag('event', 'click', {
        event_category: '404 Page',
        event_label: 'Go Back Button'
      });
    }
    window.history.back();
  };

  return (
    <div className="not-found-page">
      <div className="not-found-container">
        <div className="not-found-content">
          <div className="error-code">404</div>
          <h1 className="error-title">Oops! Page Not Found</h1>
          <p className="error-description">
            The page you're looking for seems to have vanished into the digital void. 
            Don't worry, even the best developers encounter broken links sometimes!
          </p>
          
          <div className="error-actions">
            <Link 
              to="/" 
              className="btn-primary"
              onClick={handleGoHome}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                <polyline points="9 22 9 12 15 12 15 22"/>
              </svg>
              Go Home
            </Link>
            
            <button 
              onClick={handleGoBack}
              className="btn-secondary"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
              Go Back
            </button>
          </div>
          
          <div className="helpful-links">
            <h3>You might be looking for:</h3>
            <ul>
              <li><Link to="/#about">About Me</Link></li>
              <li><Link to="/#projects">My Projects</Link></li>
              <li><Link to="/#experience">Experience</Link></li>
              <li><Link to="/#contact">Contact</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="error-animation">
          <div className="floating-elements">
            <div className="element element-1">{'{ }'}</div>
            <div className="element element-2">{'< />'}</div>
            <div className="element element-3">{'404'}</div>
            <div className="element element-4">{'</>'}</div>
          </div>
        </div>
      </div>
      
      {/* SEO-friendly content for search engines */}
      <div className="seo-content" style={{ display: 'none' }}>
        <h2>Page Not Found - Saurabh Kumar Portfolio</h2>
        <p>
          This page does not exist on Saurabh Kumar's portfolio website. 
          Visit the homepage to explore web development projects, data analysis work, 
          and professional experience in React, Node.js, and Python.
        </p>
        <p>
          Alternative pages: Portfolio, Projects, Experience, Skills, Contact, About
        </p>
      </div>
    </div>
  );
};

export default NotFound;
