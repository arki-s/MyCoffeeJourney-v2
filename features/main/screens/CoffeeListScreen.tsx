import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { CoffeeStackParamList } from '../../../type';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';

export default function CoffeeListScreen() {
  type RecordsNav = NativeStackNavigationProp<CoffeeStackParamList, 'Coffee'>;
  const navigation = useNavigation<RecordsNav>();

  const handleDetailPress = (id: string) => {
    navigation.navigate('CoffeeDetails', { id });
  };

  return (
    <View>
      <Text>CoffeeListScreen</Text>
      <Text onPress={() => handleDetailPress('123')}>Go to Coffee Details (ID: 123)</Text>
    </View>
  )
}

const styles = StyleSheet.create({})
