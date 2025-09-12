import { Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { CoffeeDetail, CoffeeReviewItem, CoffeeStackParamList } from '../../../type';
import { RouteProp } from '@react-navigation/native';
import { getCoffeeDetail } from '../../auth/services/coffeeService';
import { listReviewsForCoffee } from '../../auth/services/reviewService';

type CoffeeScreenRouteProp = RouteProp<CoffeeStackParamList, 'CoffeeDetails'>;

export default function CoffeeDetailScreen({ route }: { route: CoffeeScreenRouteProp }) {
  const [coffeeDetail, setCoffeeDetail] = useState<CoffeeDetail>();
  const [coffeeReviews, setCoffeeReviews] = useState<CoffeeReviewItem[]>([]);
  const [, setLoading] = useState<boolean>(false);
  const { id } = route.params;

  useEffect(() => {
    fetchCoffeeDetail(id);
    fetchReviewItems(id);
  }, []);

  const fetchCoffeeDetail = async (id: string) => {
    setLoading(true);
    try {
      const detail = await getCoffeeDetail(id);
      setCoffeeDetail(detail);
    } catch (error) {
      console.error("Error fetching coffee detail", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReviewItems = async (id: string) => {
    setLoading(true);
    try {
      const reviews = await listReviewsForCoffee(id);
      setCoffeeReviews(reviews);
    } catch (error) {
      console.error("Error fetching reviews", error);
    } finally {
      setLoading(false);
    }
  };

  const coffeeDetails = coffeeDetail ? (
    <View>
      <Text style={{ fontSize: 18 }}>{coffeeDetail.brand?.name}</Text>
      <Text style={{ fontSize: 18 }}>{coffeeDetail.name}</Text>
      <Text style={{ fontSize: 18 }}>飲んだ回数： {coffeeDetail.stats.recordCount} 回</Text>
      <Text style={{ fontSize: 18 }}>100gごとの金額： {coffeeDetail.stats.pricePer100g} 円</Text>
      <Text style={{ fontSize: 18 }}>スコア平均点： {coffeeDetail.stats.avgScore}</Text>
      <Text style={{ fontSize: 18 }}>今までに飲んだ量： {coffeeDetail.stats.totalWeight} g</Text>
    </View>
  ) : (
    <Text style={{ fontSize: 18 }}>Loading...</Text>
  );

  const coffeeReviewlist = coffeeReviews.length > 0 ?
    coffeeReviews.map((r) => {
      return (
        <View key={r.record_id}>
          <Text style={{ fontSize: 18 }}>飲んだ期間：{r.start_date}〜{r.end_date}</Text>
          <Text style={{ fontSize: 18 }}>{r.score}</Text>
          <Text style={{ fontSize: 18 }}>{r.comments}</Text>
        </View>
      )
    })
    : (
      <Text style={{ fontSize: 18 }}>Loading...</Text>
    );
  //コーヒー詳細画面
  // コーヒーの情報、名前、ブランド、豆産地一覧、コメント
  //これまでに飲んだ回数や量、累計金額、平均レビュー点数も表示できると良い
  // 画面上部に「一覧に戻る」ボタン
  // 将来的に画像表示もしたい
  // 編集ボタンと削除ボタンも実装予定
  return (
    <View>
      <Text>CoffeeDetailScreen</Text>
      {coffeeDetails}
      {coffeeReviewlist}
    </View>
  )
}

// const styles = StyleSheet.create({})
