import { ScrollView, Text, TouchableOpacity, View } from 'react-native'
import React, { useCallback, useState } from 'react'
import { CoffeeStackParamList, CoffeeWithBrand } from '../../../type';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { listCoffees } from '../../auth/services/coffeeService';
import { fonts } from '../../../app/main/theme/fonts';
import { colors } from '../../../app/main/theme/colors';

export default function CoffeeListScreen() {
  const [coffees, setCoffees] = useState<CoffeeWithBrand[]>([]);

  useFocusEffect(
    useCallback(() => {
      fetchCoffees();
    }, [])
  );

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
    <View
      key={coffee.id}
      className="mb-3 rounded-2xl border border-[#E6DACE] bg-white/90 px-4 py-4"
    >
      <Text className="text-lg text-[#3B0D0C]" style={{ fontFamily: fonts.title_bold }}>
        {coffee.brandName}
      </Text>
      <Text className="text-base text-[#6A1B1A]" style={{ fontFamily: fonts.title_medium }}>
        {coffee.name}
      </Text>
      {coffee.comments && (
        <Text className="mt-1 text-sm text-[#6A1B1A]" style={{ fontFamily: fonts.body_regular }}>
          {coffee.comments}
        </Text>
      )}
      <TouchableOpacity
        className="mt-3 self-start rounded-full border border-[#6A1B1A] px-4 py-2"
        onPress={() => handleDetailPress(coffee.id)}
      >
        <Text className="text-sm text-[#6A1B1A]" style={{ fontFamily: fonts.body_bold }}>
          詳細画面へ
        </Text>
      </TouchableOpacity>
    </View>
  ));

  return (
    <ScrollView className="flex-1 bg-[#F6EFE7]">
      <View className="px-5 py-6">
        <Text
          className="mt-4 text-3xl text-[#3B0D0C]"
          style={{ fontFamily: fonts.title_bold }}
        >
          コーヒー一覧
        </Text>

        {coffees.length === 0 ? (
          <View className="mt-4 mb-3 rounded-2xl border border-[#E6DACE] bg-white/70 px-4 py-4">
            <Text className="text-lg text-[#3B0D0C]" style={{ fontFamily: fonts.title_bold }}>
              登録されているコーヒーはありません。
              {'\n'}追加しましょう！
            </Text>
          </View>
        ) : (
          <View className="mt-4">{coffeeItems}</View>
        )}

        <TouchableOpacity
          className="mt-8 w-full rounded-full bg-[#6A1B1A] py-4"
          onPress={() => handleCreatePress()}
        >
          <Text
            className="text-center text-base"
            style={{ fontFamily: fonts.body_bold, color: colors.accent }}
          >
            コーヒーを追加する
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

// const styles = StyleSheet.create({})
