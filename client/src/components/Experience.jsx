import { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/Experience.css';

const Experience = () => {
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedExperiences, setExpandedExperiences] = useState(new Set());
  const [showAllExperiences, setShowAllExperiences] = useState(false);

  const INITIAL_DISPLAY_COUNT = 3;

  useEffect(() => {
    fetchExperiences();
  }, []);

  const fetchExperiences = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/experiences`);
      // Sort experiences to show newest first (by creation date, then by start date)
      const sortedExperiences = response.data.sort((a, b) => {
        // First sort by creation date (newest first)
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);
        if (dateB - dateA !== 0) return dateB - dateA;
        
        // Then by start year and month (newest first)
        if (b.startYear !== a.startYear) return b.startYear - a.startYear;
        
        const monthOrder = {
          'January': 1, 'February': 2, 'March': 3, 'April': 4,
          'May': 5, 'June': 6, 'July': 7, 'August': 8,
          'September': 9, 'October': 10, 'November': 11, 'December': 12
        };
        return (monthOrder[b.startMonth] || 0) - (monthOrder[a.startMonth] || 0);
      });
      setExperiences(sortedExperiences);
    } catch (error) {
      console.error('Error fetching experiences:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleExpanded = (experienceId) => {
    const newExpanded = new Set(expandedExperiences);
    if (newExpanded.has(experienceId)) {
      newExpanded.delete(experienceId);
    } else {
      newExpanded.add(experienceId);
    }
    setExpandedExperiences(newExpanded);
  };

  const handleViewAllExperiences = () => {
    setShowAllExperiences(true);
  };

  const handleViewFeaturedExperiences = () => {
    setShowAllExperiences(false);
    // Scroll to experience section
    const experienceSection = document.getElementById('experience');
    if (experienceSection) {
      experienceSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'center'
      });
    }
  };

  const formatDuration = (experience) => {
    const startDate = `${experience.startMonth} ${experience.startYear}`;
    const endDate = experience.status === 'Ongoing' 
      ? 'Present' 
      : `${experience.endMonth} ${experience.endYear}`;
    return `${startDate} - ${endDate}`;
  };

  const getCategoryIcon = (category) => {
    const icons = {
      Job: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
          <line x1="8" y1="21" x2="16" y2="21"/>
          <line x1="12" y1="17" x2="12" y2="21"/>
        </svg>
      ),
      Internship: (
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
          <path d="M6 12v5c3 3 9 3 12 0v-5"/>
        </svg>
      ),
      Freelance: (
        <svg xmlns="http://www.w3.org/2000/24" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="16 18 22 12 16 6"/>
          <polyline points="8 6 2 12 8 18"/>
        </svg>
      )
    };
    return icons[category] || icons.Job;
  };

  // Determine which experiences to display
  const displayedExperiences = showAllExperiences 
    ? experiences 
    : experiences.slice(0, INITIAL_DISPLAY_COUNT);
  
  const hasMoreExperiences = experiences.length > INITIAL_DISPLAY_COUNT;

  if (loading) {
    return (
      <section id="experience" className="experience-section">
        <div className="experience-container">
          <div className="experience-header">
            <h2 className="experience-title">Experience</h2>
            <p className="experience-subtitle">Professional journey</p>
          </div>
          <div className="experience-loading">
            <div className="spinner"></div>
            <p>Loading experiences...</p>
          </div>
        </div>
      </section>
    );
  }

  if (experiences.length === 0) {
    return (
      <section id="experience" className="experience-section">
        <div className="experience-container">
          <div className="experience-header">
            <h2 className="experience-title">Experience</h2>
            <p className="experience-subtitle">Professional journey</p>
          </div>
          <div className="no-experiences">
            <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
              <line x1="8" y1="21" x2="16" y2="21"/>
              <line x1="12" y1="17" x2="12" y2="21"/>
            </svg>
            <p>Experience details will be displayed here</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="experience" className="experience-section">
      <div className="experience-container">
        <div className="experience-header">
          <h2 className="experience-title">Experience</h2>
          <p className="experience-subtitle">
            Professional journey ({experiences.length} {experiences.length === 1 ? 'experience' : 'experiences'})
            {showAllExperiences && ' - All Experiences'}
          </p>
        </div>

        <div className="experience-timeline">
          {displayedExperiences.map((experience, index) => (
            <div key={experience._id} className="timeline-item">
              <div className="timeline-marker">
                <div className={`timeline-icon ${experience.status.toLowerCase()}`}>
                  {getCategoryIcon(experience.category)}
                </div>
              </div>

              <div className="experience-card">
                <div className="experience-header-card">
                  <div className="experience-main-info">
                    {experience.companyLogo && (
                      <div className="company-logo">
                        <img src={experience.companyLogo} alt={experience.companyName} />
                      </div>
                    )}
                    <div className="experience-title-info">
                      <h3 className="experience-role">{experience.role}</h3>
                      <div className="company-info">
                        {experience.companyLink ? (
                          <a 
                            href={experience.companyLink} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="company-name-link"
                          >
                            {experience.companyName}
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                              <polyline points="15 3 21 3 21 9"/>
                              <line x1="10" y1="14" x2="21" y2="3"/>
                            </svg>
                          </a>
                        ) : (
                          <span className="company-name">{experience.companyName}</span>
                        )}
                        <span className="location">{experience.location}</span>
                      </div>
                    </div>
                  </div>

                  <div className="experience-meta">
                    <div className="experience-badges">
                      <span className={`category-badge ${experience.category.toLowerCase()}`}>
                        {experience.category}
                      </span>
                      <span className="employment-type-badge">
                        {experience.employmentType}
                      </span>
                      <span className={`status-badge ${experience.status.toLowerCase()}`}>
                        {experience.status}
                      </span>
                    </div>
                    <div className="duration">
                      {formatDuration(experience)}
                    </div>
                  </div>
                </div>

                <div className="experience-content">
                  <div className={`experience-description ${expandedExperiences.has(experience._id) ? 'expanded' : ''}`}>
                    <p>{experience.description}</p>
                  </div>

                  {experience.description.length > 200 && (
                    <button 
                      className="toggle-description-btn"
                      onClick={() => toggleExpanded(experience._id)}
                    >
                      {expandedExperiences.has(experience._id) ? 'Show Less' : 'Show More'}
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        width="16" 
                        height="16" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2"
                        className={expandedExperiences.has(experience._id) ? 'rotated' : ''}
                      >
                        <polyline points="6 9 12 15 18 9"/>
                      </svg>
                    </button>
                  )}

                  {experience.technologies && experience.technologies.length > 0 && (
                    <div className="experience-technologies">
                      <h4>Technologies Used:</h4>
                      <div className="tech-badges">
                        {experience.technologies.map((tech) => (
                          <span key={tech._id} className="tech-badge">
                            <img src={tech.image} alt={tech.name} />
                            {tech.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {experience.skillTags && experience.skillTags.length > 0 && (
                    <div className="experience-skill-tags">
                      <h4>Skills & Keywords:</h4>
                      <div className="skill-tags-badges">
                        {experience.skillTags.map((tag, index) => (
                          <span key={index} className="skill-tag-badge">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="experience-documents">
                    {experience.offerLetter && (
                      <a 
                        href={experience.offerLetter} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="document-link"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                          <polyline points="14 2 14 8 20 8"/>
                          <line x1="16" y1="13" x2="8" y2="13"/>
                          <line x1="16" y1="17" x2="8" y2="17"/>
                          <polyline points="10 9 9 9 8 9"/>
                        </svg>
                        View Offer Letter
                      </a>
                    )}
                    {experience.completionCertificate && experience.status === 'Completed' && (
                      <a 
                        href={experience.completionCertificate} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="document-link"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="8" r="7"/>
                          <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>
                        </svg>
                        View Certificate
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Experience Action Buttons */}
        {hasMoreExperiences && !showAllExperiences && (
          <div className="experience-actions">
            <button 
              className="view-past-experiences-btn"
              onClick={handleViewAllExperiences}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
              View Past Experiences ({experiences.length - INITIAL_DISPLAY_COUNT} more)
            </button>
          </div>
        )}

        {showAllExperiences && (
          <div className="experience-actions">
            <button 
              className="view-featured-experiences-btn"
              onClick={handleViewFeaturedExperiences}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
              See Featured Experiences
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default Experience;
