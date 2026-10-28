export type Category = 'Học tập' | 'Công việc' | 'Sức khoẻ' | 'Cá nhân';
export type Priority = 'Cao' | 'Trung bình' | 'Thấp';

export interface Task {
  id: string;
  title: string;
  note?: string;
  category: Category;
  priority: Priority;
  dueDate: string; // Định dạng dd/mm/yyyy
  done: boolean;
}

export type FilterStatus = 'ALL' | 'ACTIVE' | 'COMPLETED' | 'OVERDUE';
export type SortOption = 'DUE_DATE' | 'PRIORITY';

export type RootTabParamList = {
  TasksTab: undefined;
  OverdueTab: undefined;
  AddPlaceholder: undefined;
  StatsTab: undefined;
  SettingsTab: undefined;
};

export type RootStackParamList = {
  MainTabs: undefined;
  Home: undefined;
  TaskForm: { task?: Task };
  Detail: { taskId: string };
};

