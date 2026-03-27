import { Dimensions, ImageBackground, ScrollView, Text, View } from 'react-native'
import React, { useCallback, useState } from 'react'
import { LineChart } from 'react-native-chart-kit'
import { useFocusEffect } from '@react-navigation/native'
import { getAnalysisData } from '../../auth/services/analysisService';
import { AnalysisData } from '../../../type';
import { fonts } from '../../../app/main/theme/fonts';
import { colors } from '../../../app/main/theme/colors';
import textureImage from '../../../assets/texture.jpg';

const screenWidth = Dimensions.get('window').width;
const chartWidth = Math.max(screenWidth - 56, 260);
const fallbackMonthLabels = ['1月', '2月', '3月', '4月', '5月', '6月'];
const fallbackChartData = fallbackMonthLabels.map(() => 0);

const chartConfig = {
  backgroundColor: colors.DARK_BROWN,
  backgroundGradientFrom: colors.DARK_BROWN,
  backgroundGradientTo: colors.BROWN,
  decimalPlaces: 0,
  color: (opacity = 1) => `rgba(204, 149, 68, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(204, 149, 68, ${opacity})`,
  propsForDots: {
    r: '5',
    strokeWidth: '2',
    stroke: colors.OCHER,
    fill: colors.OCHER,
  },
  propsForBackgroundLines: {
    stroke: 'rgba(204, 149, 68, 0.25)',
  },
  style: {
    borderRadius: 16,
  },
};

export default function AnalysisScreen() {
  const [, setLoading] = useState<boolean>(false);
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);

  useFocusEffect(
    useCallback(() => {
      void fetchAnalysisData();
    }, [])
  );

  const fetchAnalysisData = async () => {
    try {
      setLoading(true);
      const data = await getAnalysisData();
      setAnalysisData(data);
    } catch (error) {
      console.error('Error fetching analysis data', error);
    } finally {
      setLoading(false);
    }
  };

  const monthLabels = analysisData?.monthLabels.length
    ? analysisData.monthLabels
    : fallbackMonthLabels;
  const yenData = analysisData?.monthlyData.length
    ? analysisData.monthlyData.map((item) => item.yen)
    : fallbackChartData;
  const gramsData = analysisData?.monthlyData.length
    ? analysisData.monthlyData.map((item) => item.grams)
    : fallbackChartData;

  const rankingItems = analysisData?.coffeeRanking.length ? (
    analysisData.coffeeRanking.map((item, index) => (
      <View
        key={item.coffeeId}
        className="mb-3 rounded-2xl border border-OCHER bg-BROWN px-4 py-3"
      >
        <Text className="text-sm text-OCHER" style={{ fontFamily: fonts.body_regular }}>
          {index + 1}位
        </Text>
        <Text className="text-lg text-OCHER" style={{ fontFamily: fonts.title_bold }}>
          {item.brand}
        </Text>
        <Text className="text-xl text-OCHER" style={{ fontFamily: fonts.title_medium }}>
          {item.name}
        </Text>
        <Text className="mt-1 text-sm text-OCHER" style={{ fontFamily: fonts.body_regular }}>
          飲んだ回数: {item.count}回
        </Text>
      </View>
    ))
  ) : (
    <View className="rounded-2xl border border-OCHER bg-BROWN px-4 py-4">
      <Text className="text-center text-lg text-OCHER" style={{ fontFamily: fonts.body }}>
        まだ集計できるデータがありません。
      </Text>
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
          <View className="mb-3 rounded-2xl border-2 border-OCHER bg-DARK_BROWN px-4 py-4 ios:shadow-md android:elevation-md">
            <Text className="text-lg text-OCHER" style={{ fontFamily: fonts.body }}>
              累計データ
            </Text>

            <View className="mt-4 rounded-2xl border border-OCHER bg-BROWN px-4 py-3">
              <Text className="text-sm text-OCHER" style={{ fontFamily: fonts.body_regular }}>
                飲んだ回数合計
              </Text>
              <Text className="mt-1 text-3xl text-OCHER" style={{ fontFamily: fonts.body }}>
                {analysisData?.count ?? 0}回
              </Text>
            </View>

            <View className="mt-3 rounded-2xl border border-OCHER bg-BROWN px-4 py-3">
              <Text className="text-sm text-OCHER" style={{ fontFamily: fonts.body_regular }}>
                飲んだ量合計
              </Text>
              <Text className="mt-1 text-3xl text-OCHER" style={{ fontFamily: fonts.body }}>
                {analysisData?.totals.grams ?? 0}g
              </Text>
            </View>

            <View className="mt-3 rounded-2xl border border-OCHER bg-BROWN px-4 py-3">
              <Text className="text-sm text-OCHER" style={{ fontFamily: fonts.body_regular }}>
                払った金額合計
              </Text>
              <Text className="mt-1 text-3xl text-OCHER" style={{ fontFamily: fonts.body }}>
                {analysisData?.totals.yen ?? 0}円
              </Text>
            </View>
          </View>

          <View className="mb-3 rounded-2xl border-2 border-OCHER bg-DARK_BROWN px-4 py-4 ios:shadow-md android:elevation-md">
            <Text className="text-lg text-OCHER" style={{ fontFamily: fonts.body }}>
              よく飲んでいるコーヒー
            </Text>
            <Text className="mt-1 mb-4 text-sm text-OCHER" style={{ fontFamily: fonts.body_regular }}>
              ランキング形式で表示しています
            </Text>
            {rankingItems}
          </View>

          <View className="mb-3 rounded-2xl border-2 border-OCHER bg-DARK_BROWN px-4 py-4 ios:shadow-md android:elevation-md">
            <Text className="text-lg text-OCHER" style={{ fontFamily: fonts.body }}>
              月ごとの合計金額
            </Text>
            <Text className="mt-1 text-sm text-OCHER" style={{ fontFamily: fonts.body_regular }}>
              月別の支出推移
            </Text>
            <LineChart
              data={{
                labels: monthLabels,
                datasets: [{ data: yenData }],
              }}
              width={chartWidth}
              height={220}
              yAxisLabel=""
              yAxisSuffix="円"
              yAxisInterval={1}
              chartConfig={chartConfig}
              bezier
              style={{
                marginTop: 16,
                borderRadius: 16,
                alignSelf: 'center',
              }}
            />
          </View>

          <View className="rounded-2xl border-2 border-OCHER bg-DARK_BROWN px-4 py-4 ios:shadow-md android:elevation-md">
            <Text className="text-lg text-OCHER" style={{ fontFamily: fonts.body }}>
              月ごとの合計量
            </Text>
            <Text className="mt-1 text-sm text-OCHER" style={{ fontFamily: fonts.body_regular }}>
              月別の消費量推移
            </Text>
            <LineChart
              data={{
                labels: monthLabels,
                datasets: [{ data: gramsData }],
              }}
              width={chartWidth}
              height={220}
              yAxisLabel=""
              yAxisSuffix="g"
              yAxisInterval={1}
              chartConfig={{ ...chartConfig, decimalPlaces: 1 }}
              bezier
              style={{
                marginTop: 16,
                borderRadius: 16,
                alignSelf: 'center',
              }}
            />
          </View>
        </View>
      </ScrollView>
    </ImageBackground>
  )
}
