import { Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { CoffeeStackParamList } from '../../../type';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { useUserStore } from '../../../stores/useUserStore';
import { createCoffee, setCoffeeBeanInclusions } from '../../auth/services/coffeeService';
import { listBeans } from '../../auth/services/beanService';
import SelectModal from '../components/SelectModal';
import { listBrands } from '../../auth/services/brandService';

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
    brand_id: ''
  });
  const [brands, setBarnds] = useState<{ id: string, label: string }[]>([]);
  const [beans, setBeans] = useState<{ id: string, label: string }[]>([]);
  const [includedBeans, setIncludedbeans] = useState<string[]>([]);
  const [modalVisible, setModalVisible] = useState<"brand" | "bean" | null>(null);

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
        handleHomePress();
      } catch (error) {
        console.error("Error creating coffee inclusions:", error);
      }

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

  useEffect(() => {
    fetchBrands();
    fetchBeans();
  }, [])

  const fetchBrands = async () => {
    try {
      const brandData = await listBrands();
      setBarnds(brandData.map((b) => { return { id: b.id, label: b.name } }));
    } catch (error) {
      console.error("Error fetching brands", error);
    }
  }

  const fetchBeans = async () => {
    try {
      const beanData = await listBeans();
      setBeans(beanData.map((b) => { return { id: b.id, label: b.name } }));
    } catch (error) {
      console.error("Error fetching beans", error);
    }
  }

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

      <TouchableOpacity
        onPress={() => setModalVisible("brand")}
      >
        <Text>コーヒーブランドを選択</Text>
      </TouchableOpacity>

      <SelectModal
        visible={modalVisible === "brand"}
        isMulti={false}
        options={brands}
        selectedIds={[]}
        onChange={(id) => setNewCoffee({ ...newCoffee, brand_id: id[0] })}
        onClose={() => setModalVisible(null)}
      />

      <TextInput
        placeholder='コーヒー名を入力'
        value={newCoffee.name}
        onChangeText={(text) => setNewCoffee({ ...newCoffee, name: text })}
        keyboardType='default'
        autoCapitalize='none'
        autoCorrect={false}
      />

      <TouchableOpacity
        onPress={() => setModalVisible("bean")}
      >
        <Text>コーヒー豆を選択</Text>
      </TouchableOpacity>

      <SelectModal
        visible={modalVisible === "bean"}
        options={beans}
        selectedIds={includedBeans}
        onChange={(ids) => setIncludedbeans(ids)}
        onClose={() => setModalVisible(null)}
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
        <Text style={{ color: '#fd0303ff', textAlign: 'center' }}>
          {error ? error : ''}
        </Text>
      </TouchableOpacity>


    </View>
  )
}

// const styles = StyleSheet.create({})
