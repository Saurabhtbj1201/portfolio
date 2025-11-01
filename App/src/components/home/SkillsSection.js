import React, { useContext, useRef, useEffect } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, Animated } from 'react-native';
import Card from '../common/Card';
import { spacing } from '../../theme/spacing';
import { fonts } from '../../theme/fonts';
import { ThemeContext } from '../../context/ThemeContext';

const SkillsSection = ({ skills }) => {
  const { theme } = useContext(ThemeContext);
  const scrollX = useRef(new Animated.Value(0)).current;

  if (!skills || skills.length === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={[styles.heading, { color: theme.text }]}>Skills</Text>
      {skills.map((category, index) => (
        <Card key={index} style={styles.categoryCard}>
          <Text style={[styles.categoryTitle, { color: theme.primary }]}>
            {category.category || category.name}
          </Text>
          
          <AutoScrollSkills skills={category.skills} theme={theme} />
        </Card>
      ))}
    </View>
  );
};

const AutoScrollSkills = ({ skills, theme }) => {
  const scrollViewRef = useRef(null);
  const scrollX = useRef(0);

  useEffect(() => {
    const interval = setInterval(() => {
      if (scrollViewRef.current && skills && skills.length > 0) {
        scrollX.current += 1;
        scrollViewRef.current.scrollTo({ x: scrollX.current, animated: true });
        
        // Reset scroll when reaching end
        if (scrollX.current > skills.length * 90) {
          scrollX.current = 0;
        }
      }
    }, 30);

    return () => clearInterval(interval);
  }, [skills]);

  return (
    <ScrollView 
      ref={scrollViewRef}
      horizontal 
      showsHorizontalScrollIndicator={false}
      scrollEventThrottle={16}
    >
      <View style={styles.skillsContainer}>
        {skills?.map((skill, idx) => (
          <View key={idx} style={styles.skillItem}>
            {skill.image && (
              <Image source={{ uri: skill.image }} style={styles.skillImage} />
            )}
            <Text style={[styles.skillName, { color: theme.text }]} numberOfLines={2}>
              {skill.name}
            </Text>
          </View>
        ))}
        {/* Duplicate for infinite scroll effect */}
        {skills?.map((skill, idx) => (
          <View key={`duplicate-${idx}`} style={styles.skillItem}>
            {skill.image && (
              <Image source={{ uri: skill.image }} style={styles.skillImage} />
            )}
            <Text style={[styles.skillName, { color: theme.text }]} numberOfLines={2}>
              {skill.name}
            </Text>
          </View>
        ))}
      </View>
    </ScrollView>
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
  categoryCard: {
    marginBottom: spacing.md,
  },
  categoryTitle: {
    ...fonts.semibold,
    fontSize: fonts.sizes.lg,
    marginBottom: spacing.md,
  },
  skillsContainer: {
    flexDirection: 'row',
    paddingRight: spacing.md,
  },
  skillItem: {
    alignItems: 'center',
    marginRight: spacing.md,
    width: 80,
  },
  skillImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
    marginBottom: spacing.sm,
  },
  skillName: {
    ...fonts.regular,
    fontSize: fonts.sizes.xs,
    textAlign: 'center',
  },
});

export default SkillsSection;
