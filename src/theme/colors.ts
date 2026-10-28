import { Priority, Category } from '../types/task';

export const Colors = {
  // Brand colors
  primary: '#4F46E5', // Indigo modern
  primaryDark: '#3730A3',
  primaryLight: '#EEF2FF',
  secondary: '#0EA5E9',

  // Backgrounds & Surface
  background: '#F8FAFC',
  card: '#FFFFFF',
  surface: '#FFFFFF',
  surfaceSubtle: '#F1F5F9',

  // Text
  textPrimary: '#0F172A',
  textSecondary: '#64748B',
  textMuted: '#94A3B8',
  textInverse: '#FFFFFF',

  // Functional
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  borderDark: '#CBD5E1',
  error: '#DC2626',
  errorLight: '#FEE2E2',
  warning: '#D97706',
  warningLight: '#FEF3C7',
  success: '#16A34A',
  successLight: '#DCFCE7',

  // Extended functional
  errorDark: '#991B1B',
  errorBorder: '#FECACA',
  errorAccent: '#F87171',
  warningDark: '#B45309',
  warningBorder: '#FDE68A',
  successBorder: '#BBF7D0',
  info: '#0284C7',
  infoLight: '#E0F2FE',
  infoBorder: '#BAE6FD',

  // Disabled states
  disabledBg: '#E2E8F0',
  disabledText: '#94A3B8',
  disabledBorder: '#CBD5E1',

  // Checkbox
  checkboxChecked: '#16A34A',
  checkboxUnchecked: '#94A3B8',

  // Progress bar
  progressBackground: '#E2E8F0',
  progressBar: '#4F46E5',
  progressTrack: '#E2E8F0',
  progressFill: '#4F46E5',
};

export const PriorityColors: Record<
  Priority,
  {
    text: string;
    background: string;
    border: string;
    badgeText: string;
    dot: string;
  }
> = {
  Cao: {
    text: '#B91C1C',
    background: '#FEE2E2',
    border: '#FCA5A5',
    badgeText: 'Cao',
    dot: '#DC2626',
  },
  'Trung bình': {
    text: '#B45309',
    background: '#FEF3C7',
    border: '#FCD34D',
    badgeText: 'Trung bình',
    dot: '#D97706',
  },
  Thấp: {
    text: '#047857',
    background: '#D1FAE5',
    border: '#6EE7B7',
    badgeText: 'Thấp',
    dot: '#059669',
  },
};

export const CategoryColors: Record<
  Category,
  {
    text: string;
    background: string;
    border: string;
  }
> = {
  'Học tập': {
    text: '#4338CA',
    background: '#EEF2FF',
    border: '#C7D2FE',
  },
  'Công việc': {
    text: '#0369A1',
    background: '#E0F2FE',
    border: '#BAE6FD',
  },
  'Sức khoẻ': {
    text: '#047857',
    background: '#ECFDF5',
    border: '#A7F3D0',
  },
  'Cá nhân': {
    text: '#BE185D',
    background: '#FCE7F3',
    border: '#FBCFE8',
  },
};
