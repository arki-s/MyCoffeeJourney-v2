import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useState } from 'react'
import { CoffeeStackParamList } from '../../../type';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { useUserStore } from '../../../stores/useUserStore';
import { createCoffee, setCoffeeBeanInclusions } from '../../auth/services/coffeeService';

export default function CoffeeCreateScreen() {
  const user = useUserStore((state) => state.user);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [newCoffee, setNewCoffee] = useState<{
    name: string;
    comments: string;
    photo_url: string;
    roast_level: number;
    body: number;
    sweetness: number;
    fruity: number;
    bitter: number;
    aroma: number;
    brand_id: string;
  }>({
    name: '',
    comments: '',
    photo_url: '',
    roast_level: 1,
    body: 1,
    sweetness: 1,
    fruity: 1,
    bitter: 1,
    aroma: 1,
    brand_id: 'e8218a36-c99b-498c-8aed-bc05082b16de' //仮のbrand_id
  });
  const [includedBeans, setIncludedBeans] = useState<string[]>([
    '2709d8a3-7b26-4af2-ae8b-ed0a45b29348' //仮のbean_id
  ]);

  type RecordsNav = NativeStackNavigationProp<CoffeeStackParamList, 'CoffeeCreate'>;
  const navigation = useNavigation<RecordsNav>();

  const handleHomePress = () => {
    navigation.navigate('CoffeeHome');
  };

  //コーヒー新規登録、作成に成功したら一覧画面に戻り、失敗の場合はエラー表示
  const handleCoffeeCreate = async (newCoffee: {
    name: string;
    comments: string;
    photo_url: string;
    roast_level: number;
    body: number;
    sweetness: number;
    fruity: number;
    bitter: number;
    aroma: number;
    brand_id: string;
  }) => {
    if (!user) return;
    try {
      setLoading(true);
      const response = await createCoffee(newCoffee.name, newCoffee.brand_id, newCoffee.comments, newCoffee.photo_url, newCoffee.roast_level, newCoffee.body, newCoffee.sweetness, newCoffee.fruity, newCoffee.bitter, newCoffee.aroma);

      try {
        await setCoffeeBeanInclusions(response.id, includedBeans);
      } catch (error) {
        console.error("Error creating coffee inclusions:", error);
      }

      handleHomePress();

    } catch (error) {
      console.error("Error creating coffee:", error);
      setError("コーヒーの作成に失敗しました。");
    } finally {
      setLoading(false);
      // setNewCoffeeName({
      //   name: '',
      //   comments: null,
      //   photo_url: null,
      //   roast_level: 0,
      //   body: 0,
      //   sweetness: 0,
      //   fruity: 0,
      //   bitter: 0,
      //   aroma: 0,
      //   user_id: '',
      //   brand_id: ''
      // });
    }

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

      <TextInput
        placeholder='コーヒー名を入力'
        value={newCoffee.name}
        onChangeText={(text) => setNewCoffee({ ...newCoffee, name: text })}
        keyboardType='default'
        autoCapitalize='none'
        autoCorrect={false}
      />
      <TextInput
        placeholder='コメントを入力'
        value={newCoffee.comments}
        onChangeText={(text) => setNewCoffee({ ...newCoffee, comments: text })}
        keyboardType='default'
        autoCapitalize='none'
        autoCorrect={false}
      />
      <TouchableOpacity
        onPress={() => handleCoffeeCreate(newCoffee)}
        disabled={loading}
        style={{
          backgroundColor: loading ? '#ccc' : '#007AFF',
          padding: 12,
          marginTop: 16,
          borderRadius: 8,
        }}
      >
        <Text style={{ color: '#fff', textAlign: 'center' }}>
          {loading ? '保存中……' : 'コーヒーを登録'}
        </Text>
      </TouchableOpacity>


    </View>
  )
}

const styles = StyleSheet.create({})
