import { ImageBackground, ScrollView, View } from 'react-native'
import React, { useCallback, useRef, useState } from 'react'
import { Calendar } from 'react-native-calendars'
import { useFocusEffect } from '@react-navigation/native'
import { getMonthlyDrinkingRecords } from '../../auth/services/recordService';
import RecordEventModal from '../components/RecordEventModal';
import { fonts } from '../../../app/main/theme/fonts';
import { colors } from '../../../app/main/theme/colors';
import type { MarkingProps } from 'react-native-calendars/src/calendar/day/marking';
import textureImage from '../../../assets/texture.jpg';
import { ScreenSkeletonCard, ScreenSkeletonLine, ScreenStatusOverlay } from '../components/ScreenLoading';

export default function CalendarScreen() {
  const [events, setEvents] = useState<{ [key: string]: MarkingProps }>({});
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [visibleModal, setVisibleModal] = useState<boolean>(false);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const hasLoadedOnceRef = useRef(false);

  const fetchEvents = useCallback(async (year: number, month: number) => {
    if (hasLoadedOnceRef.current) {
      setIsRefreshing(true);
    } else {
      setIsInitialLoading(true);
    }

    try {
      const eventData = await getMonthlyDrinkingRecords(year, month);
      setEvents(eventData);
    } catch (error) {
      console.error("Error fetching Events", error);
    } finally {
      hasLoadedOnceRef.current = true;
      setIsInitialLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void fetchEvents(selectedYear, selectedMonth);
    }, [fetchEvents, selectedYear, selectedMonth])
  );

  const handleDayPress = (day: string) => {
    console.log('Selected day', day);
    // 選択した日付にイベントが存在する場合のみモーダルを表示
    if (events[day]) {
      setSelectedDate(day);
      setVisibleModal(true);
    }
  };

  const calendarSkeleton = (
    <ScreenSkeletonCard style={{ minHeight: 360, overflow: 'hidden' }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 18 }}>
        <ScreenSkeletonLine width={28} height={28} />
        <ScreenSkeletonLine width="34%" height={24} />
        <ScreenSkeletonLine width={28} height={28} />
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 18 }}>
        {Array.from({ length: 7 }, (_, index) => (
          <ScreenSkeletonLine key={`day-${index}`} width={22} height={12} />
        ))}
      </View>

      {Array.from({ length: 5 }, (_, rowIndex) => (
        <View
          key={`week-${rowIndex}`}
          style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: rowIndex === 4 ? 0 : 18 }}
        >
          {Array.from({ length: 7 }, (_, columnIndex) => (
            <ScreenSkeletonLine
              key={`cell-${rowIndex}-${columnIndex}`}
              width={28}
              height={28}
              style={{ borderRadius: 14 }}
            />
          ))}
        </View>
      ))}
    </ScreenSkeletonCard>
  );

  return (
    <ImageBackground
      source={textureImage}
      style={{ flex: 1 }}
      imageStyle={{ resizeMode: 'cover' }}
    >
      <ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1, paddingBottom: 24 }}>
        <View className="px-5 py-6 ios:shadow-md android:elevation-md">
          {isInitialLoading ? (
            calendarSkeleton
          ) : (
            <>
              <ScreenStatusOverlay visible={isRefreshing} label="カレンダーを更新中…" />
              <View className="rounded-2xl border-2 border-OCHER bg-DARK_BROWN overflow-hidden">
                <Calendar
                  markingType='multi-period'
                  hideArrows={false}
                  onDayPress={(day) => handleDayPress(day.dateString)}
                  onMonthChange={(monthInfo) => { setSelectedMonth(monthInfo.month); setSelectedYear(monthInfo.year); }}
                  theme={{
                    backgroundColor: 'transparent',
                    calendarBackground: 'transparent',
                    textSectionTitleColor: colors.OCHER,
                    selectedDayBackgroundColor: colors.OCHER,
                    selectedDayTextColor: colors.LIGHT_BROWN,
                    todayTextColor: colors.OCHER,
                    dayTextColor: colors.LIGHT_BROWN,
                    textDisabledColor: colors.BROWN,
                    monthTextColor: colors.OCHER,
                    textMonthFontFamily: fonts.header_footer,
                    textDayFontFamily: fonts.header_footer,
                    textDayHeaderFontFamily: fonts.header_footer,
                    textMonthFontSize: 24,
                    textDayFontSize: 18,
                    textDayHeaderFontSize: 16,
                    arrowColor: colors.LIGHT_BROWN,
                  }}
                  markedDates={events}
                />
              </View>
            </>
          )}

          {visibleModal && (
            <RecordEventModal date={selectedDate} onCancel={() => setVisibleModal(false)} />
          )}
        </View>
      </ScrollView>
    </ImageBackground>
  )
}

// const styles = StyleSheet.create({})
