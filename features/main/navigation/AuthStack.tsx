import React from 'react';
import { createNativeStackNavigator, NativeStackNavigationOptions } from '@react-navigation/native-stack';
import LoginScreen from '../../auth/screens/LoginScreen';
import { colors } from '../../../app/main/theme/colors';
import { fonts } from '../../../app/main/theme/fonts';

const Stack = createNativeStackNavigator();

const headerOptions: NativeStackNavigationOptions = {
  headerShown: true,
  headerTitle: 'My Coffee Journey',
  headerTitleAlign: 'center',
  headerStyle: { backgroundColor: colors.primary },
  headerTitleStyle: {
    fontFamily: fonts.body_bold,
    fontSize: 24,
    color: colors.accent,
  },
};

export default function AuthStack() {
  return (
    <Stack.Navigator screenOptions={headerOptions}>
      <Stack.Screen name="Login" component={LoginScreen} />
    </Stack.Navigator>
  );
}
