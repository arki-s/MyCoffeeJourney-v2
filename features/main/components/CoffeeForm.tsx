import { Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useMemo, useState } from 'react'
import Slider from '@react-native-community/slider'
import { listBeans } from '../../auth/services/beanService';
import SelectModal from './SelectModal';
import { listBrands } from '../../auth/services/brandService';
import { colors } from '../../../app/main/theme/colors';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { fonts } from '../../../app/main/theme/fonts';
import {
  CoffeeFormProps,
  CoffeeFormState,
  sliderFields,
  sliderScaleLabels,
} from './CoffeeForm.shared';

export default function CoffeeForm({
  mode,
  initialValue,
  loading = false,
  error = null,
  onSubmit,
  onCancel,
  submitLabel,
}: CoffeeFormProps) {
  const { includedBeans: initialIncludedBeans, ...initialCoffeeState } = initialValue;
  const [coffee, setCoffee] = useState<CoffeeFormState>(initialCoffeeState);
  const [includedBeans, setIncludedBeans] = useState<string[]>(initialIncludedBeans);
  const [brands, setBrands] = useState<{ id: string, label: string }[]>([]);
  const [beans, setBeans] = useState<{ id: string, label: string }[]>([]);
  const [modalVisible, setModalVisible] = useState<"brand" | "bean" | null>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [hideExternalError, setHideExternalError] = useState<boolean>(false);

  useEffect(() => {
    void fetchBrands();
    void fetchBeans();
  }, []);

  useEffect(() => {
    setHideExternalError(false);
  }, [error]);

  const fetchBrands = async () => {
    try {
      const brandData = await listBrands();
      setBrands(brandData.map((brand) => ({ id: brand.id, label: brand.name })));
    } catch (fetchError) {
      console.error('Error fetching brands', fetchError);
    }
  };

  const fetchBeans = async () => {
    try {
      const beanData = await listBeans();
      setBeans(beanData.map((bean) => ({ id: bean.id, label: bean.name })));
    } catch (fetchError) {
      console.error('Error fetching beans', fetchError);
    }
  };

  const selectedBrandLabel = useMemo(
    () => brands.find((brand) => brand.id === coffee.brand_id)?.label ?? 'コーヒーブランドを選択',
    [brands, coffee.brand_id]
  );

  const selectedBeanLabels = useMemo(
    () => beans.filter((bean) => includedBeans.includes(bean.id)).map((bean) => bean.label),
    [beans, includedBeans]
  );

  const displayedError = localError ?? (hideExternalError ? null : error);
  const canSaveCoffee = coffee.name.trim().length > 0 && coffee.brand_id.length > 0 && !loading;
  const resolvedSubmitLabel = submitLabel ?? (mode === 'create' ? 'コーヒーを登録' : '変更を保存');

  const clearErrors = () => {
    if (localError) {
      setLocalError(null);
    }
    if (error) {
      setHideExternalError(true);
    }
  };

  const updateCoffeeField = <K extends keyof CoffeeFormState>(key: K, value: CoffeeFormState[K]) => {
    clearErrors();
    setCoffee((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    if (!coffee.brand_id) {
      setLocalError('※ブランドを選択してください。');
      return;
    }

    if (!coffee.name.trim()) {
      setLocalError('※コーヒー名を入力してください。');
      return;
    }

    setLocalError(null);
    setHideExternalError(true);

    await onSubmit({
      ...coffee,
      includedBeans,
    });
  };

  return (
    <View>
      <View className="mt-4 rounded-2xl border border-OCHER bg-BROWN px-4 py-5">
        <View className="mt-1">
          <Text className="mb-2 text-lg text-OCHER" style={{ fontFamily: fonts.body }}>
            コーヒー基本情報
          </Text>
          <Text className="mb-2 text-OCHER" style={{ fontFamily: fonts.body }}>
            ブランド
          </Text>
          <TouchableOpacity
            onPress={() => setModalVisible('brand')}
            disabled={loading}
            className="flex-row items-center justify-between rounded-xl border border-OCHER bg-DARK_BROWN px-4 py-4"
            style={{ opacity: loading ? 0.6 : 1 }}
          >
            <Text className="flex-1 pr-3 text-OCHER" style={{ fontFamily: fonts.body_regular }}>
              {selectedBrandLabel}
            </Text>
            <FontAwesome5 name="chevron-right" size={14} color={colors.OCHER} />
          </TouchableOpacity>
        </View>

        <SelectModal
          visible={modalVisible === 'brand'}
          title="ブランドを選択"
          isMulti={false}
          options={brands}
          selectedIds={coffee.brand_id ? [coffee.brand_id] : []}
          onChange={(ids) => updateCoffeeField('brand_id', ids[0] ?? '')}
          onClose={() => setModalVisible(null)}
        />

        <View className="mt-5">
          <Text className="mb-2 text-OCHER" style={{ fontFamily: fonts.body }}>
            コーヒー名
          </Text>
          <TextInput
            placeholder="コーヒー名を入力"
            placeholderTextColor={colors.LIGHT_BROWN}
            value={coffee.name}
            onChangeText={(text) => updateCoffeeField('name', text)}
            keyboardType="default"
            autoCapitalize="none"
            autoCorrect={false}
            className="rounded-xl border border-OCHER bg-DARK_BROWN px-4 py-3 text-OCHER"
            style={{ fontFamily: fonts.body_regular }}
          />
        </View>

        <View className="mt-5">
          <Text className="mb-2 text-OCHER" style={{ fontFamily: fonts.body }}>
            使用している豆
          </Text>
          <TouchableOpacity
            onPress={() => setModalVisible('bean')}
            disabled={loading}
            className="rounded-xl border border-OCHER bg-DARK_BROWN px-4 py-4"
            style={{ opacity: loading ? 0.6 : 1 }}
          >
            <View className="flex-row items-center justify-between">
              <Text className="flex-1 pr-3 text-OCHER" style={{ fontFamily: fonts.body_regular }}>
                {selectedBeanLabels.length > 0 ? `${selectedBeanLabels.length}件の豆を選択中` : 'コーヒー豆を選択'}
              </Text>
              <FontAwesome5 name="chevron-right" size={14} color={colors.OCHER} />
            </View>

            {selectedBeanLabels.length > 0 ? (
              <Text className="mt-3 text-OCHER" style={{ fontFamily: fonts.body_regular }}>
                {selectedBeanLabels.join(' / ')}
              </Text>
            ) : null}
          </TouchableOpacity>
        </View>

        <SelectModal
          visible={modalVisible === 'bean'}
          title="豆を選択"
          options={beans}
          selectedIds={includedBeans}
          onChange={(ids) => {
            clearErrors();
            setIncludedBeans(ids);
          }}
          onClose={() => setModalVisible(null)}
        />

        <View className="mt-5">
          <Text className="mb-2 text-OCHER" style={{ fontFamily: fonts.body }}>
            コメント
          </Text>
          <TextInput
            placeholder="コメントを入力"
            placeholderTextColor={colors.LIGHT_BROWN}
            value={coffee.comments}
            onChangeText={(text) => updateCoffeeField('comments', text)}
            keyboardType="default"
            autoCapitalize="none"
            autoCorrect={false}
            multiline
            textAlignVertical="top"
            className="min-h-[120px] rounded-xl border border-OCHER bg-DARK_BROWN px-4 py-3 text-OCHER"
            style={{ fontFamily: fonts.body_regular }}
          />
        </View>
      </View>

      <View className="mt-4 rounded-2xl border border-OCHER bg-BROWN px-4 py-5">
        <Text className="text-lg text-OCHER" style={{ fontFamily: fonts.body }}>
          味の評価
        </Text>
        <Text className="mt-2 text-OCHER" style={{ fontFamily: fonts.body_regular }}>
          各項目を1から5の間で調整してください。
        </Text>

        {sliderFields.map((field) => (
          <View key={field.key} className="mt-5 rounded-xl border border-OCHER bg-DARK_BROWN px-4 py-4">
            <View className="flex-row items-center justify-between">
              <Text className="text-OCHER" style={{ fontFamily: fonts.body }}>
                {field.label}
              </Text>
              <Text className="text-OCHER" style={{ fontFamily: fonts.title_medium }}>
                {coffee[field.key]}
              </Text>
            </View>

            <Slider
              value={coffee[field.key]}
              onValueChange={(value) => updateCoffeeField(field.key, value)}
              minimumValue={1}
              maximumValue={5}
              step={1}
              minimumTrackTintColor={colors.OCHER}
              maximumTrackTintColor={colors.LIGHT_BROWN}
              thumbTintColor={colors.OCHER}
              style={{ marginTop: 12 }}
            />

            <View className="mt-1 flex-row justify-between">
              {sliderScaleLabels.map((label) => (
                <Text
                  key={`${field.key}-${label}`}
                  className="text-OCHER"
                  style={{ fontFamily: fonts.body_regular }}
                >
                  {label}
                </Text>
              ))}
            </View>
          </View>
        ))}
      </View>

      {displayedError ? (
        <Text className="mt-4 text-OCHER" style={{ fontFamily: fonts.body }}>
          {displayedError}
        </Text>
      ) : null}

      {onCancel ? (
        <View className="mt-4 flex-row gap-3">
          <TouchableOpacity
            onPress={onCancel}
            disabled={loading}
            className="flex-1 rounded-xl border border-OCHER px-4 py-4"
            style={{ opacity: loading ? 0.6 : 1 }}
          >
            <Text className="text-center text-OCHER" style={{ fontFamily: fonts.body }}>
              キャンセル
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => void handleSubmit()}
            disabled={!canSaveCoffee}
            className="flex-1 rounded-xl bg-OCHER px-4 py-4"
            style={{ opacity: canSaveCoffee ? 1 : 0.6 }}
          >
            <Text className="text-center text-DARK_BROWN" style={{ fontFamily: fonts.body }}>
              {loading ? '保存中……' : resolvedSubmitLabel}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity
          onPress={() => void handleSubmit()}
          disabled={!canSaveCoffee}
          className="mt-4 rounded-xl bg-OCHER px-4 py-4"
          style={{ opacity: canSaveCoffee ? 1 : 0.6 }}
        >
          <Text className="text-center text-DARK_BROWN" style={{ fontFamily: fonts.body }}>
            {loading ? '保存中……' : resolvedSubmitLabel}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  )
}
