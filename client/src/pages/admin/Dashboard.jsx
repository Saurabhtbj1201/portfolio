import { useContext, useState, useEffect } from 'react';
import AuthContext from '../../context/AuthContext';
import { getAnalyticsStats } from '../../utils/analytics';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import '../../styles/Dashboard.css';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    const data = await getAnalyticsStats();
    if (data) {
      setStats(data);
    }
    setLoading(false);
  };

  // Mock data for line chart (visits over time)
  const visitData = [
    { date: 'Mon', visits: 120 },
    { date: 'Tue', visits: 150 },
    { date: 'Wed', visits: 180 },
    { date: 'Thu', visits: 170 },
    { date: 'Fri', visits: 200 },
    { date: 'Sat', visits: 190 },
    { date: 'Sun', visits: 160 }
  ];

  // Device data for pie chart
  const deviceData = stats ? [
    { name: 'Desktop', value: stats.devices.desktop || 0 },
    { name: 'Mobile', value: stats.devices.mobile || 0 },
    { name: 'Tablet', value: stats.devices.tablet || 0 }
  ] : [];

  // Page views data for bar chart
  const pageViewsData = stats?.topPages || [
    { page: 'Home', views: 450 },
    { page: 'About', views: 320 },
    { page: 'Projects', views: 280 },
    { page: 'Contact', views: 190 }
  ];

  const COLORS = ['#667eea', '#764ba2', '#f093fb', '#4facfe'];

  // Add analytics data structure
  const analyticsData = stats ? [
    {
      category: 'Visitors & Traffic',
      metrics: [
        { 
          label: 'Total Visits', 
          value: stats.visitors.total.toLocaleString(), 
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          )
        },
        { 
          label: 'Today', 
          value: stats.visitors.today.toLocaleString(), 
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          )
        },
        { 
          label: 'This Week', 
          value: stats.visitors.weekly.toLocaleString(), 
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="20" x2="18" y2="10"/>
              <line x1="12" y1="20" x2="12" y2="4"/>
              <line x1="6" y1="20" x2="6" y2="14"/>
            </svg>
          )
        },
        { 
          label: 'Unique Visitors', 
          value: stats.visitors.unique.toLocaleString(), 
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          )
        }
      ]
    },
    {
      category: 'Engagement',
      metrics: [
        { 
          label: 'Avg. Session', 
          value: `${stats.engagement.avgSessionDuration} min`, 
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
          )
        },
        { 
          label: 'Bounce Rate', 
          value: `${stats.engagement.bounceRate}%`, 
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
          )
        },
        { 
          label: 'Pages/Session', 
          value: stats.engagement.pagesPerSession, 
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
          )
        },
        { 
          label: 'Active Now', 
          value: Math.floor(Math.random() * 10) + 1, 
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <circle cx="12" cy="12" r="3" fill="currentColor"/>
            </svg>
          )
        }
      ]
    },
    {
      category: 'Device & Location',
      metrics: [
        { 
          label: 'Desktop', 
          value: stats.devices.desktop || 0, 
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
              <line x1="8" y1="21" x2="16" y2="21"/>
              <line x1="12" y1="17" x2="12" y2="21"/>
            </svg>
          )
        },
        { 
          label: 'Mobile', 
          value: stats.devices.mobile || 0, 
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
              <line x1="12" y1="18" x2="12.01" y2="18"/>
            </svg>
          )
        },
        { 
          label: 'Top Country', 
          value: stats.locations.topCountry, 
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="2" y1="12" x2="22" y2="12"/>
              <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
            </svg>
          )
        },
        { 
          label: 'Top City', 
          value: stats.locations.topCity, 
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
          )
        }
      ]
    },
    {
      category: 'Traffic Sources',
      metrics: stats.trafficSources.length > 0 ? 
        stats.trafficSources.map(s => ({ 
          label: s.source, 
          value: s.count, 
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
            </svg>
          )
        })) :
        [
          { label: 'Direct', value: '45%', icon: (<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>) },
          { label: 'Search', value: '30%', icon: (<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>) },
          { label: 'Social', value: '15%', icon: (<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>) },
          { label: 'Referral', value: '10%', icon: (<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/></svg>) }
        ]
    }
  ] : null;

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Welcome back, {user?.username}!</h1>
          <p className="dashboard-subtitle">Here's what's happening with your portfolio</p>
        </div>
      </div>

      {/* Counter Widgets */}
      <div className="stats-grid">
        <div className="stat-widget">
          <div className="stat-icon visitors">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <div className="stat-details">
            <p className="stat-label">Total Visits</p>
            <h3 className="stat-value">{stats?.visitors.total.toLocaleString() || 0}</h3>
            <p className="stat-change positive">+12% from last week</p>
          </div>
        </div>

        <div className="stat-widget">
          <div className="stat-icon active">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <circle cx="12" cy="12" r="3" fill="currentColor"/>
            </svg>
          </div>
          <div className="stat-details">
            <p className="stat-label">Active Users</p>
            <h3 className="stat-value">{Math.floor(Math.random() * 20) + 5}</h3>
            <p className="stat-change neutral">Currently online</p>
          </div>
        </div>

        <div className="stat-widget">
          <div className="stat-icon pages">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
          </div>
          <div className="stat-details">
            <p className="stat-label">Pages/Session</p>
            <h3 className="stat-value">{stats?.engagement.pagesPerSession || 0}</h3>
            <p className="stat-change positive">+5% increase</p>
          </div>
        </div>

        <div className="stat-widget">
          <div className="stat-icon bounce">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
          </div>
          <div className="stat-details">
            <p className="stat-label">Bounce Rate</p>
            <h3 className="stat-value">{stats?.engagement.bounceRate || 0}%</h3>
            <p className="stat-change negative">-3% improvement</p>
          </div>
        </div>
      </div>

      {/* Site Analytics Section */}
      <div className="site-analytics-section">
        <h2 className="section-title">Site Analytics</h2>
        {analyticsData && (
          <div className="analytics-categories">
            {analyticsData.map((category, idx) => (
              <div key={idx} className="analytics-category-card">
                <h3 className="category-header">{category.category}</h3>
                <div className="metrics-list">
                  {category.metrics.map((metric, index) => (
                    <div key={index} className="metric-row">
                      <span className="metric-icon-svg">{metric.icon}</span>
                      <div className="metric-content">
                        <span className="metric-name">{metric.label}</span>
                        <span className="metric-number">{metric.value}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Charts Section */}
      <div className="charts-grid">
        {/* Line Chart - Visits Over Time */}
        <div className="chart-card">
          <h3 className="chart-title">Visits Over Time</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={visitData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="date" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip 
                contentStyle={{ 
                  background: '#1e293b', 
                  border: '1px solid #334155',
                  borderRadius: '8px'
                }} 
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="visits" 
                stroke="#667eea" 
                strokeWidth={3}
                dot={{ fill: '#667eea', r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart - Device Types */}
        <div className="chart-card">
          <h3 className="chart-title">Device Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={deviceData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {deviceData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart - Page Views */}
        <div className="chart-card full-width">
          <h3 className="chart-title">Page Views by Section</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={pageViewsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="page" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip 
                contentStyle={{ 
                  background: '#1e293b', 
                  border: '1px solid #334155',
                  borderRadius: '8px'
                }} 
              />
              <Bar dataKey="views" fill="#764ba2" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="activity-card">
        <h3 className="activity-title">Recent Activity</h3>
        <div className="activity-list">
          <div className="activity-item">
            <div className="activity-icon">👤</div>
            <div className="activity-details">
              <p className="activity-text">New visitor from India</p>
              <p className="activity-time">2 minutes ago</p>
            </div>
          </div>
          <div className="activity-item">
            <div className="activity-icon">📄</div>
            <div className="activity-details">
              <p className="activity-text">Project page viewed</p>
              <p className="activity-time">5 minutes ago</p>
            </div>
          </div>
          <div className="activity-item">
            <div className="activity-icon">📧</div>
            <div className="activity-details">
              <p className="activity-text">Contact form submitted</p>
              <p className="activity-time">15 minutes ago</p>
            </div>
          </div>
          <div className="activity-item">
            <div className="activity-icon">💼</div>
            <div className="activity-details">
              <p className="activity-text">Resume downloaded</p>
              <p className="activity-time">1 hour ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;