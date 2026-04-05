import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native';
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
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';

const Tab = createBottomTabNavigator<BottomStackParamList>();

const screenTitleMap: Record<string, string> = {
  Records: 'Records',
  RecordsHome: 'Records',
  RecordCreate: 'Record Create',
  RecordDetails: 'Record Details',
  Calendar: 'Calendar',
  Coffee: 'Coffee',
  CoffeeHome: 'Coffee',
  CoffeeCreate: 'Coffee Create',
  CoffeeDetails: 'Coffee Details',
  Reviews: 'Reviews',
  Analysis: 'Analysis',
  Settings: 'Settings',
  SettingsHome: 'Settings',
  Brands: 'Brands',
  Beans: 'Beans',
  GrindSize: 'Grind Size',
};

function getCurrentScreenTitle(route: { name: string; state?: unknown }) {
  const focusedRouteName = getFocusedRouteNameFromRoute(route) ?? route.name;
  return screenTitleMap[focusedRouteName] ?? screenTitleMap[route.name] ?? route.name;
}

export default function BottomTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route, navigation }) => {
        const focusedRouteName = getFocusedRouteNameFromRoute(route) ?? route.name;
        const showBackButton = ['RecordCreate', 'CoffeeDetails', 'CoffeeCreate', 'Brands', 'Beans', 'GrindSize'].includes(focusedRouteName);
        const handleHeaderBackPress = () => {
          if (focusedRouteName === 'RecordCreate') {
            navigation.navigate('Records', { screen: 'RecordsHome' });
            return;
          }

          if (focusedRouteName === 'CoffeeDetails' || focusedRouteName === 'CoffeeCreate') {
            navigation.navigate('Coffee', { screen: 'CoffeeHome' });
            return;
          }

          navigation.navigate('Settings', { screen: 'SettingsHome' });
        };

        return {
          headerShown: true,
          headerTitle: () => (
            <View style={{ alignItems: 'center' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={{ marginRight: 8 }}>
                  <CoffeeIcon color={colors.OCHER} size={24} />
                </View>
                <Text
                  style={{
                    fontFamily: fonts.header_footer,
                    fontSize: 24,
                    color: colors.OCHER,
                  }}
                >
                  My Coffee Journey
                </Text>
              </View>
              <Text
                style={{
                  fontFamily: fonts.header_footer,
                  fontSize: 16,
                  color: colors.OCHER,
                  textAlign: 'center',
                  marginTop: 2,
                }}
              >
                {getCurrentScreenTitle(route)}
              </Text>
            </View>
          ),
          headerLeft: showBackButton ? () => (
            <TouchableOpacity
              onPress={handleHeaderBackPress}
              style={{ marginLeft: 16 }}
            >
              <FontAwesome5 name="arrow-circle-left" size={28} color={colors.OCHER} />
            </TouchableOpacity>
          ) : undefined,
          headerTitleAlign: 'center',
          headerStyle: {
            backgroundColor: colors.DARK_BROWN,
            height: 104,
          },
          headerTitleContainerStyle: {
            justifyContent: 'center',
          },
          popToTopOnBlur: true,
          tabBarStyle: {
            backgroundColor: colors.DARK_BROWN
          },
          tabBarActiveTintColor: colors.OCHER,
          tabBarInactiveTintColor: colors.LIGHT_BROWN,
          tabBarLabelStyle: {
            fontFamily: fonts.header_footer,
            fontSize: 12
          },
          tabBarIcon: ({ color = colors.OCHER, size = 24 }) => {
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
        };
      }}
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
