import { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/Articles.css';

const Articles = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAllArticles, setShowAllArticles] = useState(false);
  const [expandedArticles, setExpandedArticles] = useState(new Set());

  const INITIAL_DISPLAY_COUNT = 5;

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/articles?status=published`);
      // Sort by publishedAt or createdAt (newest first)
      const sortedArticles = response.data.sort((a, b) => {
        const dateA = new Date(a.publishedAt || a.createdAt);
        const dateB = new Date(b.publishedAt || b.createdAt);
        return dateB - dateA;
      });
      setArticles(sortedArticles);
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const truncateDescription = (text, maxLength = 125) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength).trim() + '...';
  };

  const toggleExpanded = (articleId) => {
    const newExpanded = new Set(expandedArticles);
    if (newExpanded.has(articleId)) {
      newExpanded.delete(articleId);
    } else {
      newExpanded.add(articleId);
    }
    setExpandedArticles(newExpanded);
  };

  const getPlatformIcon = (platform) => {
    const icons = {
      Medium: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z"/>
        </svg>
      ),
      LinkedIn: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
        </svg>
      ),
      Blogger: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M21.976 24H2.026C.9 24 0 23.1 0 21.976V2.026C.001.9.9 0 2.025 0H21.976C23.1 0 24 .9 24 2.025v19.95C24 23.1 23.1 24 21.976 24zM8.425 4.271c-2.213 0-4.007 1.794-4.007 4.006v7.447c0 2.212 1.794 4.005 4.007 4.005h7.15c2.212 0 4.005-1.793 4.005-4.005v-3.728c0-.408-.331-.739-.739-.739h-.738c-.408 0-.739-.331-.739-.739V8.277c0-2.212-1.794-4.006-4.007-4.006H8.425zm7.887 9.472H7.688c-.408 0-.739-.331-.739-.739s.331-.739.739-.739h8.624c.408 0 .739.331.739.739s-.331.739-.739.739zm-4.312-3.31H7.688c-.408 0-.739-.331-.739-.739s.331-.739.739-.739H12c.408 0 .739.331.739.739s-.331.739-.739.739z"/>
        </svg>
      ),
      GitHub: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
        </svg>
      ),
      Quora: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12.738 18.701c-.831 2.718-1.94 3.836-3.316 3.836-1.785 0-2.919-1.577-2.919-4.068 0-3.022 1.433-5.009 3.536-5.009 1.44 0 2.699.773 2.699 2.241zm3.582-6.775c3.314 0 5.907 2.593 5.907 5.795 0 3.296-2.781 6.279-6.378 6.279-1.19 0-2.378-.372-3.235-1.116-.762 1.116-1.762 1.116-2.714 1.116-2.099 0-3.582-1.484-3.582-3.769 0-1.301.477-2.416 1.302-3.023C6.297 16.98 5.727 15.662 5.727 14.081 5.727 9.073 9.073 5.727 14.081 5.727s8.354 3.346 8.354 8.354c0 1.581-.57 2.899-1.893 3.127.825.607 1.302 1.722 1.302 3.023 0 2.285-1.483 3.769-3.582 3.769-.952 0-1.952 0-2.714-1.116-.857.744-2.045 1.116-3.235 1.116C7.935 24 5.154 21.017 5.154 17.721c0-3.202 2.593-5.795 5.907-5.795zm-1.716 6.775c-.831 2.718-1.94 3.836-3.316 3.836-1.785 0-2.919-1.577-2.919-4.068 0-3.022 1.433-5.009 3.536-5.009 1.44 0 2.699.773 2.699 2.241z"/>
        </svg>
      ),
      'Personal Blog': (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
      ),
      Custom: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
          <path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/>
        </svg>
      )
    };
    return icons[platform] || icons.Custom;
  };

  const displayedArticles = showAllArticles 
    ? articles 
    : articles.slice(0, INITIAL_DISPLAY_COUNT);

  const hasMoreArticles = articles.length > INITIAL_DISPLAY_COUNT;

  if (loading) {
    return (
      <section id="articles" className="articles-section">
        <div className="articles-container">
          <div className="articles-header">
            <h2 className="articles-title">Recent Articles</h2>
            <p className="articles-subtitle">Stay informed with our latest insights</p>
          </div>
          <div className="articles-loading">
            <div className="spinner"></div>
            <p>Loading articles...</p>
          </div>
        </div>
      </section>
    );
  }

  if (articles.length === 0) {
    return (
      <section id="articles" className="articles-section">
        <div className="articles-container">
          <div className="articles-header">
            <h2 className="articles-title">Recent Articles</h2>
            <p className="articles-subtitle">Stay informed with our latest insights</p>
          </div>
          <div className="no-articles">
            <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
            <p>Articles will be displayed here</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="articles" className="articles-section">
      <div className="articles-container">
        <div className="articles-header">
          <h2 className="articles-title">Recent Articles</h2>
          <p className="articles-subtitle">
            {showAllArticles 
              ? `All ${articles.length} Published Articles` 
              : `Latest ${Math.min(articles.length, INITIAL_DISPLAY_COUNT)} Articles`
            }
          </p>
        </div>

        <div className="articles-grid">
          {displayedArticles.map((article, index) => {
            const isExpanded = expandedArticles.has(article._id);
            const shouldShowReadMore = article.description.length > 150;
            
            return (
              <article key={article._id} className="article-card" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="article-image-container">
                  {article.thumbnail ? (
                    <img 
                      src={article.thumbnail} 
                      alt={article.title}
                      className="article-thumbnail"
                    />
                  ) : (
                    <div className="article-thumbnail-placeholder">
                      <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14 2 14 8 20 8"/>
                        <line x1="16" y1="13" x2="8" y2="13"/>
                        <line x1="16" y1="17" x2="8" y2="17"/>
                        <polyline points="10 9 9 9 8 9"/>
                      </svg>
                    </div>
                  )}
                </div>

                <div className="article-content">
                  <h3 className="article-title">{article.title}</h3>
                  
                  <div className="article-description-container">
                    <p className="article-description">
                      {isExpanded ? article.description : truncateDescription(article.description)}
                    </p>
                    
                    {shouldShowReadMore && (
                      <button 
                        className="read-more-btn"
                        onClick={() => toggleExpanded(article._id)}
                      >
                        {isExpanded ? 'Read Less' : 'Read More'}
                        <svg 
                          xmlns="http://www.w3.org/2000/svg" 
                          width="16" 
                          height="16" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth="2"
                          className={isExpanded ? 'rotated' : ''}
                        >
                          <polyline points="6 9 12 15 18 9"/>
                        </svg>
                      </button>
                    )}
                  </div>

                  <div className="article-meta">
                    <span className="article-date">
                      {new Date(article.publishedAt || article.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>

                  {article.socialLinks && article.socialLinks.length > 0 && (
                    <div className="article-link">
                      <span className="links-label">Read Full Article on:</span>
                      <div className="socials-links">
                        {article.socialLinks.map((link, linkIndex) => (
                          <a
                            key={linkIndex}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="socials-link"
                            title={`Read on ${link.platform === 'Custom' ? link.customName : link.platform}`}
                          >
                            {getPlatformIcon(link.platform)}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>

        {hasMoreArticles && !showAllArticles && (
          <div className="articles-actions">
            <button 
              className="view-all-articles-btn"
              onClick={() => setShowAllArticles(true)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
              View All Articles ({articles.length - INITIAL_DISPLAY_COUNT} more)
            </button>
          </div>
        )}

        {showAllArticles && (
          <div className="articles-actions">
            <button 
              className="view-recent-articles-btn"
              onClick={() => {
                setShowAllArticles(false);
                document.getElementById('articles').scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
              Show Recent Articles
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default Articles;
