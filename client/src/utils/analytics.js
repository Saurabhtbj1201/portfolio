import axios from 'axios';

// Generate or retrieve session ID
const getSessionId = () => {
  let sessionId = sessionStorage.getItem('sessionId');
  if (!sessionId) {
    sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    sessionStorage.setItem('sessionId', sessionId);
  }
  return sessionId;
};

// Track page view
export const trackPageView = async (page = window.location.pathname) => {
  try {
    await axios.post(`${import.meta.env.VITE_API_URL}/analytics/track`, {
      type: 'pageview',
      page,
      referrer: document.referrer,
      sessionId: getSessionId()
    });
  } catch (error) {
    console.error('Analytics tracking error:', error);
  }
};

// Track custom event
export const trackEvent = async (eventName, data = {}) => {
  try {
    await axios.post(`${import.meta.env.VITE_API_URL}/analytics/track`, {
      type: 'event',
      page: window.location.pathname,
      sessionId: getSessionId(),
      ...data
    });
  } catch (error) {
    console.error('Event tracking error:', error);
  }
};

// Get analytics stats
export const getAnalyticsStats = async () => {
  try {
    const response = await axios.get(`${import.meta.env.VITE_API_URL}/analytics/stats`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch analytics:', error);
    return null;
  }
};
