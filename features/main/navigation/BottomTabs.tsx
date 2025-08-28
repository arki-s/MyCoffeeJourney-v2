import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BottomStackParamList } from '../../../type';
import ReviewListScreen from '../screens/ReviewListScreen';
import AnalysisScreen from '../screens/AnalysisScreen';
import CoffeeRecordsStack from './CoffeeRecordsStack';
import CoffeeStack from './CoffeeStack';
import SettingStack from './SettingStack';
import CalendarScreen from '../screens/CalendarScreen';

const Tab = createBottomTabNavigator<BottomStackParamList>();

export default function BottomTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: true, popToTopOnBlur: true }}>
      <Tab.Screen name="Records" component={CoffeeRecordsStack} options={{
        tabBarLabel: 'Records', title: 'Records'
      }} />
      <Tab.Screen name="Calendar" component={CalendarScreen} options={{
        tabBarLabel: 'Calendar', title: 'Calendar'
      }} />
      <Tab.Screen name="Coffee" component={CoffeeStack} options={{
        tabBarLabel: 'Coffee', title: 'Coffee'
      }} />
      <Tab.Screen name="Reviews" component={ReviewListScreen} options={{
        tabBarLabel: 'Reviews', title: 'Reviews'
      }} />
      <Tab.Screen name="Analysis" component={AnalysisScreen} options={{
        tabBarLabel: 'Analysis', title: 'Analysis'
      }} />
      <Tab.Screen name="Settings" component={SettingStack} options={{
        tabBarLabel: 'Settings', title: 'Settings'
      }} />
    </Tab.Navigator>
  )
}
