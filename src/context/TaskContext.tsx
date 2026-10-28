import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Task } from '../types/task';
import { loadTasksFromStorage, saveTasksToStorage, getInitialSampleTasks } from '../utils/storage';
import { isTaskOverdue } from '../utils/dateUtils';

interface TaskContextType {
  tasks: Task[];
  isLoading: boolean;
  addTask: (data: Omit<Task, 'id'>) => Promise<void>;
  updateTask: (task: Task) => Promise<void>;
  deleteTask: (id: string) => Promise<void>;
  toggleTaskDone: (id: string) => Promise<void>;
  deleteCompletedTasks: () => Promise<number>;
  getTaskById: (id: string) => Task | undefined;
  resetSampleTasks: () => Promise<void>;
  clearAllTasks: () => Promise<void>;
  stats: {
    total: number;
    completed: number;
    active: number;
    overdue: number;
    progressPercentage: number;
  };
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Load from AsyncStorage on mount
  useEffect(() => {
    const initData = async () => {
      try {
        const loaded = await loadTasksFromStorage();
        setTasks(loaded);
      } catch (err) {
        console.error('Failed to init tasks:', err);
      } finally {
        setIsLoading(false);
      }
    };
    initData();
  }, []);

  // Save whenever tasks change after initial load
  const updateAndSave = async (newTasks: Task[]) => {
    setTasks(newTasks);
    await saveTasksToStorage(newTasks);
  };

  const addTask = async (data: Omit<Task, 'id'>) => {
    const newTask: Task = {
      ...data,
      id: `task_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    };
    const updated = [newTask, ...tasks];
    await updateAndSave(updated);
  };

  const updateTask = async (task: Task) => {
    const updated = tasks.map((t) => (t.id === task.id ? task : t));
    await updateAndSave(updated);
  };

  const deleteTask = async (id: string) => {
    const updated = tasks.filter((t) => t.id !== id);
    await updateAndSave(updated);
  };

  const toggleTaskDone = async (id: string) => {
    const updated = tasks.map((t) =>
      t.id === id ? { ...t, done: !t.done } : t
    );
    await updateAndSave(updated);
  };

  const deleteCompletedTasks = async (): Promise<number> => {
    const completedCount = tasks.filter((t) => t.done).length;
    if (completedCount === 0) return 0;
    const remaining = tasks.filter((t) => !t.done);
    await updateAndSave(remaining);
    return completedCount;
  };

  const getTaskById = (id: string) => {
    return tasks.find((t) => t.id === id);
  };

  const resetSampleTasks = async () => {
    const samples = getInitialSampleTasks();
    await updateAndSave(samples);
  };

  const clearAllTasks = async () => {
    await updateAndSave([]);
  };

  // Compute live statistics
  const total = tasks.length;
  const completed = tasks.filter((t) => t.done).length;
  const active = tasks.filter((t) => !t.done).length;
  const overdue = tasks.filter((t) => isTaskOverdue(t.dueDate, t.done)).length;
  const progressPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <TaskContext.Provider
      value={{
        tasks,
        isLoading,
        addTask,
        updateTask,
        deleteTask,
        toggleTaskDone,
        deleteCompletedTasks,
        getTaskById,
        resetSampleTasks,
        clearAllTasks,
        stats: {
          total,
          completed,
          active,
          overdue,
          progressPercentage,
        },
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = (): TaskContextType => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
};
