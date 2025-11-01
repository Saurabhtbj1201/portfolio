import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Linking } from 'react-native';
import Card from '../common/Card';
import { ThemeContext } from '../../context/ThemeContext';
import { spacing } from '../../theme/spacing';
import { fonts } from '../../theme/fonts';

const AwardsSection = ({ awards }) => {
  const { theme } = useContext(ThemeContext);
  const [showAll, setShowAll] = useState(false);
  
  if (!awards || awards.length === 0) return null;

  const displayAwards = showAll ? awards : awards.slice(0, 4);

  return (
    <View style={styles.container}>
      <Text style={[styles.heading, { color: theme.text }]}>Awards & Achievements</Text>
      {displayAwards.map((award) => (
        <Card key={award._id}>
          <View style={styles.header}>
            {award.image && (
              <Image 
                source={{ uri: award.image }} 
                style={styles.logo}
                resizeMode="cover"
              />
            )}
            <View style={styles.headerText}>
              <Text style={[styles.title, { color: theme.text }]}>🏆 {award.title}</Text>
              <Text style={[styles.issuer, { color: theme.primary }]}>{award.issuer}</Text>
            </View>
          </View>
          
          {award.date && (
            <Text style={[styles.date, { color: theme.textSecondary }]}>
              📅 {award.date}
            </Text>
          )}
          
          {award.description && (
            <Text style={[styles.description, { color: theme.textSecondary }]}>
              {award.description}
            </Text>
          )}
          
          {award.certificateUrl && (
            <TouchableOpacity
              style={[styles.linkButton, { backgroundColor: theme.primary }]}
              onPress={() => Linking.openURL(award.certificateUrl)}
            >
              <Text style={styles.linkText}>🔗 View Certificate</Text>
            </TouchableOpacity>
          )}
        </Card>
      ))}

      {awards.length > 4 && (
        <TouchableOpacity
          style={[styles.showMoreButton, { backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border }]}
          onPress={() => setShowAll(!showAll)}
        >
          <Text style={[styles.showMoreText, { color: theme.primary }]}>
            {showAll ? '▲ Show Less' : `▼ Show All (${awards.length - 4} more)`}
          </Text>
        </TouchableOpacity>
      )}
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
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: spacing.md,
    backgroundColor: '#e5e7eb',
  },
  headerText: {
    flex: 1,
  },
  title: {
    ...fonts.semibold,
    fontSize: fonts.sizes.md,
  },
  issuer: {
    ...fonts.medium,
    fontSize: fonts.sizes.sm,
    marginTop: spacing.xs,
  },
  date: {
    ...fonts.regular,
    fontSize: fonts.sizes.sm,
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  description: {
    ...fonts.regular,
    fontSize: fonts.sizes.sm,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  linkButton: {
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
  },
  linkText: {
    ...fonts.medium,
    fontSize: fonts.sizes.sm,
    color: '#ffffff',
  },
  showMoreButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: spacing.sm,
  },
  showMoreText: {
    ...fonts.semibold,
    fontSize: fonts.sizes.md,
  },
});

export default AwardsSection;
