import { Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { BottomStackParamList, RecordDetail, RecordsStackParamList } from '../../../type';
import { CompositeNavigationProp, RouteProp, useFocusEffect, useNavigation } from '@react-navigation/native';
import { deleteDrinkingRecord, finishDrinkingRecord, getDrinkingGrindSizes, getRecordDetail, updateFinishedDrinkingRecord, updateUnfinishedDrinkingRecord } from '../../auth/services/recordService';
import RecordForm from '../components/RecordForm';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { fonts } from '../../../app/main/theme/fonts';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { colors } from '../../../app/main/theme/colors';
import { listGrindSizes } from '../../auth/services/grindSizeService';
import ReviewForm from '../components/ReviewForm';
import { createReview, deleteReview, updateReview } from '../../auth/services/reviewService';
import { formatLocalYYYYMMDD } from '../../../utils/date';
import DeleteConfirmModal from '../components/DeleteConfirmModal';

type CoffeeRecordScreenRouteProp = RouteProp<RecordsStackParamList, 'RecordDetails'>;

export default function CoffeeRecordScreen({ route }: { route: CoffeeRecordScreenRouteProp }) {
  const { id } = route.params;
  const [recordDetail, setRecordDetail] = useState<RecordDetail>();
  const [modalVisible, setModalVisible] = useState<"edit" | "review" | null>(null);
  const [drinkingGrindSizes, setDrinkingGrindSizes] = useState<string[]>([]);
  const [grindSizeOptions, setGrindSizeOptions] = useState<{ id: string; label: string }[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [canEditEndDate, setCanEditEndDate] = useState<boolean>(false);
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState<boolean>(false);
  const [editingReview, setEditingReview] = useState<{ id: string; score: number; comments: string | null } | null>(null);
  const [deleteReviewConfirmVisible, setDeleteReviewConfirmVisible] = useState<boolean>(false);

  type RecordsNav = CompositeNavigationProp<
    NativeStackNavigationProp<RecordsStackParamList, 'RecordDetails'>,
    BottomTabNavigationProp<BottomStackParamList>
  >;
  const navigation = useNavigation<RecordsNav>();

  useFocusEffect(
    useCallback(() => {
      const parentNavigation = navigation.getParent();

      if (!parentNavigation) {
        return undefined;
      }

      const handleParentHeaderBackPress = () => {
        const returnTo = route.params.returnTo;

        if (returnTo?.tab === 'Coffee') {
          navigation.navigate('Coffee', {
            screen: returnTo.screen,
            params: returnTo.params,
          });
          return;
        }

        if (returnTo?.tab === 'Reviews' || returnTo?.tab === 'Calendar') {
          navigation.navigate(returnTo.tab);
          return;
        }

        if (returnTo?.tab === 'Records') {
          navigation.navigate('RecordsHome');
          return;
        }

        navigation.navigate('RecordsHome');
      };

      parentNavigation.setOptions({
        // RecordDetailsが表示中の間だけ、画面自身が持つreturnToで親ヘッダーの戻り先を差し替える。
        headerLeft: () => (
          <TouchableOpacity
            onPress={handleParentHeaderBackPress}
            style={{ marginLeft: 16 }}
          >
            <FontAwesome5 name="arrow-circle-left" size={28} color={colors.OCHER} />
          </TouchableOpacity>
        ),
      });

      return () => {
        // blur時に共有ヘッダーを元へ戻さないと、一覧へ戻っても戻るボタンの残骸が残る。
        parentNavigation.setOptions({
          headerLeft: undefined,
        });
      };
    }, [navigation, route.params.returnTo])
  );

  useEffect(() => {
    if (id) {
      void fetchRecordDetail(id);
    }
    void fetchGrindSizes();
  }, [id]);

  const fetchRecordDetail = async (recordId: string) => {
    try {
      setLoading(true);
      const data = await getRecordDetail(recordId);
      setRecordDetail(data);

      const grindSizes = await getDrinkingGrindSizes(recordId);
      setDrinkingGrindSizes(grindSizes);
      setCanEditEndDate(data.end_date !== null && data.end_date !== '');
    } catch (fetchError) {
      console.error('Error fetching record detail:', fetchError);
    } finally {
      setLoading(false);
    }
  };

  const fetchGrindSizes = async () => {
    try {
      const data = await listGrindSizes();
      setGrindSizeOptions(data.map((grindSize) => ({ id: grindSize.id, label: grindSize.name })));
    } catch (fetchError) {
      console.error('Error fetching grind sizes:', fetchError);
    }
  };

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
      setError(null);
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
      } else {
        await updateUnfinishedDrinkingRecord(
          recordDetail.id,
          form.weight_grams,
          form.price_yen,
          form.purchase_date,
          form.coffee_id,
          form.start_date,
        );
      }

      await fetchRecordDetail(id);
      setModalVisible(null);
    } catch (updateError) {
      console.error('Error updating record:', updateError);
      setError('※レコードの更新に失敗しました。もう一度お試しください。');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePress = async () => {
    if (!id) return;
    try {
      setLoading(true);
      await deleteDrinkingRecord(id);
      setDeleteConfirmVisible(false);
      navigation.navigate('RecordsHome');
    } catch (deleteError) {
      console.error('Error deleting record', deleteError);
    } finally {
      setLoading(false);
    }
  };

  const handleEditCancel = () => {
    setError(null);
    setModalVisible(null);
  };

  const handleReviewEditCancel = () => {
    setError(null);
    setEditingReview(null);
  };

  const handleReviewSubmit = async (score: number, comments: string) => {
    if (!id) return;

    try {
      setError(null);
      setLoading(true);
      await createReview(score, comments, id);
      await fetchRecordDetail(id);
      setModalVisible(null);
    } catch (reviewError) {
      console.error('Error submitting review:', reviewError);
      setError('※レビューの登録に失敗しました。もう一度お試しください。');
    } finally {
      setLoading(false);
    }
  };

  const handleFinishPress = async () => {
    if (!id) return;

    try {
      setError(null);
      setLoading(true);
      await finishDrinkingRecord(id, formatLocalYYYYMMDD(new Date()));
      await fetchRecordDetail(id);
      setModalVisible('review');
    } catch (finishError) {
      console.error('Error finishing drinking record:', finishError);
      setError('※飲み終えた状態への更新に失敗しました。もう一度お試しください。');
    } finally {
      setLoading(false);
    }
  };

  const handleReviewUpdate = async ({ score, comments }: { score: number; comments: string }) => {
    if (!id || !editingReview) return;

    try {
      setError(null);
      setLoading(true);
      await updateReview(editingReview.id, score, comments);
      await fetchRecordDetail(id);
      setEditingReview(null);
    } catch (reviewError) {
      console.error('Error updating review:', reviewError);
      setError('※レビューの更新に失敗しました。もう一度お試しください。');
    } finally {
      setLoading(false);
    }
  };

  const handleReviewDelete = async () => {
    if (!id || !review || typeof review !== 'object' || !('id' in review)) return;

    try {
      setError(null);
      setLoading(true);
      await deleteReview(review.id);
      await fetchRecordDetail(id);
      setDeleteReviewConfirmVisible(false);
    } catch (reviewError) {
      console.error('Error deleting review:', reviewError);
      setError('※レビューの削除に失敗しました。もう一度お試しください。');
    } finally {
      setLoading(false);
    }
  };

  const formattedPrice = useMemo(
    () => (recordDetail?.price_yen ?? 0).toLocaleString('ja-JP'),
    [recordDetail?.price_yen]
  );

  const formattedWeight = useMemo(
    () => (recordDetail?.weight_grams ?? 0).toLocaleString('ja-JP'),
    [recordDetail?.weight_grams]
  );

  const grindSizeLabels = useMemo(
    () => grindSizeOptions
      .filter((grindSize) => drinkingGrindSizes.includes(grindSize.id))
      .map((grindSize) => grindSize.label),
    [drinkingGrindSizes, grindSizeOptions]
  );

  const review = useMemo(() => {
    const reviews = recordDetail?.reviews as unknown;
    if (Array.isArray(reviews)) {
      return reviews[0] ?? null;
    }
    return reviews ?? null;
  }, [recordDetail?.reviews]);

  const hasReview = review !== null && typeof review === 'object' && 'score' in review && Boolean(review.score);

  const recordDetails = recordDetail ? (
    <View>
      <View className="py-2 rounded-2xl bg-DARK_BROWN ios:shadow-md android:elevation-md">
        <Text className="text-center text-OCHER" style={{ fontSize: 24, fontFamily: fonts.body }}>
          {recordDetail.coffee?.brand?.name ?? 'ブランド未設定'}
        </Text>
        <Text className="text-center text-OCHER" style={{ fontSize: 28, fontFamily: fonts.title_regular }}>
          {recordDetail.coffee?.name ?? 'コーヒー名未設定'}
        </Text>
      </View>

      <View className="mt-4 gap-2">
        <View className="flex-row items-center justify-between">
          <Text className="text-DARK_BROWN" style={{ fontSize: 18, fontFamily: fonts.body }}>
            購入日
          </Text>
          <Text className="text-right text-DARK_BROWN" style={{ minWidth: 96, fontSize: 18, fontFamily: fonts.body }}>
            {recordDetail.purchase_date}
          </Text>
        </View>

        <View className="flex-row items-center justify-between">
          <Text className="text-DARK_BROWN" style={{ fontSize: 18, fontFamily: fonts.body }}>
            飲んだ期間
          </Text>
          <Text className="text-right text-DARK_BROWN" style={{ minWidth: 144, fontSize: 18, fontFamily: fonts.body }}>
            {recordDetail.start_date} 〜 {recordDetail.end_date ?? '継続中'}
          </Text>
        </View>


        <View className="flex-row items-center justify-between">
          <Text className="text-DARK_BROWN" style={{ fontSize: 18, fontFamily: fonts.body }}>
            金額
          </Text>
          <Text className="text-right text-DARK_BROWN" style={{ minWidth: 96, fontSize: 18, fontFamily: fonts.body }}>
            {formattedPrice} 円
          </Text>
        </View>

        <View className="flex-row items-center justify-between">
          <Text className="text-DARK_BROWN" style={{ fontSize: 18, fontFamily: fonts.body }}>
            量
          </Text>
          <Text className="text-right text-DARK_BROWN" style={{ minWidth: 96, fontSize: 18, fontFamily: fonts.body }}>
            {formattedWeight} g
          </Text>
        </View>

        <View className="flex-row items-center justify-between">
          <Text className="text-DARK_BROWN" style={{ fontSize: 18, fontFamily: fonts.body }}>
            挽き目
          </Text>
          {grindSizeLabels.length > 0 ? (
            <Text className="text-right text-DARK_BROWN" style={{ fontSize: 18, fontFamily: fonts.body }}>
              {grindSizeLabels.join(' / ')}
            </Text>
          ) : (
            <Text className="text-right text-DARK_BROWN" style={{ fontSize: 18, fontFamily: fonts.body }}>
              未設定
            </Text>
          )}
        </View>
      </View>

      <View className="mt-4 flex-row justify-end">
        <View className="flex-row items-center gap-4">
          <TouchableOpacity
            onPress={() => {
              setError(null);
              setModalVisible('edit');
            }}
          >
            <FontAwesome name="pencil" size={24} color={colors.DARK_BROWN} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              setError(null);
              setDeleteConfirmVisible(true);
            }}
          >
            <FontAwesome name="trash" size={24} color={colors.DARK_BROWN} />
          </TouchableOpacity>
        </View>
      </View>

      <View className="mt-2 py-4">
        <Text className="mb-4 text-center text-DARK_BROWN" style={{ fontSize: 20, fontFamily: fonts.body }}>
          レビュー
        </Text>

        {hasReview && (
          <View className='mb-4 border-2 border-DARK_BROWN rounded-2xl bg-LIGHT_BROWN px-4 py-4 ios:shadow-md android:elevation-md'>

            <Text className="text-left text-DARK_BROWN" style={{ minWidth: 96, fontSize: 18, fontFamily: fonts.body }}>
              {review?.score ? '⭐️'.repeat(review.score) : '未評価'}
            </Text>


            <Text className="mt-2 text-OCHER" style={{ fontSize: 18, fontFamily: fonts.body }}>
              {hasReview && typeof review === 'object' && 'comments' in review && review.comments?.trim()
                ? review.comments
                : 'コメントなし'}
            </Text>

            <View className="mt-4 flex-row justify-end">
              <View className="flex-row items-center gap-4">
                <TouchableOpacity
                  onPress={() => {
                    setError(null);
                    if (review && typeof review === 'object' && 'id' in review) {
                      setEditingReview(review);
                    }
                  }}
                >
                  <FontAwesome name="pencil" size={24} color={colors.OCHER} />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    setError(null);
                    setDeleteReviewConfirmVisible(true);
                  }}
                >
                  <FontAwesome name="trash" size={24} color={colors.OCHER} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </View>
    </View>
  ) : (
    <Text className="text-DARK_BROWN" style={{ fontSize: 18, fontFamily: fonts.body }}>
      {loading ? 'Loading...' : 'レコードを取得できませんでした。'}
    </Text>
  );

  return (
    <ScrollView
      className="flex-1 border-2 border-BROWN bg-OCHER"
      contentContainerStyle={{ flexGrow: 1, paddingBottom: 24 }}
    >
      <View className="px-5 py-6">
        {recordDetails}

        {!recordDetail?.end_date ? (
          <TouchableOpacity
            className="mt-4 self-center rounded-full border-2 border-DARK_BROWN bg-BROWN px-5 py-3"
            onPress={() => void handleFinishPress()}
            disabled={loading}
            style={{ opacity: loading ? 0.6 : 1 }}
          >
            <Text className="text-OCHER" style={{ fontFamily: fonts.body }}>
              飲み終えた！
            </Text>
          </TouchableOpacity>
        ) : !hasReview ? (
          <TouchableOpacity
            className="mt-4 self-center rounded-full border-2 border-DARK_BROWN bg-BROWN px-5 py-3"
            onPress={() => {
              setError(null);
              setModalVisible('review');
            }}
            disabled={loading}
            style={{ opacity: loading ? 0.6 : 1 }}
          >
            <Text className="text-OCHER" style={{ fontFamily: fonts.body }}>
              レビューを追加する
            </Text>
          </TouchableOpacity>
        ) : null}

        <Modal
          visible={modalVisible === 'edit'}
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
                  レコードを編集
                </Text>

                <RecordForm
                  weight_grams={recordDetail?.weight_grams ?? 0}
                  price_yen={recordDetail?.price_yen ?? 0}
                  purchase_date={recordDetail?.purchase_date ?? ''}
                  coffee_id={recordDetail?.coffee_id ?? ''}
                  start_date={recordDetail?.start_date ?? ''}
                  end_date={recordDetail?.end_date ?? ''}
                  drinkingGrindSizes={drinkingGrindSizes}
                  canEditEndDate={canEditEndDate}
                  onSubmit={(form) => handleEditSubmit(form)}
                  onCancel={handleEditCancel}
                  loading={loading}
                  error={error}
                />
              </ScrollView>
            </View>
          </View>
        </Modal>

        {modalVisible === 'review' && (
          <ReviewForm
            onSubmit={({ score, comments }) => handleReviewSubmit(score, comments)}
            onCancel={() => setModalVisible(null)}
            loading={loading}
            error={error}
          />
        )}

        {editingReview && (
          <ReviewForm
            initialScore={editingReview.score}
            initialComments={editingReview.comments ?? ''}
            onSubmit={handleReviewUpdate}
            onCancel={handleReviewEditCancel}
            loading={loading}
            error={error}
            title="レビューを編集"
          />
        )}

        <DeleteConfirmModal
          visible={deleteConfirmVisible}
          selectedItemName={recordDetail?.coffee?.name ?? 'このレコード'}
          onConfirm={() => void handleDeletePress()}
          onClose={() => setDeleteConfirmVisible(false)}
        />

        <DeleteConfirmModal
          visible={deleteReviewConfirmVisible}
          selectedItemName={recordDetail?.coffee?.name ?? 'このレビュー'}
          onConfirm={() => void handleReviewDelete()}
          onClose={() => setDeleteReviewConfirmVisible(false)}
        />

      </View>
    </ScrollView>
  )
}
