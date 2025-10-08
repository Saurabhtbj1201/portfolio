import { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/Projects.css';

const Projects = () => {
  const [allProjects, setAllProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [showAllProjects, setShowAllProjects] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      // Fetch all projects
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/projects`);
      setAllProjects(response.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter projects based on showAllProjects state
  const displayedProjects = showAllProjects 
    ? allProjects 
    : allProjects.filter(project => project.showOnHome).slice(0, 6);

  const featuredProjectsCount = allProjects.filter(project => project.showOnHome).length;
  const hasMoreProjects = allProjects.length > featuredProjectsCount;

  const toggleProjectsView = () => {
    setShowAllProjects(!showAllProjects);
    
    // If switching to "Show Featured Only", scroll to projects section
    if (showAllProjects) {
      const projectsSection = document.getElementById('projects');
      if (projectsSection) {
        projectsSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const openProjectModal = (project) => {
    setSelectedProject(project);
    setModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeProjectModal = () => {
    setSelectedProject(null);
    setModalOpen(false);
    document.body.style.overflow = 'unset';
  };

  const getLinkIcon = (linkType) => {
    const icons = {
      Live: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
          <polyline points="15 3 21 3 21 9"/>
          <line x1="10" y1="14" x2="21" y2="3"/>
        </svg>
      ),
      GitHub: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
        </svg>
      ),
      LinkedIn: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
        </svg>
      ),
      YouTube: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
      ),
      Twitter: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
        </svg>
      ),
      Medium: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z"/>
        </svg>
      ),
      'Product Hunt': (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M13.337 9h-2.838v3h2.838c.83 0 1.5-.67 1.5-1.5S14.167 9 13.337 9z"/>
          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm1.337 14h-2.838v3H8.5V7h4.837C15.83 7 18 9.17 18 11.663 18 14.157 15.83 14 13.337 14z"/>
        </svg>
      )
    };
    return icons[linkType] || icons.Live;
  };

  if (loading) {
    return (
      <section id="projects" className="projects-section">
        <div className="projects-container">
          <div className="projects-header">
            <h2 className="projects-title">Projects</h2>
            <p className="projects-subtitle">Featured work</p>
          </div>
          <div className="projects-loading">
            <div className="spinner"></div>
            <p>Loading projects...</p>
          </div>
        </div>
      </section>
    );
  }

  if (allProjects.length === 0) {
    return (
      <section id="projects" className="projects-section">
        <div className="projects-container">
          <div className="projects-header">
            <h2 className="projects-title">Projects</h2>
            <p className="projects-subtitle">Featured work</p>
          </div>
          <div className="no-projects">
            <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
            </svg>
            <p>Projects will be displayed here</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section id="projects" className="projects-section">
        <div className="projects-container">
          <div className="projects-header">
            <h2 className="projects-title">Projects</h2>
            <p className="projects-subtitle">
              {showAllProjects 
                ? `All ${allProjects.length} projects` 
                : `Featured work (${displayedProjects.length} of ${allProjects.length})`
              }
            </p>
          </div>

          <div className="projects-grid">
            {displayedProjects.map((project) => (
              <div key={project._id} className="project-card" onClick={() => openProjectModal(project)}>
                <div className="project-image-container">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="project-image"
                  />
                  <div className="project-overlay">
                    <button className="view-project-btn">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                      View Details
                    </button>
                  </div>
                  <span className={`project-status-badge ${project.status.toLowerCase()}`}>
                    {project.status}
                  </span>
                </div>

                <div className="project-content">
                  <div className="project-header">
                    <h3 className="project-title">{project.title}</h3>
                    {project.status === 'Completed' && project.completionMonth && project.completionYear && (
                      <span className="project-completion">
                        {project.completionMonth} {project.completionYear}
                      </span>
                    )}
                  </div>

                  <p className="project-description">{project.description}</p>

                  {project.skills && project.skills.length > 0 && (
                    <div className="project-skills">
                      {project.skills.map((skill) => (
                        <span key={skill._id} className="skill-badge">
                          <img src={skill.image} alt={skill.name} />
                          {skill.name}
                        </span>
                      ))}
                    </div>
                  )}

                  {project.links && project.links.length > 0 && (
                    <div className="project-links">
                      {project.links.slice(0, 3).map((link, index) => (
                        <a
                          key={index}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="project-link"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <span className="link-icon">{getLinkIcon(link.type)}</span>
                          {link.type === 'Custom' ? link.customName : link.type}
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Show toggle button only if there are more projects than featured ones */}
          {hasMoreProjects && (
            <div className="view-all-projects">
              <button 
                onClick={toggleProjectsView} 
                className="view-all-btn"
              >
                {showAllProjects ? (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 15l-6-6-6 6"/>
                    </svg>
                    Show Featured Only
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                    </svg>
                    View All Projects ({allProjects.length})
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Project Modal */}
      <div className={`project-modal ${modalOpen ? 'open' : ''}`} onClick={closeProjectModal}>
        <div className="modal-content" onClick={(e) => e.stopPropagation()}>
          {selectedProject && (
            <>
              <div className="modal-header">
                <img
                  src={selectedProject.image}
                  alt={selectedProject.title}
                  className="modal-image"
                />
                <button className="close-modal-btn" onClick={closeProjectModal}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>

              <div className="modal-body">
                <h2 className="modal-title">{selectedProject.title}</h2>
                
                <div className="modal-meta">
                  <span className={`modal-status ${selectedProject.status.toLowerCase()}`}>
                    {selectedProject.status}
                  </span>
                  {selectedProject.status === 'Completed' && selectedProject.completionMonth && selectedProject.completionYear && (
                    <span className="modal-completion">
                      Completed: {selectedProject.completionMonth} {selectedProject.completionYear}
                    </span>
                  )}
                </div>

                <div className="modal-description">
                  <p>{selectedProject.description}</p>
                </div>

                {selectedProject.detailedDescription && (
                  <div className="modal-detailed-description">
                    <p>{selectedProject.detailedDescription}</p>
                  </div>
                )}

                {selectedProject.skills && selectedProject.skills.length > 0 && (
                  <div className="modal-skills">
                    <h3>Technologies Used</h3>
                    <div className="project-skills">
                      {selectedProject.skills.map((skill) => (
                        <span key={skill._id} className="skill-badge">
                          <img src={skill.image} alt={skill.name} />
                          {skill.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedProject.links && selectedProject.links.length > 0 && (
                  <div className="modal-links">
                    <h3>Project Links</h3>
                    <div className="project-links">
                      {selectedProject.links.map((link, index) => (
                        <a
                          key={index}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="project-link"
                        >
                          <span className="link-icon">{getLinkIcon(link.type)}</span>
                          {link.type === 'Custom' ? link.customName : link.type}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};


export default Projects;
