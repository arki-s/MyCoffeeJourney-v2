import { Text, View } from 'react-native'
import React, { useCallback, useState } from 'react'
import { Calendar } from 'react-native-calendars'
import { useFocusEffect } from '@react-navigation/native'
import { getMonthlyDrinkingRecords } from '../../auth/services/recordService';

export default function CalendarScreen() {
  const [events, setEvents] = useState({});
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());

  useFocusEffect(
    useCallback(() => {
      fetchEvents(selectedYear, selectedMonth);
    }, [selectedYear, selectedMonth])
  );

  const fetchEvents = async (year: number, month: number) => {
    try {
      const eventData = await getMonthlyDrinkingRecords(year, month);
      setEvents(eventData);
    } catch (error) {
      console.error("Error fetching Events", error);
    }

  }
  //クリックしたらその日のイベント一覧を表示してレコード画面にも飛べるようにする？


  return (
    <View>
      <Text>CalendarScreen</Text>
      <Calendar
        markingType='multi-period'
        hideArrows={false}
        onMonthChange={(monthInfo) => { setSelectedMonth(monthInfo.month); setSelectedYear(monthInfo.year); }}
        markedDates={
          events

          //   {
          //   '2025-09-14': {
          //     periods: [
          //       { startingDay: true, endingDay: false, color: '#ffa500' },
          //     ]
          //   },
          //   '2025-09-15': {
          //     periods: [
          //       { startingDay: false, endingDay: true, color: '#ffa500' },
          //     ]
          //   },
          //   '2025-09-20': {
          //     periods: [
          //       { startingDay: true, endingDay: false, color: '#ffa500' },
          //     ]
          //   },
          //   '2025-09-21': {
          //     periods: [
          //       { startingDay: false, endingDay: false, color: '#ffa500' },
          //     ]
          //   },
          //   '2025-09-22': {
          //     periods: [
          //       { startingDay: false, endingDay: false, color: '#ffa500' },
          //     ]
          //   },
          //   '2025-09-23': {
          //     periods: [
          //       { startingDay: false, endingDay: false, color: '#ffa500' },
          //     ]
          //   },
          //   '2025-09-24': {
          //     periods: [
          //       { startingDay: false, endingDay: true, color: '#ffa500' },
          //     ]
          //   }
          // }

        }
      />
    </View>
  )
}

// const styles = StyleSheet.create({})
