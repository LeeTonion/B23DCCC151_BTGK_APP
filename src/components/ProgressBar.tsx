import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors, Typography, CommonStyles, Spacing } from '../theme';

interface ProgressBarProps {
  completed: number;
  total: number;
  percentage: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  completed,
  total,
  percentage,
}) => {
  const safePercentage = Math.min(Math.max(percentage, 0), 100);

  return (
    <View style={[CommonStyles.cardShadow, styles.container]}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>Tiến độ kế hoạch</Text>
          <Text style={styles.subtitle}>
            Đã hoàn thành <Text style={styles.highlight}>{completed}/{total}</Text> công việc
          </Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{safePercentage}%</Text>
        </View>
      </View>

      {/* Progress Track and Bar built with pure Views */}
      <View style={styles.track}>
        <View
          style={[
            styles.fill,
            {
              width: `${safePercentage}%`,
              backgroundColor: safePercentage === 100 ? Colors.success : Colors.primary,
            },
          ]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: Spacing.lg,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  title: {
    ...Typography.headingSmall,
    color: Colors.textPrimary,
    marginBottom: 2,
  },
  subtitle: {
    ...Typography.bodySmall,
    color: Colors.textSecondary,
  },
  highlight: {
    fontWeight: '700',
    color: Colors.primary,
  },
  badge: {
    backgroundColor: Colors.primaryLight,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
  track: {
    height: 10,
    width: '100%',
    backgroundColor: Colors.progressBackground,
    borderRadius: 5,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 5,
  },
});
