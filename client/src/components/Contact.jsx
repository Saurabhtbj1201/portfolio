import { useState } from 'react';
import axios from 'axios';
import '../styles/Contact.css';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    purpose: '',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const purposeOptions = [
    { value: 'hire', label: 'Hire Me' },
    { value: 'project', label: 'Build a Project Together' },
    { value: 'connect', label: 'General Connection' },
    { value: 'other', label: 'Other' }
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError(''); // Clear error when user starts typing
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    // Basic validation
    if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim() || 
        !formData.purpose || !formData.message.trim()) {
      setError('Please fill in all fields');
      setSubmitting(false);
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      setSubmitting(false);
      return;
    }

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/contact`, formData);
      setSubmitted(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        purpose: '',
        message: ''
      });
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to send message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="contact" className="contact-section">
      <div className="contact-container">
        <div className="contact-header">
          <h2 className="contact-title">Get In Touch</h2>
          <p className="contact-subtitle">Let's discuss your next project or opportunity</p>
        </div>

        <div className="contact-contents">
          {/* Show success message or contact form */}
          {submitted ? (
            <div className="contact-form-container full-width">
              <div className="success-message">
                <div className="success-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <polyline points="22 4 12 14.01 9 11.01"/>
                  </svg>
                </div>
                <h2>Thank You! 🎉</h2>
                <p>Your message has been sent successfully. I'll get back to you within 24-48 hours.</p>
                <button 
                  className="btn-secondary" 
                  onClick={() => setSubmitted(false)}
                >
                  Send Another Message
                </button>
              </div>
            </div>
          ) : (
            <div className="contact-form-container">
              {/* Left side - GIF */}
              <div className="contact-gif-section">
                <img 
                  src="/contact.png" 
                  alt="Contact icon" 
                  className="contact-gif"
                />
              </div>

              {/* Right side - Form */}
              <div className="form-section">
                <form onSubmit={handleSubmit} className="contact-form">
                  <div className="form-rows">
                    <div className="form-groups">
                      <label htmlFor="name">Name *</label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Your full name"
                        required
                        className="form-input"
                      />
                    </div>
                    <div className="form-groups">
                      <label htmlFor="email">Email *</label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="your.email@example.com"
                        required
                        className="form-input"
                      />
                    </div>
                  </div>

                  <div className="form-rows">
                    <div className="form-groups">
                      <label htmlFor="phone">Phone *</label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+1 (555) 123-4567"
                        required
                        className="form-input"
                      />
                    </div>
                    <div className="form-groups">
                      <label htmlFor="purpose">Purpose *</label>
                      <select
                        id="purpose"
                        name="purpose"
                        value={formData.purpose}
                        onChange={handleChange}
                        required
                        className="form-select"
                      >
                        <option value="">Select purpose</option>
                        {purposeOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="form-groups">
                    <label htmlFor="message">Message *</label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Tell me about your project, opportunity, or just say hello..."
                      required
                      rows="5"
                      className="form-textarea"
                    />
                  </div>

                  {error && (
                    <div className="error-message">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10"/>
                        <line x1="15" y1="9" x2="9" y2="15"/>
                        <line x1="9" y1="9" x2="15" y2="15"/>
                      </svg>
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="submit-btn"
                  >
                    {submitting ? (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="spinner">
                          <path d="M21 12a9 9 0 11-6.219-8.56"/>
                        </svg>
                        Sending...
                      </>
                    ) : (
                      <>
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="22" y1="2" x2="11" y2="13"/>
                          <polygon points="22,2 15,22 11,13 2,9 22,2"/>
                        </svg>
                        Send Message
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default Contact;
            