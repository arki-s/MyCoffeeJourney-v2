import { ImageBackground, ScrollView, View } from 'react-native'
import React, { useCallback, useState } from 'react'
import { Calendar } from 'react-native-calendars'
import { useFocusEffect } from '@react-navigation/native'
import { getMonthlyDrinkingRecords } from '../../auth/services/recordService';
import RecordEventModal from '../components/RecordEventModal';
import { fonts } from '../../../app/main/theme/fonts';
import { colors } from '../../../app/main/theme/colors';
import type { MarkingProps } from 'react-native-calendars/src/calendar/day/marking';
import textureImage from '../../../assets/texture.jpg';

export default function CalendarScreen() {
  const [events, setEvents] = useState<{ [key: string]: MarkingProps }>({});
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
    <ImageBackground
      source={textureImage}
      style={{ flex: 1 }}
      imageStyle={{ resizeMode: 'cover' }}
    >
      <ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1, paddingBottom: 24 }}>
        <View className="px-5 py-6 ios:shadow-md android:elevation-md">

          <View className="rounded-2xl border-2 border-accent bg-primary overflow-hidden">
            <Calendar
              markingType='multi-period'
              hideArrows={false}
              onDayPress={(day) => handleDayPress(day.dateString)}
              onMonthChange={(monthInfo) => { setSelectedMonth(monthInfo.month); setSelectedYear(monthInfo.year); }}
              theme={{
                backgroundColor: 'transparent',
                calendarBackground: 'transparent',
                textSectionTitleColor: colors.accent,
                selectedDayBackgroundColor: colors.accent,
                selectedDayTextColor: colors.primary_light,
                todayTextColor: colors.accent,
                dayTextColor: colors.primary_light,
                textDisabledColor: colors.primary_dark,
                monthTextColor: colors.accent,
                textMonthFontFamily: fonts.header_footer,
                textDayFontFamily: fonts.header_footer,
                textDayHeaderFontFamily: fonts.header_footer,
                textMonthFontSize: 24,
                textDayFontSize: 18,
                textDayHeaderFontSize: 16,
                arrowColor: colors.primary_light,
              }}
              markedDates={events}
            />
          </View>

          {visibleModal && (
            <RecordEventModal date={selectedDate} onCancel={() => setVisibleModal(false)} />
          )}
        </View>
      </ScrollView>
    </ImageBackground>
  )
}

// const styles = StyleSheet.create({})
