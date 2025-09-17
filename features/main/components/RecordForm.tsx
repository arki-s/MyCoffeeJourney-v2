import { Modal, Text, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'

type Props = {
  weight_grams: number;
  price_yen: number;
  purchase_date: string;
  coffee_id: string;
  start_date: string;
  end_date: string | null;
  drinkingGrindSizes: string[];
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

  const [record] = useState<{
    weight_grams: number;
    price_yen: number;
    purchase_date: string;
    coffee_id: string;
    start_date: string;
    end_date: string | null;
  }>({
    weight_grams: props.weight_grams,
    price_yen: props.price_yen,
    purchase_date: props.purchase_date,
    coffee_id: props.coffee_id,
    start_date: props.start_date,
    end_date: props.end_date,
  });
  // const [drinkingGrindSizes] = useState<string[]>(props.drinkingGrindSizes);

  return (
    <Modal>
      <Text>RecordForm</Text>

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
          drinkingGrindSizes: props.drinkingGrindSizes,
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
