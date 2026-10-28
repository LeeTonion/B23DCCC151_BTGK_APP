import AsyncStorage from '@react-native-async-storage/async-storage';
import { Task } from '../types/task';
import { getRelativeDateString } from './dateUtils';

const STORAGE_KEY = '@planner_tasks_v1';

/**
 * Generate at least 6 realistic sample tasks for first run.
 * Guaranteed to have:
 * - At least 1 completed task
 * - At least 1 overdue task
 * - Full coverage of categories & priorities
 */
export const getInitialSampleTasks = (): Task[] => {
  return [
    {
      id: 'task_sample_1',
      title: 'Nộp báo cáo đồ án Đa nền tảng',
      note: 'Hoàn thiện file word báo cáo và xuất PDF nộp lên cổng đào tạo trước hạn.',
      category: 'Học tập',
      priority: 'Cao',
      dueDate: getRelativeDateString(-2), // Quá hạn 2 ngày
      done: false,
    },
    {
      id: 'task_sample_2',
      title: 'Đọc tài liệu React Navigation v7',
      note: 'Xem phần Stack Navigator, NavigationContainer và options cấu hình header.',
      category: 'Học tập',
      priority: 'Trung bình',
      dueDate: getRelativeDateString(-1), // Đã hoàn thành hôm qua
      done: true,
    },
    {
      id: 'task_sample_3',
      title: 'Chạy bộ 30 phút và rèn luyện thể lực',
      note: 'Chạy vòng quanh khuôn viên ký túc xá hoặc công viên.',
      category: 'Sức khoẻ',
      priority: 'Thấp',
      dueDate: getRelativeDateString(0), // Hạn hôm nay
      done: false,
    },
    {
      id: 'task_sample_4',
      title: 'Họp nhóm tổng kết dự án học phần',
      note: 'Phân chia thuyết trình và kiểm tra lại slide bài thuyết trình.',
      category: 'Công việc',
      priority: 'Cao',
      dueDate: getRelativeDateString(2), // Còn 2 ngày
      done: false,
    },
    {
      id: 'task_sample_5',
      title: 'Mua giáo trình và đồ dùng học tập',
      note: 'Ghé nhà sách mua sổ tay ghi chú và bút nhớ dòng.',
      category: 'Cá nhân',
      priority: 'Trung bình',
      dueDate: getRelativeDateString(4), // Còn 4 ngày
      done: false,
    },
    {
      id: 'task_sample_6',
      title: 'Khám sức khoẻ tổng quát định kỳ',
      note: 'Đến trạm y tế sinh viên kiểm tra mắt và chỉ số sức khoẻ định kỳ.',
      category: 'Sức khoẻ',
      priority: 'Thấp',
      dueDate: getRelativeDateString(6), // Còn 6 ngày
      done: false,
    },
    {
      id: 'task_sample_7',
      title: 'Dọn dẹp phòng trọ và giặt đồ',
      note: 'Tổng vệ sinh phòng ở cho gọn gàng sạch sẽ.',
      category: 'Cá nhân',
      priority: 'Thấp',
      dueDate: getRelativeDateString(1),
      done: true,
    },
  ];
};

/**
 * Load tasks from AsyncStorage.
 * If null / first launch, saves and returns sample tasks.
 */
export const loadTasksFromStorage = async (): Promise<Task[]> => {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEY);
    if (jsonValue !== null) {
      const parsed: Task[] = JSON.parse(jsonValue);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
    // First time launch: initialize sample tasks
    const initialTasks = getInitialSampleTasks();
    await saveTasksToStorage(initialTasks);
    return initialTasks;
  } catch (error) {
    console.error('Error loading tasks from AsyncStorage:', error);
    return getInitialSampleTasks();
  }
};

/**
 * Save tasks to AsyncStorage
 */
export const saveTasksToStorage = async (tasks: Task[]): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(tasks);
    await AsyncStorage.setItem(STORAGE_KEY, jsonValue);
  } catch (error) {
    console.error('Error saving tasks to AsyncStorage:', error);
  }
};
