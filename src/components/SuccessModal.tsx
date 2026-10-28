import React from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  StyleSheet,
} from 'react-native';
import { Task } from '../types/task';
import { Colors, Spacing } from '../theme';

interface SuccessModalProps {
  visible: boolean;
  task: Partial<Task> | null;
  onGoBack: () => void;
  onAddAnother: () => void;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({
  visible,
  task,
  onGoBack,
  onAddAnother,
}) => {
  if (!task) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onGoBack}
    >
      <View style={styles.backdrop}>
        <View style={styles.cardContainer}>
          {/* Success Check Icon */}
          <View style={styles.checkCircle}>
            <Text style={styles.checkIcon}>✓</Text>
          </View>

          <Text style={styles.title}>Thêm Công Việc Thành Công</Text>
          <Text style={styles.subtitle}>
            Kế hoạch mới đã được lưu vào hệ thống và sẵn sàng để theo dõi.
          </Text>

          {/* Task Info Summary */}
          <View style={styles.summaryBox}>
            <View style={styles.row}>
              <Text style={styles.label}>Tên việc:</Text>
              <Text numberOfLines={2} style={styles.valueTitle}>
                {task.title}
              </Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.row}>
              <Text style={styles.label}>Hạn chót:</Text>
              <Text style={styles.value}>{task.dueDate}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.row}>
              <Text style={styles.label}>Danh mục:</Text>
              <Text style={styles.value}>{task.category}</Text>
            </View>

            <View style={styles.divider} />

            <View style={styles.row}>
              <Text style={styles.label}>Mức ưu tiên:</Text>
              <Text style={[styles.value, { color: task.priority === 'Cao' ? Colors.error : Colors.textPrimary }]}>
                {task.priority}
              </Text>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsGroup}>
            <Pressable
              accessibilityRole="button"
              onPress={onGoBack}
              style={({ pressed }) => [styles.btnPrimary, pressed && styles.btnPressed]}
            >
              <Text style={styles.btnPrimaryText}>Về danh sách công việc</Text>
            </Pressable>

            <Pressable
              accessibilityRole="button"
              onPress={onAddAnother}
              style={({ pressed }) => [styles.btnSecondary, pressed && styles.btnPressed]}
            >
              <Text style={styles.btnSecondaryText}>+ Thêm việc khác</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  cardContainer: {
    width: '100%',
    backgroundColor: Colors.card,
    borderRadius: 20,
    padding: Spacing.xl,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 10,
  },
  checkCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.successLight,
    borderWidth: 2.5,
    borderColor: Colors.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  checkIcon: {
    fontSize: 30,
    fontWeight: 'bold',
    color: Colors.success,
    marginTop: -2,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: Spacing.lg,
    lineHeight: 18,
  },
  summaryBox: {
    width: '100%',
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.lg,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  label: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  value: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  valueTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
    flex: 1,
    textAlign: 'right',
    marginLeft: Spacing.md,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: 4,
  },
  actionsGroup: {
    width: '100%',
    gap: Spacing.sm,
  },
  btnPrimary: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  btnPrimaryText: {
    color: Colors.textInverse,
    fontWeight: '700',
    fontSize: 13,
  },
  btnSecondary: {
    backgroundColor: Colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  btnSecondaryText: {
    color: Colors.textPrimary,
    fontWeight: '600',
    fontSize: 13,
  },
  btnPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
});
