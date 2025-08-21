import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BottomStackParamList } from '../../../type';
import CoffeeListScreen from '../screens/CoffeeListScreen';
import CoffeeRecordListScreen from '../screens/CoffeeRecordListScreen';
import ReviewListScreen from '../screens/ReviewListScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AnalysisScreen from '../screens/AnalysisScreen';

const Tab = createBottomTabNavigator<BottomStackParamList>();

export default function BottomTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: true }}>
      <Tab.Screen name="Records" component={CoffeeRecordListScreen} options={{
        tabBarLabel: 'Records', title: 'Records'
      }} />
      <Tab.Screen name="Coffee" component={CoffeeListScreen} options={{
        tabBarLabel: 'Coffee', title: 'Coffee'
      }} />
      <Tab.Screen name="Reviews" component={ReviewListScreen} options={{
        tabBarLabel: 'Reviews', title: 'Reviews'
      }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{
        tabBarLabel: 'Profile', title: 'Profile'
      }} />
      <Tab.Screen name="Analysis" component={AnalysisScreen} options={{
        tabBarLabel: 'Analysis', title: 'Analysis'
      }} />
    </Tab.Navigator>
  )
}
