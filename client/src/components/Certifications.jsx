import { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/Certifications.css';

const Certifications = () => {
  const [allCertifications, setAllCertifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCertification, setSelectedCertification] = useState(null);

  useEffect(() => {
    fetchCertifications();
  }, []);

  const fetchCertifications = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/certifications`);
      // Sort by pinned first, then by newest (completion year and month)
      const sortedCertifications = response.data.sort((a, b) => {
        // First sort by pinned status (pinned first)
        if (b.pinned !== a.pinned) return b.pinned - a.pinned;
        
        // Then by completion date (newest first)
        if (b.completionYear !== a.completionYear) return b.completionYear - a.completionYear;
        
        const monthOrder = {
          'January': 1, 'February': 2, 'March': 3, 'April': 4,
          'May': 5, 'June': 6, 'July': 7, 'August': 8,
          'September': 9, 'October': 10, 'November': 11, 'December': 12
        };
        return (monthOrder[b.completionMonth] || 0) - (monthOrder[a.completionMonth] || 0);
      });
      setAllCertifications(sortedCertifications);
      // Set first certification as selected by default
      if (sortedCertifications.length > 0) {
        setSelectedCertification(sortedCertifications[0]);
      }
    } catch (error) {
      console.error('Error fetching certifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCertificationSelect = (certification) => {
    setSelectedCertification(certification);
  };

  if (loading) {
    return (
      <section id="certifications" className="certifications-section">
        <div className="certifications-container">
          <div className="certifications-header">
            <h2 className="certifications-title">Courses & Certifications</h2>
            <p className="certifications-subtitle">Select a certificate to view details</p>
          </div>
          <div className="certifications-loading">
            <div className="spinner"></div>
            <p>Loading certifications...</p>
          </div>
        </div>
      </section>
    );
  }

  if (allCertifications.length === 0) {
    return (
      <section id="certifications" className="certifications-section">
        <div className="certifications-container">
          <div className="certifications-header">
            <h2 className="certifications-title">Courses & Certifications</h2>
            <p className="certifications-subtitle">Select a certificate to view details</p>
          </div>
          <div className="no-certifications">
            <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <path d="M9 15l2 2 4-4"/>
            </svg>
            <p>Certifications will be displayed here</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="certifications" className="certifications-section">
      <div className="certifications-container">
        <div className="certifications-header">
          <h2 className="certifications-title">Courses & Certifications</h2>
          <p className="certifications-subtitle">Select a certificate to view details</p>
        </div>

        <div className="certifications-layout">
          {/* Left Panel - Certificate List */}
          <div className="certificates-list-panel">
            <div className="certificates-list-container">
              {allCertifications.map((certification, index) => (
                <div 
                  key={certification._id} 
                  className={`certificate-list-item ${selectedCertification?._id === certification._id ? 'selected' : ''} ${certification.pinned ? 'pinned' : ''}`}
                  onClick={() => handleCertificationSelect(certification)}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="certificate-list-image">
                    {certification.image ? (
                      <img src={certification.image} alt={certification.organization} />
                    ) : (
                      <div className="certificate-list-placeholder">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                          <polyline points="14 2 14 8 20 8"/>
                          <path d="M9 15l2 2 4-4"/>
                        </svg>
                      </div>
                    )}
                    {certification.pinned && (
                      <div className="certificate-pin-indicator">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 17l-5-5h3V4h4v8h3l-5 5z"/>
                        </svg>
                      </div>
                    )}
                  </div>
                  
                  <div className="certificate-list-content">
                    <h4 className="certificate-list-title">{certification.title}</h4>
                    <p className="certificate-list-organization">{certification.organization}</p>
                    <span className="certificate-list-date">
                      Issued on {certification.completionMonth} {certification.completionYear}
                    </span>
                  </div>

                  {selectedCertification?._id === certification._id && (
                    <div className="certificate-list-indicator">
                      <div className="indicator-dot"></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Right Panel - Certificate Preview */}
          <div className="certificate-preview-panel">
            {selectedCertification ? (
              <div className="certificate-preview-card" key={selectedCertification._id}>
                <div className="certificate-preview-header">
                  <div className="certificate-preview-title-section">
                    <h3 className="certificate-preview-title">{selectedCertification.title}</h3>
                    <p className="certificate-preview-organization">
                      {selectedCertification.organization}
                    </p>
                    <p className="certificate-preview-subtitle">Professional Certificate Program</p>
                  </div>
                  
                  {selectedCertification.image && (
                    <div className="certificate-preview-logo">
                      <img src={selectedCertification.image} alt={selectedCertification.organization} />
                    </div>
                  )}
                </div>

                <div className="certificate-preview-meta">
                  <div className="certificate-meta-item">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                      <line x1="16" y1="2" x2="16" y2="6"/>
                      <line x1="8" y1="2" x2="8" y2="6"/>
                      <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                    <span>Issued on {selectedCertification.completionMonth} {selectedCertification.completionYear} • Valid for 3 years</span>
                  </div>
                </div>

                <div className="certificate-preview-image">
                  {selectedCertification.certificate ? (
                    <div className="certificate-document-preview">
                      {selectedCertification.certificate.toLowerCase().includes('.pdf') ? (
                        <iframe
                          src={`${selectedCertification.certificate}#toolbar=0&navpanes=0&scrollbar=0&view=FitH&zoom=100`}
                          title={`${selectedCertification.title} Certificate`}
                          className="certificate-pdf-viewer"
                          loading="lazy"
                        />
                      ) : (
                        <img
                          src={selectedCertification.certificate}
                          alt={`${selectedCertification.title} Certificate`}
                          className="certificate-image-viewer"
                          loading="lazy"
                        />
                      )}
                    </div>
                  ) : (
                    <div className="certificate-placeholder">
                      <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14 2 14 8 20 8"/>
                        <path d="M9 15l2 2 4-4"/>
                      </svg>
                      <p>No Certificate Available</p>
                    </div>
                  )}
                </div>

                <div className="certificate-preview-action">
                  {selectedCertification.certificate && (
                    <a
                      href={selectedCertification.certificate}
                      download={`${selectedCertification.title}_Certificate.${selectedCertification.certificate.toLowerCase().includes('.pdf') ? 'pdf' : 'jpg'}`}
                      className="download-certificate-btn"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                        <polyline points="7 10 12 15 17 10"/>
                        <line x1="12" y1="15" x2="12" y2="3"/>
                      </svg>
                      Download Certificate
                    </a>
                  )}
                  {selectedCertification.credentialUrl && (
                    <a
                      href={selectedCertification.credentialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="verify-certificate-btn"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                        <polyline points="15 3 21 3 21 9"/>
                        <line x1="10" y1="14" x2="21" y2="3"/>
                      </svg>
                      Verify Credential
                    </a>
                  )}
                </div>

                <div className="certificate-preview-details">
                  <h4>About this certification</h4>
                  <p>
                    {selectedCertification.description || 
                     `This certification program, developed by ${selectedCertification.organization}, includes hands-on projects designed to equip learners with job-ready skills. The certification covers comprehensive training from beginning to end, including practical applications and real-world scenarios. Upon completion, graduates have demonstrated their proficiency and expertise in the subject matter.`}
                  </p>

                  {selectedCertification.skills && selectedCertification.skills.length > 0 && (
                    <div className="certificate-skills-section">
                      <h5>Skills & Technologies:</h5>
                      <div className="certificate-skills-tags">
                        {selectedCertification.skills.map((skill, index) => (
                          <span key={index} className="certificate-skill-tag">{skill}</span>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedCertification.credentialId && (
                    <div className="certificate-credential-id">
                      <strong>Credential ID:</strong> {selectedCertification.credentialId}
                    </div>
                  )}
                </div>

                <div className="certificate-preview-footer">
                  <div className="certificate-organization-badge">
                    {selectedCertification.image && (
                      <img src={selectedCertification.image} alt={selectedCertification.organization} />
                    )}
                    <span>{selectedCertification.organization}</span>
                  </div>
                  
                  <div className="certificate-social-links">
                    <a
                      href="#"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="certificate-social-link"
                      title="Share on LinkedIn"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            ) : (
              <div className="no-certificate-selected">
                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <path d="M9 15l2 2 4-4"/>
                </svg>
                <h3>Select a Certificate</h3>
                <p>Choose a certificate from the list to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Certifications;
