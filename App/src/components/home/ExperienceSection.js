import React, { useContext } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import Card from '../common/Card';
import { ThemeContext } from '../../context/ThemeContext';
import { spacing } from '../../theme/spacing';
import { fonts } from '../../theme/fonts';

const ExperienceSection = ({ experiences }) => {
  const { theme } = useContext(ThemeContext);
  
  if (!experiences || experiences.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={[styles.heading, { color: theme.text }]}>Experience</Text>
      {experiences.map((exp) => (
        <Card key={exp._id}>
          <View style={styles.header}>
            {exp.logo && (
              <Image source={{ uri: exp.logo }} style={styles.logo} />
            )}
            <View style={styles.headerText}>
              <Text style={[styles.position, { color: theme.text }]}>{exp.position}</Text>
              <Text style={[styles.company, { color: theme.primary }]}>{exp.company}</Text>
            </View>
          </View>
          
          <Text style={[styles.duration, { color: theme.textSecondary }]}>
            📅 {exp.duration}
          </Text>
          {exp.location && (
            <Text style={[styles.location, { color: theme.textSecondary }]}>
              📍 {exp.location}
            </Text>
          )}
          {exp.description && (
            <Text style={[styles.description, { color: theme.text }]}>
              {exp.description}
            </Text>
          )}
        </Card>
      ))}
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  logo: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: spacing.md,
  },
  headerText: {
    flex: 1,
  },
  position: {
    ...fonts.semibold,
    fontSize: fonts.sizes.md,
  },
  company: {
    ...fonts.medium,
    fontSize: fonts.sizes.md,
    marginTop: spacing.xs,
  },
  duration: {
    ...fonts.regular,
    fontSize: fonts.sizes.sm,
    marginTop: spacing.xs,
  },
  location: {
    ...fonts.regular,
    fontSize: fonts.sizes.sm,
    marginTop: spacing.xs,
  },
  description: {
    ...fonts.regular,
    fontSize: fonts.sizes.sm,
    marginTop: spacing.sm,
    lineHeight: 20,
  },
});

export default ExperienceSection;
