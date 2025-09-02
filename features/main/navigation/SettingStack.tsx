import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SettingStackParamList } from '../../../type';
import CoffeeBrandScreen from '../screens/CoffeeBrandScreen';
import CoffeeBeanScreen from '../screens/CoffeeBeanScreen';
import SettingScreen from '../screens/SettingScreen';
import GrindSizeScreen from '../screens/GrindSizeScreen';

const Stack = createNativeStackNavigator<SettingStackParamList>();

export default function SettingStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SettingsHome" component={SettingScreen} />
      <Stack.Screen name="Brands" component={CoffeeBrandScreen} />
      <Stack.Screen name="Beans" component={CoffeeBeanScreen} />
      <Stack.Screen name="GrindSize" component={GrindSizeScreen} />
    </Stack.Navigator>
  )
}
