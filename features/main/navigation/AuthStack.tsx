import React from 'react';
import { Text, View } from 'react-native';
import { createNativeStackNavigator, NativeStackNavigationOptions } from '@react-navigation/native-stack';
import LoginScreen from '../../auth/screens/LoginScreen';
import { colors } from '../../../app/main/theme/colors';
import { fonts } from '../../../app/main/theme/fonts';
import CoffeeIcon from '../../../app/main/icons/CoffeeIcon';

const Stack = createNativeStackNavigator();

const headerOptions: NativeStackNavigationOptions = {
  headerShown: true,
  header: () => (
    <View
      style={{
        height: 120,
        backgroundColor: colors.DARK_BROWN,
        alignItems: 'center',
        justifyContent: 'flex-end',
      }}
    >
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
            marginBottom: 2,
          }}
        >
          Login
        </Text>
      </View>
    </View>
  ),
  headerStyle: {
    backgroundColor: colors.DARK_BROWN,
  },
  headerShadowVisible: false,
};

export default function AuthStack() {
  return (
    <Stack.Navigator screenOptions={headerOptions}>
      <Stack.Screen name="Login" component={LoginScreen} />
    </Stack.Navigator>
  );
}
