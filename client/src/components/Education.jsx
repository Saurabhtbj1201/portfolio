import { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/Education.css';

const Education = () => {
  const [educationData, setEducationData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEducation();
  }, []);

  const fetchEducation = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/education`);
      setEducationData(response.data);
    } catch (error) {
      console.error('Error fetching education:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="education-loading">
        <div className="spinner"></div>
        <p>Loading education...</p>
      </div>
    );
  }

  if (educationData.length === 0) {
    return (
      <section id="education" className="education-section">
        <div className="education-container">
          <div className="education-header">
            <h2 className="education-title">Education</h2>
            <p className="education-subtitle">My academic journey</p>
          </div>
          <div className="no-education">
            <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
              <path d="M6 12v5c3 3 9 3 12 0v-5"/>
            </svg>
            <p>Education records will be displayed here</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="education" className="education-section">
      <div className="education-container">
        <div className="education-header">
          <h2 className="education-title">Education</h2>
          <p className="education-subtitle">My academic journey</p>
        </div>

        <div className="education-timeline">
          {educationData.map((edu, index) => (
            <div key={edu._id} className="education-item">
              <div className="educations-content">
                <div className="education-logo">
                  {edu.logo ? (
                    <img src={edu.logo} alt={`${edu.instituteName} logo`} />
                  ) : (
                    <div className="education-logo-placeholder">
                      <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                        <path d="M6 12v5c3 3 9 3 12 0v-5"/>
                      </svg>
                    </div>
                  )}
                </div>

                <div className="education-details">
                  <div className="education-degree">
                    <h3 className="degree-name">
                      {edu.degree}
                      {edu.specialization && <span className="specialization"> - {edu.specialization}</span>}
                    </h3>
                  </div>

                  <div className="education-institute">
                    <h4 className="institute-name">
                      {edu.instituteName}
                      {edu.location && <span className="institute-location"> - {edu.location}</span>}
                    </h4>
                  </div>

                  <div className="education-meta">
                    <div className="education-status">
                      <span className={`status-badge ${edu.status.toLowerCase()}`}>
                        {edu.status}
                      </span>
                      {edu.status === 'Completed' && edu.completionYear && (
                        <span className="education-year">{edu.completionYear}</span>
                      )}
                      {edu.status === 'Pursuing' && edu.expectedCompletionYear && (
                        <span className="education-year">Expected: {edu.expectedCompletionYear}</span>
                      )}
                    </div>
                    {edu.grade && (
                      <div className="education-grade">
                        <span className="grade-label">Grade:</span>
                        <span className="grade-value">{edu.grade}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {index < educationData.length - 1 && <div className="education-connector"></div>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Education;
