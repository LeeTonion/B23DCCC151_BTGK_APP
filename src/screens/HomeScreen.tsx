import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  Pressable,
  StyleSheet,
  Alert,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTasks } from '../context/TaskContext';
import { FilterStatus, SortOption, RootStackParamList } from '../types/task';
import { FilterBar } from '../components/FilterBar';
import { SortBar } from '../components/SortBar';
import { TaskCard } from '../components/TaskCard';
import { EmptyState } from '../components/EmptyState';
import { Colors, Spacing, Typography } from '../theme';
import { isTaskOverdue, parseDate } from '../utils/dateUtils';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface HomeScreenProps {
  navigation: HomeScreenNavigationProp;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const { tasks, deleteTask, toggleTaskDone, stats } = useTasks();

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filter, setFilter] = useState<FilterStatus>('ALL');
  const [sort, setSort] = useState<SortOption>('DUE_DATE');

  // Notification button handler
  const handleOpenNotification = () => {
    const overdueMsg =
      stats.overdue > 0
        ? `⚠️ ${stats.overdue} công việc đã quá hạn cần xử lý gấp!\n`
        : '🎉 Không có công việc nào bị quá hạn.\n';

    Alert.alert(
      '🔔 Thông báo công việc',
      `${overdueMsg}📋 Đang làm: ${stats.active} việc\n✅ Đã hoàn thành: ${stats.completed}/${stats.total} việc (${stats.progressPercentage}%)`,
      [
        ...(stats.overdue > 0
          ? [
              {
                text: 'Xem việc quá hạn',
                onPress: () => navigation.navigate('MainTabs' as never),
              },
            ]
          : []),
        { text: 'Đóng', style: 'cancel' },
      ]
    );
  };

  // Filter, search, and sort simultaneously
  const filteredAndSortedTasks = useMemo(() => {
    let result = [...tasks];

    // 1. Status Filter
    if (filter === 'ACTIVE') {
      result = result.filter((t) => !t.done);
    } else if (filter === 'COMPLETED') {
      result = result.filter((t) => t.done);
    } else if (filter === 'OVERDUE') {
      result = result.filter((t) => isTaskOverdue(t.dueDate, t.done));
    }

    // 2. Search by title (case-insensitive)
    if (searchQuery.trim().length > 0) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter((t) => t.title.toLowerCase().includes(q));
    }

    // 3. Sorting
    if (sort === 'DUE_DATE') {
      result.sort((a, b) => {
        const dateA = parseDate(a.dueDate)?.getTime() || 0;
        const dateB = parseDate(b.dueDate)?.getTime() || 0;
        return dateA - dateB; // Closest / earliest deadline first
      });
    } else if (sort === 'PRIORITY') {
      const priorityWeight: Record<string, number> = {
        Cao: 3,
        'Trung bình': 2,
        Thấp: 1,
      };
      result.sort((a, b) => {
        const weightA = priorityWeight[a.priority] || 0;
        const weightB = priorityWeight[b.priority] || 0;
        return weightB - weightA; // Cao -> Thấp
      });
    }

    return result;
  }, [tasks, filter, searchQuery, sort]);

  // Today's formatted date string
  const todayString = useMemo(() => {
    const now = new Date();
    const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    const dName = days[now.getDay()];
    const d = String(now.getDate()).padStart(2, '0');
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const y = now.getFullYear();
    return `${dName}, ${d}/${m}/${y}`;
  }, []);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" />

      {/* Minimalist Header with Date & Notification Bell */}
      <View style={styles.header}>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerSub}>{todayString}</Text>
          <Text style={styles.headerTitle}>Kế Hoạch Của Tôi</Text>
        </View>

        {/* Notification Bell Button (Thay nút thêm mới ở góc phải) */}
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Thông báo công việc"
          onPress={handleOpenNotification}
          style={({ pressed }) => [styles.btnNotify, pressed && styles.btnNotifyPressed]}
        >
          <Text style={styles.btnNotifyIcon}>🔔</Text>
          {stats.overdue > 0 && (
            <View style={styles.notifyBadge}>
              <Text style={styles.notifyBadgeText}>
                {stats.overdue > 9 ? '9+' : stats.overdue}
              </Text>
            </View>
          )}
        </Pressable>
      </View>

      {/* Minimalist Search Input */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Tìm kiếm công việc..."
            placeholderTextColor={Colors.textMuted}
            style={styles.searchInput}
            clearButtonMode="while-editing"
            returnKeyType="search"
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')} hitSlop={8}>
              <Text style={styles.clearSearch}>✕</Text>
            </Pressable>
          )}
        </View>
      </View>

      {/* Filter Tabs */}
      <FilterBar
        currentFilter={filter}
        onSelectFilter={setFilter}
        counts={{
          all: stats.total,
          active: stats.active,
          completed: stats.completed,
          overdue: stats.overdue,
        }}
      />

      {/* Sort Options */}
      <SortBar currentSort={sort} onToggleSort={setSort} />

      {/* Task List */}
      <FlatList
        data={filteredAndSortedTasks}
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
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState
            title={searchQuery ? 'Không tìm thấy kết quả' : 'Không có công việc'}
            message={
              searchQuery
                ? `Không có công việc nào khớp với từ khoá "${searchQuery}". Hãy thử tìm kiếm từ khác.`
                : filter === 'COMPLETED'
                ? 'Chưa có công việc nào được hoàn thành.'
                : filter === 'OVERDUE'
                ? 'Tuyệt vời! Không có công việc nào bị quá hạn.'
                : 'Danh sách trống. Nhấn nút "+" ở thanh menu dưới để thêm công việc mới!'
            }
            icon={searchQuery ? '🔎' : filter === 'OVERDUE' ? '🎉' : '📋'}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xs,
  },
  headerTitleContainer: {
    flex: 1,
  },
  headerSub: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 2,
  },
  headerTitle: {
    ...Typography.headingLarge,
    color: Colors.textPrimary,
  },
  btnNotify: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 2,
  },
  btnNotifyPressed: {
    transform: [{ scale: 0.92 }],
    backgroundColor: Colors.surfaceSubtle,
  },
  btnNotifyIcon: {
    fontSize: 18,
  },
  notifyBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: Colors.error,
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.card,
  },
  notifyBadgeText: {
    color: Colors.textInverse,
    fontSize: 9,
    fontWeight: '800',
  },
  searchContainer: {
    paddingHorizontal: Spacing.lg,
    marginTop: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.card,
    borderRadius: 12,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    height: 42,
  },
  searchIcon: {
    fontSize: 14,
    marginRight: Spacing.xs,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: Colors.textPrimary,
    paddingVertical: 0,
  },
  clearSearch: {
    fontSize: 14,
    color: Colors.textMuted,
    padding: 4,
  },
  listContent: {
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xl,
  },
});