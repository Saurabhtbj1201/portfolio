import React, { useContext } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Linking } from 'react-native';
import Card from '../common/Card';
import { ThemeContext } from '../../context/ThemeContext';
import { spacing } from '../../theme/spacing';
import { fonts } from '../../theme/fonts';

const AboutSection = ({ profile }) => {
  const { theme } = useContext(ThemeContext);
  
  if (!profile) return null;

  const handleResumePress = () => {
    if (profile.resumeUrl) {
      Linking.openURL(profile.resumeUrl);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.heading, { color: theme.text }]}>About Me</Text>
      <Card>
        {profile.aboutImage && (
          <Image source={{ uri: profile.aboutImage }} style={styles.image} />
        )}
        <Text style={[styles.description, { color: theme.textSecondary }]}>
          {profile.description}
        </Text>
        {profile.email && (
          <Text style={[styles.info, { color: theme.text }]}>📧 {profile.email}</Text>
        )}
        {profile.place && (
          <Text style={[styles.info, { color: theme.text }]}>📍 {profile.place}</Text>
        )}
        
        {profile.resumeUrl && (
          <TouchableOpacity
            style={[styles.resumeButton, { backgroundColor: theme.primary }]}
            onPress={handleResumePress}
          >
            <Text style={styles.resumeButtonText}>📄 View Resume</Text>
          </TouchableOpacity>
        )}
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
  },
  heading: {
    ...fonts.bold,
    fontSize: fonts.sizes.xxl,
    marginBottom: spacing.md,
  },
  image: {
    width: '100%',
    aspectRatio: 3 / 3,
    borderRadius: 12,
    marginBottom: spacing.md,
  },
  description: {
    ...fonts.regular,
    fontSize: fonts.sizes.md,
    lineHeight: 24,
    marginBottom: spacing.md,
  },
  info: {
    ...fonts.medium,
    fontSize: fonts.sizes.sm,
    marginTop: spacing.xs,
  },
  resumeButton: {
    marginTop: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 12,
    alignItems: 'center',
  },
  resumeButtonText: {
    ...fonts.semibold,
    fontSize: fonts.sizes.md,
    color: '#ffffff',
  },
});

export default AboutSection;
