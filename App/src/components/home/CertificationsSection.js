import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Image } from 'react-native';
import Card from '../common/Card';
import { ThemeContext } from '../../context/ThemeContext';
import { spacing } from '../../theme/spacing';
import { fonts } from '../../theme/fonts';

const CertificationsSection = ({ certifications }) => {
  const { theme } = useContext(ThemeContext);
  const [showAll, setShowAll] = useState(false);
  
  if (!certifications || certifications.length === 0) return null;

  const displayCertifications = showAll ? certifications : certifications.slice(0, 5);

  return (
    <View style={styles.container}>
      <Text style={[styles.heading, { color: theme.text }]}>Certifications</Text>
      {displayCertifications.map((cert) => (
        <Card key={cert._id}>
          <View style={styles.header}>
            {cert.image && (
              <Image 
                source={{ uri: cert.image }} 
                style={styles.logo}
                resizeMode="cover"
              />
            )}
            <View style={styles.headerText}>
              <Text style={[styles.name, { color: theme.text }]}>{cert.name}</Text>
              <Text style={[styles.issuer, { color: theme.primary }]}>{cert.issuer}</Text>
            </View>
          </View>
          
          {cert.description && (
            <Text style={[styles.description, { color: theme.textSecondary }]}>
              {cert.description}
            </Text>
          )}
          
          <View style={styles.infoRow}>
            {cert.date && (
              <Text style={[styles.date, { color: theme.textSecondary }]}>
                📅 {cert.date}
              </Text>
            )}
            {cert.credentialId && (
              <Text style={[styles.credentialId, { color: theme.textSecondary }]}>
                ID: {cert.credentialId}
              </Text>
            )}
          </View>
          
          {cert.url && (
            <TouchableOpacity
              style={[styles.linkButton, { backgroundColor: theme.primary }]}
              onPress={() => Linking.openURL(cert.url)}
            >
              <Text style={styles.linkText}>🔗 View Certificate</Text>
            </TouchableOpacity>
          )}
        </Card>
      ))}

      {certifications.length > 5 && (
        <TouchableOpacity
          style={[styles.showMoreButton, { backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border }]}
          onPress={() => setShowAll(!showAll)}
        >
          <Text style={[styles.showMoreText, { color: theme.primary }]}>
            {showAll ? '▲ Show Less' : `▼ Show All (${certifications.length - 5} more)`}
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
  name: {
    ...fonts.semibold,
    fontSize: fonts.sizes.md,
  },
  issuer: {
    ...fonts.medium,
    fontSize: fonts.sizes.sm,
    marginTop: spacing.xs,
  },
  description: {
    ...fonts.regular,
    fontSize: fonts.sizes.sm,
    lineHeight: 20,
    marginTop: spacing.sm,
    marginBottom: spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.sm,
  },
  date: {
    ...fonts.regular,
    fontSize: fonts.sizes.sm,
    marginRight: spacing.md,
  },
  credentialId: {
    ...fonts.regular,
    fontSize: fonts.sizes.xs,
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

export default CertificationsSection;
