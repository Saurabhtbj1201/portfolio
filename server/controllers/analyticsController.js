import Analytics from '../models/Analytics.js';

// @desc    Track page view or event
// @route   POST /api/analytics/track
// @access  Public
export const trackEvent = async (req, res) => {
  try {
    const { type, page, referrer, sessionId } = req.body;
    const userAgent = req.headers['user-agent'];
    const ip = req.ip || req.connection.remoteAddress;

    // Parse device info from user agent
    const device = /mobile/i.test(userAgent) ? 'mobile' : 
                   /tablet|ipad/i.test(userAgent) ? 'tablet' : 'desktop';
    
    const browser = userAgent.match(/(chrome|safari|firefox|edge|opera)/i)?.[0] || 'Unknown';
    const os = userAgent.match(/(windows|mac|linux|android|ios)/i)?.[0] || 'Unknown';

    const analytics = await Analytics.create({
      type,
      page,
      referrer,
      userAgent,
      device,
      browser,
      os,
      ip,
      sessionId,
      country: 'India', // You can integrate with IP geolocation API
      city: 'Noida'
    });

    res.status(201).json({ success: true, id: analytics._id });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get analytics stats
// @route   GET /api/analytics/stats
// @access  Public
export const getStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastWeek = new Date(today);
    lastWeek.setDate(lastWeek.getDate() - 7);

    const lastMonth = new Date(today);
    lastMonth.setDate(lastMonth.getDate() - 30);

    // Total visits
    const totalVisits = await Analytics.countDocuments({ type: 'pageview' });
    
    // Today's visits
    const todayVisits = await Analytics.countDocuments({
      type: 'pageview',
      timestamp: { $gte: today }
    });

    // Weekly visits
    const weeklyVisits = await Analytics.countDocuments({
      type: 'pageview',
      timestamp: { $gte: lastWeek }
    });

    // Unique visitors (based on sessionId)
    const uniqueVisitors = await Analytics.distinct('sessionId', { 
      type: 'pageview' 
    });

    // Device breakdown
    const deviceStats = await Analytics.aggregate([
      { $match: { type: 'pageview' } },
      { $group: { _id: '$device', count: { $sum: 1 } } }
    ]);

    // Top pages
    const topPages = await Analytics.aggregate([
      { $match: { type: 'pageview' } },
      { $group: { _id: '$page', views: { $sum: 1 } } },
      { $sort: { views: -1 } },
      { $limit: 5 }
    ]);

    // Traffic sources
    const trafficSources = await Analytics.aggregate([
      { $match: { type: 'pageview', referrer: { $exists: true, $ne: '' } } },
      { $group: { 
        _id: { 
          $cond: [
            { $regexMatch: { input: '$referrer', regex: 'google' } },
            'Google',
            { $cond: [
              { $regexMatch: { input: '$referrer', regex: 'facebook' } },
              'Facebook',
              { $cond: [
                { $regexMatch: { input: '$referrer', regex: 'twitter|x\\.com' } },
                'Twitter',
                'Other'
              ]}
            ]}
          ]
        },
        count: { $sum: 1 }
      }},
      { $sort: { count: -1 } }
    ]);

    // Calculate engagement metrics
    const avgSessionDuration = 2.5; // In minutes (you can calculate this with session tracking)
    const bounceRate = 35; // Percentage

    res.json({
      visitors: {
        total: totalVisits,
        today: todayVisits,
        weekly: weeklyVisits,
        unique: uniqueVisitors.length
      },
      engagement: {
        avgSessionDuration,
        bounceRate,
        pagesPerSession: (totalVisits / Math.max(uniqueVisitors.length, 1)).toFixed(2)
      },
      devices: deviceStats.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      locations: {
        topCountry: 'India',
        topCity: 'Noida'
      },
      trafficSources: trafficSources.map(s => ({ source: s._id, count: s.count })),
      topPages: topPages.map(p => ({ page: p._id, views: p.views }))
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get detailed analytics (admin only)
// @route   GET /api/analytics/detailed
// @access  Private
export const getDetailedAnalytics = async (req, res) => {
  try {
    const { startDate, endDate, type } = req.query;
    
    const query = {};
    if (type) query.type = type;
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    const analytics = await Analytics.find(query)
      .sort({ timestamp: -1 })
      .limit(1000);

    res.json(analytics);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
