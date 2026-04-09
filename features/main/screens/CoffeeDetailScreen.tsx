import { Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useMemo, useState } from 'react'
import Slider from '@react-native-community/slider'
import { CoffeeDetail, CoffeeReviewItem, CoffeeStackParamList } from '../../../type';
import { RouteProp, useNavigation } from '@react-navigation/native';
import { deleteCoffee, getBeanInclusions, getCoffeeDetail, setCoffeeBeanInclusions, updateCoffee } from '../../auth/services/coffeeService';
import { listReviewsForCoffee } from '../../auth/services/reviewService';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import CoffeeForm from '../components/CoffeeForm';
import { fonts } from '../../../app/main/theme/fonts';
import { CoffeeFormSubmitValue, sliderFields } from '../components/CoffeeForm.shared';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { colors } from '../../../app/main/theme/colors';
import DeleteConfirmModal from '../components/DeleteConfirmModal';

type CoffeeScreenRouteProp = RouteProp<CoffeeStackParamList, 'CoffeeDetails'>;

const MAX_STARS = 5;
const STAR_SIZE = 18;
const STAR_GAP = 2;
const STAR_ROW_WIDTH = MAX_STARS * STAR_SIZE + (MAX_STARS - 1) * STAR_GAP;

function renderStars(color: string) {
  return Array.from({ length: MAX_STARS }, (_, index) => (
    <FontAwesome
      key={`${color}-${index}`}
      name="star"
      size={STAR_SIZE}
      color={color}
      style={index === MAX_STARS - 1 ? undefined : { marginRight: STAR_GAP }}
    />
  ));
}

function renderAverageScore(avgScore: number | null) {
  const normalizedScore = avgScore == null
    ? 0
    : Math.max(0, Math.min(avgScore, MAX_STARS));
  const filledWidth = (normalizedScore / MAX_STARS) * STAR_ROW_WIDTH;

  return (
    <View className="flex-row items-center justify-end" style={{ minWidth: 164 }}>
      <View style={{ width: STAR_ROW_WIDTH, height: STAR_SIZE, position: 'relative' }}>
        <View className="flex-row">
          {renderStars(colors.GRAY)}
        </View>

        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: filledWidth,
            height: STAR_SIZE,
            overflow: 'hidden',
          }}
        >
          <View className="flex-row">
            {renderStars(colors.DARK_BROWN)}
          </View>
        </View>
      </View>

      <Text
        className="ml-2 text-right text-DARK_BROWN"
        style={{ minWidth: 36, fontSize: 18, fontFamily: fonts.body }}
      >
        {avgScore == null ? '-' : normalizedScore.toFixed(1)}
      </Text>
    </View>
  );
}

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
  const [includedBeans, setIncludedBeans] = useState<string[]>([]);
  const [modalVisible, setModalVisible] = useState<"edit" | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState<boolean>(false);
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
        setIncludedBeans(beans);
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
      setDeleteConfirmVisible(false);
      navigation.navigate('CoffeeHome');
    } catch (error) {
      console.error("Error deleting coffee", error);
    } finally {
      setLoading(false)
    }
  };

  async function handleEditSubmit(form: CoffeeFormSubmitValue) {
    try {
      setError(null);
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
      setError('※コーヒーの更新に失敗しました。もう一度お試しください。');
    } finally {
      setLoading(false);
    }
  }

  const handleEditCancel = () => {
    setError(null);
    setModalVisible(null);
  };

  const editInitialValue = useMemo(
    (): CoffeeFormSubmitValue => ({
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
      includedBeans,
    }),
    [coffee, includedBeans]
  );

  const avgScore = coffeeDetail?.stats.avgScore ?? null;

  const coffeeDetails = coffeeDetail ? (
    <View>
      <View className='py-2 rounded-2xl bg-DARK_BROWN'>
        <Text className="text-center text-OCHER" style={{ fontSize: 24, fontFamily: fonts.body }}>{coffeeDetail.brand?.name}</Text>
        <Text className="text-center text-OCHER" style={{ fontSize: 28, fontFamily: fonts.title_regular }}>{coffeeDetail.name}</Text>
      </View>
      <View className="mt-4 gap-2">
        <View className="flex-row items-center justify-between">
          <Text className="text-DARK_BROWN" style={{ fontSize: 18, fontFamily: fonts.body }}>
            スコア平均点
          </Text>
          {renderAverageScore(avgScore)}
        </View>

        <View className="flex-row items-center justify-between">
          <Text className="text-DARK_BROWN" style={{ fontSize: 18, fontFamily: fonts.body }}>
            飲んだ回数
          </Text>
          <Text className="text-right text-DARK_BROWN" style={{ minWidth: 96, fontSize: 18, fontFamily: fonts.body }}>
            {coffeeDetail.stats.recordCount} 回
          </Text>
        </View>

        <View className="flex-row items-center justify-between">
          <Text className="text-DARK_BROWN" style={{ fontSize: 18, fontFamily: fonts.body }}>
            今までに飲んだ量
          </Text>
          <Text className="text-right text-DARK_BROWN" style={{ minWidth: 96, fontSize: 18, fontFamily: fonts.body }}>
            {coffeeDetail.stats.totalWeight} ｇ
          </Text>
        </View>

        <View className="flex-row items-center justify-between">
          <Text className="text-DARK_BROWN" style={{ fontSize: 18, fontFamily: fonts.body }}>
            100gごとの金額
          </Text>
          <Text className="text-right text-DARK_BROWN" style={{ minWidth: 96, fontSize: 18, fontFamily: fonts.body }}>
            {coffeeDetail.stats.pricePer100g ?? 0} 円
          </Text>
        </View>
      </View>
      <Text className="mt-4 text-DARK_BROWN" style={{ fontSize: 18, fontFamily: fonts.body }}>{coffeeDetail.comments}</Text>

      <View className="mt-2 py-4">
        <Text className="mb-4 text-center text-DARK_BROWN" style={{ fontSize: 20, fontFamily: fonts.body }}>
          味の評価
        </Text>

        {sliderFields.map((field) => (
          <View key={field.key} className="mb-4 flex-row items-center">
            <Text
              className="text-DARK_BROWN"
              style={{ width: 72, fontSize: 16, fontFamily: fonts.body }}
            >
              {field.label}
            </Text>
            <Text
              className="text-center text-DARK_BROWN"
              style={{ width: 28, fontSize: 18, fontFamily: fonts.body }}
            >
              {coffeeDetail[field.key]}
            </Text>
            <View className="ml-3 flex-1">
              <Slider
                value={coffeeDetail[field.key]}
                minimumValue={1}
                maximumValue={5}
                step={1}
                disabled
                minimumTrackTintColor={colors.DARK_BROWN}
                maximumTrackTintColor={colors.WHITE}
                thumbTintColor={colors.WHITE}
              />
            </View>
          </View>
        ))}
      </View>
    </View>
  ) : (
    <Text style={{ fontSize: 18 }}>Loading...</Text>
  );

  const coffeeReviewlist = coffeeReviews.length > 0 ?
    coffeeReviews.map((r) => {
      return (
        <View key={r.record_id}>
          <Text style={{ fontSize: 18 }}>{'⭐️'.repeat(r.score)}</Text>
          <Text style={{ fontSize: 18, fontFamily: fonts.body }}>{r.start_date}〜{r.end_date}</Text>
          <Text style={{ fontSize: 18, fontFamily: fonts.body }}>{r.comments}</Text>
        </View>
      )
    })
    : (
      <Text className="text-DARK_BROWN text-center" style={{ fontSize: 18, fontFamily: fonts.body }}>まだレビューはありません。</Text>
    );

  //削除時は関連するrecordもreviewもgrindsizeも何もかも消える処理が必要、アラート必要
  type RecordsNav = NativeStackNavigationProp<CoffeeStackParamList, 'CoffeeDetails'>;
  const navigation = useNavigation<RecordsNav>();

  return (
    <ScrollView
      className="flex-1 border-2 border-BROWN bg-OCHER"
      contentContainerStyle={{ flexGrow: 1, paddingBottom: 24 }}
    >
      <View className="px-5 py-6">

        {coffeeDetails}
        {coffeeReviewlist}

        <Modal
          visible={modalVisible === "edit"}
          animationType="slide"
          transparent
          onRequestClose={handleEditCancel}
        >
          <View style={{ flex: 1, backgroundColor: '#0008', justifyContent: 'center', padding: 16 }}>
            <View
              className="rounded-2xl border border-OCHER bg-DARK_BROWN"
              style={{ maxHeight: '92%' }}
            >
              <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 24 }}>
                <Text className="text-lg text-OCHER" style={{ fontFamily: fonts.body }}>
                  コーヒーを編集
                </Text>

                <CoffeeForm
                  mode="edit"
                  initialValue={editInitialValue}
                  loading={loading}
                  error={error}
                  onSubmit={(form) => handleEditSubmit(form)}
                  onCancel={handleEditCancel}
                  submitLabel="変更を保存"
                />
              </ScrollView>
            </View>
          </View>
        </Modal>
        <View className="mt-4 flex-row justify-end">
          <View className="flex-row items-center gap-4">
            <TouchableOpacity
              onPress={() => {
                setError(null);
                setModalVisible("edit");
              }}
            >
              <FontAwesome name="pencil" size={28} color={colors.DARK_BROWN} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setDeleteConfirmVisible(true)}
            >
              <FontAwesome name="trash" size={28} color={colors.DARK_BROWN} />
            </TouchableOpacity>
          </View>
        </View>

        <DeleteConfirmModal
          visible={deleteConfirmVisible}
          selectedItemName={coffeeDetail?.name ?? 'このコーヒー'}
          onConfirm={() => void handleDeletePress()}
          onClose={() => setDeleteConfirmVisible(false)}
        />
      </View>
    </ScrollView>
  )
}
