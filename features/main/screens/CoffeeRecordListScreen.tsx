import { ScrollView, Text, TouchableOpacity, View } from 'react-native'
import React, { useCallback, useState } from 'react'
import { FinishedWithReview, RecordsStackParamList, UnfinishedWithName } from '../../../type';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { finishDrinkingRecord, listFinishedDrinkingRecords, listUnfinishedDrinkingRecords } from '../../auth/services/recordService';
import { formatLocalYYYYMMDD } from '../../../utils/date';
import ReviewForm from '../components/ReviewForm';
import { createReview } from '../../auth/services/reviewService';
import { fonts } from '../../../app/main/theme/fonts';
import { colors } from '../../../app/main/theme/colors';

export default function CoffeeRecordListScreen() {
  const [ongoingRecords, setOngoingRecords] = useState<UnfinishedWithName[]>([]);
  const [finishedRecords, setFinishedRecords] = useState<FinishedWithReview[]>([]);
  const [modalVisible, setModalVisible] = useState<"review" | null>(null);
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      fetchOngoingRecords();
      fetchFinishedRecords();
    }, [])
  );

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

      fetchOngoingRecords();
      fetchFinishedRecords();
    } catch (error) {
      console.error("Error finishing drinking record:", error);
    }
  }

  const ongoingRecordItems = ongoingRecords.map((record) => (
    <View
      key={record.id}
      className="mb-3 rounded-2xl border border-[#E6DACE] bg-white/90 px-4 py-4"
    >
      {/* 詳細クリックした場合はcoffeeRecordの詳細画面に遷移予定 */}
      <Text className="text-lg text-[#3B0D0C]" style={{ fontFamily: fonts.title_bold }}>
        {record.coffee?.brand?.name}
      </Text>
      <Text className="text-base text-[#6A1B1A]" style={{ fontFamily: fonts.title_medium }}>
        {record.coffee?.name}
      </Text>
      <Text className="mt-1 text-sm text-[#6A1B1A]" style={{ fontFamily: fonts.body_regular }}>
        Started on {new Date(record.start_date).toLocaleDateString()}
      </Text>
      <TouchableOpacity
        className="mt-3 self-start rounded-full border border-[#6A1B1A] px-4 py-2"
        onPress={() => handleDetailPress(record.id)}
      >
        <Text className="text-sm text-[#6A1B1A]" style={{ fontFamily: fonts.body_bold }}>
          詳細画面へ
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        className="mt-2 self-start rounded-full bg-[#A23E48] px-4 py-2"
        onPress={() => handleFinishPress(record.id)}
      >
        <Text className="text-sm text-white" style={{ fontFamily: fonts.body_bold }}>
          飲み終えた！
        </Text>
      </TouchableOpacity>
    </View>
  ));

  const finishedRecordItems = finishedRecords.map((record) => {
    if (record.end_date) {
      return (
        <View
          key={record.id}
          className="mb-3 rounded-2xl border border-[#E6DACE] bg-white/70 px-4 py-4"
        >
          {/* 詳細クリックした場合はcoffeeRecordの詳細画面に遷移予定 */}
          <Text className="text-lg text-[#3B0D0C]" style={{ fontFamily: fonts.title_bold }}>
            {record.coffee?.brand?.name}
          </Text>
          <Text className="text-base text-[#6A1B1A]" style={{ fontFamily: fonts.title_medium }}>
            {record.coffee?.name}
          </Text>
          <Text className="mt-1 text-sm text-[#6A1B1A]" style={{ fontFamily: fonts.body_regular }}>
            Finished on {new Date(record.end_date).toLocaleDateString()}
          </Text>
          <TouchableOpacity
            className="mt-3 self-start rounded-full border border-[#6A1B1A] px-4 py-2"
            onPress={() => handleDetailPress(record.id)}
          >
            <Text className="text-sm text-[#6A1B1A]" style={{ fontFamily: fonts.body_bold }}>
              詳細画面へ
            </Text>
          </TouchableOpacity>
          {!record.hasReview && (
            <TouchableOpacity
              className="mt-2 self-start rounded-full bg-[#3B0D0C] px-4 py-2"
              onPress={() => { setSelectedRecordId(record.id); setModalVisible("review") }}
            >
              <Text className="text-sm text-white" style={{ fontFamily: fonts.body_bold }}>
                レビューを追加する
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )
    }
  });

  const howToUse = ongoingRecords.length === 0 && finishedRecords.length === 0 && (
    <Text
      className="mt-6 rounded-2xl bg-white/80 px-4 py-4 text-sm leading-6 text-[#3B0D0C]"
      style={{ fontFamily: fonts.body_regular }}
    >
      My Coffee Journeyの使い方
      {'\n'}1. 設定画面でコーヒーブランド名、コーヒー豆産地、コーヒーの挽き目を登録します。
      {'\n'}2. コーヒー画面でコーヒーの登録をします。
      {'\n'}3. コーヒーを飲み始めたら、「飲んでるコーヒー記録登録画面へ」ボタンから記録を登録します。
      {'\n'}4. コーヒーを飲み終えたら、記録の「飲み終えた！」ボタンを押して、レビューを追加します。
      {'\n'}5. カレンダー画面で飲んだコーヒーの履歴を確認したり、分析画面で飲んだコーヒーの傾向を確認したりできます。
      {'\n'}6. レビュー画面で過去のレビューを確認できます。
      {'\n'}ぜひ、My Coffee Journeyであなたのコーヒーライフを充実させてください！
    </Text>
  );

  return (
    <ScrollView className="flex-1 bg-[#F6EFE7]">
      <View className="px-5 py-6">
        {/* NativeWindを使って背景色やカードをTailwind記法で整え、記録一覧を視覚的に整理 */}
        <Text
          className="mt-4 text-3xl text-[#3B0D0C]"
          style={{ fontFamily: fonts.title_bold }}
        >
          飲んでるコーヒー
        </Text>
        {howToUse}
        {ongoingRecordItems.length === 0 ? (
          <View className="mb-3 rounded-2xl border border-[#E6DACE] bg-white/70 px-4 py-4">
            <Text className="text-lg text-[#3B0D0C]" style={{ fontFamily: fonts.title_bold }}>
              現在飲んでいるコーヒーはありません。
              {'\n'}登録しましょう！
            </Text>
          </View>
        ) : (
          <View className="mt-4">{ongoingRecordItems}</View>
        )}
        <Text
          className="mt-4 text-3xl text-[#3B0D0C]"
          style={{ fontFamily: fonts.title_bold }}
        >
          飲み終えたコーヒー
        </Text>
        <View className="mt-4">{finishedRecordItems}</View>
        <TouchableOpacity
          className="mt-8 w-full rounded-full bg-[#6A1B1A] py-4"
          onPress={() => handleCreatePress()}
        >
          <Text
            className="text-center text-base text-white"
            style={{ fontFamily: fonts.body_bold, color: colors.accent }}
          >
            飲んでるコーヒー記録登録画面へ
          </Text>
        </TouchableOpacity>
      </View>
      {modalVisible === "review" && (
        <ReviewForm
          onSubmit={({ score, comments }) => handleReviewSubmit(score, comments)}
          onCancel={() => setModalVisible(null)}
        />
      )}
    </ScrollView>
  )
}

// const styles = StyleSheet.create({})
