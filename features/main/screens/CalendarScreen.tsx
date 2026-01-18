import { ScrollView, Text, View } from 'react-native'
import React, { useCallback, useState } from 'react'
import { Calendar } from 'react-native-calendars'
import { useFocusEffect } from '@react-navigation/native'
import { getMonthlyDrinkingRecords } from '../../auth/services/recordService';
import RecordEventModal from '../components/RecordEventModal';
import { fonts } from '../../../app/main/theme/fonts';

export default function CalendarScreen() {
  const [events, setEvents] = useState<Record<string, any>>({});
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [visibleModal, setVisibleModal] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<string>('');

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

  const handleDayPress = (day: string) => {
    console.log('Selected day', day);
    // 選択した日付にイベントが存在する場合のみモーダルを表示
    if (events[day]) {
      setSelectedDate(day);
      setVisibleModal(true);
    }
  };

  return (
    <ScrollView className="flex-1 bg-[#F6EFE7]">
      <View className="px-5 py-6">
        <Text
          className="mt-4 text-3xl text-[#3B0D0C] text-center"
          style={{ fontFamily: fonts.title_bold }}
        >
          コーヒーカレンダー
        </Text>

        <View className="mt-4 rounded-2xl border border-[#E6DACE] bg-white/90 overflow-hidden">
          <Calendar
            markingType='multi-period'
            hideArrows={false}
            onDayPress={(day) => handleDayPress(day.dateString)}
            onMonthChange={(monthInfo) => { setSelectedMonth(monthInfo.month); setSelectedYear(monthInfo.year); }}
            theme={{
              backgroundColor: 'transparent',
              calendarBackground: 'transparent',
              textSectionTitleColor: '#6A1B1A',
              selectedDayBackgroundColor: '#A23E48',
              selectedDayTextColor: '#ffffff',
              todayTextColor: '#A23E48',
              dayTextColor: '#3B0D0C',
              textDisabledColor: '#E6DACE',
              monthTextColor: '#3B0D0C',
              textMonthFontFamily: fonts.title_bold,
              textDayFontFamily: fonts.body_regular,
              textDayHeaderFontFamily: fonts.body_bold,
              textMonthFontSize: 18,
              textDayFontSize: 14,
              textDayHeaderFontSize: 12,
            }}
            markedDates={events}
          />
        </View>

        {visibleModal && (
          <RecordEventModal date={selectedDate} onCancel={() => setVisibleModal(false)} />
        )}
      </View>
    </ScrollView>
  )
}

// const styles = StyleSheet.create({})
