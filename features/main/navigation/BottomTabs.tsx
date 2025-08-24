import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BottomStackParamList } from '../../../type';
import CoffeeListScreen from '../screens/CoffeeListScreen';
import ReviewListScreen from '../screens/ReviewListScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AnalysisScreen from '../screens/AnalysisScreen';
import CoffeeRecordsStack from './CoffeeRecordsStack';

const Tab = createBottomTabNavigator<BottomStackParamList>();

export default function BottomTabs() {
  return (
    <Tab.Navigator screenOptions={{ headerShown: true, popToTopOnBlur: true }}>
      <Tab.Screen name="Records" component={CoffeeRecordsStack} options={{
        tabBarLabel: 'Records', title: 'Records'
      }} />
      <Tab.Screen name="Coffee" component={CoffeeListScreen} options={{
        tabBarLabel: 'Coffee', title: 'Coffee'
      }} />
      <Tab.Screen name="Reviews" component={ReviewListScreen} options={{
        tabBarLabel: 'Reviews', title: 'Reviews'
      }} />
      <Tab.Screen name="Analysis" component={AnalysisScreen} options={{
        tabBarLabel: 'Analysis', title: 'Analysis'
      }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{
        tabBarLabel: 'Profile', title: 'Profile'
      }} />
    </Tab.Navigator>
  )
}
