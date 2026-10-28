import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Colors, Spacing } from '../theme';
import { useTasks } from '../context/TaskContext';

interface TabMeta {
  label: string;
}

const TAB_META: Record<string, TabMeta> = {
  TasksTab: { label: 'Công việc' },
  OverdueTab: { label: 'Quá hạn' },
  AddPlaceholder: { label: 'Thêm' },
  StatsTab: { label: 'Thống kê' },
  SettingsTab: { label: 'Cài đặt' },
};

export const CustomTabBar: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const insets = useSafeAreaInsets();
  const { stats } = useTasks();

  const renderTabIcon = (name: string, isFocused: boolean) => {
    const color = isFocused ? Colors.primary : Colors.textMuted;

    switch (name) {
      case 'TasksTab':
        return (
          <View style={styles.iconTasks}>
            <View style={[styles.taskLine, { backgroundColor: color, width: 14 }]} />
            <View style={[styles.taskLine, { backgroundColor: color, width: 18 }]} />
            <View style={[styles.taskLine, { backgroundColor: color, width: 12 }]} />
          </View>
        );

      case 'OverdueTab':
        return (
          <View style={[styles.iconOverdueCircle, { borderColor: color }]}>
            <Text style={[styles.iconOverdueText, { color }]}>!</Text>
          </View>
        );

      case 'StatsTab':
        return (
          <View style={styles.iconStats}>
            <View style={[styles.statBar, { height: 7, backgroundColor: color }]} />
            <View style={[styles.statBar, { height: 16, backgroundColor: color }]} />
            <View style={[styles.statBar, { height: 11, backgroundColor: color }]} />
          </View>
        );

      case 'SettingsTab':
        return <Text style={[styles.iconGear, { color }]}>⚙</Text>;

      default:
        return <Text style={[styles.iconGear, { color }]}>•</Text>;
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          paddingBottom: Math.max(insets.bottom, 8),
          height: 58 + Math.max(insets.bottom, 8),
        },
      ]}
    >
      <View style={styles.tabBarInner}>
        {state.routes.map((route, index) => {
          const isCenter = route.name === 'AddPlaceholder';
          const meta = TAB_META[route.name] || { label: route.name };

          if (isCenter) {
            return (
              <View key={route.key} style={styles.centerButtonWrapper}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Thêm công việc mới"
                  onPress={() => {
                    navigation.navigate('TaskForm' as never);
                  }}
                  style={({ pressed }) => [
                    styles.centerButton,
                    pressed && styles.centerButtonPressed,
                  ]}
                >
                  <Text style={styles.centerButtonIcon}>+</Text>
                </Pressable>
                <Text style={styles.centerButtonLabel}>Thêm</Text>
              </View>
            );
          }

          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          return (
            <Pressable
              key={route.key}
              accessibilityRole="tab"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={meta.label}
              testID={descriptors[route.key].options.tabBarButtonTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              style={({ pressed }) => [
                styles.tabItem,
                pressed && styles.tabItemPressed,
              ]}
            >
              <View style={styles.iconContainer}>
                {renderTabIcon(route.name, isFocused)}

                {/* Overdue Badge if overdue > 0 */}
                {route.name === 'OverdueTab' && stats.overdue > 0 && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>
                      {stats.overdue > 9 ? '9+' : stats.overdue}
                    </Text>
                  </View>
                )}
              </View>

              <Text
                style={[
                  styles.tabLabel,
                  isFocused ? styles.tabLabelActive : styles.tabLabelInactive,
                ]}
              >
                {meta.label}
              </Text>

              {isFocused && <View style={styles.activeIndicator} />}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.card,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 8,
  },
  tabBarInner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: Spacing.sm,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    position: 'relative',
  },
  tabItemPressed: {
    opacity: 0.7,
  },
  iconContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    height: 22,
  },
  // Minimalist Tasks Icon (3 clean horizontal lines)
  iconTasks: {
    width: 18,
    height: 14,
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  taskLine: {
    height: 2,
    borderRadius: 1,
  },
  // Minimalist Overdue Icon (thin circle with exclamation mark)
  iconOverdueCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconOverdueText: {
    fontSize: 11,
    fontWeight: '800',
    marginTop: -1,
  },
  // Minimalist Stats Icon (3 vertical bars)
  iconStats: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 16,
    gap: 3,
  },
  statBar: {
    width: 3.5,
    borderRadius: 1,
  },
  // Minimalist Settings Icon
  iconGear: {
    fontSize: 17,
  },
  tabLabel: {
    fontSize: 10,
    marginTop: 3,
    fontWeight: '500',
  },
  tabLabelActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  tabLabelInactive: {
    color: Colors.textMuted,
  },
  activeIndicator: {
    position: 'absolute',
    bottom: -2,
    width: 12,
    height: 2.5,
    borderRadius: 1.5,
    backgroundColor: Colors.primary,
  },
  centerButtonWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -16,
  },
  centerButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
    borderWidth: 2.5,
    borderColor: Colors.card,
  },
  centerButtonPressed: {
    transform: [{ scale: 0.92 }],
    backgroundColor: Colors.primaryDark,
  },
  centerButtonIcon: {
    fontSize: 22,
    fontWeight: '600',
    color: Colors.textInverse,
    marginTop: -2,
  },
  centerButtonLabel: {
    fontSize: 10,
    color: Colors.primary,
    fontWeight: '700',
    marginTop: 2,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: Colors.error,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    paddingHorizontal: 3,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.card,
  },
  badgeText: {
    color: Colors.textInverse,
    fontSize: 9,
    fontWeight: '800',
  },
});
