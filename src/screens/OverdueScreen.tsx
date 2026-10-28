import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTasks } from '../context/TaskContext';
import { Task, RootStackParamList } from '../types/task';
import { TaskCard } from '../components/TaskCard';
import { EmptyState } from '../components/EmptyState';
import { Colors, Spacing, Typography } from '../theme';
import { isTaskOverdue, parseDate } from '../utils/dateUtils';

type OverdueScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface OverdueScreenProps {
  navigation: OverdueScreenNavigationProp;
}

type TabType = 'OVERDUE' | 'UPCOMING';

export const OverdueScreen: React.FC<OverdueScreenProps> = ({ navigation }) => {
  const { tasks, deleteTask, toggleTaskDone, stats } = useTasks();
  const [activeTab, setActiveTab] = useState<TabType>('OVERDUE');

  // Compute overdue vs upcoming tasks
  const { overdueTasks, upcomingTasks } = useMemo(() => {
    const overdue: Task[] = [];
    const upcoming: Task[] = [];

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const threeDaysLater = today + 3 * 24 * 60 * 60 * 1000;

    tasks.forEach((t) => {
      if (t.done) return; // Completed tasks are excluded from urgency list

      const isOver = isTaskOverdue(t.dueDate, t.done);
      if (isOver) {
        overdue.push(t);
      } else {
        const d = parseDate(t.dueDate);
        if (d) {
          const taskTime = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
          if (taskTime <= threeDaysLater) {
            upcoming.push(t);
          }
        }
      }
    });

    // Sort overdue: most overdue first
    overdue.sort((a, b) => {
      const timeA = parseDate(a.dueDate)?.getTime() || 0;
      const timeB = parseDate(b.dueDate)?.getTime() || 0;
      return timeA - timeB;
    });

    // Sort upcoming: closest deadline first
    upcoming.sort((a, b) => {
      const timeA = parseDate(a.dueDate)?.getTime() || 0;
      const timeB = parseDate(b.dueDate)?.getTime() || 0;
      return timeA - timeB;
    });

    return { overdueTasks: overdue, upcomingTasks: upcoming };
  }, [tasks]);

  const displayedTasks = activeTab === 'OVERDUE' ? overdueTasks : upcomingTasks;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" />

      {/* Screen Header */}
      <View style={styles.header}>
        <Text style={styles.headerSub}>THEO DÕI TIẾN ĐỘ</Text>
        <Text style={styles.headerTitle}>Hạn Chót & Cảnh Báo</Text>
      </View>

      {/* Dynamic Alert Banner */}
      {overdueTasks.length > 0 ? (
        <View style={styles.alertBannerWarning}>
          <Text style={styles.alertIcon}>⚠️</Text>
          <View style={styles.alertTextWrapper}>
            <Text style={styles.alertTitle}>
              Có {overdueTasks.length} công việc đã quá hạn!
            </Text>
            <Text style={styles.alertMessage}>
              Vui lòng ưu tiên hoàn thành hoặc cập nhật lại hạn chót.
            </Text>
          </View>
        </View>
      ) : (
        <View style={styles.alertBannerSuccess}>
          <Text style={styles.alertIcon}>🎉</Text>
          <View style={styles.alertTextWrapper}>
            <Text style={styles.alertSuccessTitle}>Không có công việc quá hạn</Text>
            <Text style={styles.alertSuccessMessage}>
              Mọi kế hoạch của bạn đều đang được thực hiện đúng thời hạn!
            </Text>
          </View>
        </View>
      )}

      {/* Segmented Switcher */}
      <View style={styles.segmentContainer}>
        <Pressable
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === 'OVERDUE' }}
          onPress={() => setActiveTab('OVERDUE')}
          style={[
            styles.segmentButton,
            activeTab === 'OVERDUE' && styles.segmentButtonActiveOverdue,
          ]}
        >
          <Text
            style={[
              styles.segmentText,
              activeTab === 'OVERDUE' && styles.segmentTextActiveOverdue,
            ]}
          >
            🚨 Đã quá hạn ({overdueTasks.length})
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="tab"
          accessibilityState={{ selected: activeTab === 'UPCOMING' }}
          onPress={() => setActiveTab('UPCOMING')}
          style={[
            styles.segmentButton,
            activeTab === 'UPCOMING' && styles.segmentButtonActiveUpcoming,
          ]}
        >
          <Text
            style={[
              styles.segmentText,
              activeTab === 'UPCOMING' && styles.segmentTextActiveUpcoming,
            ]}
          >
            ⏰ Sắp tới hạn ({upcomingTasks.length})
          </Text>
        </Pressable>
      </View>

      {/* Task List */}
      <FlatList
        data={displayedTasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TaskCard
            task={item}
            onPress={(task) => navigation.navigate('Detail', { taskId: task.id })}
            onToggleDone={toggleTaskDone}
            onDelete={(taskId) => deleteTask(taskId)}
          />
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <EmptyState
            title={
              activeTab === 'OVERDUE'
                ? 'Không có công việc quá hạn'
                : 'Không có công việc sắp tới hạn'
            }
            message={
              activeTab === 'OVERDUE'
                ? 'Tuyệt vời! Bạn đang duy trì tiến độ hoàn hảo, không có bất kỳ việc nào trễ hạn.'
                : 'Trong 3 ngày tới không có kế hoạch nào cận kề hạn chót. Bạn có thể thư giãn hoặc lập thêm kế hoạch mới!'
            }
            icon={activeTab === 'OVERDUE' ? '✨' : '📅'}
          />
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xs,
  },
  headerSub: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.error,
    letterSpacing: 1.2,
    marginBottom: 2,
  },
  headerTitle: {
    ...Typography.headingLarge,
    color: Colors.textPrimary,
  },
  alertBannerWarning: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.errorLight,
    borderWidth: 1.5,
    borderColor: Colors.errorBorder,
    borderRadius: 12,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.xs,
    marginBottom: Spacing.sm,
    padding: Spacing.md,
  },
  alertBannerSuccess: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.successLight,
    borderWidth: 1.5,
    borderColor: Colors.successBorder,
    borderRadius: 12,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.xs,
    marginBottom: Spacing.sm,
    padding: Spacing.md,
  },
  alertIcon: {
    fontSize: 24,
    marginRight: Spacing.md,
  },
  alertTextWrapper: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.error,
  },
  alertMessage: {
    fontSize: 12,
    color: Colors.errorDark,
    marginTop: 2,
  },
  alertSuccessTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.success,
  },
  alertSuccessMessage: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: 10,
    padding: 4,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  segmentButtonActiveOverdue: {
    backgroundColor: Colors.errorLight,
    borderWidth: 1,
    borderColor: Colors.errorBorder,
  },
  segmentButtonActiveUpcoming: {
    backgroundColor: Colors.warningLight,
    borderWidth: 1,
    borderColor: Colors.warningBorder,
  },
  segmentText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  segmentTextActiveOverdue: {
    color: Colors.error,
    fontWeight: '700',
  },
  segmentTextActiveUpcoming: {
    color: Colors.warningDark,
    fontWeight: '700',
  },
  listContent: {
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.xl,
  },
});
