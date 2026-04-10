import { Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useMemo, useState } from 'react'
import { BottomStackParamList, UnfinishedWithName } from '../../../type'
import { getDailyDrinkingRecords } from '../../auth/services/recordService'
import { useNavigation } from '@react-navigation/native'
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs'
import FontAwesome5 from '@expo/vector-icons/FontAwesome5'
import { colors } from '../../../app/main/theme/colors'
import { fonts } from '../../../app/main/theme/fonts'

type Props = {
  date: string;
  onCancel: () => void;
  loading?: boolean;
  error?: string | null;
}

export default function RecordEventModal({
  date,
  onCancel,
  loading = false,
  error = null,
}: Props) {
  const [records, setRecords] = useState<UnfinishedWithName[]>([])
  const [fetchError, setFetchError] = useState<string | null>(null)
  const [isFetching, setIsFetching] = useState(false)
  const navigation = useNavigation<BottomTabNavigationProp<BottomStackParamList, 'Calendar'>>()

  useEffect(() => {
    void fetchEvents()
  }, [date])

  const formattedDate = useMemo(() => {
    if (!date) {
      return ''
    }

    const parsedDate = new Date(`${date}T00:00:00`)
    if (Number.isNaN(parsedDate.getTime())) {
      return date
    }

    return `${parsedDate.getFullYear()}年${parsedDate.getMonth() + 1}月${parsedDate.getDate()}日`
  }, [date])

  const fetchEvents = async () => {
    if (!date) return

    try {
      setIsFetching(true)
      setFetchError(null)
      const eventData = await getDailyDrinkingRecords(date)
      setRecords(eventData)
    } catch (fetchEventsError) {
      console.error('Error fetching Events', fetchEventsError)
      setFetchError('レコードの取得に失敗しました。')
    } finally {
      setIsFetching(false)
    }
  }

  const handleRecordPress = (id: string) => {
    onCancel()
    navigation.navigate('Records', {
      screen: 'RecordDetails',
      // Calendarの日別モーダルから開いた詳細は、カレンダータブへ戻せるようにする。
      params: { id, returnTo: { tab: 'Calendar' } },
    })
  }

  const displayedError = fetchError ?? error

  return (
    <Modal visible animationType="fade" transparent onRequestClose={onCancel}>
      <View style={{ flex: 1, backgroundColor: '#0008', justifyContent: 'center', padding: 16 }}>
        <View
          className="rounded-2xl border border-OCHER bg-DARK_BROWN"
          style={{ maxHeight: '92%' }}
        >
          <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 24 }}>
            <Text className="text-lg text-OCHER" style={{ fontFamily: fonts.body }}>
              {formattedDate || '日付未設定'}
            </Text>

            <View className="mt-4 rounded-2xl border border-OCHER bg-BROWN px-4 py-5">

              {isFetching ? (
                <View className="mt-2 rounded-xl border border-OCHER bg-DARK_BROWN px-4 py-4">
                  <Text className="text-OCHER" style={{ fontFamily: fonts.body_regular }}>
                    読み込み中……
                  </Text>
                </View>
              ) : records.length === 0 ? (
                <View className="mt-2 rounded-xl border border-OCHER bg-DARK_BROWN px-4 py-4">
                  <Text className="text-OCHER" style={{ fontFamily: fonts.body_regular }}>
                    この日に該当するレコードはありません。
                  </Text>
                </View>
              ) : (
                records.map((record) => (
                  <TouchableOpacity
                    key={record.id}
                    onPress={() => handleRecordPress(record.id)}
                    className="mt-2 rounded-xl border border-OCHER bg-DARK_BROWN px-4 py-4"
                  >
                    <View className="flex-row items-start justify-between">
                      <View className="flex-1 pr-3">
                        <Text className="text-OCHER" style={{ fontFamily: fonts.body }}>
                          {record.coffee?.brand?.name ?? 'ブランド未設定'}
                        </Text>
                        <Text className="mt-1 text-OCHER" style={{ fontFamily: fonts.body }}>
                          {record.coffee?.name ?? 'コーヒー名未設定'}
                        </Text>
                        <Text className="mt-3 text-OCHER" style={{ fontFamily: fonts.body_regular }}>
                          {record.start_date} 〜 {record.end_date ?? '飲み途中'}
                        </Text>
                      </View>
                      <FontAwesome5 name="chevron-right" size={14} color={colors.OCHER} />
                    </View>
                  </TouchableOpacity>
                ))
              )}
            </View>

            {displayedError ? (
              <Text className="mt-4 text-[#E9B4AF]" style={{ fontFamily: fonts.body_regular }}>
                {displayedError}
              </Text>
            ) : null}

            <TouchableOpacity
              onPress={onCancel}
              disabled={loading}
              className="mt-4 rounded-xl border border-OCHER px-4 py-4"
              style={{ opacity: loading ? 0.6 : 1 }}
            >
              <Text className="text-center text-OCHER" style={{ fontFamily: fonts.body }}>
                閉じる
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  )
}
