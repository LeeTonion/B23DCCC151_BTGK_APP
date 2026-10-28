import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useTasks } from '../context/TaskContext';
import { Category, Priority, RootStackParamList } from '../types/task';
import { Colors, PriorityColors, CategoryColors, Spacing, Typography } from '../theme';
import { validateDueDate, getRelativeDateString } from '../utils/dateUtils';
import { SuccessModal } from '../components/SuccessModal';

type TaskFormScreenProps = NativeStackScreenProps<RootStackParamList, 'TaskForm'>;

const CATEGORIES: Category[] = ['Học tập', 'Công việc', 'Sức khoẻ', 'Cá nhân'];
const PRIORITIES: Priority[] = ['Cao', 'Trung bình', 'Thấp'];

export const TaskFormScreen: React.FC<TaskFormScreenProps> = ({
  route,
  navigation,
}) => {
  const { addTask, updateTask } = useTasks();
  const existingTask = route.params?.task;
  const isEditMode = Boolean(existingTask);

  // Form states
  const [title, setTitle] = useState<string>(existingTask?.title || '');
  const [note, setNote] = useState<string>(existingTask?.note || '');
  const [category, setCategory] = useState<Category>(existingTask?.category || 'Học tập');
  const [priority, setPriority] = useState<Priority>(existingTask?.priority || 'Trung bình');
  const [dueDate, setDueDate] = useState<string>(
    existingTask?.dueDate || getRelativeDateString(1)
  );

  // Validation error states
  const [titleError, setTitleError] = useState<string | null>(null);
  const [dueDateError, setDueDateError] = useState<string | null>(null);

  // Success modal state
  const [savedTask, setSavedTask] = useState<Partial<Task> | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);

  // Validate title on change
  const handleTitleChange = (text: string) => {
    setTitle(text);
    if (!text.trim()) {
      setTitleError('Tên công việc không được để trống');
    } else if (text.trim().length > 50) {
      setTitleError('Tên công việc không được vượt quá 50 ký tự');
    } else {
      setTitleError(null);
    }
  };

  // Validate due date on change
  const handleDueDateChange = (text: string) => {
    setDueDate(text);
    if (text.trim().length > 0) {
      const err = validateDueDate(text, isEditMode);
      setDueDateError(err);
    } else {
      setDueDateError('Hạn hoàn thành không được để trống');
    }
  };

  const handleSave = async () => {
    // 1. Validate title
    const trimmedTitle = title.trim();
    let hasError = false;

    if (!trimmedTitle) {
      setTitleError('Tên công việc không được để trống');
      hasError = true;
    } else if (trimmedTitle.length > 50) {
      setTitleError('Tên công việc không được vượt quá 50 ký tự');
      hasError = true;
    } else {
      setTitleError(null);
    }

    // 2. Validate due date
    const dateErr = validateDueDate(dueDate, isEditMode);
    if (dateErr) {
      setDueDateError(dateErr);
      hasError = true;
    } else {
      setDueDateError(null);
    }

    if (hasError) {
      Alert.alert('Dữ liệu không hợp lệ', 'Vui lòng kiểm tra các thông báo lỗi màu đỏ.');
      return;
    }

    try {
      if (isEditMode && existingTask) {
        await updateTask({
          ...existingTask,
          title: trimmedTitle,
          note: note.trim() || undefined,
          category,
          priority,
          dueDate: dueDate.trim(),
        });
        Alert.alert('Thành công', 'Đã cập nhật công việc!');
        navigation.goBack();
      } else {
        const newTaskData = {
          title: trimmedTitle,
          note: note.trim() || undefined,
          category,
          priority,
          dueDate: dueDate.trim(),
          done: false,
        };
        await addTask(newTaskData);
        setSavedTask(newTaskData);
        setShowSuccessModal(true);
      }
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể lưu công việc. Vui lòng thử lại.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['bottom', 'left', 'right']}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoid}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Card: Title & Note */}
          <View style={styles.sectionCard}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>
                Tên công việc <Text style={styles.required}>*</Text>
              </Text>
              <Text
                style={[
                  styles.charCounter,
                  title.length > 50 && styles.charCounterError,
                ]}
              >
                {title.length}/50
              </Text>
            </View>

            <TextInput
              value={title}
              onChangeText={handleTitleChange}
              placeholder="Ví dụ: Ôn tập môn Lập trình di động..."
              placeholderTextColor={Colors.textMuted}
              style={[
                styles.input,
                titleError ? styles.inputError : null,
              ]}
              maxLength={60} // Allow typing a bit over 50 to see counter turn red
            />
            {titleError ? <Text style={styles.errorText}>⚠ {titleError}</Text> : null}

            {/* Note input */}
            <Text style={[styles.label, { marginTop: Spacing.lg }]}>
              Ghi chú <Text style={styles.optional}>(không bắt buộc)</Text>
            </Text>
            <TextInput
              value={note}
              onChangeText={setNote}
              placeholder="Thêm mô tả chi tiết, tài liệu hoặc ghi chú..."
              placeholderTextColor={Colors.textMuted}
              style={[styles.input, styles.textArea]}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          {/* Card: Category Selector */}
          <View style={styles.sectionCard}>
            <Text style={styles.label}>
              Danh mục <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.chipGrid}>
              {CATEGORIES.map((cat) => {
                const isSelected = category === cat;
                const catTheme = CategoryColors[cat];
                return (
                  <Pressable
                    key={cat}
                    onPress={() => setCategory(cat)}
                    style={({ pressed }) => [
                      styles.categoryChip,
                      {
                        backgroundColor: isSelected
                          ? catTheme.background
                          : Colors.surfaceSubtle,
                        borderColor: isSelected ? catTheme.border : Colors.border,
                      },
                      isSelected && styles.chipSelectedBorder,
                      pressed && styles.btnPressed,
                    ]}
                  >
                    <Text
                      style={[
                        styles.chipText,
                        { color: isSelected ? catTheme.text : Colors.textSecondary },
                        isSelected && styles.chipTextSelected,
                      ]}
                    >
                      {cat}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Card: Priority Selector */}
          <View style={styles.sectionCard}>
            <Text style={styles.label}>
              Mức độ ưu tiên <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.priorityRow}>
              {PRIORITIES.map((p) => {
                const isSelected = priority === p;
                const pTheme = PriorityColors[p];
                return (
                  <Pressable
                    key={p}
                    onPress={() => setPriority(p)}
                    style={({ pressed }) => [
                      styles.priorityButton,
                      {
                        backgroundColor: isSelected
                          ? pTheme.background
                          : Colors.surfaceSubtle,
                        borderColor: isSelected ? pTheme.dot : Colors.border,
                      },
                      isSelected && styles.priorityButtonSelected,
                      pressed && styles.btnPressed,
                    ]}
                  >
                    <View
                      style={[
                        styles.priorityDot,
                        { backgroundColor: isSelected ? pTheme.dot : Colors.disabledBorder },
                      ]}
                    />
                    <Text
                      style={[
                        styles.priorityBtnText,
                        { color: isSelected ? pTheme.text : Colors.textSecondary },
                        isSelected && styles.chipTextSelected,
                      ]}
                    >
                      {p}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* Card: Due Date */}
          <View style={styles.sectionCard}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>
                Hạn hoàn thành (dd/mm/yyyy) <Text style={styles.required}>*</Text>
              </Text>
            </View>

            <TextInput
              value={dueDate}
              onChangeText={handleDueDateChange}
              placeholder="dd/mm/yyyy (ví dụ: 30/10/2026)"
              placeholderTextColor={Colors.textMuted}
              keyboardType={Platform.OS === 'ios' ? 'numbers-and-punctuation' : 'phone-pad'}
              style={[styles.input, dueDateError ? styles.inputError : null]}
            />
            {dueDateError ? <Text style={styles.errorText}>⚠ {dueDateError}</Text> : null}

            {/* Quick date chips */}
            <View style={styles.quickDateContainer}>
              <Text style={styles.quickDateTitle}>Chọn nhanh:</Text>
              <Pressable
                onPress={() => {
                  const d = getRelativeDateString(0);
                  setDueDate(d);
                  handleDueDateChange(d);
                }}
                style={({ pressed }) => [
                  styles.quickDateBtn,
                  pressed && styles.quickDateBtnPressed,
                ]}
              >
                <Text style={styles.quickDateText}>Hôm nay</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  const d = getRelativeDateString(1);
                  setDueDate(d);
                  handleDueDateChange(d);
                }}
                style={({ pressed }) => [
                  styles.quickDateBtn,
                  pressed && styles.quickDateBtnPressed,
                ]}
              >
                <Text style={styles.quickDateText}>Ngày mai</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  const d = getRelativeDateString(3);
                  setDueDate(d);
                  handleDueDateChange(d);
                }}
                style={({ pressed }) => [
                  styles.quickDateBtn,
                  pressed && styles.quickDateBtnPressed,
                ]}
              >
                <Text style={styles.quickDateText}>3 ngày nữa</Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  const d = getRelativeDateString(7);
                  setDueDate(d);
                  handleDueDateChange(d);
                }}
                style={({ pressed }) => [
                  styles.quickDateBtn,
                  pressed && styles.quickDateBtnPressed,
                ]}
              >
                <Text style={styles.quickDateText}>1 tuần nữa</Text>
              </Pressable>
            </View>
          </View>

          {/* Submit Button */}
          <View style={styles.buttonContainer}>
            <Pressable
              onPress={handleSave}
              style={({ pressed }) => [styles.btnSubmit, pressed && styles.btnPressed]}
            >
              <Text style={styles.btnSubmitText}>
                {isEditMode ? '💾 Lưu thay đổi' : '✨ Thêm công việc'}
              </Text>
            </Pressable>

            <Pressable
              onPress={() => navigation.goBack()}
              style={({ pressed }) => [styles.btnCancel, pressed && styles.btnPressed]}
            >
              <Text style={styles.btnCancelText}>Huỷ bỏ</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Success Modal Panel */}
      <SuccessModal
        visible={showSuccessModal}
        task={savedTask}
        onGoBack={() => {
          setShowSuccessModal(false);
          navigation.goBack();
        }}
        onAddAnother={() => {
          setShowSuccessModal(false);
          setTitle('');
          setNote('');
          setDueDate(getRelativeDateString(1));
          setTitleError(null);
          setDueDateError(null);
        }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  keyboardAvoid: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxxl,
  },
  sectionCard: {
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: Spacing.xs,
  },
  required: {
    color: Colors.error,
    fontWeight: '700',
  },
  optional: {
    fontSize: 12,
    fontWeight: '400',
    color: Colors.textMuted,
  },
  charCounter: {
    fontSize: 12,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  charCounterError: {
    color: Colors.error,
    fontWeight: '700',
  },
  input: {
    backgroundColor: Colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    fontSize: 14,
    color: Colors.textPrimary,
  },
  inputError: {
    borderColor: Colors.error,
    backgroundColor: Colors.errorLight,
  },
  errorText: {
    color: Colors.error,
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },
  textArea: {
    minHeight: 80,
  },
  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  categoryChip: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: 8,
    borderWidth: 1,
  },
  chipSelectedBorder: {
    borderWidth: 1.5,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '500',
  },
  chipTextSelected: {
    fontWeight: '700',
  },
  priorityRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  priorityButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm + 2,
    paddingHorizontal: Spacing.xs,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
  },
  priorityButtonSelected: {
    borderWidth: 1.5,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  priorityBtnText: {
    fontSize: 13,
    fontWeight: '500',
  },
  quickDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginTop: Spacing.sm,
  },
  quickDateTitle: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '500',
    marginRight: 2,
  },
  quickDateBtn: {
    backgroundColor: Colors.surfaceSubtle,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  quickDateBtnPressed: {
    backgroundColor: Colors.primaryLight,
    borderColor: Colors.primary,
    transform: [{ scale: 0.96 }],
  },
  quickDateText: {
    fontSize: 11,
    color: Colors.primaryDark,
    fontWeight: '600',
  },
  buttonContainer: {
    marginTop: Spacing.md,
    gap: Spacing.sm,
  },
  btnSubmit: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
  },
  btnSubmitText: {
    color: Colors.textInverse,
    fontSize: 15,
    fontWeight: '700',
  },
  btnCancel: {
    backgroundColor: 'transparent',
    borderRadius: 10,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  btnCancelText: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  btnPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
});
