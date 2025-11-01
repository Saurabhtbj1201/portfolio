import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { fonts } from '../../theme/fonts';
import { AuthContext } from '../../context/AuthContext';
import Card from '../../components/common/Card';
import StatsCard from '../../components/admin/StatsCard';
import apiClient from '../../api/client';
import { ENDPOINTS } from '../../utils/constants';
import { projectsApi } from '../../api/projects';
import { skillsApi } from '../../api/skills';

const DashboardScreen = ({ navigation }) => {
  const { logout } = useContext(AuthContext);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const data = await apiClient.get(ENDPOINTS.DASHBOARD);
      setStats(data);
      prepareChartData(data);
    } catch (error) {
      console.log('Dashboard endpoint not available, calculating stats manually...');
      await calculateStatsManually();
    } finally {
      setLoading(false);
    }
  };

  const calculateStatsManually = async () => {
    try {
      const [projects, skills, articles, contacts] = await Promise.all([
        projectsApi.getAll().catch(() => []),
        skillsApi.getAll().catch(() => []),
        apiClient.get(ENDPOINTS.ARTICLES).catch(() => []),
        apiClient.get(ENDPOINTS.CONTACT).catch(() => []),
      ]);

      const statsData = {
        projectsCount: projects?.length || 0,
        skillsCount: skills?.reduce((acc, cat) => acc + (cat.skills?.length || 0), 0) || 0,
        articlesCount: articles?.length || 0,
        contactsCount: contacts?.length || 0,
      };
      
      setStats(statsData);
      prepareChartData(statsData);
    } catch (error) {
      console.error('Error calculating stats:', error);
      const defaultStats = {
        projectsCount: 0,
        skillsCount: 0,
        articlesCount: 0,
        contactsCount: 0,
      };
      setStats(defaultStats);
      prepareChartData(defaultStats);
    }
  };

  const prepareChartData = (data) => {
    setChartData({
      pieData: [
        {
          name: 'Projects',
          population: data.projectsCount || 1,
          color: colors.primary,
          legendFontColor: colors.text,
        },
        {
          name: 'Skills',
          population: data.skillsCount || 1,
          color: colors.secondary,
          legendFontColor: colors.text,
        },
        {
          name: 'Articles',
          population: data.articlesCount || 1,
          color: colors.accent,
          legendFontColor: colors.text,
        },
        {
          name: 'Contacts',
          population: data.contactsCount || 1,
          color: colors.warning,
          legendFontColor: colors.text,
        },
      ],
      barData: {
        labels: ['Projects', 'Skills', 'Articles', 'Contacts'],
        datasets: [
          {
            data: [
              data.projectsCount || 0,
              data.skillsCount || 0,
              data.articlesCount || 0,
              data.contactsCount || 0,
            ],
          },
        ],
      },
    });
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        onPress: () => {
          logout();
          navigation.getParent().reset({
            index: 0,
            routes: [{ name: 'Home' }],
          });
        },
      },
    ]);
  };

  const managementItems = [
    { title: 'Profile', icon: '👤', screen: 'Profile' },
    { title: 'Skills', icon: '⚡', screen: 'Skills' },
    { title: 'Projects', icon: '💼', screen: 'Projects' },
    { title: 'Experience', icon: '🏢', screen: 'Experience' },
    { title: 'Education', icon: '🎓', screen: 'Education' },
    { title: 'Certifications', icon: '📜', screen: 'Certifications' },
    { title: 'Articles', icon: '📝', screen: 'Articles' },
    { title: 'Awards', icon: '🏆', screen: 'Awards' },
    { title: 'Contact', icon: '📧', screen: 'Contact' },
    { title: 'Users', icon: '👥', screen: 'Users' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Dashboard</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>Loading dashboard...</Text>
          </View>
        ) : (
          <>
            {stats && (
              <>
                <View style={styles.statsContainer}>
                  <StatsCard title="Projects" count={stats.projectsCount} color={colors.primary} />
                  <StatsCard title="Skills" count={stats.skillsCount} color={colors.secondary} />
                  <StatsCard title="Articles" count={stats.articlesCount} color={colors.accent} />
                  <StatsCard title="Contacts" count={stats.contactsCount} color={colors.warning} />
                </View>

                {chartData && (
                  <>
                    <Text style={styles.sectionTitle}>Analytics</Text>
                    
                    <Card>
                      <Text style={styles.chartTitle}>Distribution Overview</Text>
                      <PieChart
                        data={chartData.pieData}
                        width={Dimensions.get('window').width - 64}
                        height={220}
                        chartConfig={{
                          color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
                        }}
                        accessor="population"
                        backgroundColor="transparent"
                        paddingLeft="15"
                        absolute
                      />
                    </Card>

                    <Card>
                      <Text style={styles.chartTitle}>Statistics Comparison</Text>
                      <BarChart
                        data={chartData.barData}
                        width={Dimensions.get('window').width - 64}
                        height={220}
                        chartConfig={{
                          backgroundColor: colors.card,
                          backgroundGradientFrom: colors.card,
                          backgroundGradientTo: colors.card,
                          decimalPlaces: 0,
                          color: (opacity = 1) => `rgba(99, 102, 241, ${opacity})`,
                          labelColor: (opacity = 1) => `rgba(241, 245, 249, ${opacity})`,
                          style: {
                            borderRadius: 16,
                          },
                        }}
                        style={{
                          marginVertical: 8,
                          borderRadius: 16,
                        }}
                      />
                    </Card>
                  </>
                )}
              </>
            )}

            <Text style={styles.sectionTitle}>Management</Text>
            <View style={styles.grid}>
              {managementItems.map((item) => (
                <Card
                  key={item.title}
                  style={styles.managementCard}
                  onPress={() => navigation.navigate(item.screen)}
                >
                  <Text style={styles.icon}>{item.icon}</Text>
                  <Text style={styles.cardTitle}>{item.title}</Text>
                </Card>
              ))}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.surface,
  },
  title: {
    ...fonts.bold,
    fontSize: fonts.sizes.xxl,
    color: colors.text,
  },
  logoutText: {
    ...fonts.medium,
    fontSize: fonts.sizes.md,
    color: colors.error,
  },
  content: {
    flex: 1,
    padding: spacing.md,
  },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...fonts.bold,
    fontSize: fonts.sizes.lg,
    color: colors.text,
    marginBottom: spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  managementCard: {
    width: '48%',
    alignItems: 'center',
    padding: spacing.lg,
  },
  icon: {
    fontSize: 40,
    marginBottom: spacing.sm,
  },
  cardTitle: {
    ...fonts.semibold,
    fontSize: fonts.sizes.md,
    color: colors.text,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xxl,
  },
  loadingText: {
    ...fonts.regular,
    fontSize: fonts.sizes.md,
    color: colors.textSecondary,
    marginTop: spacing.md,
  },
  chartTitle: {
    ...fonts.semibold,
    fontSize: fonts.sizes.md,
    color: colors.text,
    marginBottom: spacing.md,
  },
});

export default DashboardScreen;
