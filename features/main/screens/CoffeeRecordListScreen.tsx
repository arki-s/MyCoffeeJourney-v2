import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { DrinkingRecord, RecordsStackParamList } from '../../../type';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { finishDrinkingRecord, listFinishedDrinkingRecords, listUnfinishedDrinkingRecords } from '../../auth/services/recordService';
import { formatLocalYYYYMMDD } from '../../../utils/date';
import ReviewForm from '../components/ReviewForm';
import { createReview } from '../../auth/services/reviewService';

export default function CoffeeRecordListScreen() {
  const [ongoingRecords, setOngoingRecords] = useState<DrinkingRecord[]>([]);
  const [finishedRecords, setFinishedRecords] = useState<DrinkingRecord[]>([]);
  const [modalVisible, setModalVisible] = useState<"review" | null>(null);
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);

  useEffect(() => {
    fetchOngoingRecords();
    fetchFinishedRecords();
  }, []);

  const fetchOngoingRecords = async () => {
    try {
      const data = await listUnfinishedDrinkingRecords();
      setOngoingRecords(data);
    } catch (error) {
      console.error("Error fetching ongoing records:", error);
    }
  };

  const fetchFinishedRecords = async () => {
    try {
      const data = await listFinishedDrinkingRecords();
      setFinishedRecords(data);
    } catch (error) {
      console.error("Error fetching finished records:", error);
    }
  };

  type RecordsNav = NativeStackNavigationProp<RecordsStackParamList, 'RecordsHome'>;
  const navigation = useNavigation<RecordsNav>();

  const handleCreatePress = () => {
    navigation.navigate('RecordCreate');
  };

  const handleDetailPress = (id: string) => {
    navigation.navigate('RecordDetails', { id });
  };

  const handleFinishPress = (id: string) => {
    setSelectedRecordId(id);
    finishDrinking(id);
    setModalVisible("review");
  };

  const handleReviewSubmit = async (score: number, comments: string) => {
    if (!selectedRecordId) return;

    try {
      await createReview(score, comments, selectedRecordId);
      fetchFinishedRecords();
      fetchOngoingRecords();

    } catch (error) {
      console.error("Error submitting review:", error);

    } finally {
      setModalVisible(null);
    }
  };

  const finishDrinking = async (id: string) => {
    try {

      // 日付は仮で現在日時を使用
      await finishDrinkingRecord(id, formatLocalYYYYMMDD(new Date()));

      // 今後この時点でモーダルを表示させてレビュー登録を促す

      fetchOngoingRecords();
      fetchFinishedRecords();
    } catch (error) {
      console.error("Error finishing drinking record:", error);
    }
  }

  const ongoingRecordItems = ongoingRecords.map((record) => (
    <View key={record.id} style={{ padding: 8, borderBottomWidth: 1, borderBottomColor: '#ccc' }}>
      <Text style={{ fontSize: 18 }}>Started on {new Date(record.start_date).toLocaleDateString()}</Text>
      <TouchableOpacity onPress={() => handleDetailPress(record.id)}>
        <Text style={{ color: '#007AFF', marginTop: 4 }}>詳細画面へ</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => handleFinishPress(record.id)}>
        <Text style={{ color: '#007AFF', marginTop: 4 }}>飲み終えた！</Text>
      </TouchableOpacity>
    </View>
  ));

  const finishedRecordItems = finishedRecords.map((record) => {
    if (record.end_date) {
      return (
        <View key={record.id} style={{ padding: 8, borderBottomWidth: 1, borderBottomColor: '#ccc' }}>
          <Text style={{ fontSize: 18 }}>Finished on {new Date(record.end_date).toLocaleDateString()}</Text>
          <TouchableOpacity onPress={() => handleDetailPress(record.id)}>
            <Text style={{ color: '#007AFF', marginTop: 4 }}>詳細画面へ</Text>
          </TouchableOpacity>
          {/* レビューが一個もない記録にはレビュー追加ボタンを表示する */}
        </View>
      )
    }
  });

  return (
    <View>
      <Text>CoffeeRecordListScreen</Text>
      <Text>飲んでるコーヒー</Text>
      {ongoingRecordItems}
      <Text>飲み終えたコーヒー</Text>
      {finishedRecordItems}

      <TouchableOpacity
        onPress={() => handleCreatePress()}
        style={{
          backgroundColor: '#34C759',
          padding: 12,
          marginTop: 16,
          borderRadius: 8,
        }}
      >
        <Text style={{ color: '#fff', textAlign: 'center' }}>
          飲んでるコーヒー記録登録画面へ
        </Text>
      </TouchableOpacity>
      {modalVisible === "review" && (
        <ReviewForm
          onSubmit={({ score, comments }) => handleReviewSubmit(score, comments)}
          onCancel={() => setModalVisible(null)}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({})
