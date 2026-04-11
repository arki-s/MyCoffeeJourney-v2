import { ImageBackground, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import React, { useCallback, useRef, useState } from 'react'
import { BottomStackParamList, ReviewWithContext } from '../../../type';
import { deleteReview, listReviews, updateReview } from '../../auth/services/reviewService';
import ReviewForm from '../components/ReviewForm';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { fonts } from '../../../app/main/theme/fonts';
import { colors } from '../../../app/main/theme/colors';
import textureImage from '../../../assets/texture.jpg';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import { ScreenSkeletonCard, ScreenSkeletonLine, ScreenStatusOverlay } from '../components/ScreenLoading';

export default function ReviewListScreen() {
  const [reviews, setReviews] = useState<ReviewWithContext[]>([]);
  const [editReviewId, setEditReviewId] = useState<string | null>(null);
  const [, setScore] = useState<number>(0);
  const [, setComments] = useState<string>('');
  const [modalVisible, setModalVisible] = useState<"edit" | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const hasLoadedOnceRef = useRef(false);

  type TabsNav = BottomTabNavigationProp<BottomStackParamList, 'Reviews'>;
  const navigation = useNavigation<TabsNav>();

  const handleDetailPress = (id: string) => {
    navigation.navigate('Records', {
      screen: 'RecordDetails',
      // Reviewsから遷移した詳細は、ヘッダー戻るでReviewsタブへ返すために遷移元を渡す。
      params: { id, returnTo: { tab: 'Reviews' } },
    });
  };

  const fetchReviews = useCallback(async () => {
    // 前回の一覧を残して更新し、再訪時のガクつきを抑える。
    if (hasLoadedOnceRef.current) {
      setIsRefreshing(true);
    } else {
      setIsInitialLoading(true);
    }

    try {
      const data = await listReviews();
      setReviews(data);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      hasLoadedOnceRef.current = true;
      setIsInitialLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void fetchReviews();
    }, [fetchReviews])
  );

  const handleEditPress = (id: string, currentScore: number, currentComments: string | null) => {
    setEditReviewId(id);
    setScore(currentScore);
    setComments(currentComments ?? '');
    setModalVisible("edit");
  };

  const handleReviewSubmit = async (newScore: number, newComments: string) => {
    if (!editReviewId) return;

    try {
      setIsSubmitting(true);
      await updateReview(editReviewId, newScore, newComments);
      await fetchReviews();
    } catch (error) {
      console.error("Error updating review:", error);
    } finally {
      setIsSubmitting(false);
      setModalVisible(null);
      setEditReviewId(null);
      setScore(0);
      setComments('');
    }
  };

  const handleDeletePress = async (id: string) => {
    if (!id) return;
    try {
      setIsSubmitting(true);
      await deleteReview(id);
      setDeleteTarget(null);
      await fetchReviews();
    } catch (error) {
      console.error("Error deleting review:", error);
    } finally {
      setIsSubmitting(false);
    }

  };

  const reviewItems = reviews.map((review) => (
    <View
      key={review.id}
      className="mb-4 rounded-2xl border-2 border-OCHER bg-DARK_BROWN px-4 py-4 ios:shadow-md android:elevation-md"
    >
      <View className="flex-row justify-between">
        <Text className="text-xl text-OCHER" style={{ fontFamily: fonts.body }}>
          {review.record?.coffee.brand?.name}
        </Text>
        <TouchableOpacity
          onPress={() => handleDetailPress(review.record_id)}
        >
          <FontAwesome5 name="arrow-circle-right" size={28} color={colors.OCHER} />
        </TouchableOpacity>

      </View>
      <Text className="text-2xl text-OCHER" style={{ fontFamily: fonts.body }}>
        {review.record?.coffee.name}
      </Text>
      <Text className="mt-1 text-base text-OCHER" style={{ fontFamily: fonts.body_bold }}>
        {review.record?.start_date} ~ {review.record?.end_date}
      </Text>
      <View className="mt-2 flex-row items-center">
        <Text className="text-base text-OCHER" style={{ fontFamily: fonts.body }}>
          {'⭐️'.repeat(review.score)}
        </Text>
      </View>
      {review.comments && (
        <Text className="mt-2 text-base text-OCHER" style={{ fontFamily: fonts.body }}>
          {review.comments}
        </Text>
      )}

      <View className="mt-4 flex-row justify-end space-x-4">
        <TouchableOpacity
          onPress={() => handleEditPress(review.id, review.score, review.comments)}
          disabled={isSubmitting}
          style={{ opacity: isSubmitting ? 0.6 : 1 }}
        >
          <FontAwesome name="pencil" size={28} color={colors.OCHER} />
        </TouchableOpacity>
        <TouchableOpacity
          className="ml-4"
          disabled={isSubmitting}
          style={{ opacity: isSubmitting ? 0.6 : 1 }}
          onPress={() => setDeleteTarget({
            id: review.id,
            name: review.record?.coffee.name ?? 'このレビュー',
          })}
        >
          <FontAwesome name="trash" size={28} color={colors.OCHER} />
        </TouchableOpacity>
      </View>
    </View>
  ));

  const reviewListSkeleton = (
    <View>
      {[0, 1, 2].map((index) => (
        <ScreenSkeletonCard key={index}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}>
            <ScreenSkeletonLine width="36%" height={18} />
            <ScreenSkeletonLine width={24} height={24} />
          </View>
          <ScreenSkeletonLine width="52%" height={24} style={{ marginBottom: 10 }} />
          <ScreenSkeletonLine width="48%" height={14} style={{ marginBottom: 12 }} />
          <ScreenSkeletonLine width="28%" height={16} style={{ marginBottom: 12 }} />
          <ScreenSkeletonLine width="100%" height={14} style={{ marginBottom: 8 }} />
          <ScreenSkeletonLine width="72%" height={14} />
        </ScreenSkeletonCard>
      ))}
    </View>
  );

  return (
    <ImageBackground
      source={textureImage}
      style={{ flex: 1 }}
      imageStyle={{ resizeMode: 'cover' }}
    >
      <ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1, paddingBottom: 24 }}>
        <View className="px-5 py-6">
          {isInitialLoading ? (
            reviewListSkeleton
          ) : (
            <>
              <ScreenStatusOverlay visible={isRefreshing} label="レビューを更新中…" />
              {reviews.length === 0 ? (
                <View className="rounded-2xl border-2 border-OCHER bg-DARK_BROWN px-4 py-4 ios:shadow-md android:elevation-md">
                  <Text className="text-lg text-OCHER" style={{ fontFamily: fonts.body }}>
                    まだレビューがありません。
                    {'\n'}コーヒーを飲み終えたらレビューを追加しましょう！
                  </Text>
                </View>
              ) : (
                <View>{reviewItems}</View>
              )}
            </>
          )}
        </View>

        {modalVisible === "edit" && (
          <ReviewForm
            initialScore={reviews.find(r => r.id === editReviewId)?.score ?? 0}
            initialComments={reviews.find(r => r.id === editReviewId)?.comments || ""}
            onSubmit={({ score, comments }) => handleReviewSubmit(score, comments)}
            onCancel={() => setModalVisible(null)}
            loading={isSubmitting}
          />
        )}

        <DeleteConfirmModal
          visible={deleteTarget !== null}
          selectedItemName={deleteTarget?.name ?? 'このレビュー'}
          onConfirm={() => {
            if (deleteTarget) {
              void handleDeletePress(deleteTarget.id);
            }
          }}
          onClose={() => setDeleteTarget(null)}
        />
      </ScrollView>
    </ImageBackground>
  )
}
