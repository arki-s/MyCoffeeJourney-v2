import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import CoffeeRecordListScreen from '../screens/CoffeeRecordListScreen';
import CoffeeDetailScreen from '../screens/CoffeeDetailScreen';
import { RecordsStackParamList } from '../../../type';

const Stack = createNativeStackNavigator<RecordsStackParamList>();

export default function CoffeeRecordsStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Records" component={CoffeeRecordListScreen} />
      <Stack.Screen name="RecordDetails" component={CoffeeDetailScreen} />
    </Stack.Navigator>
  )
}
