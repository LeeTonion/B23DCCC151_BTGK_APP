import React from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  FlatList,
  StyleSheet,
} from 'react-native';
import { Task } from '../types/task';
import { Colors, Spacing, Typography } from '../theme';
import { isTaskOverdue, getDueStatusInfo } from '../utils/dateUtils';

interface NotificationPanelProps {
  visible: boolean;
  tasks: Task[];
  onClose: () => void;
  onSelectTask: (taskId: string) => void;
  onToggleDone: (taskId: string) => void;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({
  visible,
  tasks,
  onClose,
  onSelectTask,
  onToggleDone,
}) => {
  // Filter ONLY overdue uncompleted tasks
  const overdueTasks = tasks.filter((t) => isTaskOverdue(t.dueDate, t.done));

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.panelContainer} onPress={(e) => e.stopPropagation()}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <View style={styles.iconCircle}>
                <Text style={styles.bellIcon}>🔔</Text>
              </View>
              <View style={styles.titleWrapper}>
                <Text style={styles.title}>Thông Báo Quá Hạn</Text>
                <Text style={styles.subtitle}>
                  {overdueTasks.length > 0
                    ? `Có ${overdueTasks.length} công việc chưa hoàn thành đã quá hạn`
                    : 'Không có công việc nào bị quá hạn'}
                </Text>
              </View>
            </View>

            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Đóng thông báo"
              onPress={onClose}
              style={({ pressed }) => [styles.btnClose, pressed && styles.btnPressed]}
              hitSlop={8}
            >
              <Text style={styles.btnCloseText}>✕</Text>
            </Pressable>
          </View>

          {/* Overdue Task List */}
          <FlatList
            data={overdueTasks}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => {
              const dueInfo = getDueStatusInfo(item.dueDate, item.done);

              return (
                <Pressable
                  onPress={() => {
                    onClose();
                    onSelectTask(item.id);
                  }}
                  style={({ pressed }) => [styles.taskItem, pressed && styles.taskItemPressed]}
                >
                  <View style={styles.taskHeader}>
                    <Text numberOfLines={1} style={styles.taskTitle}>
                      {item.title}
                    </Text>
                    <View style={styles.badgeOverdue}>
                      <Text style={styles.badgeOverdueText}>
                        {dueInfo.text}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.taskMetaRow}>
                    <Text style={styles.taskDate}>Hạn: {item.dueDate}</Text>
                    <Text style={styles.metaDot}>•</Text>
                    <Text style={styles.taskCategory}>{item.category}</Text>
                    <Text style={styles.metaDot}>•</Text>
                    <Text style={styles.taskPriority}>Ưu tiên {item.priority}</Text>
                  </View>

                  {/* Actions inside task item */}
                  <View style={styles.taskActionsRow}>
                    <Pressable
                      onPress={() => onToggleDone(item.id)}
                      style={({ pressed }) => [styles.btnMarkDone, pressed && styles.btnPressed]}
                    >
                      <Text style={styles.btnMarkDoneText}>✓ Hoàn thành ngay</Text>
                    </Pressable>

                    <Text style={styles.tapDetailHint}>Chạm để xem chi tiết →</Text>
                  </View>
                </Pressable>
              );
            }}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIconCircle}>
                  <Text style={styles.emptyCheckmark}>✓</Text>
                </View>
                <Text style={styles.emptyTitle}>Tất cả đúng hạn</Text>
                <Text style={styles.emptyMessage}>
                  Hiện tại không có bất kỳ công việc nào bị quá hạn. Tiến độ của bạn đang rất tốt!
                </Text>
              </View>
            }
          />

          {/* Footer button */}
          <View style={styles.footer}>
            <Pressable
              accessibilityRole="button"
              onPress={onClose}
              style={({ pressed }) => [styles.btnDismiss, pressed && styles.btnPressed]}
            >
              <Text style={styles.btnDismissText}>Đóng thông báo</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'flex-end',
  },
  panelContainer: {
    backgroundColor: Colors.card,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '78%',
    minHeight: '40%',
    paddingTop: Spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.errorLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  bellIcon: {
    fontSize: 18,
  },
  titleWrapper: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  subtitle: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  btnClose: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.surfaceSubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnCloseText: {
    fontSize: 14,
    color: Colors.textSecondary,
    fontWeight: '700',
  },
  btnPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.96 }],
  },
  listContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  taskItem: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.errorBorder,
    borderLeftWidth: 4,
    borderLeftColor: Colors.error,
    borderRadius: 10,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  taskItemPressed: {
    opacity: 0.85,
    backgroundColor: Colors.errorLight,
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textPrimary,
    flex: 1,
    marginRight: Spacing.sm,
  },
  badgeOverdue: {
    backgroundColor: Colors.errorLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Colors.error,
  },
  badgeOverdueText: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.error,
  },
  taskMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  taskDate: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  metaDot: {
    fontSize: 11,
    color: Colors.textMuted,
    marginHorizontal: 5,
  },
  taskCategory: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  taskPriority: {
    fontSize: 11,
    color: Colors.error,
    fontWeight: '600',
  },
  taskActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 0.8,
    borderTopColor: Colors.border,
    paddingTop: 8,
  },
  btnMarkDone: {
    backgroundColor: Colors.successLight,
    borderWidth: 1,
    borderColor: Colors.success,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  btnMarkDoneText: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.success,
  },
  tapDetailHint: {
    fontSize: 11,
    color: Colors.primary,
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingVertical: Spacing.xl,
    paddingHorizontal: Spacing.lg,
  },
  emptyIconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.successLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
    borderWidth: 2,
    borderColor: Colors.success,
  },
  emptyCheckmark: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.success,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  emptyMessage: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
  },
  footer: {
    padding: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
  },
  btnDismiss: {
    backgroundColor: Colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  btnDismissText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
});
