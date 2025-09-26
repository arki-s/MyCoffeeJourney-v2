import { Modal, Text, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import { BottomStackParamList, UnfinishedWithName } from '../../../type';
import { getDailyDrinkingRecords } from '../../auth/services/recordService';
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';

type Props = {
  date: string; //YYYY-MM-DD
  onCancel: () => void;
  loading?: boolean;
  error?: string | null;
}

export default function RecordEventModal(props: Props) {
  const { date, onCancel } = props;
  const [records, setReords] = useState<UnfinishedWithName[]>([]);
  const navigation = useNavigation<BottomTabNavigationProp<BottomStackParamList, 'Calendar'>>();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    if (!date) return;
    try {
      const eventData = await getDailyDrinkingRecords(date);
      setReords(eventData);

    } catch (error) {
      console.error("Error fetching Events", error);
    }
  };

  const handleRecordPress = (id: string) => {
    onCancel();
    navigation.navigate('Records', {
      screen: 'RecordDetails',
      params: { id },
    });
  };

  const data = records.map((record) => {
    return (
      <TouchableOpacity
        key={record.id}
        onPress={() => handleRecordPress(record.id)}>
        <Text>
          {record.coffee?.brand?.name ?? ''} {record.coffee?.name ?? ''}
        </Text>
        <Text>{record.start_date} ~ {record.end_date ?? '飲み途中！'}</Text>
      </TouchableOpacity>
    )
  });

  return (
    <Modal>
      <Text>RecordEventModal</Text>
      {data}
      <TouchableOpacity
        onPress={() => onCancel()}
        disabled={props.loading}
      >
        <Text>閉じる</Text>
      </TouchableOpacity>
    </Modal>
  )

}

// const styles = StyleSheet.create({})
