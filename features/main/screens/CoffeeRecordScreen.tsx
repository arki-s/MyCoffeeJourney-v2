import { Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RecordDetail, RecordsStackParamList } from '../../../type';
import { useNavigation } from '@react-navigation/native';
import { RouteProp } from '@react-navigation/native';
import { getRecordDetail } from '../../auth/services/recordService';

type CoffeeRecordScreenRouteProp = RouteProp<RecordsStackParamList, 'RecordDetails'>;

export default function CoffeeRecordScreen({ route }: { route: CoffeeRecordScreenRouteProp }) {
  const { id } = route.params;
  const [recordDetail, setRecordDetail] = useState<RecordDetail>();

  type RecordsNav = NativeStackNavigationProp<RecordsStackParamList, 'RecordDetails'>;
  const navigation = useNavigation<RecordsNav>();

  useEffect(() => {
    if (id) fetchRecordDetail(id);
  }, []);

  const fetchRecordDetail = async (id: string) => {
    try {
      const data = await getRecordDetail(id);
      setRecordDetail(data);

    } catch (error) {
      console.error("Error fetching record detail:", error);
    }
  };

  const handleHomePress = () => {
    navigation.navigate('RecordsHome');
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

    </View>
  )
}

// const styles = StyleSheet.create({})
