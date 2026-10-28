import React from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView } from 'react-native';
import { FilterStatus } from '../types/task';
import { Colors, Spacing } from '../theme';

interface FilterOption {
  key: FilterStatus;
  label: string;
  count: number;
}

interface FilterBarProps {
  currentFilter: FilterStatus;
  onSelectFilter: (filter: FilterStatus) => void;
  counts: {
    all: number;
    active: number;
    completed: number;
    overdue: number;
  };
}

export const FilterBar: React.FC<FilterBarProps> = ({
  currentFilter,
  onSelectFilter,
  counts,
}) => {
  const options: FilterOption[] = [
    { key: 'ALL', label: 'Tất cả', count: counts.all },
    { key: 'ACTIVE', label: 'Chưa xong', count: counts.active },
    { key: 'COMPLETED', label: 'Đã xong', count: counts.completed },
    { key: 'OVERDUE', label: 'Quá hạn', count: counts.overdue },
  ];

  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        {options.map((opt) => {
          const isActive = currentFilter === opt.key;
          const isOverdueTab = opt.key === 'OVERDUE';

          return (
            <Pressable
              key={opt.key}
              onPress={() => onSelectFilter(opt.key)}
              style={({ pressed }) => [
                styles.tab,
                isActive && (isOverdueTab ? styles.tabActiveOverdue : styles.tabActive),
                pressed && styles.tabPressed,
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  isActive && styles.tabTextActive,
                ]}
              >
                {opt.label}
              </Text>
              <View
                style={[
                  styles.countBadge,
                  isActive && (isOverdueTab ? styles.countBadgeOverdueActive : styles.countBadgeActive),
                ]}
              >
                <Text
                  style={[
                    styles.countText,
                    isActive && styles.countTextActive,
                  ]}
                >
                  {opt.count}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: Spacing.xs,
  },
  container: {
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceSubtle,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  tabActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  tabActiveOverdue: {
    backgroundColor: Colors.error,
    borderColor: Colors.error,
  },
  tabPressed: {
    opacity: 0.75,
    transform: [{ scale: 0.98 }],
  },
  tabText: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textSecondary,
    marginRight: 6,
  },
  tabTextActive: {
    color: Colors.textInverse,
    fontWeight: '700',
  },
  countBadge: {
    backgroundColor: Colors.border,
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 10,
    minWidth: 18,
    alignItems: 'center',
  },
  countBadgeActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
  },
  countBadgeOverdueActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  countText: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  countTextActive: {
    color: Colors.textInverse,
  },
});
