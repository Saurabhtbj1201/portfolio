import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Home from './pages/Home';
import Login from './pages/Login';
import AdminDashboard from './pages/admin/Dashboard';
import AdminProfile from './pages/admin/Profile';
import AdminSkills from './pages/admin/Skills';
import AdminEducation from './pages/admin/Education';
import AdminProjects from './pages/admin/Projects';
import AdminContact from './pages/admin/Contact';
import PrivateRoute from './components/PrivateRoute';
import Header from './components/Header';
import Footer from './components/Footer';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { trackPageView } from './utils/analytics';

function AnalyticsTracker() {
  const location = useLocation();

  useEffect(() => {
    trackPageView(location.pathname);
  }, [location]);

  return null;
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AnalyticsTracker />
          <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            <Header />
            <main style={{ flex: 1, marginTop: '70px' }}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route
                  path="/admin/dashboard"
                  element={
                    <PrivateRoute>
                      <AdminDashboard />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/admin/profile"
                  element={
                    <PrivateRoute>
                      <AdminProfile />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/admin/skills"
                  element={
                    <PrivateRoute>
                      <AdminSkills />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/admin/education"
                  element={
                    <PrivateRoute>
                      <AdminEducation />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/admin/projects"
                  element={
                    <PrivateRoute>
                      <AdminProjects />
                    </PrivateRoute>
                  }
                />
                <Route
                  path="/admin/contact"
                  element={
                    <PrivateRoute>
                      <AdminContact />
                    </PrivateRoute>
                  }
                />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
