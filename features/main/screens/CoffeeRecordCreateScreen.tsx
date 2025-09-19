import { Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useUserStore } from '../../../stores/useUserStore';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RecordsStackParamList } from '../../../type';
import { useNavigation } from '@react-navigation/native';
import { createDrinkingRecord, setDrinkingGrindSizes } from '../../auth/services/recordService';
import DateTimePicker from '@react-native-community/datetimepicker';
import { formatLocalYYYYMMDD } from '../../../utils/date';
import { listGrindSizes } from '../../auth/services/grindSizeService';
import SelectModal from '../components/SelectModal';


export default function CoffeeRecordCreateScreen() {
  const user = useUserStore((state) => state.user);

  // const [error, setError] = useState<string | null>(null);
  const [, setLoading] = useState<boolean>(false);

  const [newRecord, setNewRecord] = useState<{
    coffee_id: string;
    weight_grams: number;
    price_yen: number;
    purchase_date: string;
    start_date: string;
  }>({
    coffee_id: '78d173e0-1c3a-440a-b13f-b1759dc71686', // テスト用 ID
    weight_grams: 0,
    price_yen: 0,
    purchase_date: '',
    start_date: '',
  });

  const [selectedGrindSizes, setSelectedGrindSizes] = useState<string[]>([]);

  const [grindSizes, setGrindSizes] = useState<{ id: string, label: string }[]>([]);
  const [modalVisible, setModalVisible] = useState<boolean>(false);

  type RecordsNav = NativeStackNavigationProp<RecordsStackParamList, 'RecordCreate'>;
  const navigation = useNavigation<RecordsNav>();

  const handleHomePress = () => {
    navigation.navigate('RecordsHome');
  };

  useEffect(() => {
    fetchGrindSizes();
  }, [])

  const fetchGrindSizes = async () => {
    try {
      const data = await listGrindSizes();
      setGrindSizes(data.map((d) => { return { id: d.id, label: d.name } }));
    } catch (error) {
      console.error("Error fetching grind sizes:", error);
    }
  };

  const handleRecordCreate = async (newRecord: {
    coffee_id: string;
    weight_grams: number;
    price_yen: number;
    purchase_date: string;
    start_date: string;
  }) => {
    if (!user) return;
    setLoading(true);
    try {
      const response = await createDrinkingRecord(
        newRecord.weight_grams,
        newRecord.price_yen,
        newRecord.purchase_date,
        newRecord.coffee_id,
        newRecord.start_date,
      );

      try {
        await setDrinkingGrindSizes(response.id, selectedGrindSizes);
        navigation.navigate('RecordsHome');
      } catch (error) {
        console.error("Error creating grind size records:", error);
      }

    } catch (error) {
      console.error("Error creating record:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View>
      <Text>CoffeeRecordCreateScreen</Text>
      {/* コーヒー名のプルダウン選択追加予定 */}
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
      >
        <Text>挽き目を選択</Text>
      </TouchableOpacity>

      <SelectModal
        visible={modalVisible}
        options={grindSizes}
        selectedIds={selectedGrindSizes}
        onChange={(ids) => setSelectedGrindSizes(ids)}
        onClose={() => setModalVisible(false)} />

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
          レコード一覧へ戻る
        </Text>
      </TouchableOpacity>

      <TextInput
        placeholder='コーヒーの量(グラム)を入力'
        value={newRecord.weight_grams.toString()}
        onChangeText={(text) => {
          const sanitized = text.replace(/[^0-9]/g, '');
          setNewRecord(prev => ({ ...prev, weight_grams: sanitized ? parseInt(sanitized) : 0 }))
        }}
        keyboardType='numeric'
        autoCapitalize='none'
        autoCorrect={false}
      />
      <TextInput
        placeholder='価格を入力'
        value={newRecord.price_yen.toString()}
        onChangeText={(text) => {
          const sanitized = text.replace(/[^0-9]/g, '');
          setNewRecord(prev => ({ ...prev, price_yen: sanitized ? parseInt(sanitized) : 0 }))
        }}
        keyboardType='numeric'
        autoCapitalize='none'
        autoCorrect={false}
      />
      <Text>購入日を選択</Text>
      <DateTimePicker
        value={newRecord.purchase_date ? new Date(newRecord.purchase_date) : new Date()}
        mode="date"
        display="default"
        onChange={(event, selectedDate) => {
          const currentDate = selectedDate || new Date();
          setNewRecord(prev => ({ ...prev, purchase_date: formatLocalYYYYMMDD(currentDate) }))
        }}
      />
      <Text>飲み始めた日を選択</Text>
      <DateTimePicker
        value={newRecord.start_date ? new Date(newRecord.start_date) : new Date()}
        mode="date"
        display="default"
        onChange={(event, selectedDate) => {
          const currentDate = selectedDate || new Date();
          setNewRecord(prev => ({ ...prev, start_date: formatLocalYYYYMMDD(currentDate) }))
        }}
      />
      <TouchableOpacity
        onPress={() => handleRecordCreate(newRecord)}
        style={{
          backgroundColor: '#34C759',
          padding: 12,
          marginTop: 16,
          borderRadius: 8,
        }}
      >
        <Text style={{ color: '#fff', textAlign: 'center' }}>
          レコードを作成
        </Text>
      </TouchableOpacity>

    </View>
  )
}

// const styles = StyleSheet.create({})
