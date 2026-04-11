import { ImageBackground, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import React, { useCallback, useRef, useState } from 'react'
import { FinishedWithReview, RecordsStackParamList, UnfinishedWithName } from '../../../type';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { finishDrinkingRecord, listFinishedDrinkingRecords, listUnfinishedDrinkingRecords } from '../../auth/services/recordService';
import { formatLocalYYYYMMDD } from '../../../utils/date';
import ReviewForm from '../components/ReviewForm';
import { createReview } from '../../auth/services/reviewService';
import { fonts } from '../../../app/main/theme/fonts';
import { colors } from '../../../app/main/theme/colors';
import textureImage from '../../../assets/texture.jpg';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import Octicons from '@expo/vector-icons/Octicons';
import { ScreenSkeletonCard, ScreenSkeletonLine, ScreenStatusOverlay } from '../components/ScreenLoading';

export default function CoffeeRecordListScreen() {
  const [ongoingRecords, setOngoingRecords] = useState<UnfinishedWithName[]>([]);
  const [finishedRecords, setFinishedRecords] = useState<FinishedWithReview[]>([]);
  const [modalVisible, setModalVisible] = useState<"review" | null>(null);
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const hasLoadedOnceRef = useRef(false);

  const fetchRecords = useCallback(async () => {
    // 一覧を消さずに再取得して、再訪時のガクつきを抑える。
    if (hasLoadedOnceRef.current) {
      setIsRefreshing(true);
    } else {
      setIsInitialLoading(true);
    }

    const [ongoingResult, finishedResult] = await Promise.allSettled([
      listUnfinishedDrinkingRecords(),
      listFinishedDrinkingRecords(),
    ]);

    if (ongoingResult.status === 'fulfilled') {
      setOngoingRecords(ongoingResult.value);
    } else {
      console.error("Error fetching ongoing records:", ongoingResult.reason);
    }

    if (finishedResult.status === 'fulfilled') {
      setFinishedRecords(finishedResult.value);
    } else {
      console.error("Error fetching finished records:", finishedResult.reason);
    }

    hasLoadedOnceRef.current = true;
    setIsInitialLoading(false);
    setIsRefreshing(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      void fetchRecords();
    }, [fetchRecords])
  );

  type RecordsNav = NativeStackNavigationProp<RecordsStackParamList, 'RecordsHome'>;
  const navigation = useNavigation<RecordsNav>();

  const handleCreatePress = () => {
    navigation.navigate('RecordCreate');
  };

  const handleDetailPress = (id: string) => {
    // Records一覧から開いた詳細は、同じ一覧へ戻せるように戻り先を明示する。
    navigation.navigate('RecordDetails', {
      id,
      returnTo: { tab: 'Records', screen: 'RecordsHome' },
    });
  };

  const handleFinishPress = async (id: string) => {
    setSelectedRecordId(id);

    const finished = await finishDrinking(id);
    if (finished) {
      setModalVisible("review");
    }
  };

  const handleReviewSubmit = async (score: number, comments: string) => {
    if (!selectedRecordId) return;

    try {
      setIsSubmitting(true);
      await createReview(score, comments, selectedRecordId);
      await fetchRecords();

    } catch (error) {
      console.error("Error submitting review:", error);

    } finally {
      setIsSubmitting(false);
      setModalVisible(null);
      setSelectedRecordId(null);
    }
  };

  const finishDrinking = async (id: string) => {
    try {
      setIsSubmitting(true);

      // 日付は仮で現在日時を使用
      await finishDrinkingRecord(id, formatLocalYYYYMMDD(new Date()));
      await fetchRecords();
      return true;
    } catch (error) {
      console.error("Error finishing drinking record:", error);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const ongoingRecordItems = ongoingRecords.map((record) => (
    <View
      key={record.id}
      className="mb-3 rounded-2xl border-2 border-OCHER bg-DARK_BROWN px-4 py-4 ios:shadow-md android:elevation-md"
    >
      <TouchableOpacity
        className="absolute right-4 top-4"
        onPress={() => handleDetailPress(record.id)}
      >
        <FontAwesome5 name="arrow-circle-right" size={28} color={colors.OCHER} />
      </TouchableOpacity>
      <View className="self-center mb-4">
        <Text className="text-lg text-OCHER" style={{ fontFamily: fonts.body }}>
          {record.coffee?.brand?.name}
        </Text>
        <Text className="text-2xl text-OCHER" style={{ fontFamily: fonts.body }}>
          {record.coffee?.name}
        </Text>
        <Text className="mt-1 text-md text-OCHER" style={{ fontFamily: fonts.body_bold }}>
          Started on {new Date(record.start_date).toLocaleDateString()}
        </Text>
      </View>
      <TouchableOpacity
        className="mb-1 self-center rounded-full border-2 border-OCHER  bg-BROWN px-4 py-2"
        onPress={() => void handleFinishPress(record.id)}
        disabled={isSubmitting}
        style={{ opacity: isSubmitting ? 0.6 : 1 }}
      >
        <Text className="text-md text-OCHER" style={{ fontFamily: fonts.body }}>
          {isSubmitting && selectedRecordId === record.id ? '更新中…' : '飲み終えた！'}
        </Text>
      </TouchableOpacity>
    </View>
  ));

  const finishedRecordItems = finishedRecords.map((record) => {
    if (record.end_date) {
      return (
        <View
          key={record.id}
          className="mb-3 rounded-2xl border-2 border-LIGHT_BROWN bg-DARK_BROWN px-4 py-4 ios:shadow-md android:elevation-md"
        >
          <TouchableOpacity
            className="absolute right-4 top-4"
            onPress={() => handleDetailPress(record.id)}
          >
            <FontAwesome5 name="arrow-circle-right" size={28} color={colors.LIGHT_BROWN} />
          </TouchableOpacity>
          <View className="self-center mb-4">
            <Text className="text-lg text-LIGHT_BROWN" style={{ fontFamily: fonts.body }}>
              {record.coffee?.brand?.name}
            </Text>
            <Text className="text-2xl text-LIGHT_BROWN" style={{ fontFamily: fonts.body }}>
              {record.coffee?.name}
            </Text>
            <Text className="mt-1 text-md text-LIGHT_BROWN" style={{ fontFamily: fonts.body_bold }}>
              {new Date(record.start_date).toLocaleDateString()}〜{new Date(record.end_date).toLocaleDateString()}
            </Text>
          </View>

          {!record.hasReview && (
            <TouchableOpacity
              className="mt-2 self-center border-2 border-OCHER rounded-full bg-BROWN px-4 py-2"
              onPress={() => { setSelectedRecordId(record.id); setModalVisible("review") }}
            >
              <Text className="text-md text-OCHER" style={{ fontFamily: fonts.body }}>
                レビューを追加する
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )
    }
  });

  const howToUse = ongoingRecords.length === 0 && finishedRecords.length === 0 && (
    <View className="mb-3 rounded-2xl border-2 border-OCHER bg-DARK_BROWN px-4 py-4 ios:shadow-md android:elevation-md">
      <Text>
        <Text className="text-lg text-OCHER text-center" style={{ fontFamily: fonts.header_footer }}>
          HOW TO USE
        </Text>
      </Text>
      <Text
        className="text-md text-OCHER"
        style={{ fontFamily: fonts.body }}
      >
        {'\n'}1. 設定画面でコーヒーブランド名、コーヒー豆産地、コーヒーの挽き目を登録します。
        {'\n'}
        {'\n'}2. コーヒー画面でコーヒーの登録をします。
        {'\n'}
        {'\n'}3. コーヒーを飲み始めたら、右下の丸いプラスボタンから記録を登録します。
        {'\n'}
        {'\n'}4. コーヒーを飲み終えたら、記録の「飲み終えた！」ボタンを押して、レビューを追加します。
        {'\n'}
        {'\n'}5. カレンダー画面で飲んだコーヒーの履歴を確認したり、分析画面で飲んだコーヒーの傾向を確認したりできます。
        {'\n'}
        {'\n'}6. レビュー画面で過去のレビューを確認できます。
        {'\n'}
        {'\n'}ぜひ、My Coffee Journeyであなたのコーヒーライフを充実させてください！
      </Text>
    </View>
  );

  const hasOngoingRecords = ongoingRecords.length > 0;
  const hasFinishedRecords = finishedRecords.length > 0;
  const showHowToUseOnly = !hasOngoingRecords && !hasFinishedRecords;
  const showOngoingEmptyState = !hasOngoingRecords && hasFinishedRecords;
  const recordListSkeleton = (
    <View>
      <View className="self-start rounded-full border border-OCHER bg-DARK_BROWN px-3 py-1 mb-2 ios:shadow-md android:elevation-md">
        <ScreenSkeletonLine width={132} height={18} />
      </View>

      {[0, 1].map((index) => (
        <ScreenSkeletonCard key={`ongoing-${index}`}>
          <ScreenSkeletonLine width="42%" height={16} style={{ alignSelf: 'center', marginBottom: 10 }} />
          <ScreenSkeletonLine width="58%" height={24} style={{ alignSelf: 'center', marginBottom: 10 }} />
          <ScreenSkeletonLine width="36%" height={14} style={{ alignSelf: 'center', marginBottom: 20 }} />
          <ScreenSkeletonLine width={128} height={16} style={{ alignSelf: 'center' }} />
        </ScreenSkeletonCard>
      ))}

      <View className="self-start rounded-full border border-LIGHT_BROWN bg-DARK_BROWN px-3 py-1 mt-4 mb-2 ios:shadow-md android:elevation-md">
        <ScreenSkeletonLine width={152} height={18} />
      </View>

      <ScreenSkeletonCard borderColor={colors.LIGHT_BROWN}>
        <ScreenSkeletonLine width="42%" height={16} style={{ alignSelf: 'center', marginBottom: 10 }} />
        <ScreenSkeletonLine width="58%" height={24} style={{ alignSelf: 'center', marginBottom: 10 }} />
        <ScreenSkeletonLine width="44%" height={14} style={{ alignSelf: 'center' }} />
      </ScreenSkeletonCard>
    </View>
  );

  return (
    <ImageBackground
      source={textureImage}
      style={{ flex: 1 }}
      imageStyle={{ resizeMode: 'cover' }}
    >
      <ScrollView className="flex-1" contentContainerStyle={{ paddingBottom: 112 }}>
        <View className="px-5 py-6">
          {isInitialLoading ? (
            recordListSkeleton
          ) : (
            <>
              <ScreenStatusOverlay visible={isRefreshing} label="記録を更新中…" />
              {showHowToUseOnly ? (
                howToUse
              ) : (
                <>
                  <View className="self-start rounded-full border border-OCHER bg-DARK_BROWN px-3 py-1 mb-2 ios:shadow-md android:elevation-md">
                    <Text className="text-xl text-OCHER" style={{ fontFamily: fonts.body }}>
                      飲んでるコーヒー
                    </Text>
                  </View>
                  {showOngoingEmptyState ? (
                    <View className="mb-3 rounded-2xl border-2 border-OCHER bg-DARK_BROWN px-4 py-4 ios:shadow-md android:elevation-md">
                      <Text className="text-lg text-OCHER" style={{ fontFamily: fonts.body }}>
                        現在飲んでいるコーヒーはありません。
                        {'\n'}登録しましょう！
                      </Text>
                    </View>
                  ) : (
                    <View className="mt-4">{ongoingRecordItems}</View>
                  )}
                  {hasFinishedRecords && (
                    <>
                      <View className="self-start rounded-full border border-LIGHT_BROWN bg-DARK_BROWN px-3 py-1 mt-4 ios:shadow-md android:elevation-md">
                        <Text className="text-xl text-LIGHT_BROWN" style={{ fontFamily: fonts.body }}>
                          飲み終えたコーヒー
                        </Text>
                      </View>
                      <View className="mt-2">{finishedRecordItems}</View>
                    </>
                  )}
                </>
              )}
            </>
          )}
        </View>
        {modalVisible === "review" && (
          <ReviewForm
            onSubmit={({ score, comments }) => handleReviewSubmit(score, comments)}
            onCancel={() => setModalVisible(null)}
            loading={isSubmitting}
          />
        )}
      </ScrollView>
      <TouchableOpacity
        className="absolute bottom-6 right-5 h-16 w-16 items-center justify-center rounded-full border-2 border-OCHER bg-DARK_BROWN ios:shadow-md android:elevation-md"
        onPress={() => handleCreatePress()}
      >
        <Octicons name="plus" size={34} color={colors.OCHER} />
      </TouchableOpacity>
    </ImageBackground>
  )
}

// const styles = StyleSheet.create({})
