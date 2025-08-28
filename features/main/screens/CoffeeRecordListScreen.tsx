import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { RecordsStackParamList } from '../../../type';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export default function CoffeeRecordListScreen() {
  type RecordsNav = NativeStackNavigationProp<RecordsStackParamList, 'RecordsHome'>;
  const navigation = useNavigation<RecordsNav>();

  const handleDetailPress = (id: string) => {
    navigation.navigate('RecordDetails', { id });
  };

  return (
    <View>
      <Text>CoffeeRecordListScreen</Text>
      <Text onPress={() => handleDetailPress('123')}>Go to Record Details (ID: 123)</Text>
    </View>
  )
}

const styles = StyleSheet.create({})
