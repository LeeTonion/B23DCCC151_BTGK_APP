import React from 'react';
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTasks } from '../context/TaskContext';
import { RootStackParamList } from '../types/task';
import {
  Colors,
  PriorityColors,
  CategoryColors,
  Spacing,
  Typography,
  CommonStyles,
} from '../theme';
import { isTaskOverdue, getDueStatusInfo } from '../utils/dateUtils';

type DetailScreenProps = NativeStackScreenProps<RootStackParamList, 'Detail'>;

export const DetailScreen: React.FC<DetailScreenProps> = ({
  route,
  navigation,
}) => {
  const { taskId } = route.params;
  const { getTaskById, toggleTaskDone, deleteTask } = useTasks();

  const task = getTaskById(taskId);

  if (!task) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.notFoundContainer}>
          <Text style={styles.notFoundTitle}>Không tìm thấy công việc</Text>
          <Text style={styles.notFoundMessage}>
            Công việc này có thể đã bị xoá hoặc không tồn tại.
          </Text>
          <Pressable
            onPress={() => navigation.goBack()}
            style={styles.btnBack}
          >
            <Text style={styles.btnBackText}>Quay lại danh sách</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const isOverdue = isTaskOverdue(task.dueDate, task.done);
  const priorityTheme = PriorityColors[task.priority];
  const categoryTheme = CategoryColors[task.category];
  const dueStatus = getDueStatusInfo(task.dueDate, task.done);

  const handleDelete = () => {
    Alert.alert(
      'Xoá công việc',
      `Bạn có chắc chắn muốn xoá công việc "${task.title}" không? Hành động này không thể hoàn tác.`,
      [
        { text: 'Huỷ', style: 'cancel' },
        {
          text: 'Xoá',
          style: 'destructive',
          onPress: async () => {
            await deleteTask(task.id);
            navigation.goBack();
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Main Status & Overdue Banner */}
        {isOverdue && (
          <View style={styles.overdueBanner}>
            <Text style={styles.overdueBannerIcon}>⚠️</Text>
            <View style={styles.overdueBannerContent}>
              <Text style={styles.overdueBannerTitle}>CẢNH BÁO: CÔNG VIỆC QUÁ HẠN</Text>
              <Text style={styles.overdueBannerSub}>
                Công việc này đã quá hạn {Math.abs(dueStatus.diffDays)} ngày so với dự kiến.
              </Text>
            </View>
          </View>
        )}

        {/* Card: Title & Done Status */}
        <View style={[CommonStyles.cardShadow, styles.card]}>
          <View style={styles.statusRow}>
            <View
              style={[
                styles.doneBadge,
                task.done ? styles.doneBadgeCompleted : styles.doneBadgeActive,
              ]}
            >
              <Text
                style={[
                  styles.doneBadgeText,
                  task.done ? styles.doneBadgeTextCompleted : styles.doneBadgeTextActive,
                ]}
              >
                {task.done ? '✓ Đã hoàn thành' : '⏳ Chưa hoàn thành'}
              </Text>
            </View>

            {isOverdue && (
              <View style={styles.overdueTag}>
                <Text style={styles.overdueTagText}>Quá hạn</Text>
              </View>
            )}
          </View>

          <Text
            style={[
              styles.taskTitle,
              task.done && styles.taskTitleCompleted,
            ]}
          >
            {task.title}
          </Text>
        </View>

        {/* Card: Meta Details (Category, Priority, Due Date, Days Remaining) */}
        <View style={[CommonStyles.cardShadow, styles.card]}>
          <Text style={styles.sectionHeader}>Thông tin chi tiết</Text>

          {/* Category */}
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Danh mục:</Text>
            <View
              style={[
                styles.categoryChip,
                {
                  backgroundColor: categoryTheme.background,
                  borderColor: categoryTheme.border,
                },
              ]}
            >
              <Text style={[styles.categoryText, { color: categoryTheme.text }]}>
                {task.category}
              </Text>
            </View>
          </View>

          {/* Priority */}
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Mức độ ưu tiên:</Text>
            <View
              style={[
                styles.priorityChip,
                {
                  backgroundColor: priorityTheme.background,
                  borderColor: priorityTheme.border,
                },
              ]}
            >
              <View
                style={[styles.priorityDot, { backgroundColor: priorityTheme.dot }]}
              />
              <Text style={[styles.priorityText, { color: priorityTheme.text }]}>
                {task.priority}
              </Text>
            </View>
          </View>

          {/* Due date & countdown */}
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Hạn hoàn thành:</Text>
            <Text style={styles.dueDateValue}>📅 {task.dueDate}</Text>
          </View>

          {/* Days status */}
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Tình trạng hạn:</Text>
            <View
              style={[
                styles.dueStatusBadge,
                isOverdue
                  ? styles.dueStatusOverdue
                  : dueStatus.diffDays === 0
                  ? styles.dueStatusToday
                  : styles.dueStatusUpcoming,
              ]}
            >
              <Text
                style={[
                  styles.dueStatusText,
                  isOverdue
                    ? styles.dueStatusTextOverdue
                    : dueStatus.diffDays === 0
                    ? styles.dueStatusTextToday
                    : styles.dueStatusTextUpcoming,
                ]}
              >
                {dueStatus.text}
              </Text>
            </View>
          </View>
        </View>

        {/* Card: Note */}
        <View style={[CommonStyles.cardShadow, styles.card]}>
          <Text style={styles.sectionHeader}>Ghi chú</Text>
          <Text style={task.note ? styles.noteContent : styles.noteEmpty}>
            {task.note || 'Không có ghi chú thêm cho công việc này.'}
          </Text>
        </View>

        {/* Action Buttons (Câu 4) */}
        <View style={styles.actionsContainer}>
          {/* Toggle Done Button */}
          <Pressable
            onPress={() => toggleTaskDone(task.id)}
            style={({ pressed }) => [
              styles.btnToggleDone,
              task.done ? styles.btnToggleDoneUndo : styles.btnToggleDoneComplete,
              pressed && styles.btnPressed,
            ]}
          >
            <Text
              style={[
                styles.btnToggleDoneText,
                task.done && styles.btnToggleDoneTextUndo,
              ]}
            >
              {task.done
                ? '↺ Đánh dấu chưa hoàn thành'
                : '✓ Đánh dấu hoàn thành'}
            </Text>
          </Pressable>

          {/* Edit Button */}
          <Pressable
            onPress={() => navigation.navigate('TaskForm', { task })}
            style={({ pressed }) => [styles.btnEdit, pressed && styles.btnPressed]}
          >
            <Text style={styles.btnEditText}>✏️ Chỉnh sửa công việc</Text>
          </Pressable>

          {/* Delete Button */}
          <Pressable
            onPress={handleDelete}
            style={({ pressed }) => [styles.btnDelete, pressed && styles.btnPressed]}
          >
            <Text style={styles.btnDeleteText}>🗑️ Xoá công việc này</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
  overdueBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.errorLight,
    borderWidth: 1,
    borderColor: Colors.errorAccent,
    borderRadius: 12,
    padding: Spacing.md,
    marginBottom: Spacing.md,
  },
  overdueBannerIcon: {
    fontSize: 24,
    marginRight: Spacing.md,
  },
  overdueBannerContent: {
    flex: 1,
  },
  overdueBannerTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: Colors.error,
    letterSpacing: 0.5,
  },
  overdueBannerSub: {
    fontSize: 12,
    color: Colors.errorDark,
    marginTop: 2,
  },
  card: {
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  doneBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: 20,
  },
  doneBadgeCompleted: {
    backgroundColor: Colors.successLight,
  },
  doneBadgeActive: {
    backgroundColor: Colors.primaryLight,
  },
  doneBadgeText: {
    fontSize: 12,
    fontWeight: '700',
  },
  doneBadgeTextCompleted: {
    color: Colors.success,
  },
  doneBadgeTextActive: {
    color: Colors.primary,
  },
  overdueTag: {
    backgroundColor: Colors.errorLight,
    borderWidth: 1,
    borderColor: Colors.error,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  overdueTagText: {
    color: Colors.error,
    fontSize: 11,
    fontWeight: '700',
  },
  taskTitle: {
    ...Typography.headingMedium,
    color: Colors.textPrimary,
    lineHeight: 24,
  },
  taskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: Colors.textMuted,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: Spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 0.8,
    borderBottomColor: Colors.borderLight,
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  categoryChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
  },
  priorityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    gap: 6,
  },
  priorityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '700',
  },
  dueDateValue: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  dueStatusBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 4,
    borderRadius: 6,
  },
  dueStatusOverdue: {
    backgroundColor: Colors.errorLight,
  },
  dueStatusToday: {
    backgroundColor: Colors.warningLight,
  },
  dueStatusUpcoming: {
    backgroundColor: Colors.primaryLight,
  },
  dueStatusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  dueStatusTextOverdue: {
    color: Colors.error,
  },
  dueStatusTextToday: {
    color: Colors.warning,
  },
  dueStatusTextUpcoming: {
    color: Colors.primaryDark,
  },
  noteContent: {
    fontSize: 14,
    color: Colors.textPrimary,
    lineHeight: 22,
  },
  noteEmpty: {
    fontSize: 13,
    color: Colors.textMuted,
    fontStyle: 'italic',
  },
  actionsContainer: {
    marginTop: Spacing.sm,
    gap: Spacing.sm,
  },
  btnToggleDone: {
    paddingVertical: Spacing.md,
    borderRadius: 10,
    alignItems: 'center',
  },
  btnToggleDoneComplete: {
    backgroundColor: Colors.success,
  },
  btnToggleDoneUndo: {
    backgroundColor: Colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  btnToggleDoneText: {
    color: Colors.textInverse,
    fontSize: 14,
    fontWeight: '700',
  },
  btnToggleDoneTextUndo: {
    color: Colors.textPrimary,
  },
  btnEdit: {
    backgroundColor: Colors.primaryLight,
    borderWidth: 1,
    borderColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: 10,
    alignItems: 'center',
  },
  btnEditText: {
    color: Colors.primaryDark,
    fontSize: 14,
    fontWeight: '700',
  },
  btnDelete: {
    backgroundColor: Colors.errorLight,
    borderWidth: 1,
    borderColor: Colors.errorBorder,
    paddingVertical: Spacing.md,
    borderRadius: 10,
    alignItems: 'center',
  },
  btnDeleteText: {
    color: Colors.error,
    fontSize: 14,
    fontWeight: '700',
  },
  btnPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  notFoundContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  notFoundTitle: {
    ...Typography.headingMedium,
    marginBottom: Spacing.sm,
  },
  notFoundMessage: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
  },
  btnBack: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: 8,
  },
  btnBackText: {
    color: Colors.textInverse,
    fontWeight: '700',
  },
});