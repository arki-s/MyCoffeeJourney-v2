import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React from 'react'
import { CoffeeStackParamList } from '../../../type';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';

export default function CoffeeCreateScreen() {
  type RecordsNav = NativeStackNavigationProp<CoffeeStackParamList, 'CoffeeCreate'>;
  const navigation = useNavigation<RecordsNav>();

  const handleHomePress = () => {
    navigation.navigate('CoffeeHome');
  };

  return (
    <View>
      <Text>CoffeeCreateScreen</Text>

      <TouchableOpacity
        onPress={() => handleHomePress()}
        style={{
          backgroundColor: '#34C759',
          padding: 12,
          marginTop: 16,
          borderRadius: 8,
        }}
      >
        <Text style={{ color: '#fff', textAlign: 'center' }}>
          コーヒー一覧へ戻る
        </Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({})
