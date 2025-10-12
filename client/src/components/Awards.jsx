import { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/Awards.css';

const Awards = () => {
  const [allAwards, setAllAwards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAllAwards, setShowAllAwards] = useState(false);

  useEffect(() => {
    fetchAwards();
  }, []);

  const fetchAwards = async () => {
    try {
      // Fetch all awards
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/awards`);
      setAllAwards(response.data);
    } catch (error) {
      console.error('Error fetching awards:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter awards based on showAllAwards state
  const displayedAwards = showAllAwards 
    ? allAwards 
    : allAwards.filter(award => award.featured);

  const featuredAwardsCount = allAwards.filter(award => award.featured).length;
  const hasMoreAwards = allAwards.length > featuredAwardsCount;

  const toggleAwardsView = () => {
    setShowAllAwards(!showAllAwards);
    
    // If switching to "Show Featured Only", scroll to awards section
    if (showAllAwards) {
      const awardsSection = document.getElementById('awards');
      if (awardsSection) {
        awardsSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const getAssociationText = (award) => {
    if (award.associatedWith.type === 'none') {
      return 'Independent Achievement';
    } else if (award.associatedWith.type === 'experience') {
      return `${award.associatedWith.id.role} at ${award.associatedWith.id.companyName}`;
    } else {
      return `${award.associatedWith.id.instituteName}`;
    }
  };

  if (loading) {
    return (
      <section id="awards" className="awards-section">
        <div className="awards-container">
          <div className="awards-header">
            <h2 className="awards-title">Awards & Achievements</h2>
            <p className="awards-subtitle">Recognition and accomplishments</p>
          </div>
          <div className="awards-loading">
            <div className="spinner"></div>
            <p>Loading awards...</p>
          </div>
        </div>
      </section>
    );
  }

  if (allAwards.length === 0) {
    return (
      <section id="awards" className="awards-section">
        <div className="awards-container">
          <div className="awards-header">
            <h2 className="awards-title">Awards & Achievements</h2>
            <p className="awards-subtitle">Recognition and accomplishments</p>
          </div>
          <div className="no-awards">
            <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="8" r="7"/>
              <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>
            </svg>
            <p>Awards and achievements will be displayed here</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="awards" className="awards-section">
      <div className="awards-container">
        <div className="awards-header">
          <h2 className="awards-title">Awards & Achievements</h2>
          <p className="awards-subtitle">
            {showAllAwards 
              ? `All ${allAwards.length} awards` 
              : `Featured awards (${displayedAwards.length} of ${allAwards.length})`
            }
          </p>
        </div>

        <div className="awards-grid">
          {displayedAwards.map((award) => (
            <div key={award._id} className="award-card">
              <div className="award-header">
                <div className="award-image-container">
                  {award.image ? (
                    <img src={award.image} alt={award.organization} className="award-image" />
                  ) : (
                    <div className="award-image-placeholder">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="8" r="7"/>
                        <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>
                      </svg>
                    </div>
                  )}
                </div>

                <div className="award-main-info">
                  <h3 className="award-title">{award.title}</h3>
                  <p className="award-organization">{award.organization}</p>
                  <p className="award-date">{award.issueMonth} {award.issueYear}</p>
                </div>
              </div>

              <div className="award-content">
                <p className="award-description">{award.description}</p>

                <div className="award-associated">
                  <span className="association-badge">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      {award.associatedWith.type === 'none' ? (
                        <circle cx="12" cy="12" r="10"/>
                      ) : (
                        <>
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                          <circle cx="12" cy="10" r="3"/>
                        </>
                      )}
                    </svg>
                    {getAssociationText(award)}
                  </span>
                </div>
              </div>

              <div className="award-actions">
                <div className="award-links">
                  {award.certificate && (
                    <a
                      href={award.certificate}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="award-link"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14 2 14 8 20 8"/>
                      </svg>
                      Certificate
                    </a>
                  )}
                  {award.certificateLink && (
                    <a
                      href={award.certificateLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="award-link"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                        <polyline points="15 3 21 3 21 9"/>
                        <line x1="10" y1="14" x2="21" y2="3"/>
                      </svg>
                      Reference
                    </a>
                  )}
                </div>

                {award.socialLinks && award.socialLinks.length > 0 && (
                  <div className="social-links">
                    {award.socialLinks.map((link, index) => (
                      <a
                        key={index}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="socials-link"
                        title={`View on ${link.platform}`}
                      >
                        {link.platform === 'linkedin' && (
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                          </svg>
                        )}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Show toggle button only if there are more awards than featured ones */}
        {hasMoreAwards && (
          <div className="view-all-awards">
            <button 
              onClick={toggleAwardsView} 
              className="view-all-awards-btn"
            >
              {showAllAwards ? (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                  Show Featured Awards Only
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="8" r="7"/>
                    <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>
                  </svg>
                  View All Awards ({allAwards.length})
                </>
              )}
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default Awards;
