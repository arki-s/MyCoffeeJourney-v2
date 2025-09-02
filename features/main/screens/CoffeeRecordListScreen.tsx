import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { RecordsStackParamList } from '../../../type';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

export default function CoffeeRecordListScreen() {
  type RecordsNav = NativeStackNavigationProp<RecordsStackParamList, 'RecordsHome'>;
  const navigation = useNavigation<RecordsNav>();

  const handleCreatePress = () => {
    navigation.navigate('RecordCreate');
  };

  const handleDetailPress = (id: string) => {
    navigation.navigate('RecordDetails', { id });
  };

  return (
    <View>
      <Text>CoffeeRecordListScreen</Text>
      <Text onPress={() => handleDetailPress('123')}>Go to Record Details (ID: 123)</Text>

      <TouchableOpacity
        onPress={() => handleCreatePress()}
        style={{
          backgroundColor: '#34C759',
          padding: 12,
          marginTop: 16,
          borderRadius: 8,
        }}
      >
        <Text style={{ color: '#fff', textAlign: 'center' }}>
          飲んでるコーヒー記録登録画面へ
        </Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({})
