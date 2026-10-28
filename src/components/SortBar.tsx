import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { SortOption } from '../types/task';
import { Colors, Spacing } from '../theme';

interface SortBarProps {
  currentSort: SortOption;
  onToggleSort: (sort: SortOption) => void;
}

export const SortBar: React.FC<SortBarProps> = ({ currentSort, onToggleSort }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Sắp xếp:</Text>
      <View style={styles.buttonGroup}>
        <Pressable
          onPress={() => onToggleSort('DUE_DATE')}
          style={({ pressed }) => [
            styles.sortBtn,
            currentSort === 'DUE_DATE' && styles.sortBtnActive,
            pressed && styles.btnPressed,
          ]}
        >
          <Text
            style={[
              styles.btnText,
              currentSort === 'DUE_DATE' && styles.btnTextActive,
            ]}
          >
            📅 Hạn gần nhất
          </Text>
        </Pressable>

        <Pressable
          onPress={() => onToggleSort('PRIORITY')}
          style={({ pressed }) => [
            styles.sortBtn,
            currentSort === 'PRIORITY' && styles.sortBtnActive,
            pressed && styles.btnPressed,
          ]}
        >
          <Text
            style={[
              styles.btnText,
              currentSort === 'PRIORITY' && styles.btnTextActive,
            ]}
          >
            ⚡ Ưu tiên (Cao → Thấp)
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xs,
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginRight: Spacing.sm,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: Spacing.xs,
    flex: 1,
    justifyContent: 'flex-end',
  },
  sortBtn: {
    paddingVertical: 5,
    paddingHorizontal: Spacing.sm + 2,
    borderRadius: 8,
    backgroundColor: Colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sortBtnActive: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
  },
  btnPressed: {
    opacity: 0.7,
  },
  btnText: {
    fontSize: 11,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  btnTextActive: {
    color: Colors.primaryDark,
    fontWeight: '700',
  },
});
