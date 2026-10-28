import React from 'react';
import { View, Text, Pressable, StyleSheet, Alert } from 'react-native';
import { Task } from '../types/task';
import { Colors, PriorityColors, CategoryColors, CommonStyles, Spacing } from '../theme';
import { isTaskOverdue, getDueStatusInfo } from '../utils/dateUtils';

interface TaskCardProps {
  task: Task;
  onPress: (task: Task) => void;
  onToggleDone: (taskId: string) => void;
  onDelete: (taskId: string, title: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  task,
  onPress,
  onToggleDone,
  onDelete,
}) => {
  const isOverdue = isTaskOverdue(task.dueDate, task.done);
  const priorityStyle = PriorityColors[task.priority] || PriorityColors['Thấp'];
  const categoryStyle = CategoryColors[task.category] || CategoryColors['Cá nhân'];
  const statusInfo = getDueStatusInfo(task.dueDate, task.done);

  const handleLongPress = () => {
    Alert.alert(
      'Xác nhận xoá công việc',
      `Bạn có chắc chắn muốn xoá công việc "${task.title}" không? Hành động này không thể hoàn tác.`,
      [
        { text: 'Huỷ', style: 'cancel' },
        {
          text: 'Xoá',
          style: 'destructive',
          onPress: () => onDelete(task.id, task.title),
        },
      ]
    );
  };

  return (
    <Pressable
      onPress={() => onPress(task)}
      onLongPress={handleLongPress}
      delayLongPress={400}
      style={({ pressed }) => [
        CommonStyles.cardShadow,
        styles.card,
        task.done && styles.cardCompleted,
        isOverdue && styles.cardOverdueBorder,
        pressed && styles.cardPressed,
      ]}
    >
      <View style={styles.cardHeader}>
        {/* Custom Checkbox */}
        <Pressable
          hitSlop={8}
          onPress={(e) => {
            e.stopPropagation();
            onToggleDone(task.id);
          }}
          style={({ pressed }) => [
            styles.checkbox,
            task.done && styles.checkboxChecked,
            pressed && styles.checkboxPressed,
          ]}
        >
          {task.done && <Text style={styles.checkmark}>✓</Text>}
        </Pressable>

        {/* Title & Note summary */}
        <View style={styles.titleContainer}>
          <Text
            numberOfLines={2}
            style={[
              styles.title,
              task.done && styles.titleCompleted,
            ]}
          >
            {task.title}
          </Text>

          {task.note ? (
            <Text
              numberOfLines={1}
              style={[
                styles.notePreview,
                task.done && styles.noteCompleted,
              ]}
            >
              {task.note}
            </Text>
          ) : null}
        </View>
      </View>

      {/* Meta tags row */}
      <View style={styles.metaRow}>
        <View style={styles.leftTags}>
          {/* Category Chip */}
          <View
            style={[
              styles.categoryBadge,
              {
                backgroundColor: categoryStyle.background,
                borderColor: categoryStyle.border,
              },
            ]}
          >
            <Text style={[styles.categoryText, { color: categoryStyle.text }]}>
              {task.category}
            </Text>
          </View>

          {/* Priority Badge */}
          <View
            style={[
              styles.priorityBadge,
              {
                backgroundColor: priorityStyle.background,
                borderColor: priorityStyle.border,
              },
            ]}
          >
            <View style={[styles.priorityDot, { backgroundColor: priorityStyle.dot }]} />
            <Text style={[styles.priorityText, { color: priorityStyle.text }]}>
              {task.priority}
            </Text>
          </View>
        </View>

        {/* Due Date & Overdue Tag */}
        <View style={styles.rightTags}>
          {isOverdue && (
            <View style={styles.overdueBadge}>
              <Text style={styles.overdueBadgeText}>Quá hạn</Text>
            </View>
          )}

          <View style={styles.dueDateBadge}>
            <Text style={[styles.dueDateText, isOverdue && styles.dueDateTextOverdue]}>
              📅 {task.dueDate}
            </Text>
          </View>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: Spacing.md + 2,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardCompleted: {
    backgroundColor: Colors.background,
    opacity: 0.72,
    borderColor: Colors.border,
  },
  cardOverdueBorder: {
    borderLeftWidth: 4,
    borderLeftColor: Colors.error,
  },
  cardPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.995 }],
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing.sm + 2,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.checkboxUnchecked,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: Colors.checkboxChecked,
    borderColor: Colors.checkboxChecked,
  },
  checkboxPressed: {
    transform: [{ scale: 0.9 }],
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    marginTop: -1,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
    lineHeight: 20,
  },
  titleCompleted: {
    textDecorationLine: 'line-through',
    color: Colors.textMuted,
  },
  notePreview: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  noteCompleted: {
    color: Colors.textMuted,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    paddingTop: 4,
    borderTopWidth: 0.8,
    borderTopColor: Colors.borderLight,
  },
  leftTags: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  rightTags: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '600',
  },
  priorityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    gap: 4,
  },
  priorityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  priorityText: {
    fontSize: 11,
    fontWeight: '700',
  },
  overdueBadge: {
    backgroundColor: Colors.errorLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: Colors.error,
  },
  overdueBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.error,
  },
  dueDateBadge: {
    paddingHorizontal: 4,
    paddingVertical: 2,
  },
  dueDateText: {
    fontSize: 11,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  dueDateTextOverdue: {
    color: Colors.error,
    fontWeight: '700',
  },
});
