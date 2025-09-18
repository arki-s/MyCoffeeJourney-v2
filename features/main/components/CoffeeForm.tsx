import { Modal, Text, TextInput, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import { listBeans } from '../../auth/services/beanService';
import MultiSelectModal from './MultiSelectModal';

type Props = {
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
  includedBeans: string[];
  loading?: boolean;
  error?: string | null;
  onSubmit: (data: {
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
    includedBeans: string[];
  }) => Promise<void>;
  onCancel: () => void;
}

export default function CoffeeForm(props: Props) {
  const [coffee, setCoffee] = useState<{
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
    name: props.name,
    comments: props.comments,
    photo_url: props.photo_url,
    roast_level: props.roast_level,
    body: props.body,
    sweetness: props.sweetness,
    fruity: props.fruity,
    bitter: props.bitter,
    aroma: props.aroma,
    brand_id: props.brand_id
  });
  const [includedBeans, setIncludedbeans] = useState<string[]>(props.includedBeans);
  const [beans, setBeans] = useState<{ id: string, label: string }[]>([]);
  const [modalVisible, setModalVisible] = useState<boolean>(false);

  useEffect(() => {
    fetchBeans();
  }, []);

  const fetchBeans = async () => {
    try {
      const beanData = await listBeans();
      setBeans(beanData.map((b) => { return { id: b.id, label: b.name } }));
    } catch (error) {
      console.error("Error fetching beans", error);
    }
  };

  return (
    <Modal>
      <Text style={{ marginTop: 30 }}>CoffeeUpdate</Text>

      <TextInput
        placeholder='コーヒー名を入力'
        value={coffee.name}
        onChangeText={(text) => setCoffee({ ...coffee, name: text })}
        keyboardType='default'
        autoCapitalize='none'
        autoCorrect={false}
      />

      {/* コーヒー豆産地を複数選択可能にする予定 */}
      <TouchableOpacity
        onPress={() => setModalVisible(true)}
      >
        <Text>コーヒー豆を選択</Text>
      </TouchableOpacity>

      <MultiSelectModal
        visible={modalVisible}
        options={beans}
        selectedIds={includedBeans}
        onChange={(ids) => setIncludedbeans(ids)}
        onClose={() => setModalVisible(false)}
      />

      <TextInput
        placeholder='コメントを入力'
        value={coffee.comments}
        onChangeText={(text) => setCoffee({ ...coffee, comments: text })}
        keyboardType='default'
        autoCapitalize='none'
        autoCorrect={false}
      />

      <TouchableOpacity
        onPress={props.onCancel}
        disabled={props.loading}
      >
        <Text>キャンセル</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => props.onSubmit({
          name: coffee.name,
          comments: coffee.comments,
          photo_url: coffee.photo_url,
          roast_level: coffee.roast_level,
          body: coffee.body,
          sweetness: coffee.sweetness,
          fruity: coffee.fruity,
          bitter: coffee.bitter,
          aroma: coffee.aroma,
          brand_id: coffee.brand_id,
          includedBeans: props.includedBeans
        })}
        disabled={props.loading}
      >
        <Text>保存</Text>
      </TouchableOpacity>
      {props.error ? <Text style={{ color: 'red' }}>{props.error}</Text> : null}

    </Modal>
  )
}

// const styles = StyleSheet.create({})
