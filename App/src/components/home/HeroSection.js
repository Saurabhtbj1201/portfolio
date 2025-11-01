import React, { useContext } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { ThemeContext } from '../../context/ThemeContext';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { fonts } from '../../theme/fonts';
import { LinearGradient } from 'expo-linear-gradient';

const HeroSection = ({ profile }) => {
  const { theme } = useContext(ThemeContext);
  
  if (!profile) return null;

  return (
    <LinearGradient
      colors={[theme.primary, theme.secondary]}
      style={styles.container}
    >
      {profile.profileImage && (
        <Image source={{ uri: profile.profileImage }} style={styles.image} />
      )}
      <Text style={styles.title}>{profile.title}</Text>
      <View style={styles.tagsContainer}>
        {profile.tags?.map((tag, index) => (
          <View key={index} style={styles.tag}>
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        ))}
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  image: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: spacing.md,
    borderWidth: 4,
    borderColor: colors.white,
  },
  title: {
    ...fonts.bold,
    fontSize: fonts.sizes.xxxl,
    color: colors.white,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  tag: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    margin: spacing.xs,
  },
  tagText: {
    ...fonts.medium,
    fontSize: fonts.sizes.sm,
    color: colors.white,
  },
});

export default HeroSection;
