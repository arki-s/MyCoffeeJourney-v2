import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useMemo, useState } from 'react'
import { useUserStore } from '../../../stores/useUserStore';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RecordsStackParamList } from '../../../type';
import { useNavigation } from '@react-navigation/native';
import { createDrinkingRecord, setDrinkingGrindSizes } from '../../auth/services/recordService';
import DateTimePicker from '@react-native-community/datetimepicker';
import { formatLocalYYYYMMDD } from '../../../utils/date';
import { listGrindSizes } from '../../auth/services/grindSizeService';
import SelectModal from '../components/SelectModal';
import { listCoffees } from '../../auth/services/coffeeService';
import { colors } from '../../../app/main/theme/colors';
import { fonts } from '../../../app/main/theme/fonts';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';

type RecordCreateFormState = {
  coffee_id: string;
  weight_grams: string;
  price_yen: string;
  purchase_date: string;
  start_date: string;
};

type RecordCreateFieldError = Partial<Record<keyof RecordCreateFormState, string>>;

const today = formatLocalYYYYMMDD(new Date());

export default function CoffeeRecordCreateScreen() {
  const user = useUserStore((state) => state.user);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [fieldErrors, setFieldErrors] = useState<RecordCreateFieldError>({});
  const [record, setRecord] = useState<RecordCreateFormState>({
    coffee_id: '',
    weight_grams: '',
    price_yen: '',
    purchase_date: today,
    start_date: today,
  });
  const [coffeeOptions, setCoffeeOptions] = useState<{ id: string, label: string }[]>([]);
  const [selectedGrindSizes, setSelectedGrindSizes] = useState<string[]>([]);
  const [grindSizes, setGrindSizes] = useState<{ id: string, label: string }[]>([]);
  const [modalVisible, setModalVisible] = useState<"grindSize" | "coffee" | null>(null);

  type RecordsNav = NativeStackNavigationProp<RecordsStackParamList, 'RecordCreate'>;
  const navigation = useNavigation<RecordsNav>();

  useEffect(() => {
    void fetchCoffees();
    void fetchGrindSizes();
  }, []);

  const fetchCoffees = async () => {
    try {
      const data = await listCoffees();
      setCoffeeOptions(data.map((coffee) => ({ id: coffee.id, label: coffee.name })));
    } catch (fetchError) {
      console.error('Error fetching coffee:', fetchError);
      setError('※コーヒー一覧の取得に失敗しました。時間をおいて再度お試しください。');
    }
  };

  const fetchGrindSizes = async () => {
    try {
      const data = await listGrindSizes();
      setGrindSizes(data.map((grindSize) => ({ id: grindSize.id, label: grindSize.name })));
    } catch (fetchError) {
      console.error('Error fetching grind sizes:', fetchError);
      setError('※挽き目一覧の取得に失敗しました。時間をおいて再度お試しください。');
    }
  };

  const selectedCoffeeLabel = useMemo(
    () => coffeeOptions.find((coffee) => coffee.id === record.coffee_id)?.label ?? 'コーヒーを選択',
    [coffeeOptions, record.coffee_id]
  );

  const selectedGrindSizeLabels = useMemo(
    () => grindSizes.filter((grindSize) => selectedGrindSizes.includes(grindSize.id)).map((grindSize) => grindSize.label),
    [grindSizes, selectedGrindSizes]
  );

  const clearGeneralError = () => {
    if (error) {
      setError(null);
    }
  };

  const updateField = <K extends keyof RecordCreateFormState>(key: K, value: RecordCreateFormState[K]) => {
    clearGeneralError();
    setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
    setRecord((prev) => ({ ...prev, [key]: value }));
  };

  const handleGrindSizeChange = (ids: string[]) => {
    clearGeneralError();
    setSelectedGrindSizes(ids);
  };

  const validateRecord = () => {
    const nextErrors: RecordCreateFieldError = {};
    const weight = Number(record.weight_grams);
    const price = Number(record.price_yen);

    if (!record.coffee_id) {
      nextErrors.coffee_id = '※コーヒーを選択してください。';
    }

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

    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleRecordCreate = async () => {
    if (!user) {
      setError('※ログイン情報を確認できませんでした。再度ログインしてください。');
      return;
    }

    clearGeneralError();

    if (!validateRecord()) {
      return;
    }

    setLoading(true);
    try {
      const response = await createDrinkingRecord(
        Number(record.weight_grams),
        Number(record.price_yen),
        record.purchase_date,
        record.coffee_id,
        record.start_date,
      );

      await setDrinkingGrindSizes(response.id, selectedGrindSizes);
      navigation.navigate('RecordsHome');
    } catch (createError) {
      console.error('Error creating record:', createError);
      setError('※レコードの作成に失敗しました。もう一度お試しください。');
    } finally {
      setLoading(false);
    }
  };

  const canCreateRecord =
    record.coffee_id.length > 0 &&
    record.weight_grams.length > 0 &&
    record.price_yen.length > 0 &&
    !loading;

  return (
    <ScrollView
      className="flex-1 border-2 border-OCHER bg-DARK_BROWN"
      contentContainerStyle={{ flexGrow: 1, paddingBottom: 24 }}
      keyboardShouldPersistTaps="handled"
    >
      <View className="px-5 py-6">
        <View className="mt-4 rounded-2xl border border-OCHER bg-BROWN px-4 py-5">
          <Text className="text-lg text-OCHER" style={{ fontFamily: fonts.body }}>
            レコード基本情報
          </Text>

          <View className="mt-5">
            <Text className="mb-2 text-OCHER" style={{ fontFamily: fonts.body }}>
              コーヒー
            </Text>
            <TouchableOpacity
              onPress={() => setModalVisible('coffee')}
              disabled={loading}
              className="flex-row items-center justify-between rounded-xl border border-OCHER bg-DARK_BROWN px-4 py-4"
              style={{ opacity: loading ? 0.6 : 1 }}
            >
              <Text className="flex-1 pr-3 text-OCHER" style={{ fontFamily: fonts.body_regular }}>
                {selectedCoffeeLabel}
              </Text>
              <FontAwesome5 name="chevron-right" size={14} color={colors.OCHER} />
            </TouchableOpacity>
            {fieldErrors.coffee_id ? (
              <Text className="mt-2 text-[#E9B4AF]" style={{ fontFamily: fonts.body_regular }}>
                {fieldErrors.coffee_id}
              </Text>
            ) : null}
          </View>

          <View className="mt-5">
            <Text className="mb-2 text-OCHER" style={{ fontFamily: fonts.body }}>
              挽き目
            </Text>
            <TouchableOpacity
              onPress={() => setModalVisible('grindSize')}
              disabled={loading}
              className="rounded-xl border border-OCHER bg-DARK_BROWN px-4 py-4"
              style={{ opacity: loading ? 0.6 : 1 }}
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
              onChangeText={(text) => updateField('weight_grams', text.replace(/[^0-9]/g, ''))}
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
              onChangeText={(text) => updateField('price_yen', text.replace(/[^0-9]/g, ''))}
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
          <Text className="mt-2 text-OCHER" style={{ fontFamily: fonts.body_regular }}>
            購入日と飲み始めた日を設定してください。
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
                updateField('purchase_date', formatLocalYYYYMMDD(currentDate));
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
                updateField('start_date', formatLocalYYYYMMDD(currentDate));
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
        </View>

        {error ? (
          <Text className="mt-4 text-OCHER" style={{ fontFamily: fonts.body }}>
            {error}
          </Text>
        ) : null}

        <TouchableOpacity
          onPress={() => void handleRecordCreate()}
          disabled={!canCreateRecord}
          className="mt-4 rounded-xl bg-OCHER px-4 py-4"
          style={{ opacity: canCreateRecord ? 1 : 0.6 }}
        >
          <Text className="text-center text-DARK_BROWN" style={{ fontFamily: fonts.body }}>
            {loading ? '保存中……' : 'レコードを登録'}
          </Text>
        </TouchableOpacity>
      </View>

      <SelectModal
        visible={modalVisible === 'coffee'}
        title="コーヒーを選択"
        isMulti={false}
        options={coffeeOptions}
        selectedIds={record.coffee_id ? [record.coffee_id] : []}
        onChange={(ids) => updateField('coffee_id', ids[0] ?? '')}
        onClose={() => setModalVisible(null)}
      />

      <SelectModal
        visible={modalVisible === 'grindSize'}
        title="挽き目を選択"
        options={grindSizes}
        selectedIds={selectedGrindSizes}
        onChange={handleGrindSizeChange}
        onClose={() => setModalVisible(null)}
      />
    </ScrollView>
  )
}
