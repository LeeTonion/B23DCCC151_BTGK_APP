import React from 'react';
import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import { RootStackParamList, RootTabParamList } from '../types/task';
import { HomeScreen } from '../screens/HomeScreen';
import { OverdueScreen } from '../screens/OverdueScreen';
import { StatsScreen } from '../screens/StatsScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { TaskFormScreen } from '../screens/TaskFormScreen';
import { DetailScreen } from '../screens/DetailScreen';
import { CustomTabBar } from '../components/CustomTabBar';
import { Colors } from '../theme';

const Tab = createBottomTabNavigator<RootTabParamList>();
const Stack = createNativeStackNavigator<RootStackParamList>();

// Empty component for the center Tab placeholder
const DummyComponent = () => <View />;

function MainTabNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="TasksTab"
        component={HomeScreen}
        options={{ title: 'Công việc' }}
      />
      <Tab.Screen
        name="OverdueTab"
        component={OverdueScreen}
        options={{ title: 'Quá hạn' }}
      />
      <Tab.Screen
        name="AddPlaceholder"
        component={DummyComponent}
        options={{ title: 'Thêm' }}
      />
      <Tab.Screen
        name="StatsTab"
        component={StatsScreen}
        options={{ title: 'Thống kê' }}
      />
      <Tab.Screen
        name="SettingsTab"
        component={SettingsScreen}
        options={{ title: 'Cài đặt' }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="MainTabs"
        screenOptions={{
          headerStyle: {
            backgroundColor: Colors.card,
          },
          headerTintColor: Colors.primary,
          headerTitleStyle: {
            fontWeight: '700',
            fontSize: 17,
            color: Colors.textPrimary,
          },
          headerShadowVisible: true,
          contentStyle: {
            backgroundColor: Colors.background,
          },
        }}
      >
        <Stack.Screen
          name="MainTabs"
          component={MainTabNavigator}
          options={{
            headerShown: false,
          }}
        />

        {/* Backwards compatibility if any screen targets 'Home' */}
        <Stack.Screen
          name="Home"
          component={MainTabNavigator}
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen
          name="TaskForm"
          component={TaskFormScreen}
          options={({ route }) => ({
            title: route.params?.task
              ? 'Chỉnh Sửa Công Việc'
              : 'Thêm Công Việc Mới',
            headerBackTitle: 'Quay lại',
          })}
        />

        <Stack.Screen
          name="Detail"
          component={DetailScreen}
          options={{
            title: 'Chi Tiết Kế Hoạch',
            headerBackTitle: 'Quay lại',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}