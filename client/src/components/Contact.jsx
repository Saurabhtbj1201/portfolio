import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import ToastContainer from './ToastContainer';
import { useToast } from '../hooks/useToast';
import '../styles/Contact.css';

const Contact = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [activeForm, setActiveForm] = useState('review'); // 'review' or 'contact'
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const testimonialRef = useRef(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Toast notifications
  const { toasts, removeToast, showSuccess, showError } = useToast();

  // Form states
  const [reviewForm, setReviewForm] = useState({
    fullName: '',
    email: '',
    rating: 5,
    feedback: '',
    websiteLink: '',
    profileImage: null
  });

  const [contactForm, setContactForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    reason: 'general connection',
    message: ''
  });

  useEffect(() => {
    fetchTestimonials();
  }, []);

  // Group testimonials into slides of 2
  const groupedTestimonials = [];
  for (let i = 0; i < testimonials.length; i += 2) {
    groupedTestimonials.push(testimonials.slice(i, i + 2));
  }

  // Auto-scroll testimonials
  useEffect(() => {
    if (groupedTestimonials.length > 0 && !isHovered) {
      const interval = setInterval(() => {
        setCurrentSlide(prev => (prev + 1) % groupedTestimonials.length);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [groupedTestimonials.length, isHovered]);

  const fetchTestimonials = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/feedback/testimonials`);
      setTestimonials(response.data);
    } catch (error) {
      console.error('Error fetching testimonials:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const formData = new FormData();
      Object.keys(reviewForm).forEach(key => {
        if (key === 'profileImage' && reviewForm[key]) {
          formData.append(key, reviewForm[key]);
        } else if (key !== 'profileImage') {
          formData.append(key, reviewForm[key]);
        }
      });

      await axios.post(`${import.meta.env.VITE_API_URL}/feedback`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      showSuccess('Thank you for your feedback! It will be reviewed before being published.');
      setReviewForm({
        fullName: '',
        email: '',
        rating: 5,
        feedback: '',
        websiteLink: '',
        profileImage: null
      });
      
      // Reset file input
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = '';
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to submit feedback');
    } finally {
      setSubmitting(false);
    }
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/contact-messages`, contactForm);

      showSuccess('Thank you for reaching out! We will get back to you soon.');
      setContactForm({
        fullName: '',
        email: '',
        phone: '',
        reason: 'general connection',
        message: ''
      });
    } catch (error) {
      showError(error.response?.data?.message || 'Failed to send message');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReviewInputChange = (e) => {
    const { name, value, type, files } = e.target;
    setReviewForm(prev => ({
      ...prev,
      [name]: type === 'file' ? files[0] : value
    }));
  };

  const handleContactInputChange = (e) => {
    const { name, value } = e.target;
    setContactForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const nextSlide = () => {
    setCurrentSlide(prev => (prev + 1) % groupedTestimonials.length);
  };

  const prevSlide = () => {
    setCurrentSlide(prev => (prev - 1 + groupedTestimonials.length) % groupedTestimonials.length);
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, index) => (
      <svg
        key={index}
        className={`star ${index < rating ? 'filled' : ''}`}
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    ));
  };

  return (
    <section id="contact" className="contact-section">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      
      <div className="contact-container">

        <div className="contact-header">
          <h2 className="contact-title">Get In Touch</h2>
          <p className="contact-subtitle">Let's connect and create something amazing together</p>
        </div>

        {/* Contact Forms Section */}
        <div className="contact-forms">
          <div className="form-tabs">
            <button 
              className={`tab-btn ${activeForm === 'review' ? 'active' : ''}`}
              onClick={() => setActiveForm('review')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
              Leave a Review
            </button>
            <button 
              className={`tab-btn ${activeForm === 'contact' ? 'active' : ''}`}
              onClick={() => setActiveForm('contact')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
              Get In Touch
            </button>
          </div>

          <div className="forms-container">
            {/* Review Form */}
            {activeForm === 'review' && (
              <form onSubmit={handleReviewSubmit} className="contact-form review-form">
                <div className="form-image-container">
                  <img 
                    src="/feedback.jpg" 
                    alt="Leave a Review" 
                    className="form-image"
                  />
                </div>
                
                <div className="form-content">
                  <div className="form-grids">
                    <div className="form-groups">
                      <label>Full Name *</label>
                      <input
                        type="text"
                        name="fullName"
                        value={reviewForm.fullName}
                        onChange={handleReviewInputChange}
                        required
                        placeholder="Your full name"
                      />
                    </div>

                    <div className="form-groups">
                      <label>Email *</label>
                      <input
                        type="email"
                        name="email"
                        value={reviewForm.email}
                        onChange={handleReviewInputChange}
                        required
                        placeholder="your.email@example.com"
                      />
                    </div>

                    <div className="form-groups">
                      <label>Profile Image</label>
                      <input
                        type="file"
                        name="profileImage"
                        accept="image/*"
                        onChange={handleReviewInputChange}
                      />
                    </div>

                    <div className="form-groups">
                      <label>Website Link (Optional)</label>
                      <input
                        type="url"
                        name="websiteLink"
                        value={reviewForm.websiteLink}
                        onChange={handleReviewInputChange}
                        placeholder="https://yourwebsite.com"
                      />
                    </div>
                  </div>

                  <div className="form-groups">
                    <label>Rating *</label>
                    <div className="star-rating">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          className={`star-btn ${star <= reviewForm.rating ? 'active' : ''}`}
                          onClick={() => setReviewForm(prev => ({ ...prev, rating: star }))}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                          </svg>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="form-groups">
                    <label>Your Feedback *</label>
                    <textarea
                      name="feedback"
                      value={reviewForm.feedback}
                      onChange={handleReviewInputChange}
                      required
                      rows="5"
                      placeholder="Share your experience working with me..."
                    />
                  </div>

                  <button type="submit" className="submit-btn" disabled={submitting}>
                    {submitting ? 'Submitting...' : 'Submit Review'}
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="22" y1="2" x2="11" y2="13"/>
                      <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                    </svg>
                  </button>
                </div>
              </form>
            )}

            {/* Contact Form */}
            {activeForm === 'contact' && (
              <form onSubmit={handleContactSubmit} className="contact-form get-in-touch-form">
                <div className="form-image-container">
                  <img 
                    src="/contact.jpg" 
                    alt="Get In Touch" 
                    className="form-image"
                  />
                </div>
                
                <div className="form-content">
                  <div className="form-grids">
                    <div className="form-groups">
                      <label>Full Name *</label>
                      <input
                        type="text"
                        name="fullName"
                        value={contactForm.fullName}
                        onChange={handleContactInputChange}
                        required
                        placeholder="Your full name"
                      />
                    </div>

                    <div className="form-groups">
                      <label>Email *</label>
                      <input
                        type="email"
                        name="email"
                        value={contactForm.email}
                        onChange={handleContactInputChange}
                        required
                        placeholder="your.email@example.com"
                      />
                    </div>

                    <div className="form-groups">
                      <label>Phone *</label>
                      <input
                        type="tel"
                        name="phone"
                        value={contactForm.phone}
                        onChange={handleContactInputChange}
                        required
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>

                    <div className="form-groups">
                      <label>Reason for Contact *</label>
                      <select
                        name="reason"
                        value={contactForm.reason}
                        onChange={handleContactInputChange}
                        required
                      >
                        <option value="hire me">Hire Me</option>
                        <option value="build projects">Build Projects</option>
                        <option value="general connection">General Connection</option>
                        <option value="others">Others</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-groups">
                    <label>Message *</label>
                    <textarea
                      name="message"
                      value={contactForm.message}
                      onChange={handleContactInputChange}
                      required
                      rows="5"
                      placeholder="Tell me about your project or how I can help you..."
                    />
                  </div>

                  <button type="submit" className="submit-btn" disabled={submitting}>
                    {submitting ? 'Sending...' : 'Send Message'}
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="22" y1="2" x2="11" y2="13"/>
                      <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                    </svg>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
                {/* Testimonials Section */}
        {testimonials.length > 0 && (
          <div className="testimonials-section">
            <h3 className="testimonials-title">What People Say</h3>
            <div 
              className="testimonials-carousel"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <button className="carousel-btn prev" onClick={prevSlide}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="15 18 9 12 15 6"/>
                </svg>
              </button>

              <div className="testimonials-container" ref={testimonialRef}>
                <div 
                  className="testimonials-track"
                  style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                >
                  {groupedTestimonials.map((slide, slideIndex) => (
                    <div key={slideIndex} className="testimonials-slide">
                      {slide.map((testimonial) => (
                        <div key={testimonial._id} className="testimonial-card">
                          <div className="testimonial-header">
                            <div className="testimonial-avatar">
                              {testimonial.profileImage ? (
                                <img src={testimonial.profileImage} alt={testimonial.fullName} />
                              ) : (
                                <div className="avatar-placeholder">
                                  {testimonial.fullName.charAt(0).toUpperCase()}
                                </div>
                              )}
                            </div>
                            <div className="testimonial-info">
                              <h4 className="testimonial-name">{testimonial.fullName}</h4>
                              <div className="testimonial-rating">
                                {renderStars(testimonial.rating)}
                              </div>
                            </div>
                          </div>
                          
                          <p className="testimonial-feedback">"{testimonial.feedback}"</p>
                          
                          {testimonial.websiteLink && (
                            <a 
                              href={testimonial.websiteLink} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="testimonial-link"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                                <polyline points="15 3 21 3 21 9"/>
                                <line x1="10" y1="14" x2="21" y2="3"/>
                              </svg>
                              Visit Website
                            </a>
                          )}
                        </div>
                      ))}
                      {/* Fill empty space if odd number of testimonials */}
                      {slide.length === 1 && <div></div>}
                    </div>
                  ))}
                </div>
              </div>

              <button className="carousel-btn next" onClick={nextSlide}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </button>

              <div className="carousel-indicators">
                {groupedTestimonials.map((_, index) => (
                  <button
                    key={index}
                    className={`indicator ${index === currentSlide ? 'active' : ''}`}
                    onClick={() => setCurrentSlide(index)}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Contact;
