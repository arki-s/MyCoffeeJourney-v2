import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BottomTabs from './BottomTabs';
import { useEnsureUserRow } from '../../auth/hooks/useEnsureUserRow';

const Stack = createNativeStackNavigator();

export default function AppStack() {

  useEnsureUserRow();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs" component={BottomTabs} />
    </Stack.Navigator>
  );
}
