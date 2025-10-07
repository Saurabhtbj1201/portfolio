import { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/About.css';

const About = () => {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/profile`);
      setProfileData(response.data);
    } catch (error) {
      console.error('Error fetching profile data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="about-loading">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <section id="about" className="about-section">
      <div className="about-container">
        <div className="about-content">
          {/* Left side - About Image */}
          <div className="about-image-container">
            {profileData?.aboutImage ? (
              <img 
                src={profileData.aboutImage} 
                alt="About Saurabh Kumar" 
                className="about-image"
              />
            ) : (
              <div className="about-image-placeholder">
                <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                <p>No about image uploaded</p>
              </div>
            )}
          </div>

          {/* Right side - Details */}
          <div className="about-details">
            <div className="about-header">
              <h2 className="about-title">
                <span className="about-title-highlight">{profileData?.title}</span>
              </h2>
            </div>

            {/* Tags */}
            {profileData?.tags && profileData.tags.length > 0 && (
              <div className="about-tags">
                {profileData.tags.map((tag, index) => (
                  <span key={index} className="about-tag">
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Description */}
            {profileData?.description && (
              <div className="about-description">
                <p>{profileData.description}</p>
              </div>
            )}

            {/* Contact Info */}
            <div className="about-info">
              {profileData?.email && (
                <div className="about-info-item">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                  <span>{profileData.email}</span>
                </div>
              )}

              {profileData?.place && (
                <div className="about-info-item">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                  <span>{profileData.place}</span>
                </div>
              )}
            </div>

            {/* Resume Actions */}
            {profileData?.resume && (
              <div className="about-actions">
                <a 
                  href={profileData.resume} 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="about-btn primary"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                  </svg>
                  View Resume
                </a>
                <a 
                  href={profileData.resume}
                  download
                  className="about-btn secondary"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7 10 12 15 17 10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                  Download Resume
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
