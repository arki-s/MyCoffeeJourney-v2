import { Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
// import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RecordDetail, RecordsStackParamList } from '../../../type';
// import { useNavigation } from '@react-navigation/native';
import { RouteProp } from '@react-navigation/native';
import { getRecordDetail, updateFinishedDrinkingRecord, updateUnfinishedDrinkingRecord } from '../../auth/services/recordService';
import RecordForm from '../components/RecordForm';

type CoffeeRecordScreenRouteProp = RouteProp<RecordsStackParamList, 'RecordDetails'>;

export default function CoffeeRecordScreen({ route }: { route: CoffeeRecordScreenRouteProp }) {
  const { id } = route.params;
  const [recordDetail, setRecordDetail] = useState<RecordDetail>();
  const [modalVisible, setModalVisible] = useState<"edit" | null>(null);
  const [, setDrinkingGrindSizes] = useState<string[]>([]);
  const [, setLoading] = useState<boolean>(false);
  const [canEditEndDate, setCanEditEndDate] = useState<boolean>(false);

  // type RecordsNav = NativeStackNavigationProp<RecordsStackParamList, 'RecordDetails'>;
  // const navigation = useNavigation<RecordsNav>();

  useEffect(() => {
    if (id) fetchRecordDetail(id);
  }, []);

  const fetchRecordDetail = async (id: string) => {
    try {
      const data = await getRecordDetail(id);
      setRecordDetail(data);

      if (data.end_date !== null && data.end_date !== "") setCanEditEndDate(true);

    } catch (error) {
      console.error("Error fetching record detail:", error);
    }
  };

  // const handleHomePress = () => {
  //   navigation.navigate('RecordsHome');
  // };

  async function handleEditSubmit(form: {
    weight_grams: number;
    price_yen: number;
    purchase_date: string;
    coffee_id: string;
    start_date: string;
    end_date: string | null;
    drinkingGrindSizes: string[];
  }) {
    if (!id || !recordDetail) return;
    try {
      setLoading(true);

      if (canEditEndDate) {
        await updateFinishedDrinkingRecord(
          recordDetail.id,
          form.weight_grams,
          form.price_yen,
          form.purchase_date,
          form.coffee_id,
          form.start_date,
          form.end_date ?? '',
        );
      }
      else {
        await updateUnfinishedDrinkingRecord(
          recordDetail.id,
          form.weight_grams,
          form.price_yen,
          form.purchase_date,
          form.coffee_id,
          form.start_date,
        );
      }

      setDrinkingGrindSizes(form.drinkingGrindSizes);
      fetchRecordDetail(id);

    } catch (error) {
      console.error("Error updating record:", error);

    } finally {
      setModalVisible(null);
      setLoading(false);
    }
  };

  //コーヒーレコード詳細画面
  // - 飲んだコーヒーの情報（名前、ブランド、焙煎日、購入日、購入価格、購入重量、挽き目）
  // - 飲み始めた日、飲み終わった日
  // - 飲み終わった場合はレビュー（スコア、コメント、編集・削除ボタン）
  // - 飲み終わっていない場合は「飲み終わった」ボタン
  // - 画面上部に「一覧に戻る」ボタン
  return (
    <View>
      <Text>CoffeeRecordScreen</Text>
      <Text>{recordDetail?.coffee?.brand?.name}</Text>
      <Text>{recordDetail?.coffee?.name}</Text>
      <Text>飲んだ期間：{recordDetail?.start_date} ~ {recordDetail?.end_date ? recordDetail?.end_date : "まだ飲んでる！"}</Text>
      <Text>購入日：{recordDetail?.purchase_date}</Text>
      <Text>金額：{recordDetail?.price_yen} 円</Text>
      <Text>量：{recordDetail?.weight_grams} g</Text>
      <Text>レビュー</Text>
      <Text>スコア：{Array.isArray(recordDetail?.reviews) && recordDetail.reviews.length > 0 ? recordDetail.reviews[0].score : "未評価"}</Text>
      <Text>コメント：{Array.isArray(recordDetail?.reviews) && recordDetail.reviews.length > 0 ? recordDetail.reviews[0].comments : "コメントなし"}</Text>

      <TouchableOpacity
        onPress={() => setModalVisible("edit")}
        style={{
          backgroundColor: '#51c734ff',
          padding: 12,
          marginTop: 16,
          borderRadius: 8,
        }}
      >
        <Text style={{ color: '#fff', textAlign: 'center' }}>
          編集する
        </Text>
      </TouchableOpacity>

      {modalVisible === "edit" && (<RecordForm
        weight_grams={recordDetail?.weight_grams ?? 0}
        price_yen={recordDetail?.price_yen ?? 0}
        purchase_date={recordDetail?.purchase_date ?? ''}
        coffee_id={recordDetail?.coffee_id ?? ''}
        start_date={recordDetail?.start_date ?? ''}
        end_date={recordDetail?.end_date ?? ''}
        drinkingGrindSizes={[]}
        canEditEndDate={canEditEndDate}
        onSubmit={(form) => handleEditSubmit(form)}
        onCancel={() => setModalVisible(null)} />)}

    </View>
  )
}

// const styles = StyleSheet.create({})
