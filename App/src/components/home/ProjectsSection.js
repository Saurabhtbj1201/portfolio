import React, { useContext, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Linking } from 'react-native';
import Card from '../common/Card';
import { ThemeContext } from '../../context/ThemeContext';
import { spacing } from '../../theme/spacing';
import { fonts } from '../../theme/fonts';

const ProjectsSection = ({ projects }) => {
  const { theme } = useContext(ThemeContext);
  const [showAll, setShowAll] = useState(false);
  
  if (!projects || projects.length === 0) return null;

  const displayProjects = showAll ? projects : projects.slice(0, 3);

  return (
    <View style={styles.container}>
      <Text style={[styles.heading, { color: theme.text }]}>Projects</Text>
      {displayProjects.map((project) => (
        <Card key={project._id}>
          {project.image && (
            <Image source={{ uri: project.image }} style={styles.image} />
          )}
          <Text style={[styles.title, { color: theme.text }]}>{project.title}</Text>
          <Text style={[styles.description, { color: theme.textSecondary }]}>
            {project.description}
          </Text>
          
          {project.technologies && project.technologies.length > 0 && (
            <View style={styles.techContainer}>
              {project.technologies.map((tech, idx) => (
                <View key={idx} style={[styles.techBadge, { backgroundColor: theme.primary + '20' }]}>
                  <Text style={[styles.techText, { color: theme.primary }]}>{tech}</Text>
                </View>
              ))}
            </View>
          )}

          {(project.link || project.github) && (
            <View style={styles.linksContainer}>
              {project.link && (
                <TouchableOpacity
                  style={[styles.linkButton, { backgroundColor: theme.primary }]}
                  onPress={() => Linking.openURL(project.link)}
                >
                  <Text style={styles.linkText}>🌐 Live Demo</Text>
                </TouchableOpacity>
              )}
              {project.github && (
                <TouchableOpacity
                  style={[styles.linkButton, { backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border }]}
                  onPress={() => Linking.openURL(project.github)}
                >
                  <Text style={[styles.linkText, { color: theme.text }]}>💻 GitHub</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </Card>
      ))}
      
      {projects.length > 3 && (
        <TouchableOpacity
          style={[styles.showMoreButton, { backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border }]}
          onPress={() => setShowAll(!showAll)}
        >
          <Text style={[styles.showMoreText, { color: theme.primary }]}>
            {showAll ? '▲ Show Less' : `▼ Show All (${projects.length - 3} more)`}
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
  image: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: spacing.md,
  },
  title: {
    ...fonts.semibold,
    fontSize: fonts.sizes.lg,
    marginBottom: spacing.xs,
  },
  description: {
    ...fonts.regular,
    fontSize: fonts.sizes.sm,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  techContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.md,
  },
  techBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 6,
    marginRight: spacing.xs,
    marginBottom: spacing.xs,
  },
  techText: {
    ...fonts.medium,
    fontSize: fonts.sizes.xs,
  },
  linksContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  linkButton: {
    flex: 1,
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

export default ProjectsSection;
