import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Colors, Spacing } from '../theme';
import { useTasks } from '../context/TaskContext';

interface TabMeta {
  label: string;
  icon: string;
}

const TAB_META: Record<string, TabMeta> = {
  TasksTab: { label: 'Công việc', icon: '📋' },
  OverdueTab: { label: 'Quá hạn', icon: '⏰' },
  AddPlaceholder: { label: 'Thêm', icon: '➕' },
  StatsTab: { label: 'Thống kê', icon: '📊' },
  SettingsTab: { label: 'Cài đặt', icon: '⚙️' },
};

export const CustomTabBar: React.FC<BottomTabBarProps> = ({
  state,
  descriptors,
  navigation,
}) => {
  const insets = useSafeAreaInsets();
  const { stats } = useTasks();

  return (
    <View
      style={[
        styles.container,
        {
          paddingBottom: Math.max(insets.bottom, 8),
          height: 60 + Math.max(insets.bottom, 8),
        },
      ]}
    >
      <View style={styles.tabBarInner}>
        {state.routes.map((route, index) => {
          const isCenter = route.name === 'AddPlaceholder';
          const meta = TAB_META[route.name] || { label: route.name, icon: '📌' };

          if (isCenter) {
            return (
              <View key={route.key} style={styles.centerButtonWrapper}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Thêm công việc mới"
                  onPress={() => {
                    // Navigate to the Root Stack TaskForm screen
                    navigation.navigate('TaskForm' as never);
                  }}
                  style={({ pressed }) => [
                    styles.centerButton,
                    pressed && styles.centerButtonPressed,
                  ]}
                >
                  <Text style={styles.centerButtonIcon}>＋</Text>
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
                <Text
                  style={[
                    styles.tabIcon,
                    isFocused && styles.tabIconActive,
                  ]}
                >
                  {meta.icon}
                </Text>

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
    shadowOpacity: 0.06,
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
    height: 24,
  },
  tabIcon: {
    fontSize: 20,
    opacity: 0.65,
  },
  tabIconActive: {
    opacity: 1,
    transform: [{ scale: 1.08 }],
  },
  tabLabel: {
    fontSize: 11,
    marginTop: 2,
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
    width: 14,
    height: 3,
    borderRadius: 2,
    backgroundColor: Colors.primary,
  },
  centerButtonWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -16,
  },
  centerButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 5,
    elevation: 7,
    borderWidth: 3,
    borderColor: Colors.card,
  },
  centerButtonPressed: {
    transform: [{ scale: 0.92 }],
    backgroundColor: Colors.primaryDark,
  },
  centerButtonIcon: {
    fontSize: 24,
    fontWeight: 'bold',
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
