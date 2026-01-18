import { ScrollView, Text, TouchableOpacity, View } from 'react-native'
import React, { useCallback, useState } from 'react'
import { BottomStackParamList, ReviewWithContext } from '../../../type';
import { deleteReview, listReviews, updateReview } from '../../auth/services/reviewService';
import ReviewForm from '../components/ReviewForm';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { fonts } from '../../../app/main/theme/fonts';

export default function ReviewListScreen() {
  const [reviews, setReviews] = useState<ReviewWithContext[]>([]);
  const [editReviewId, setEditReviewId] = useState<string | null>(null);
  const [, setScore] = useState<number>(0);
  const [, setComments] = useState<string>('');
  const [modalVisible, setModalVisible] = useState<"edit" | null>(null);

  type TabsNav = BottomTabNavigationProp<BottomStackParamList, 'Reviews'>;
  const navigation = useNavigation<TabsNav>();

  const handleDetailPress = (id: string) => {
    navigation.navigate('Records', {
      screen: 'RecordDetails',
      params: { id },
    });
  };

  useFocusEffect(
    useCallback(() => {
      fetchReviews();
    }, [])
  );

  const fetchReviews = async () => {
    try {
      const data = await listReviews();
      setReviews(data);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  const handleEditPress = (id: string, currentScore: number, currentComments: string | null) => {
    setEditReviewId(id);
    setScore(currentScore);
    setComments(currentComments ?? '');
    setModalVisible("edit");
  };

  const handleReviewSubmit = async (newScore: number, newComments: string) => {
    if (!editReviewId) return;

    try {
      await updateReview(editReviewId, newScore, newComments);
      fetchReviews();
    } catch (error) {
      console.error("Error updating review:", error);
    } finally {
      setModalVisible(null);
      setEditReviewId(null);
      setScore(0);
      setComments('');
    }
  };

  const handleDeletePress = async (id: string) => {
    if (!id) return;
    try {
      await deleteReview(id);
      fetchReviews();
    } catch (error) {
      console.error("Error deleting review:", error);
    }

  };

  const reviewItems = reviews.map((review) => (
    <View
      key={review.id}
      className="mb-3 rounded-2xl border border-[#E6DACE] bg-white/90 px-4 py-4"
    >
      <Text className="text-lg text-[#3B0D0C]" style={{ fontFamily: fonts.title_bold }}>
        {review.record?.coffee.brand?.name}
      </Text>
      <Text className="text-base text-[#6A1B1A]" style={{ fontFamily: fonts.title_medium }}>
        {review.record?.coffee.name}
      </Text>
      <Text className="mt-1 text-sm text-[#6A1B1A]" style={{ fontFamily: fonts.body_regular }}>
        {review.record?.start_date} ~ {review.record?.end_date}
      </Text>
      <View className="mt-2 flex-row items-center">
        <Text className="text-base text-[#A23E48]" style={{ fontFamily: fonts.body_bold }}>
          評価: {review.score}/5
        </Text>
      </View>
      {review.comments && (
        <Text className="mt-2 text-sm text-[#3B0D0C]" style={{ fontFamily: fonts.body_regular }}>
          {review.comments}
        </Text>
      )}

      <View className="mt-3 flex-row gap-2">
        <TouchableOpacity
          className="flex-1 rounded-full border border-[#6A1B1A] px-4 py-2"
          onPress={() => handleDetailPress(review.record_id)}
        >
          <Text className="text-center text-sm text-[#6A1B1A]" style={{ fontFamily: fonts.body_bold }}>
            詳細画面へ
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className="flex-1 rounded-full bg-[#6A1B1A] px-4 py-2"
          onPress={() => handleEditPress(review.id, review.score, review.comments)}
        >
          <Text className="text-center text-sm text-white" style={{ fontFamily: fonts.body_bold }}>
            編集
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        className="mt-2 self-start rounded-full border border-[#A23E48] px-4 py-2"
        onPress={() => handleDeletePress(review.id)}
      >
        <Text className="text-sm text-[#A23E48]" style={{ fontFamily: fonts.body_bold }}>
          削除
        </Text>
      </TouchableOpacity>
    </View>
  ));

  return (
    <ScrollView className="flex-1 bg-[#F6EFE7]">
      <View className="px-5 py-6">
        <Text
          className="mt-4 text-3xl text-[#3B0D0C]"
          style={{ fontFamily: fonts.title_bold }}
        >
          レビュー一覧
        </Text>

        {reviews.length === 0 ? (
          <View className="mt-4 mb-3 rounded-2xl border border-[#E6DACE] bg-white/70 px-4 py-4">
            <Text className="text-lg text-[#3B0D0C]" style={{ fontFamily: fonts.title_bold }}>
              まだレビューがありません。
              {'\n'}コーヒーを飲み終えたらレビューを追加しましょう！
            </Text>
          </View>
        ) : (
          <View className="mt-4">{reviewItems}</View>
        )}
      </View>

      {modalVisible === "edit" && (
        <ReviewForm
          initialScore={reviews.find(r => r.id === editReviewId)?.score ?? 0}
          initialComments={reviews.find(r => r.id === editReviewId)?.comments || ""}
          onSubmit={({ score, comments }) => handleReviewSubmit(score, comments)}
          onCancel={() => setModalVisible(null)}
        />
      )}
    </ScrollView>
  )
}

// const styles = StyleSheet.create({})
