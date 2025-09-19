import { Modal, Text, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import DateTimePicker from '@react-native-community/datetimepicker';
import { formatLocalYYYYMMDD } from '../../../utils/date';
import { listGrindSizes } from '../../auth/services/grindSizeService';
import SelectModal from './SelectModal';

type Props = {
  weight_grams: number;
  price_yen: number;
  purchase_date: string;
  coffee_id: string;
  start_date: string;
  end_date: string | null;
  drinkingGrindSizes: string[];
  canEditEndDate: boolean;
  onSubmit: (data: {
    weight_grams: number;
    price_yen: number;
    purchase_date: string;
    coffee_id: string;
    start_date: string;
    end_date: string | null;
    drinkingGrindSizes: string[];
  }) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  error?: string | null;
}

export default function RecordForm(props: Props) {

  const [record, setRecord] = useState<{
    weight_grams: number;
    price_yen: number;
    purchase_date: string;
    coffee_id: string;
    start_date: string;
    end_date: string | null;
    drinkingGrindSizes: string[];
  }>({
    weight_grams: props.weight_grams,
    price_yen: props.price_yen,
    purchase_date: props.purchase_date,
    coffee_id: props.coffee_id,
    start_date: props.start_date,
    end_date: props.end_date,
    drinkingGrindSizes: props.drinkingGrindSizes,
  });
  const [grindSizes, setGrindSizes] = useState<{ id: string, label: string }[]>([]);
  const [modalVisible, setModalVisible] = useState<boolean>(false);

  const [canEditEndDate] = useState<boolean>(props.canEditEndDate);

  useEffect(() => {
    fetchGrindSizes();
  }, []);

  const fetchGrindSizes = async () => {
    const grindSizes = await listGrindSizes();
    setGrindSizes(grindSizes.map((g) => { return { id: g.id, label: g.name } }))
  }

  return (
    <Modal>
      <Text style={{ marginTop: 50 }}>RecordForm</Text>

      <TouchableOpacity
        onPress={() => setModalVisible(true)}
      >
        <Text>挽き目を選択</Text>
      </TouchableOpacity>

      <SelectModal
        visible={modalVisible}
        options={grindSizes}
        selectedIds={record.drinkingGrindSizes}
        onChange={(id) => setRecord(prev => ({ ...prev, drinkingGrindSizes: id }))}
        onClose={() => setModalVisible(false)} />

      <Text>購入日を選択</Text>
      <DateTimePicker
        value={record.purchase_date ? new Date(record.purchase_date) : new Date()}
        mode="date"
        display="default"
        onChange={(event, selectedDate) => {
          const currentDate = selectedDate || new Date();
          setRecord(prev => ({ ...prev, purchase_date: formatLocalYYYYMMDD(currentDate) }))
        }}
      />
      <Text>飲み始めた日を選択</Text>
      <DateTimePicker
        value={record.start_date ? new Date(record.start_date) : new Date()}
        mode="date"
        display="default"
        onChange={(event, selectedDate) => {
          const currentDate = selectedDate || new Date();
          setRecord(prev => ({ ...prev, start_date: formatLocalYYYYMMDD(currentDate) }))
        }}
      />

      {canEditEndDate && (
        <>
          <Text>飲み終えた日を選択</Text>
          <DateTimePicker
            value={record.end_date ? new Date(record.end_date) : new Date()}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              const currentDate = selectedDate || new Date();
              setRecord(prev => ({ ...prev, end_date: formatLocalYYYYMMDD(currentDate) }))
            }}
          />
        </>
      )}

      <TouchableOpacity
        onPress={props.onCancel}
        disabled={props.loading}
      >
        <Text>キャンセル</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => props.onSubmit({
          weight_grams: record.weight_grams,
          price_yen: record.price_yen,
          purchase_date: record.purchase_date,
          coffee_id: record.coffee_id,
          start_date: record.start_date,
          end_date: record.end_date,
          drinkingGrindSizes: record.drinkingGrindSizes,
        })}
        disabled={props.loading}
      >
        <Text>保存</Text>
      </TouchableOpacity>
      {props.error ? <Text style={{ color: 'red' }}>{props.error}</Text> : null}
    </Modal>
  )
}

// const styles = StyleSheet.create({})
