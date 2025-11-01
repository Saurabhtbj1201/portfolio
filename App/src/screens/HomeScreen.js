import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { spacing } from '../theme/spacing';
import { fonts } from '../theme/fonts';
import { AuthContext } from '../context/AuthContext';
import { ThemeContext } from '../context/ThemeContext';
import HeroSection from '../components/home/HeroSection';
import AboutSection from '../components/home/AboutSection';
import SkillsSection from '../components/home/SkillsSection';
import ProjectsSection from '../components/home/ProjectsSection';
import ExperienceSection from '../components/home/ExperienceSection';
import EducationSection from '../components/home/EducationSection';
import CertificationsSection from '../components/home/CertificationsSection';
import ArticlesSection from '../components/home/ArticlesSection';
import AwardsSection from '../components/home/AwardsSection';
import ContactSection from '../components/home/ContactSection';
import { profileApi } from '../api/profile';
import { skillsApi } from '../api/skills';
import { projectsApi } from '../api/projects';
import apiClient from '../api/client';
import { ENDPOINTS } from '../utils/constants';

const HomeScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);
  const { theme, isDark, toggleTheme } = useContext(ThemeContext);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState({
    profile: null,
    skills: [],
    projects: [],
    experiences: [],
    education: [],
    certifications: [],
    articles: [],
    awards: [],
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      console.log('Fetching all data...');
      const [
        profileData,
        skillsData,
        projectsData,
        experiencesData,
        educationData,
        certificationsData,
        articlesData,
        awardsData,
      ] = await Promise.all([
        profileApi.get().catch(() => null),
        skillsApi.getAll().catch(() => []),
        projectsApi.getAll().catch(() => []),
        apiClient.get(ENDPOINTS.EXPERIENCE).catch(() => []),
        apiClient.get(ENDPOINTS.EDUCATION).catch(() => []),
        apiClient.get(ENDPOINTS.CERTIFICATIONS).catch(() => []),
        apiClient.get(ENDPOINTS.ARTICLES).catch(() => []),
        apiClient.get(ENDPOINTS.AWARDS).catch(() => []),
      ]);

      setData({
        profile: profileData,
        skills: skillsData,
        projects: projectsData?.filter(p => p.visible !== false) || [],
        experiences: experiencesData,
        education: educationData,
        certifications: certificationsData,
        articles: articlesData?.filter(a => a.status === 'published') || [],
        awards: awardsData,
      });
      console.log('All data fetched successfully');
    } catch (error) {
      console.error('Error fetching data:', error);
      setError(error.message);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const handleAdminPress = () => {
    navigation.navigate('Admin', { screen: 'Dashboard' });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.surface }]}>
        <Text style={[styles.logo, { color: theme.primary }]}>Portfolio</Text>
        
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={[styles.themeButton, { backgroundColor: theme.card }]}
            onPress={toggleTheme}
          >
            <Text style={styles.themeIcon}>{isDark ? '☀️' : '🌙'}</Text>
          </TouchableOpacity>

          {user ? (
            <TouchableOpacity
              style={[styles.adminButton, { backgroundColor: theme.primary }]}
              onPress={handleAdminPress}
            >
              <Text style={styles.adminButtonText}>Admin</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.loginButton, { backgroundColor: theme.secondary }]}
              onPress={() => navigation.navigate('Auth', { screen: 'Login' })}
            >
              <Text style={styles.loginButtonText}>Login</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor={theme.primary}
          />
        }
      >
        {error && (
          <View style={styles.errorContainer}>
            <Text style={[styles.errorText, { color: theme.error }]}>Error: {error}</Text>
            <Text style={[styles.errorHint, { color: theme.textSecondary }]}>
              Make sure your backend is running
            </Text>
          </View>
        )}
        
        {!error && (
          <>
            <HeroSection profile={data.profile} />
            <AboutSection profile={data.profile} />
            <SkillsSection skills={data.skills} />
            <ProjectsSection projects={data.projects} />
            <ExperienceSection experiences={data.experiences} />
            <EducationSection education={data.education} />
            <CertificationsSection certifications={data.certifications} />
            <ArticlesSection articles={data.articles} />
            <AwardsSection awards={data.awards} />
            <ContactSection />
          </>
        )}
        
        {!data.profile && !error && (
          <View style={styles.placeholderContainer}>
            <Text style={[styles.placeholderText, { color: theme.text }]}>
              👋 Welcome to Portfolio App
            </Text>
            <Text style={[styles.placeholderSubtext, { color: theme.textSecondary }]}>
              Connect to your backend to see your portfolio
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    paddingTop: spacing.xl,
  },
  logo: {
    ...fonts.bold,
    fontSize: fonts.sizes.xl,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  themeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.sm,
  },
  themeIcon: {
    fontSize: 20,
  },
  adminButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
  },
  adminButtonText: {
    ...fonts.semibold,
    color: '#ffffff',
  },
  loginButton: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 8,
  },
  loginButtonText: {
    ...fonts.semibold,
    color: '#ffffff',
  },
  content: {
    flex: 1,
  },
  errorContainer: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  errorText: {
    ...fonts.semibold,
    fontSize: fonts.sizes.md,
    textAlign: 'center',
  },
  errorHint: {
    ...fonts.regular,
    fontSize: fonts.sizes.sm,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  placeholderContainer: {
    padding: spacing.xxl,
    alignItems: 'center',
  },
  placeholderText: {
    ...fonts.bold,
    fontSize: fonts.sizes.xxl,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  placeholderSubtext: {
    ...fonts.regular,
    fontSize: fonts.sizes.md,
    textAlign: 'center',
  },
});

export default HomeScreen;
