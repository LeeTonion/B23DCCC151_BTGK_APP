import React, { useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  Alert,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTasks } from '../context/TaskContext';
import { Colors, Spacing, Typography } from '../theme';
import { Category, Priority } from '../types/task';

const MAX_BAR_HEIGHT = 85;

export const StatsScreen: React.FC = () => {
  const { tasks, stats, deleteCompletedTasks } = useTasks();

  // Category statistics
  const categoryStats = useMemo(() => {
    const counts: Record<Category, { total: number; done: number; active: number }> = {
      'Học tập': { total: 0, done: 0, active: 0 },
      'Công việc': { total: 0, done: 0, active: 0 },
      'Sức khoẻ': { total: 0, done: 0, active: 0 },
      'Cá nhân': { total: 0, done: 0, active: 0 },
    };

    tasks.forEach((t) => {
      if (counts[t.category]) {
        counts[t.category].total += 1;
        if (t.done) {
          counts[t.category].done += 1;
        } else {
          counts[t.category].active += 1;
        }
      }
    });

    return counts;
  }, [tasks]);

  // Priority statistics
  const priorityStats = useMemo(() => {
    const counts: Record<Priority, { total: number; done: number; active: number }> = {
      Cao: { total: 0, done: 0, active: 0 },
      'Trung bình': { total: 0, done: 0, active: 0 },
      Thấp: { total: 0, done: 0, active: 0 },
    };

    tasks.forEach((t) => {
      if (counts[t.priority]) {
        counts[t.priority].total += 1;
        if (t.done) {
          counts[t.priority].done += 1;
        } else {
          counts[t.priority].active += 1;
        }
      }
    });

    return counts;
  }, [tasks]);

  // Scaling factors for bar chart
  const maxCategoryCount = useMemo(() => {
    let max = 1;
    (Object.keys(categoryStats) as Category[]).forEach((cat) => {
      if (categoryStats[cat].total > max) {
        max = categoryStats[cat].total;
      }
    });
    return max;
  }, [categoryStats]);

  const maxPriorityCount = useMemo(() => {
    let max = 1;
    (Object.keys(priorityStats) as Priority[]).forEach((p) => {
      if (priorityStats[p].total > max) {
        max = priorityStats[p].total;
      }
    });
    return max;
  }, [priorityStats]);

  // Handle batch deletion of completed tasks
  const handleBatchDeleteCompleted = () => {
    if (stats.completed === 0) return;

    Alert.alert(
      'Xoá việc đã hoàn thành',
      `Bạn có chắc chắn muốn xoá ${stats.completed} công việc đã hoàn thành không?`,
      [
        { text: 'Huỷ', style: 'cancel' },
        {
          text: `Xoá ${stats.completed} việc`,
          style: 'destructive',
          onPress: async () => {
            const count = await deleteCompletedTasks();
            Alert.alert('Thành công', `Đã xoá ${count} công việc đã hoàn thành.`);
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="dark-content" />

      {/* Screen Header */}
      <View style={styles.header}>
        <Text style={styles.headerSub}>BÁO CÁO HIỆU SUẤT</Text>
        <Text style={styles.headerTitle}>Thống Kê Kế Hoạch</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Progress Card */}
        <View style={styles.progressCard}>
          <View style={styles.progressCardHeader}>
            <View>
              <Text style={styles.progressCardTitle}>Tiến độ hoàn thành</Text>
              <Text style={styles.progressCardSubtitle}>
                {stats.completed}/{stats.total} việc hoàn thành ({stats.progressPercentage}%)
              </Text>
            </View>
            <View style={styles.percentageCircle}>
              <Text style={styles.percentageValue}>{stats.progressPercentage}%</Text>
            </View>
          </View>

          <View style={styles.track}>
            <View style={[styles.fill, { width: `${stats.progressPercentage}%` }]} />
          </View>
        </View>

        {/* 4 Summary Stat Boxes */}
        <View style={styles.statsGrid}>
          <View style={[styles.statBox, { borderColor: Colors.primaryLight }]}>
            <Text style={styles.statBoxNumber}>{stats.total}</Text>
            <Text style={styles.statBoxLabel}>Tổng việc</Text>
          </View>

          <View style={[styles.statBox, { borderColor: Colors.infoBorder }]}>
            <Text style={[styles.statBoxNumber, { color: Colors.info }]}>{stats.active}</Text>
            <Text style={styles.statBoxLabel}>Đang làm</Text>
          </View>

          <View style={[styles.statBox, { borderColor: Colors.successBorder }]}>
            <Text style={[styles.statBoxNumber, { color: Colors.success }]}>{stats.completed}</Text>
            <Text style={styles.statBoxLabel}>Đã xong</Text>
          </View>

          <View style={[styles.statBox, { borderColor: Colors.errorBorder }]}>
            <Text style={[styles.statBoxNumber, { color: Colors.error }]}>{stats.overdue}</Text>
            <Text style={styles.statBoxLabel}>Quá hạn</Text>
          </View>
        </View>

        {/* BIỂU ĐỒ CỘT 1: Phân bổ theo Danh mục */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Biểu đồ theo Danh mục</Text>
            <Text style={styles.chartSub}>Số lượng công việc</Text>
          </View>

          {/* Chart Plot Area */}
          <View style={styles.chartPlotArea}>
            {/* Background Grid Lines */}
            <View style={styles.gridLineTop} />
            <View style={styles.gridLineMid} />

            {/* Vertical Bars Row */}
            <View style={styles.barsRow}>
              {(['Học tập', 'Công việc', 'Sức khoẻ', 'Cá nhân'] as Category[]).map((cat) => {
                const data = categoryStats[cat];
                const heightRatio = maxCategoryCount > 0 ? data.total / maxCategoryCount : 0;
                const barHeight = Math.max(Math.round(heightRatio * MAX_BAR_HEIGHT), data.total > 0 ? 14 : 4);

                const barColor =
                  cat === 'Học tập'
                    ? Colors.primary
                    : cat === 'Công việc'
                    ? Colors.secondary
                    : cat === 'Sức khoẻ'
                    ? Colors.success
                    : '#EC4899';

                return (
                  <View key={cat} style={styles.barCol}>
                    {/* Number on top */}
                    <Text style={[styles.barValueText, data.total > 0 && { color: barColor }]}>
                      {data.total}
                    </Text>

                    {/* Column Pillar */}
                    <View style={styles.pillarTrack}>
                      <View
                        style={[
                          styles.pillarFill,
                          {
                            height: barHeight,
                            backgroundColor: barColor,
                          },
                        ]}
                      />
                    </View>
                  </View>
                );
              })}
            </View>

            {/* X-Axis Baseline */}
            <View style={styles.xAxisBaseline} />

            {/* Labels Row below baseline */}
            <View style={styles.labelsRow}>
              {(['Học tập', 'Công việc', 'Sức khoẻ', 'Cá nhân'] as Category[]).map((cat) => {
                return (
                  <View key={cat} style={styles.labelCol}>
                    <Text numberOfLines={1} style={styles.labelText}>
                      {cat}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* Legend */}
          <View style={styles.legendContainer}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: Colors.primary }]} />
              <Text style={styles.legendText}>Học tập</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: Colors.secondary }]} />
              <Text style={styles.legendText}>Công việc</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: Colors.success }]} />
              <Text style={styles.legendText}>Sức khoẻ</Text>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: '#EC4899' }]} />
              <Text style={styles.legendText}>Cá nhân</Text>
            </View>
          </View>
        </View>

        {/* BIỂU ĐỒ CỘT 2: Phân bổ theo Mức độ ưu tiên */}
        <View style={styles.chartCard}>
          <View style={styles.chartHeader}>
            <Text style={styles.chartTitle}>Biểu đồ theo Mức độ ưu tiên</Text>
            <Text style={styles.chartSub}>Cao • Trung bình • Thấp</Text>
          </View>

          <View style={styles.chartPlotArea}>
            <View style={styles.gridLineTop} />
            <View style={styles.gridLineMid} />

            <View style={styles.barsRow}>
              {(['Cao', 'Trung bình', 'Thấp'] as Priority[]).map((p) => {
                const data = priorityStats[p];
                const heightRatio = maxPriorityCount > 0 ? data.total / maxPriorityCount : 0;
                const barHeight = Math.max(Math.round(heightRatio * MAX_BAR_HEIGHT), data.total > 0 ? 14 : 4);

                const barColor =
                  p === 'Cao' ? Colors.error : p === 'Trung bình' ? Colors.warning : Colors.success;

                return (
                  <View key={p} style={styles.barColWide}>
                    <Text style={[styles.barValueText, data.total > 0 && { color: barColor }]}>
                      {data.total}
                    </Text>

                    <View style={styles.pillarTrackWide}>
                      <View
                        style={[
                          styles.pillarFill,
                          {
                            height: barHeight,
                            backgroundColor: barColor,
                          },
                        ]}
                      />
                    </View>
                  </View>
                );
              })}
            </View>

            <View style={styles.xAxisBaseline} />

            <View style={styles.labelsRow}>
              {(['Cao', 'Trung bình', 'Thấp'] as Priority[]).map((p) => {
                const data = priorityStats[p];
                const barColor =
                  p === 'Cao' ? Colors.error : p === 'Trung bình' ? Colors.warning : Colors.success;

                return (
                  <View key={p} style={styles.labelColWide}>
                    <Text style={[styles.labelText, { fontWeight: '700', color: barColor }]}>
                      {p}
                    </Text>
                    <Text style={styles.labelSubText}>
                      {data.done}/{data.total} xong
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        </View>

        {/* Action: Clear completed tasks */}
        <View style={styles.actionCard}>
          <Text style={styles.actionCardTitle}>Dọn dẹp công việc</Text>
          <Text style={styles.actionCardDesc}>
            Xoá tất cả các công việc đã hoàn thành để giữ không gian làm việc gọn gàng.
          </Text>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Xoá việc đã hoàn thành"
            disabled={stats.completed === 0}
            onPress={handleBatchDeleteCompleted}
            style={({ pressed }) => [
              styles.btnBatchDelete,
              stats.completed === 0 && styles.btnBatchDeleteDisabled,
              pressed && styles.btnPressed,
            ]}
          >
            <Text
              style={[
                styles.btnBatchDeleteText,
                stats.completed === 0 && styles.btnBatchDeleteTextDisabled,
              ]}
            >
              Xoá {stats.completed} việc đã hoàn thành
            </Text>
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
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xs,
  },
  headerSub: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.primary,
    letterSpacing: 1.2,
    marginBottom: 2,
  },
  headerTitle: {
    ...Typography.headingLarge,
    color: Colors.textPrimary,
  },
  scrollContent: {
    paddingBottom: Spacing.xxl,
  },
  progressCard: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.sm,
    marginBottom: Spacing.md,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  progressCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  progressCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  progressCardSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  percentageCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: Colors.primaryLight,
    borderWidth: 2,
    borderColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  percentageValue: {
    fontSize: 15,
    fontWeight: '800',
    color: Colors.primary,
  },
  track: {
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.progressTrack,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: Colors.progressFill,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  statBox: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  statBoxIcon: {
    fontSize: 22,
    marginBottom: 4,
  },
  statBoxNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.textPrimary,
  },
  statBoxLabel: {
    fontSize: 11,
    color: Colors.textMuted,
    marginTop: 2,
    fontWeight: '500',
  },
  chartCard: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  chartTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  chartSub: {
    fontSize: 11,
    color: Colors.textMuted,
  },
  chartPlotArea: {
    position: 'relative',
    marginBottom: Spacing.md,
  },
  gridLineTop: {
    position: 'absolute',
    top: 25,
    left: 0,
    right: 0,
    height: 1,
    borderStyle: 'dashed',
    borderWidth: 0.5,
    borderColor: Colors.border,
  },
  gridLineMid: {
    position: 'absolute',
    top: 70,
    left: 0,
    right: 0,
    height: 1,
    borderStyle: 'dashed',
    borderWidth: 0.5,
    borderColor: Colors.borderLight,
  },
  barsRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    height: 115,
  },
  barCol: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
    height: '100%',
  },
  barColWide: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
    height: '100%',
  },
  barValueText: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  pillarTrack: {
    width: 28,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  pillarTrackWide: {
    width: 36,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  pillarFill: {
    width: '100%',
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  xAxisBaseline: {
    height: 1.5,
    backgroundColor: Colors.borderDark,
    width: '100%',
    marginTop: 0,
  },
  labelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: Spacing.xs + 2,
  },
  labelCol: {
    alignItems: 'center',
    flex: 1,
  },
  labelColWide: {
    alignItems: 'center',
    flex: 1,
  },
  labelIcon: {
    fontSize: 14,
    marginBottom: 2,
  },
  labelText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: '600',
    textAlign: 'center',
  },
  labelSubText: {
    fontSize: 10,
    color: Colors.textMuted,
    marginTop: 2,
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: Spacing.md,
    marginTop: Spacing.xs,
    paddingTop: Spacing.xs,
    borderTopWidth: 0.8,
    borderTopColor: Colors.borderLight,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  actionCard: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    marginHorizontal: Spacing.lg,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  actionCardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  actionCardDesc: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 4,
    marginBottom: Spacing.md,
    lineHeight: 18,
  },
  btnBatchDelete: {
    backgroundColor: Colors.errorLight,
    borderWidth: 1,
    borderColor: Colors.errorBorder,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  btnBatchDeleteDisabled: {
    backgroundColor: Colors.disabledBg,
    borderColor: Colors.border,
    opacity: 0.6,
  },
  btnBatchDeleteText: {
    color: Colors.error,
    fontWeight: '700',
    fontSize: 13,
  },
  btnBatchDeleteTextDisabled: {
    color: Colors.disabledText,
  },
  btnPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
});
