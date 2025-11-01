import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Card from '../common/Card';
import { spacing } from '../../theme/spacing';
import { fonts } from '../../theme/fonts';
import { colors } from '../../theme/colors';

const StatsCard = ({ title, count, color }) => {
  return (
    <Card style={[styles.card, { borderLeftColor: color }]}>
      <Text style={styles.count}>{count}</Text>
      <Text style={styles.title}>{title}</Text>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '48%',
    marginBottom: spacing.md,
    borderLeftWidth: 4,
  },
  count: {
    ...fonts.bold,
    fontSize: fonts.sizes.xxxl,
    color: colors.text,
  },
  title: {
    ...fonts.medium,
    fontSize: fonts.sizes.sm,
    color: colors.textSecondary,
  },
});

export default StatsCard;
