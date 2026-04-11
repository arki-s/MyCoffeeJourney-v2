import { Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import React, { useCallback, useMemo, useRef, useState } from 'react'
import Slider from '@react-native-community/slider'
import { BottomStackParamList, CoffeeDetail, CoffeeReviewItem, CoffeeStackParamList } from '../../../type';
import { CompositeNavigationProp, RouteProp, useFocusEffect, useNavigation } from '@react-navigation/native';
import { deleteCoffee, getBeanInclusions, getCoffeeDetail, setCoffeeBeanInclusions, updateCoffee } from '../../auth/services/coffeeService';
import { listReviewsForCoffee } from '../../auth/services/reviewService';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import CoffeeForm from '../components/CoffeeForm';
import { fonts } from '../../../app/main/theme/fonts';
import { CoffeeFormSubmitValue, sliderFields } from '../components/CoffeeForm.shared';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { colors } from '../../../app/main/theme/colors';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import DeleteBlockModal from '../components/DeleteBlockModal';
import { ScreenSkeletonCard, ScreenSkeletonLine, ScreenStatusOverlay } from '../components/ScreenLoading';

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
      <Text
        className="mr-2 text-right text-DARK_BROWN"
        style={{ minWidth: 36, fontSize: 18, fontFamily: fonts.body }}
      >
        {avgScore == null ? '-' : normalizedScore.toFixed(1)}
      </Text>

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
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleteBlockType, setDeleteBlockType] = useState<"coffee" | "error" | null>(null);
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState<boolean>(false);
  const hasLoadedOnceRef = useRef(false);
  const { id } = route.params;

  const fetchCoffeeScreenData = useCallback(async (mode: 'screen' | 'silent' = 'screen') => {
    // 初回読込と再取得を分離して、詳細画面の点滅を防ぐ。
    if (mode === 'screen') {
      if (hasLoadedOnceRef.current) {
        setIsRefreshing(true);
      } else {
        setIsInitialLoading(true);
      }
    }

    try {
      const [detailResult, reviewResult] = await Promise.allSettled([
        getCoffeeDetail(id),
        listReviewsForCoffee(id),
      ]);

      if (detailResult.status === 'fulfilled') {
        const detail = detailResult.value;
        setCoffeeDetail(detail);
        setCoffee({
          id,
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
        } catch (beanError) {
          console.error("Error fetching bean inclusion", beanError);
        }
      } else {
        console.error("Error fetching coffee detail", detailResult.reason);
      }

      if (reviewResult.status === 'fulfilled') {
        setCoffeeReviews(reviewResult.value);
      } else {
        console.error("Error fetching reviews", reviewResult.reason);
      }
    } finally {
      if (mode === 'screen') {
        hasLoadedOnceRef.current = true;
        setIsInitialLoading(false);
        setIsRefreshing(false);
      }
    }
  }, [id]);

  useFocusEffect(
    useCallback(() => {
      void fetchCoffeeScreenData();
    }, [fetchCoffeeScreenData])
  );

  const handleDeletePress = async () => {
    setIsSubmitting(true)
    try {
      await deleteCoffee(id);
      setDeleteConfirmVisible(false);
      navigation.navigate('CoffeeHome');
    } catch (error) {
      console.error("Error deleting coffee", error);

      setDeleteConfirmVisible(false);

      const errorCode =
        typeof error === "object" &&
          error !== null &&
          "code" in error &&
          typeof error.code === "string"
          ? error.code
          : undefined;

      if (errorCode === "23503") {
        // 外部キー制約。関連データがあるので削除不可。
        setDeleteBlockType("coffee");
      } else {
        // それ以外は汎用エラー扱い。
        setDeleteBlockType("error");
      }

    } finally {
      setIsSubmitting(false)
    }
  };

  async function handleEditSubmit(form: CoffeeFormSubmitValue) {
    try {
      setError(null);
      setIsSubmitting(true);
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
      await fetchCoffeeScreenData('silent');
      setModalVisible(null);
    } catch (error) {
      console.error("Error updating coffee:", error);
      setError('※コーヒーの更新に失敗しました。もう一度お試しください。');
    } finally {
      setIsSubmitting(false);
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
      <View className='py-2 rounded-2xl bg-DARK_BROWN ios:shadow-md android:elevation-md'>
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
    <View className="rounded-2xl border-2 border-DARK_BROWN bg-BROWN px-4 py-4">
      <Text className="text-center text-DARK_BROWN" style={{ fontSize: 18, fontFamily: fonts.body }}>
        コーヒー情報を取得できませんでした。
      </Text>
    </View>
  );

  const coffeeReviewlist = coffeeReviews.length > 0 ?
    coffeeReviews.map((r) => {
      return (
        <View key={r.record_id} className='mb-4 border-2 border-DARK_BROWN rounded-2xl bg-LIGHT_BROWN px-4 py-4 ios:shadow-md android:elevation-md'>
          <View className="mb-4 flex-row justify-between">

            <Text style={{ fontSize: 18 }}>{'⭐️'.repeat(r.score)}</Text>
            <TouchableOpacity
              className=""
              onPress={() => handleDetailPress(r.record_id)}
            >
              <FontAwesome5 name="arrow-circle-right" size={24} color={colors.OCHER} />
            </TouchableOpacity>
          </View>


          <Text className="text-OCHER" style={{ fontSize: 18, fontFamily: fonts.body }}>{r.start_date}〜{r.end_date}</Text>
          <Text className="text-OCHER" style={{ fontSize: 18, fontFamily: fonts.body }}>{r.comments}</Text>


        </View>
      )
    })
    : (
      <Text className="text-DARK_BROWN text-center" style={{ fontSize: 18, fontFamily: fonts.body }}>まだレビューはありません。</Text>
    );

  const detailSkeleton = (
    <View>
      <ScreenSkeletonCard borderColor={colors.DARK_BROWN} backgroundColor={colors.DARK_BROWN}>
        <ScreenSkeletonLine width="42%" height={18} style={{ alignSelf: 'center', marginBottom: 12 }} />
        <ScreenSkeletonLine width="60%" height={28} style={{ alignSelf: 'center' }} />
      </ScreenSkeletonCard>

      <View style={{ marginTop: 16, marginBottom: 16 }}>
        {[0, 1, 2, 3].map((index) => (
          <View
            key={`metric-${index}`}
            style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}
          >
            <ScreenSkeletonLine width="34%" height={16} />
            <ScreenSkeletonLine width="28%" height={16} />
          </View>
        ))}
      </View>

      <ScreenSkeletonLine width="100%" height={14} style={{ marginBottom: 8 }} />
      <ScreenSkeletonLine width="72%" height={14} style={{ marginBottom: 24 }} />

      <View style={{ marginBottom: 20 }}>
        <ScreenSkeletonLine width="28%" height={18} style={{ alignSelf: 'center', marginBottom: 16 }} />
        {sliderFields.map((field) => (
          <View key={field.key} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <ScreenSkeletonLine width={64} height={14} />
            <ScreenSkeletonLine width={24} height={14} style={{ marginLeft: 12 }} />
            <ScreenSkeletonLine width="60%" height={10} style={{ marginLeft: 16 }} />
          </View>
        ))}
      </View>

      <View className="mb-4 flex-row justify-end">
        <View className="flex-row items-center gap-4">
          <ScreenSkeletonLine width={24} height={24} />
          <ScreenSkeletonLine width={24} height={24} />
        </View>
      </View>

      <ScreenSkeletonLine width="32%" height={18} style={{ alignSelf: 'center', marginBottom: 12 }} />
      {[0, 1].map((index) => (
        <ScreenSkeletonCard
          key={`review-${index}`}
          borderColor={colors.DARK_BROWN}
          backgroundColor={colors.LIGHT_BROWN}
        >
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 }}>
            <ScreenSkeletonLine width="26%" height={16} />
            <ScreenSkeletonLine width={24} height={24} />
          </View>
          <ScreenSkeletonLine width="48%" height={14} style={{ marginBottom: 12 }} />
          <ScreenSkeletonLine width="100%" height={14} style={{ marginBottom: 8 }} />
          <ScreenSkeletonLine width="76%" height={14} />
        </ScreenSkeletonCard>
      ))}
    </View>
  );

  type RecordsNav = CompositeNavigationProp<
    NativeStackNavigationProp<CoffeeStackParamList, 'CoffeeDetails'>,
    BottomTabNavigationProp<BottomStackParamList>
  >;
  const navigation = useNavigation<RecordsNav>();

  const handleDetailPress = (recordId: string) => {
    navigation.navigate('Records', {
      screen: 'RecordDetails',
      // CoffeeDetails配下のレビューから開いた詳細は、同じコーヒー詳細へ戻すために元画面を持たせる。
      params: { id: recordId, returnTo: { tab: 'Coffee', screen: 'CoffeeDetails', params: { id } } },
    });
  };

  return (
    <ScrollView
      className="flex-1 border-2 border-BROWN bg-OCHER"
      contentContainerStyle={{ flexGrow: 1, paddingBottom: 24 }}
    >
      <View className="px-5 py-6">
        {isInitialLoading ? (
          detailSkeleton
        ) : (
          <>
            <ScreenStatusOverlay visible={isRefreshing} label="詳細を更新中…" />
            {coffeeDetails}

            <View className="mb-4 flex-row justify-end">
              <View className="flex-row items-center gap-4">
                <TouchableOpacity
                  onPress={() => {
                    setError(null);
                    setModalVisible("edit");
                  }}
                  disabled={isSubmitting || !coffeeDetail}
                  style={{ opacity: isSubmitting || !coffeeDetail ? 0.6 : 1 }}
                >
                  <FontAwesome name="pencil" size={24} color={colors.DARK_BROWN} />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setDeleteConfirmVisible(true)}
                  disabled={isSubmitting || !coffeeDetail}
                  style={{ opacity: isSubmitting || !coffeeDetail ? 0.6 : 1 }}
                >
                  <FontAwesome name="trash" size={24} color={colors.DARK_BROWN} />
                </TouchableOpacity>
              </View>
            </View>

            <Text className="mb-2 text-center text-DARK_BROWN" style={{ fontSize: 20, fontFamily: fonts.body }}>
              レビュー履歴
            </Text>
            {coffeeReviewlist}
          </>
        )}

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
                  loading={isSubmitting}
                  error={error}
                  onSubmit={(form) => handleEditSubmit(form)}
                  onCancel={handleEditCancel}
                  submitLabel="変更を保存"
                />
              </ScrollView>
            </View>
          </View>
        </Modal>

        <DeleteConfirmModal
          visible={deleteConfirmVisible}
          selectedItemName={coffeeDetail?.name ?? 'このコーヒー'}
          onConfirm={() => void handleDeletePress()}
          onClose={() => setDeleteConfirmVisible(false)}
        />
      </View>

      {deleteBlockType && (
        <DeleteBlockModal
          visible
          selectedItemName={deleteBlockType}
          onClose={() => setDeleteBlockType(null)}
        />
      )}
    </ScrollView>
  )
}
