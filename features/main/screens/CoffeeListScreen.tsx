import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Coffee, CoffeeStackParamList } from '../../../type';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { listCoffees } from '../../auth/services/coffeeService';

export default function CoffeeListScreen() {
  const [coffees, setCoffees] = useState<Coffee[]>([]);

  useEffect(() => {
    fetchCoffees();
  }, []);

  const fetchCoffees = async () => {
    try {
      const data = await listCoffees();
      setCoffees(data);
    } catch (error) {
      console.error("Error fetching coffees:", error);
    }
  };

  type RecordsNav = NativeStackNavigationProp<CoffeeStackParamList, 'CoffeeHome'>;
  const navigation = useNavigation<RecordsNav>();

  const handleCreatePress = () => {
    navigation.navigate('CoffeeCreate');
  };
  const handleDetailPress = (id: string) => {
    navigation.navigate('CoffeeDetails', { id });
  };

  const coffeeItems = coffees.map((coffee) => (
    <View key={coffee.id} style={{ padding: 8, borderBottomWidth: 1, borderBottomColor: '#ccc' }}>
      <Text style={{ fontSize: 18 }}>{coffee.name}</Text>
      <Text style={{ color: '#666' }}>{coffee.comments}</Text>
      <TouchableOpacity onPress={() => handleDetailPress(coffee.id)}>
        <Text style={{ color: '#007AFF', marginTop: 4 }}>View Details</Text>
      </TouchableOpacity>
    </View>
  ));

  return (
    <View>
      <Text>CoffeeListScreen</Text>

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
          コーヒーを追加する
        </Text>
      </TouchableOpacity>
      {coffeeItems}
    </View>
  )
}

const styles = StyleSheet.create({})
