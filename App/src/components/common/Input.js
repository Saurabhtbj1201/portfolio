import React from 'react';
import { View, TextInput, Text, StyleSheet } from 'react-native';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { fonts } from '../../theme/fonts';

const Input = ({ label, error, style, ...props }) => {
  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <TextInput
        style={[styles.input, error && styles.inputError]}
        placeholderTextColor={colors.textSecondary}
        {...props}
      />
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  label: {
    ...fonts.medium,
    fontSize: fonts.sizes.sm,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  input: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    color: colors.text,
    fontSize: fonts.sizes.md,
  },
  inputError: {
    borderColor: colors.error,
  },
  errorText: {
    ...fonts.regular,
    fontSize: fonts.sizes.xs,
    color: colors.error,
    marginTop: spacing.xs,
  },
});

export default Input;
