import { Text, View } from 'react-native'
import React, { useCallback } from 'react'
import { Calendar } from 'react-native-calendars'
import { useFocusEffect } from '@react-navigation/native'

export default function CalendarScreen() {

  useFocusEffect(
    useCallback(() => {
      // 月毎のイベントフェッチ
    }, [])
  );

  return (
    <View>
      <Text>CalendarScreen</Text>
      <Calendar
        markingType='multi-period'
        hideArrows={false}
        markedDates={{
          '2025-09-14': {
            periods: [
              { startingDay: true, endingDay: false, color: '#ffa500' },
            ]
          },
          '2025-09-15': {
            periods: [
              { startingDay: false, endingDay: true, color: '#ffa500' },
            ]
          },
          '2025-09-20': {
            periods: [
              { startingDay: true, endingDay: false, color: '#ffa500' },
            ]
          },
          '2025-09-21': {
            periods: [
              { startingDay: false, endingDay: false, color: '#ffa500' },
            ]
          },
          '2025-09-22': {
            periods: [
              { startingDay: false, endingDay: false, color: '#ffa500' },
            ]
          },
          '2025-09-23': {
            periods: [
              { startingDay: false, endingDay: false, color: '#ffa500' },
            ]
          },
          '2025-09-24': {
            periods: [
              { startingDay: false, endingDay: true, color: '#ffa500' },
            ]
          }
        }}
      />
    </View>
  )
}

// const styles = StyleSheet.create({})
