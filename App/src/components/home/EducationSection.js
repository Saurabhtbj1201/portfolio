import React, { useContext } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import Card from '../common/Card';
import { ThemeContext } from '../../context/ThemeContext';
import { spacing } from '../../theme/spacing';
import { fonts } from '../../theme/fonts';

const EducationSection = ({ education }) => {
  const { theme } = useContext(ThemeContext);
  
  if (!education || education.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={[styles.heading, { color: theme.text }]}>Education</Text>
      {education.map((edu) => (
        <Card key={edu._id}>
          {edu.image && (
            <Image 
              source={{ uri: edu.image }} 
              style={styles.image}
              resizeMode="cover"
            />
          )}
          <Text style={[styles.degree, { color: theme.text }]}>{edu.degree}</Text>
          <Text style={[styles.institution, { color: theme.primary }]}>
            {edu.institution}
          </Text>
          {edu.field && (
            <Text style={[styles.field, { color: theme.textSecondary }]}>
              {edu.field}
            </Text>
          )}
          {edu.duration && (
            <Text style={[styles.duration, { color: theme.textSecondary }]}>
              📅 {edu.duration}
            </Text>
          )}
          {edu.grade && (
            <Text style={[styles.grade, { color: theme.success }]}>
              ⭐ Grade: {edu.grade}
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
  image: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    marginBottom: spacing.md,
    backgroundColor: '#e5e7eb',
  },
  degree: {
    ...fonts.semibold,
    fontSize: fonts.sizes.md,
  },
  institution: {
    ...fonts.medium,
    fontSize: fonts.sizes.md,
    marginTop: spacing.xs,
  },
  field: {
    ...fonts.regular,
    fontSize: fonts.sizes.sm,
    marginTop: spacing.xs,
  },
  duration: {
    ...fonts.regular,
    fontSize: fonts.sizes.sm,
    marginTop: spacing.xs,
  },
  grade: {
    ...fonts.medium,
    fontSize: fonts.sizes.sm,
    marginTop: spacing.sm,
  },
});

export default EducationSection;
