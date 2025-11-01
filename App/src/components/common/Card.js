import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';

const Card = ({ children, style, onPress }) => {
  const Container = onPress ? TouchableOpacity : View;
  
  return (
    <Container
      style={[styles.card, style]}
      onPress={onPress}
      activeOpacity={onPress ? 0.8 : 1}
    >
      {children}
    </Container>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.md,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
});

export default Card;
