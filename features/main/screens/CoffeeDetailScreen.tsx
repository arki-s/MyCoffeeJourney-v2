import { Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { CoffeeDetail, CoffeeReviewItem, CoffeeStackParamList } from '../../../type';
import { RouteProp, useNavigation } from '@react-navigation/native';
import { deleteCoffee, getBeanInclusions, getCoffeeDetail, setCoffeeBeanInclusions, updateCoffee } from '../../auth/services/coffeeService';
import { listReviewsForCoffee } from '../../auth/services/reviewService';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import CoffeeForm from '../components/CoffeeForm';

type CoffeeScreenRouteProp = RouteProp<CoffeeStackParamList, 'CoffeeDetails'>;

export default function CoffeeDetailScreen({ route }: { route: CoffeeScreenRouteProp }) {
  const [coffeeDetail, setCoffeeDetail] = useState<CoffeeDetail>();
  const [coffeeReviews, setCoffeeReviews] = useState<CoffeeReviewItem[]>([]);
  const [coffee, setCoffee] = useState<{
    id: string;
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
    id: '',
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
  const [includedBeans, setIncludedbeans] = useState<string[]>([]);
  const [modalVisible, setModalVisible] = useState<"edit" | null>(null);
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
      setCoffee({
        id: id,
        name: detail.name,
        comments: detail.comments ?? '',
        photo_url: detail.photo_url ?? '',
        roast_level: detail.roast_level,
        body: detail.body,
        sweetness: detail.sweetness,
        fruity: detail.fruity,
        bitter: detail.bitter,
        aroma: detail.aroma,
        brand_id: detail.brand_id
      });

      try {
        const beans = await getBeanInclusions(id);
        setIncludedbeans(beans);
      } catch (error) {
        console.error("Error fetching bean inclusion", error);
      }

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

  const handleDeletePress = async () => {
    setLoading(true)
    try {
      await deleteCoffee(id);
      navigation.navigate('CoffeeHome');
    } catch (error) {
      console.error("Error deleting coffee", error);
    } finally {
      setLoading(false)
    }
  };

  async function handleEditSubmit(form: {
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
  }) {
    try {
      setLoading(true);
      await updateCoffee(
        coffee.id,
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
      await setCoffeeBeanInclusions(id, form.includedBeans);
      await fetchCoffeeDetail(id);
      setModalVisible(null);
    } catch (error) {
      console.error("Error updating coffee:", error);
    } finally {
      setLoading(false);
    }
  }

  const coffeeDetails = coffeeDetail ? (
    <View>
      <Text style={{ fontSize: 18 }}>{coffeeDetail.brand?.name}</Text>
      <Text style={{ fontSize: 18 }}>{coffeeDetail.name}</Text>
      <Text style={{ fontSize: 18 }}>{coffeeDetail.comments}</Text>
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
      <Text style={{ fontSize: 18 }}>まだレビューはありません。</Text>
    );

  //削除時は関連するrecordもreviewもgrindsizeも何もかも消える処理が必要、アラート必要
  type RecordsNav = NativeStackNavigationProp<CoffeeStackParamList, 'CoffeeDetails'>;
  const navigation = useNavigation<RecordsNav>();

  const handleHomePress = () => {
    navigation.navigate('CoffeeHome');
  };

  return (
    <View>
      <Text>CoffeeDetailScreen</Text>
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

      {coffeeDetails}
      {coffeeReviewlist}

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

      <TouchableOpacity
        onPress={() => handleDeletePress()}
        style={{
          backgroundColor: '#c73434ff',
          padding: 12,
          marginTop: 16,
          borderRadius: 8,
        }}
      >
        <Text style={{ color: '#fff', textAlign: 'center' }}>
          削除する
        </Text>
      </TouchableOpacity>

      {modalVisible === "edit" && (<CoffeeForm
        name={coffee.name}
        comments={coffee.comments}
        photo_url={coffee.photo_url}
        roast_level={coffee.roast_level}
        body={coffee.body}
        sweetness={coffee.sweetness}
        fruity={coffee.fruity}
        bitter={coffee.bitter}
        aroma={coffee.aroma}
        brand_id={coffee.brand_id}
        includedBeans={includedBeans}
        onSubmit={(form) => handleEditSubmit(form)}
        onCancel={() => setModalVisible(null)}
      />)}
    </View>
  )
}

// const styles = StyleSheet.create({})
