import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CoffeeDetailScreen from '../screens/CoffeeDetailScreen';
import { CoffeeStackParamList } from '../../../type';
import CoffeeListScreen from '../screens/CoffeeListScreen';

const Stack = createNativeStackNavigator<CoffeeStackParamList>();

export default function CoffeeRecordsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="CoffeeHome" component={CoffeeListScreen} />
      <Stack.Screen name="CoffeeDetails" component={CoffeeDetailScreen} />
    </Stack.Navigator>
  )
}
