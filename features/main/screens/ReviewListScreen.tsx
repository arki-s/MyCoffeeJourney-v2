import { Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Review } from '../../../type';
import { listReviews } from '../../auth/services/reviewService';

export default function ReviewListScreen() {
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const data = await listReviews();
      setReviews(data);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    }
  };

  const reviewItems = reviews.map((review) => (
    <View key={review.id} style={{ padding: 8, borderBottomWidth: 1, borderBottomColor: '#ccc' }}>
      <Text style={{ fontSize: 18 }}>{review.score}</Text>
      <Text style={{ color: '#666' }}>{review.comments}</Text>
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
