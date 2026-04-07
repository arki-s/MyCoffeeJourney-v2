import { Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useMemo, useState } from 'react'
import DateTimePicker from '@react-native-community/datetimepicker';
import { formatLocalYYYYMMDD } from '../../../utils/date';
import { listGrindSizes } from '../../auth/services/grindSizeService';
import SelectModal from './SelectModal';
import { colors } from '../../../app/main/theme/colors';
import { fonts } from '../../../app/main/theme/fonts';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';

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

type RecordFormState = {
  weight_grams: string;
  price_yen: string;
  purchase_date: string;
  coffee_id: string;
  start_date: string;
  end_date: string | null;
  drinkingGrindSizes: string[];
};

type RecordFieldErrors = {
  weight_grams?: string;
  price_yen?: string;
  purchase_date?: string;
  start_date?: string;
  end_date?: string;
};

export default function RecordForm(props: Props) {
  const [record, setRecord] = useState<RecordFormState>({
    weight_grams: props.weight_grams ? props.weight_grams.toString() : '',
    price_yen: props.price_yen ? props.price_yen.toString() : '',
    purchase_date: props.purchase_date,
    coffee_id: props.coffee_id,
    start_date: props.start_date,
    end_date: props.end_date,
    drinkingGrindSizes: props.drinkingGrindSizes,
  });
  const [grindSizes, setGrindSizes] = useState<{ id: string, label: string }[]>([]);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [fieldErrors, setFieldErrors] = useState<RecordFieldErrors>({});

  useEffect(() => {
    void fetchGrindSizes();
  }, []);

  const fetchGrindSizes = async () => {
    try {
      const data = await listGrindSizes();
      setGrindSizes(data.map((grindSize) => ({ id: grindSize.id, label: grindSize.name })));
    } catch (fetchError) {
      console.error('Error fetching grind sizes:', fetchError);
    }
  };

  const selectedGrindSizeLabels = useMemo(
    () => grindSizes.filter((grindSize) => record.drinkingGrindSizes.includes(grindSize.id)).map((grindSize) => grindSize.label),
    [grindSizes, record.drinkingGrindSizes]
  );

  const clearFieldError = (key: keyof RecordFieldErrors) => {
    setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validateRecord = () => {
    const nextErrors: RecordFieldErrors = {};
    const weight = Number(record.weight_grams);
    const price = Number(record.price_yen);

    if (!record.weight_grams || Number.isNaN(weight) || weight <= 0) {
      nextErrors.weight_grams = '※内容量を1g以上で入力してください。';
    }

    if (!record.price_yen || Number.isNaN(price) || price <= 0) {
      nextErrors.price_yen = '※価格を1円以上で入力してください。';
    }

    if (!record.purchase_date) {
      nextErrors.purchase_date = '※購入日を選択してください。';
    }

    if (!record.start_date) {
      nextErrors.start_date = '※飲み始めた日を選択してください。';
    }

    if (record.purchase_date && record.start_date && record.start_date < record.purchase_date) {
      nextErrors.start_date = '※飲み始めた日は購入日以降にしてください。';
    }

    if (props.canEditEndDate) {
      if (!record.end_date) {
        nextErrors.end_date = '※飲み終えた日を選択してください。';
      } else if (record.end_date < record.start_date) {
        nextErrors.end_date = '※飲み終えた日は飲み始めた日以降にしてください。';
      }
    }

    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateRecord()) {
      return;
    }

    await props.onSubmit({
      weight_grams: Number(record.weight_grams),
      price_yen: Number(record.price_yen),
      purchase_date: record.purchase_date,
      coffee_id: record.coffee_id,
      start_date: record.start_date,
      end_date: record.end_date,
      drinkingGrindSizes: record.drinkingGrindSizes,
    });
  };

  return (
    <View>
      <View className="mt-4 rounded-2xl border border-OCHER bg-BROWN px-4 py-5">

        <View>
          <Text className="mb-2 text-OCHER" style={{ fontFamily: fonts.body }}>
            挽き目
          </Text>
          <TouchableOpacity
            onPress={() => setModalVisible(true)}
            disabled={props.loading}
            className="rounded-xl border border-OCHER bg-DARK_BROWN px-4 py-4"
            style={{ opacity: props.loading ? 0.6 : 1 }}
          >
            <View className="flex-row items-center justify-between">
              <Text className="flex-1 pr-3 text-OCHER" style={{ fontFamily: fonts.body_regular }}>
                {selectedGrindSizeLabels.length > 0 ? `${selectedGrindSizeLabels.length}件の挽き目を選択中` : '挽き目を選択'}
              </Text>
              <FontAwesome5 name="chevron-right" size={14} color={colors.OCHER} />
            </View>

            {selectedGrindSizeLabels.length > 0 ? (
              <Text className="mt-3 text-OCHER" style={{ fontFamily: fonts.body_regular }}>
                {selectedGrindSizeLabels.join(' / ')}
              </Text>
            ) : null}
          </TouchableOpacity>
        </View>

        <View className="mt-5">
          <Text className="mb-2 text-OCHER" style={{ fontFamily: fonts.body }}>
            内容量(g)
          </Text>
          <TextInput
            placeholder="コーヒーの量を入力"
            placeholderTextColor={colors.LIGHT_BROWN}
            value={record.weight_grams}
            onChangeText={(text) => {
              clearFieldError('weight_grams');
              setRecord((prev) => ({ ...prev, weight_grams: text.replace(/[^0-9]/g, '') }));
            }}
            keyboardType="numeric"
            autoCapitalize="none"
            autoCorrect={false}
            className="rounded-xl border border-OCHER bg-DARK_BROWN px-4 py-3 text-OCHER"
            style={{ fontFamily: fonts.body_regular }}
          />
          {fieldErrors.weight_grams ? (
            <Text className="mt-2 text-[#E9B4AF]" style={{ fontFamily: fonts.body_regular }}>
              {fieldErrors.weight_grams}
            </Text>
          ) : null}
        </View>

        <View className="mt-5">
          <Text className="mb-2 text-OCHER" style={{ fontFamily: fonts.body }}>
            価格(円)
          </Text>
          <TextInput
            placeholder="価格を入力"
            placeholderTextColor={colors.LIGHT_BROWN}
            value={record.price_yen}
            onChangeText={(text) => {
              clearFieldError('price_yen');
              setRecord((prev) => ({ ...prev, price_yen: text.replace(/[^0-9]/g, '') }));
            }}
            keyboardType="numeric"
            autoCapitalize="none"
            autoCorrect={false}
            className="rounded-xl border border-OCHER bg-DARK_BROWN px-4 py-3 text-OCHER"
            style={{ fontFamily: fonts.body_regular }}
          />
          {fieldErrors.price_yen ? (
            <Text className="mt-2 text-[#E9B4AF]" style={{ fontFamily: fonts.body_regular }}>
              {fieldErrors.price_yen}
            </Text>
          ) : null}
        </View>
      </View>

      <View className="mt-4 rounded-2xl border border-OCHER bg-BROWN px-4 py-5">
        <Text className="text-lg text-OCHER" style={{ fontFamily: fonts.body }}>
          日付
        </Text>

        <View className="mt-5 rounded-xl border border-OCHER bg-DARK_BROWN px-4 py-4">
          <Text className="text-OCHER" style={{ fontFamily: fonts.body }}>
            購入日
          </Text>
          <Text className="mt-2 text-OCHER" style={{ fontFamily: fonts.title_medium }}>
            {record.purchase_date}
          </Text>
          <DateTimePicker
            value={record.purchase_date ? new Date(record.purchase_date) : new Date()}
            mode="date"
            display="default"
            onChange={(_, selectedDate) => {
              const currentDate = selectedDate || new Date();
              clearFieldError('purchase_date');
              setRecord((prev) => ({ ...prev, purchase_date: formatLocalYYYYMMDD(currentDate) }));
            }}
            accentColor={colors.OCHER}
            style={{ marginTop: 8 }}
          />
          {fieldErrors.purchase_date ? (
            <Text className="mt-2 text-[#E9B4AF]" style={{ fontFamily: fonts.body_regular }}>
              {fieldErrors.purchase_date}
            </Text>
          ) : null}
        </View>

        <View className="mt-5 rounded-xl border border-OCHER bg-DARK_BROWN px-4 py-4">
          <Text className="text-OCHER" style={{ fontFamily: fonts.body }}>
            飲み始めた日
          </Text>
          <Text className="mt-2 text-OCHER" style={{ fontFamily: fonts.title_medium }}>
            {record.start_date}
          </Text>
          <DateTimePicker
            value={record.start_date ? new Date(record.start_date) : new Date()}
            mode="date"
            display="default"
            onChange={(_, selectedDate) => {
              const currentDate = selectedDate || new Date();
              clearFieldError('start_date');
              setRecord((prev) => ({ ...prev, start_date: formatLocalYYYYMMDD(currentDate) }));
            }}
            accentColor={colors.OCHER}
            style={{ marginTop: 8 }}
          />
          {fieldErrors.start_date ? (
            <Text className="mt-2 text-[#E9B4AF]" style={{ fontFamily: fonts.body_regular }}>
              {fieldErrors.start_date}
            </Text>
          ) : null}
        </View>

        {props.canEditEndDate ? (
          <View className="mt-5 rounded-xl border border-OCHER bg-DARK_BROWN px-4 py-4">
            <Text className="text-OCHER" style={{ fontFamily: fonts.body }}>
              飲み終えた日
            </Text>
            <Text className="mt-2 text-OCHER" style={{ fontFamily: fonts.title_medium }}>
              {record.end_date ?? ''}
            </Text>
            <DateTimePicker
              value={record.end_date ? new Date(record.end_date) : new Date()}
              mode="date"
              display="default"
              onChange={(_, selectedDate) => {
                const currentDate = selectedDate || new Date();
                clearFieldError('end_date');
                setRecord((prev) => ({ ...prev, end_date: formatLocalYYYYMMDD(currentDate) }));
              }}
              accentColor={colors.OCHER}
              style={{ marginTop: 8 }}
            />
            {fieldErrors.end_date ? (
              <Text className="mt-2 text-[#E9B4AF]" style={{ fontFamily: fonts.body_regular }}>
                {fieldErrors.end_date}
              </Text>
            ) : null}
          </View>
        ) : null}
      </View>

      {props.error ? (
        <Text className="mt-4 text-OCHER" style={{ fontFamily: fonts.body }}>
          {props.error}
        </Text>
      ) : null}

      <View className="mt-4 flex-row gap-3">
        <TouchableOpacity
          onPress={props.onCancel}
          disabled={props.loading}
          className="flex-1 rounded-xl border border-OCHER px-4 py-4"
          style={{ opacity: props.loading ? 0.6 : 1 }}
        >
          <Text className="text-center text-OCHER" style={{ fontFamily: fonts.body }}>
            キャンセル
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => void handleSubmit()}
          disabled={props.loading}
          className="flex-1 rounded-xl bg-OCHER px-4 py-4"
          style={{ opacity: props.loading ? 0.6 : 1 }}
        >
          <Text className="text-center text-DARK_BROWN" style={{ fontFamily: fonts.body }}>
            {props.loading ? '保存中……' : '変更を保存'}
          </Text>
        </TouchableOpacity>
      </View>

      <SelectModal
        visible={modalVisible}
        title="挽き目を選択"
        options={grindSizes}
        selectedIds={record.drinkingGrindSizes}
        onChange={(ids) => setRecord((prev) => ({ ...prev, drinkingGrindSizes: ids }))}
        onClose={() => setModalVisible(false)}
      />
    </View>
  )
}
