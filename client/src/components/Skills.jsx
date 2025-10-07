import { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/Skills.css';

const Skills = () => {
  const [skillCategories, setSkillCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/skills`);
      setSkillCategories(response.data);
    } catch (error) {
      console.error('Error fetching skills:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="skills-loading">
        <div className="spinner"></div>
        <p>Loading skills...</p>
      </div>
    );
  }

  if (skillCategories.length === 0) {
    return (
      <section id="skills" className="skills-section">
        <div className="skills-container">
          <div className="skills-header">
            <h2 className="skills-title">Technical Skills</h2>
            <p className="skills-subtitle">Technologies and tools I work with</p>
          </div>
          <div className="no-skills">
            <svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
            </svg>
            <p>Skills will be displayed here</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="skills" className="skills-section">
      <div className="skills-container">
        <div className="skills-header">
          <h2 className="skills-title">Technical Skills</h2>
          <p className="skills-subtitle">Technologies and tools I work with</p>
        </div>

        <div className="skills-categories">
          {skillCategories.map((category) => (
            <div key={category._id} className="skill-category">
              <div className="category-headers">
                <h3 
                  className="category-title"
                  style={{ color: category.color }}
                >
                  {category.name}
                </h3>
                {category.description && (
                  <p className="category-description">{category.description}</p>
                )}
              </div>

              <div className="skills-ribbon">
                <div className="skills-scroll-container">
                  <div className="skills-list">
                    {/* Original skills */}
                    {category.skills.map((skill) => (
                      <div key={skill._id} className="skill-item">
                        <div className="skill-image">
                          <img src={skill.image} alt={skill.name} />
                        </div>
                        <span className="skill-name">{skill.name}</span>
                      </div>
                    ))}
                    
                    {/* Duplicate skills for infinite scroll effect */}
                    {category.skills.length > 0 && category.skills.map((skill) => (
                      <div key={`${skill._id}-duplicate`} className="skill-item">
                        <div className="skill-image">
                          <img src={skill.image} alt={skill.name} />
                        </div>
                        <span className="skill-name">{skill.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Skills;
