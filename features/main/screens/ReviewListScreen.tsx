import { Text, TouchableOpacity, View } from 'react-native'
import React, { useCallback, useEffect, useState } from 'react'
import { Review, ReviewWithContext } from '../../../type';
import { deleteReview, listReviews, updateReview } from '../../auth/services/reviewService';
import ReviewForm from '../components/ReviewForm';
import { useFocusEffect } from '@react-navigation/native';

export default function ReviewListScreen() {
  const [reviews, setReviews] = useState<ReviewWithContext[]>([]);
  const [editReviewId, setEditReviewId] = useState<string | null>(null);
  const [score, setScore] = useState<number>(0);
  const [comments, setComments] = useState<string>('');
  const [modalVisible, setModalVisible] = useState<"edit" | null>(null);

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
    <View key={review.id} style={{ padding: 8, borderBottomWidth: 1, borderBottomColor: '#ccc' }}>
      {/* 詳細クリックした場合はcoffeeRecordの詳細画面に遷移予定 */}
      <Text style={{ fontSize: 18 }}>{review.record?.coffee.brand?.name}</Text>
      <Text style={{ fontSize: 18 }}>{review.record?.coffee.name}</Text>
      <Text style={{ fontSize: 18 }}>{review.record?.start_date} ~ {review.record?.end_date}</Text>
      <Text style={{ fontSize: 18 }}>{review.score}</Text>
      <Text style={{ color: '#666' }}>{review.comments}</Text>
      <TouchableOpacity onPress={() => handleEditPress(review.id, review.score, review.comments)}>
        <Text style={{ color: '#007AFF', marginTop: 4 }}>Edit</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => handleDeletePress(review.id)}>
        <Text style={{ color: '#FF3B30', marginTop: 4 }}>Delete</Text>
      </TouchableOpacity>
      {modalVisible === "edit" && (<ReviewForm
        initialScore={review.score}
        initialComments={review.comments || ""}
        onSubmit={({ score, comments }) => handleReviewSubmit(score, comments)}
        onCancel={() => setModalVisible(null)}
      />)}
    </View>
  ));

  return (
    <View>
      <Text>ReviewListScreen</Text>
      {reviewItems}
    </View>
  )
}

// const styles = StyleSheet.create({})
