import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  Switch,
  StyleSheet,
  Alert,
  StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTasks } from '../context/TaskContext';
import { Colors, Spacing, Typography } from '../theme';

const USER_INFO_KEY = '@planner_user_info_v1';
const SETTINGS_KEY = '@planner_app_settings_v1';

export const SettingsScreen: React.FC = () => {
  const { resetSampleTasks, clearAllTasks } = useTasks();

  const [userName, setUserName] = useState<string>('');
  const [userNote, setUserNote] = useState<string>('');
  const [isSaved, setIsSaved] = useState<boolean>(false);

  // App settings state
  const [notifyOverdue, setNotifyOverdue] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [autoSort, setAutoSort] = useState<boolean>(true);

  // Load user info & settings on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const userJson = await AsyncStorage.getItem(USER_INFO_KEY);
        if (userJson) {
          const data = JSON.parse(userJson);
          setUserName(data.name || '');
          setUserNote(data.note || '');
        }

        const settingsJson = await AsyncStorage.getItem(SETTINGS_KEY);
        if (settingsJson) {
          const cfg = JSON.parse(settingsJson);
          if (cfg.notifyOverdue !== undefined) setNotifyOverdue(cfg.notifyOverdue);
          if (cfg.soundEnabled !== undefined) setSoundEnabled(cfg.soundEnabled);
          if (cfg.autoSort !== undefined) setAutoSort(cfg.autoSort);
        }
      } catch (e) {
        console.error('Error loading settings:', e);
      }
    };
    loadData();
  }, []);

  // Save user info
  const handleSaveUserInfo = async () => {
    try {
      await AsyncStorage.setItem(
        USER_INFO_KEY,
        JSON.stringify({
          name: userName,
          note: userNote,
        })
      );
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2500);
      Alert.alert('Thành công', 'Đã lưu thông tin cá nhân vào máy.');
    } catch (e) {
      Alert.alert('Lỗi', 'Không thể lưu thông tin.');
    }
  };

  // Toggle settings
  const updateSetting = async (key: string, val: boolean) => {
    const newSettings = {
      notifyOverdue: key === 'notifyOverdue' ? val : notifyOverdue,
      soundEnabled: key === 'soundEnabled' ? val : soundEnabled,
      autoSort: key === 'autoSort' ? val : autoSort,
    };
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
  };

  // Reset sample tasks
  const handleResetSampleTasks = () => {
    Alert.alert(
      'Khôi phục dữ liệu mẫu',
      'Thao tác này sẽ đặt lại danh sách công việc về các công việc mẫu ban đầu. Bạn có chắc chắn?',
      [
        { text: 'Huỷ', style: 'cancel' },
        {
          text: 'Khôi phục',
          style: 'destructive',
          onPress: async () => {
            await resetSampleTasks();
            Alert.alert('Thành công', 'Đã khôi phục dữ liệu mẫu thành công!');
          },
        },
      ]
    );
  };

  // Clear all tasks
  const handleClearAllTasks = () => {
    Alert.alert(
      'Xác nhận xoá toàn bộ',
      'Bạn có chắc chắn muốn xoá TẤT CẢ công việc trong ứng dụng không? Dữ liệu sẽ biến mất hoàn toàn.',
      [
        { text: 'Huỷ', style: 'cancel' },
        {
          text: 'Xoá tất cả',
          style: 'destructive',
          onPress: async () => {
            await clearAllTasks();
            Alert.alert('Đã xoá', 'Đã làm trống toàn bộ danh sách công việc.');
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
        <Text style={styles.headerSub}>TUỲ CHỈNH HỆ THỐNG</Text>
        <Text style={styles.headerTitle}>Cài Đặt</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* App Preferences Settings */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>⚙️ Tuỳ chọn ứng dụng</Text>

          <View style={styles.settingItem}>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>Cảnh báo công việc quá hạn</Text>
              <Text style={styles.settingDesc}>Hiển thị huy hiệu đỏ khi có việc trễ hạn</Text>
            </View>
            <Switch
              value={notifyOverdue}
              onValueChange={(val) => {
                setNotifyOverdue(val);
                updateSetting('notifyOverdue', val);
              }}
              trackColor={{ false: Colors.border, true: Colors.primaryLight }}
              thumbColor={notifyOverdue ? Colors.primary : Colors.disabledText}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.settingItem}>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>Âm thanh & Rung phản hồi</Text>
              <Text style={styles.settingDesc}>Phản hồi xúc giác khi tương tác</Text>
            </View>
            <Switch
              value={soundEnabled}
              onValueChange={(val) => {
                setSoundEnabled(val);
                updateSetting('soundEnabled', val);
              }}
              trackColor={{ false: Colors.border, true: Colors.primaryLight }}
              thumbColor={soundEnabled ? Colors.primary : Colors.disabledText}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.settingItem}>
            <View style={styles.settingTextContainer}>
              <Text style={styles.settingTitle}>Tự động sắp xếp theo hạn chót</Text>
              <Text style={styles.settingDesc}>Đưa các công việc cận kề lên đầu danh sách</Text>
            </View>
            <Switch
              value={autoSort}
              onValueChange={(val) => {
                setAutoSort(val);
                updateSetting('autoSort', val);
              }}
              trackColor={{ false: Colors.border, true: Colors.primaryLight }}
              thumbColor={autoSort ? Colors.primary : Colors.disabledText}
            />
          </View>
        </View>

        {/* User Profile Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>👤 Thông tin người dùng</Text>
          <Text style={styles.cardSubtitle}>
            Thông tin cá nhân hoá và ghi nhớ trên thiết bị này.
          </Text>

          <Text style={styles.inputLabel}>Tên của bạn</Text>
          <TextInput
            value={userName}
            onChangeText={setUserName}
            placeholder="Ví dụ: Nguyễn Văn A"
            placeholderTextColor={Colors.textMuted}
            style={styles.textInput}
          />

          <Text style={styles.inputLabel}>Ghi chú mục tiêu cá nhân</Text>
          <TextInput
            value={userNote}
            onChangeText={setUserNote}
            placeholder="Ví dụ: Hoàn thành mọi kế hoạch đúng hạn!"
            placeholderTextColor={Colors.textMuted}
            style={styles.textInput}
          />

          <Pressable
            accessibilityRole="button"
            onPress={handleSaveUserInfo}
            style={({ pressed }) => [styles.btnSave, pressed && styles.btnPressed]}
          >
            <Text style={styles.btnSaveText}>
              {isSaved ? '✓ Đã lưu thành công' : '💾 Lưu thông tin'}
            </Text>
          </Pressable>
        </View>

        {/* Data Management Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🗄️ Quản lý dữ liệu</Text>
          <Text style={styles.cardSubtitle}>
            Các thao tác đồng bộ và sao lưu dữ liệu trong máy.
          </Text>

          <Pressable
            accessibilityRole="button"
            onPress={handleResetSampleTasks}
            style={({ pressed }) => [styles.btnSecondary, pressed && styles.btnPressed]}
          >
            <Text style={styles.btnSecondaryText}>🔄 Khôi phục dữ liệu mẫu</Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={handleClearAllTasks}
            style={({ pressed }) => [styles.btnDanger, pressed && styles.btnPressed]}
          >
            <Text style={styles.btnDangerText}>⚠️ Xoá toàn bộ dữ liệu ứng dụng</Text>
          </Pressable>
        </View>

        {/* About Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>ℹ️ Thông tin ứng dụng</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Tên ứng dụng:</Text>
            <Text style={styles.infoValue}>Quản Lý Kế Hoạch Cá Nhân</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Phiên bản:</Text>
            <Text style={styles.infoValue}>v1.0.0 (Release)</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Công nghệ:</Text>
            <Text style={styles.infoValue}>React Native CLI • AsyncStorage</Text>
          </View>
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
  card: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.sm,
    marginBottom: Spacing.md,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  cardSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
    marginBottom: Spacing.md,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.xs + 2,
  },
  settingTextContainer: {
    flex: 1,
    paddingRight: Spacing.md,
  },
  settingTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  settingDesc: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.borderLight,
    marginVertical: Spacing.xs + 2,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  textInput: {
    backgroundColor: Colors.background,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 8,
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    fontSize: 13,
    color: Colors.textPrimary,
    marginBottom: Spacing.sm,
  },
  btnSave: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: Spacing.xs,
  },
  btnSaveText: {
    color: Colors.textInverse,
    fontWeight: '700',
    fontSize: 13,
  },
  btnSecondary: {
    backgroundColor: Colors.primaryLight,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  btnSecondaryText: {
    color: Colors.primary,
    fontWeight: '700',
    fontSize: 12,
  },
  btnDanger: {
    backgroundColor: Colors.errorLight,
    borderWidth: 1,
    borderColor: Colors.errorBorder,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
  },
  btnDangerText: {
    color: Colors.error,
    fontWeight: '700',
    fontSize: 12,
  },
  btnPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.xs + 2,
  },
  infoLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  infoValue: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
});
