import React from 'react'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { BottomStackParamList } from '../../../type';
import ReviewListScreen from '../screens/ReviewListScreen';
import AnalysisScreen from '../screens/AnalysisScreen';
import CoffeeRecordsStack from './CoffeeRecordsStack';
import CoffeeStack from './CoffeeStack';
import SettingStack from './SettingStack';
import CalendarScreen from '../screens/CalendarScreen';
import CalendarIcon from '../../../app/main/icons/CalendarIcon';
import { colors } from '../../../app/main/theme/colors';
import AnalysisIcon from '../../../app/main/icons/AnalysisIcon';
import CoffeeIcon from '../../../app/main/icons/CoffeeIcon';
import BeanIcon from '../../../app/main/icons/BeanIcon';
import MessageIcon from '../../../app/main/icons/MessageIcon';
import SettingsIcon from '../../../app/main/icons/SettingsIcon';
import { fonts } from '../../../app/main/theme/fonts';

const Tab = createBottomTabNavigator<BottomStackParamList>();

export default function BottomTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: true,
        headerTitle: "My Coffee Journey",
        headerTitleAlign: 'center',
        headerStyle: {
          backgroundColor: colors.primary,
        },
        headerTitleStyle: {
          backgroundColor: colors.primary,
          fontFamily: fonts.body_bold,
          fontSize: 24,
          color: colors.accent,
        },
        popToTopOnBlur: true,
        tabBarStyle: {
          backgroundColor: colors.primary
        },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.primary_light,
        tabBarLabelStyle: {
          fontFamily: fonts.body_regular,
          fontSize: 12
        },
        tabBarIcon: ({ color = colors.accent, size = 24 }) => {
          switch (route.name) {
            case 'Coffee':
              return <BeanIcon color={color} size={size} />;
            case 'Calendar':
              return <CalendarIcon color={color} size={size} />;
            case 'Analysis':
              return <AnalysisIcon color={color} size={size} />;
            case 'Records':
              return <CoffeeIcon color={color} size={size} />;
            case 'Reviews':
              return <MessageIcon color={color} size={size} />;
            case 'Settings':
              return <SettingsIcon color={color} size={size} />;
            default:
              return null;
          }
        },
      })}
    >
      <Tab.Screen
        name="Records"
        component={CoffeeRecordsStack}
        options={{ tabBarLabel: 'Records', title: 'Records' }}
      />
      <Tab.Screen
        name="Calendar"
        component={CalendarScreen}
        options={{ tabBarLabel: 'Calendar', title: 'Calendar' }}
      />
      <Tab.Screen
        name="Coffee"
        component={CoffeeStack}
        options={{ tabBarLabel: 'Coffee', title: 'Coffee' }}
      />
      <Tab.Screen
        name="Reviews"
        component={ReviewListScreen}
        options={{ tabBarLabel: 'Reviews', title: 'Reviews' }}
      />
      <Tab.Screen
        name="Analysis"
        component={AnalysisScreen}
        options={{ tabBarLabel: 'Analysis', title: 'Analysis' }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingStack}
        options={{ tabBarLabel: 'Settings', title: 'Settings' }}
      />
    </Tab.Navigator>
  )
}
