import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '../../core/theme/colors';
import { typography } from '../../core/theme/typography';
import { spacing, borderRadius } from '../../core/theme/spacing';
import { AppButton } from './AppButton';

interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  title = 'ERROR',
  message,
  onRetry,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.message}>{message}</Text>
      </View>
      {onRetry && (
        <AppButton
          title="RETRY"
          size="sm"
          variant="outline"
          onPress={onRetry}
          style={styles.retryBtn}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: borderRadius.sm,
    padding: spacing.md,
    marginVertical: spacing.sm,
  },
  content: {
    marginBottom: spacing.xs,
  },
  title: {
    ...typography.captionBold,
    color: colors.textPrimary,
    letterSpacing: 1.2,
    marginBottom: spacing.xxs,
  },
  message: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  retryBtn: {
    marginTop: spacing.xs,
    alignSelf: 'flex-start',
  },
});
