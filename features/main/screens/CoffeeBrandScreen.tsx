import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { SettingStackParamList } from '../../../type';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';

export default function CoffeeBrandScreen() {
  type RecordsNav = NativeStackNavigationProp<SettingStackParamList, 'Brands'>;
  const navigation = useNavigation<RecordsNav>();

  const handleSettingPress = () => {
    navigation.navigate('Settings');
  };

  return (
    <View>
      <Text>CoffeeBrandScreen</Text>
      <Text onPress={() => handleSettingPress()}>Go to Settings</Text>
    </View>
  )
}

const styles = StyleSheet.create({})
