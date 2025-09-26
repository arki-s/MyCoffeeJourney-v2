import { Dimensions, Text, View } from 'react-native'
import React, { useCallback, useState } from 'react'
import { LineChart } from 'react-native-chart-kit'
import { useFocusEffect } from '@react-navigation/native'
import { getAnalysisData } from '../../auth/services/analysisService';
import { AnalysisData } from '../../../type';

export default function AnalysisScreen() {
  const [, setLoading] = useState<boolean>(false);
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);

  useFocusEffect(
    useCallback(() => {
      fetchAnalysisData();
    }, [])
  );

  const fetchAnalysisData = async () => {
    try {
      setLoading(true);
      const data = await getAnalysisData();
      setAnalysisData(data);
    } catch (error) {
      console.error("Error fetching analysis data", error);
    } finally {
      setLoading(false);
    }
  }

  const ranking = analysisData?.coffeeRanking.map((item, index) => (
    <View key={item.coffeeId}>
      <Text>{index + 1}位: {item.brand} {item.name} - {item.count}回</Text>
    </View>
  ));

  return (
    <View>
      <Text>AnalysisScreen</Text>
      <Text>飲んだ回数合計： {analysisData?.count}</Text>
      <Text>飲んだ量合計： {analysisData?.totals.grams}g</Text>
      <Text>払った金額合計： {analysisData?.totals.yen}円</Text>
      <Text>よく飲んでるコーヒーランキング</Text>
      {ranking}
      <View>
        <Text>合計金額</Text>
        <LineChart
          data={{
            labels: analysisData?.monthLabels ?? ["1月", "2月", "3月", "4月", "5月", "6月"],
            datasets: [
              {
                data: analysisData?.monthlyData.map(d => d.yen) ?? [
                  Math.random() * 100,
                  Math.random() * 100,
                  Math.random() * 100,
                  Math.random() * 100,
                  Math.random() * 100,
                  Math.random() * 100
                ]
              }
            ]
          }}
          width={Dimensions.get("window").width} // from react-native
          height={220}
          yAxisLabel=""
          yAxisSuffix="円"
          yAxisInterval={1} // optional, defaults to 1
          chartConfig={{
            backgroundColor: "#e26a00",
            backgroundGradientFrom: "#fb8c00",
            backgroundGradientTo: "#ffa726",
            decimalPlaces: 0, // optional, defaults to 2dp
            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            style: {
              borderRadius: 16
            },
            propsForDots: {
              r: "6",
              strokeWidth: "2",
              stroke: "#ffa726"
            }
          }}
          bezier
          style={{
            marginVertical: 8,
            borderRadius: 16
          }}
        />
      </View>
      <View>
        <Text>合計量</Text>
        <LineChart
          data={{
            labels: analysisData?.monthLabels ?? ["1月", "2月", "3月", "4月", "5月", "6月"],
            datasets: [
              {
                data: analysisData?.monthlyData.map(d => d.grams) ?? [
                  Math.random() * 100,
                  Math.random() * 100,
                  Math.random() * 100,
                  Math.random() * 100,
                  Math.random() * 100,
                  Math.random() * 100
                ]
              }
            ]
          }}
          width={Dimensions.get("window").width} // from react-native
          height={220}
          yAxisLabel=""
          yAxisSuffix="g"
          yAxisInterval={1} // optional, defaults to 1
          chartConfig={{
            backgroundColor: "#e26a00",
            backgroundGradientFrom: "#fb8c00",
            backgroundGradientTo: "#ffa726",
            decimalPlaces: 1, // optional, defaults to 2dp
            color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
            style: {
              borderRadius: 16
            },
            propsForDots: {
              r: "6",
              strokeWidth: "2",
              stroke: "#ffa726"
            }
          }}
          bezier
          style={{
            marginVertical: 8,
            borderRadius: 16
          }}
        />
      </View>
    </View>
  )
}

// const styles = StyleSheet.create({})
