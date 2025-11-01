import React, { useContext } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import Card from '../common/Card';
import { ThemeContext } from '../../context/ThemeContext';
import { spacing } from '../../theme/spacing';
import { fonts } from '../../theme/fonts';

const ArticlesSection = ({ articles }) => {
  const { theme } = useContext(ThemeContext);
  
  if (!articles || articles.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={[styles.heading, { color: theme.text }]}>Articles</Text>
      {articles.map((article) => (
        <Card key={article._id}>
          {article.image && (
            <Image source={{ uri: article.image }} style={styles.image} />
          )}
          <Text style={[styles.title, { color: theme.text }]}>📝 {article.title}</Text>
          {article.summary && (
            <Text style={[styles.summary, { color: theme.textSecondary }]}>
              {article.summary}
            </Text>
          )}
          {article.tags && article.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {article.tags.map((tag, idx) => (
                <View key={idx} style={[styles.tag, { backgroundColor: theme.accent + '20' }]}>
                  <Text style={[styles.tagText, { color: theme.accent }]}>#{tag}</Text>
                </View>
              ))}
            </View>
          )}
          {article.createdAt && (
            <Text style={[styles.date, { color: theme.textSecondary }]}>
              📅 {new Date(article.createdAt).toLocaleDateString()}
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
    height: 200,
    borderRadius: 12,
    marginBottom: spacing.md,
  },
  title: {
    ...fonts.semibold,
    fontSize: fonts.sizes.md,
    marginBottom: spacing.sm,
  },
  summary: {
    ...fonts.regular,
    fontSize: fonts.sizes.sm,
    lineHeight: 20,
    marginBottom: spacing.md,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: spacing.sm,
  },
  tag: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 6,
    marginRight: spacing.xs,
    marginBottom: spacing.xs,
  },
  tagText: {
    ...fonts.medium,
    fontSize: fonts.sizes.xs,
  },
  date: {
    ...fonts.regular,
    fontSize: fonts.sizes.xs,
  },
});

export default ArticlesSection;
