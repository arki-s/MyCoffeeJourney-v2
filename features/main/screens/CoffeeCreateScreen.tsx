import { ScrollView, View } from 'react-native'
import React, { useState } from 'react'
import { CoffeeStackParamList } from '../../../type';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { useUserStore } from '../../../stores/useUserStore';
import { createCoffee, setCoffeeBeanInclusions } from '../../auth/services/coffeeService';
import CoffeeForm from '../components/CoffeeForm';
import { CoffeeFormSubmitValue, initialCoffeeFormValue } from '../components/CoffeeForm.shared';

export default function CoffeeCreateScreen() {
  const user = useUserStore((state) => state.user);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  type RecordsNav = NativeStackNavigationProp<CoffeeStackParamList, 'CoffeeCreate'>;
  const navigation = useNavigation<RecordsNav>();

  const handleCoffeeCreate = async (form: CoffeeFormSubmitValue) => {
    if (!user) return;

    try {
      setError(null);
      setLoading(true);

      const response = await createCoffee(
        form.name,
        form.brand_id,
        form.comments,
        form.photo_url,
        form.roast_level,
        form.body,
        form.sweetness,
        form.fruity,
        form.bitter,
        form.aroma
      );

      await setCoffeeBeanInclusions(response.id, form.includedBeans);
      navigation.navigate('CoffeeHome');
    } catch (createError) {
      console.error('Error creating coffee:', createError);
      setError('※コーヒーの作成に失敗しました。もう一度お試しください。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      className="flex-1 border-2 border-OCHER bg-DARK_BROWN"
      contentContainerStyle={{ flexGrow: 1, paddingBottom: 24 }}
    >
      <View className="px-5 py-6">
        <CoffeeForm
          mode="create"
          initialValue={initialCoffeeFormValue}
          loading={loading}
          error={error}
          onSubmit={handleCoffeeCreate}
        />
      </View>
    </ScrollView>
  )
}
