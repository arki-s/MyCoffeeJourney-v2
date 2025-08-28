import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CoffeeRecordListScreen from '../screens/CoffeeRecordListScreen';
import { RecordsStackParamList } from '../../../type';
import CoffeeRecordScreen from '../screens/CoffeeRecordScreen';

const Stack = createNativeStackNavigator<RecordsStackParamList>();

export default function CoffeeRecordsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="RecordsHome" component={CoffeeRecordListScreen} />
      <Stack.Screen name="RecordDetails" component={CoffeeRecordScreen} />
    </Stack.Navigator>
  )
}
