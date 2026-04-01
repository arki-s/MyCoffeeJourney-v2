import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useMemo, useState } from 'react'
import Slider from '@react-native-community/slider'
import { CoffeeStackParamList } from '../../../type';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { useUserStore } from '../../../stores/useUserStore';
import { createCoffee, setCoffeeBeanInclusions } from '../../auth/services/coffeeService';
import { listBeans } from '../../auth/services/beanService';
import SelectModal from '../components/SelectModal';
import { listBrands } from '../../auth/services/brandService';
import { colors } from '../../../app/main/theme/colors';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { fonts } from '../../../app/main/theme/fonts';

type CoffeeFormState = {
  name: string;
  comments: string;
  photo_url: string;
  roast_level: number;
  body: number;
  sweetness: number;
  fruity: number;
  bitter: number;
  aroma: number;
  brand_id: string;
};

const initialCoffeeState: CoffeeFormState = {
  name: '',
  comments: '',
  photo_url: '',
  roast_level: 1,
  body: 1,
  sweetness: 1,
  fruity: 1,
  bitter: 1,
  aroma: 1,
  brand_id: ''
};

const sliderFields: Array<{
  key: keyof Pick<CoffeeFormState, 'roast_level' | 'body' | 'sweetness' | 'fruity' | 'bitter' | 'aroma'>;
  label: string;
}> = [
    { key: 'roast_level', label: '焙煎度' },
    { key: 'body', label: 'コク' },
    { key: 'sweetness', label: '甘み' },
    { key: 'fruity', label: '酸味' },
    { key: 'bitter', label: '苦味' },
    { key: 'aroma', label: '香り' },
  ];

const sliderScaleLabels = ['1', '2', '3', '4', '5'];

export default function CoffeeCreateScreen() {
  const user = useUserStore((state) => state.user);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [newCoffee, setNewCoffee] = useState<CoffeeFormState>(initialCoffeeState);
  const [brands, setBrands] = useState<{ id: string, label: string }[]>([]);
  const [beans, setBeans] = useState<{ id: string, label: string }[]>([]);
  const [includedBeans, setIncludedBeans] = useState<string[]>([]);
  const [modalVisible, setModalVisible] = useState<"brand" | "bean" | null>(null);

  type RecordsNav = NativeStackNavigationProp<CoffeeStackParamList, 'CoffeeCreate'>;
  const navigation = useNavigation<RecordsNav>();

  useEffect(() => {
    void fetchBrands();
    void fetchBeans();
  }, []);

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
    () => brands.find((brand) => brand.id === newCoffee.brand_id)?.label ?? 'コーヒーブランドを選択',
    [brands, newCoffee.brand_id]
  );

  const selectedBeanLabels = useMemo(
    () => beans.filter((bean) => includedBeans.includes(bean.id)).map((bean) => bean.label),
    [beans, includedBeans]
  );

  const canSaveCoffee = newCoffee.name.trim().length > 0 && newCoffee.brand_id.length > 0 && !loading;

  const handleHomePress = () => {
    navigation.navigate('CoffeeHome');
  };

  const updateCoffeeField = <K extends keyof CoffeeFormState>(key: K, value: CoffeeFormState[K]) => {
    if (error) {
      setError(null);
    }
    setNewCoffee((prev) => ({ ...prev, [key]: value }));
  };

  const handleCoffeeCreate = async () => {
    if (!user) return;

    if (!newCoffee.brand_id) {
      setError('※ブランドを選択してください。');
      return;
    }

    if (!newCoffee.name.trim()) {
      setError('※コーヒー名を入力してください。');
      return;
    }

    try {
      setError(null);
      setLoading(true);

      const response = await createCoffee(
        newCoffee.name,
        newCoffee.brand_id,
        newCoffee.comments,
        newCoffee.photo_url,
        newCoffee.roast_level,
        newCoffee.body,
        newCoffee.sweetness,
        newCoffee.fruity,
        newCoffee.bitter,
        newCoffee.aroma
      );

      await setCoffeeBeanInclusions(response.id, includedBeans);
      navigation.navigate('CoffeeHome');
    } catch (createError) {
      console.error('Error creating coffee:', createError);
      setError('※コーヒーの作成に失敗しました。もう一度お試しください。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      className="flex-1 border-2 border-OCHER bg-DARK_BROWN"
      contentContainerStyle={{ flexGrow: 1, paddingBottom: 24 }}
    >
      <View className="px-5 py-6">
        <TouchableOpacity className="self-start" onPress={handleHomePress}>
          <FontAwesome5 name="arrow-circle-left" size={28} color={colors.OCHER} />
        </TouchableOpacity>

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
            selectedIds={newCoffee.brand_id ? [newCoffee.brand_id] : []}
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
              value={newCoffee.name}
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
              if (error) {
                setError(null);
              }
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
              value={newCoffee.comments}
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
                  {newCoffee[field.key]}
                </Text>
              </View>

              <Slider
                value={newCoffee[field.key]}
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

        {error ? (
          <Text className="mt-4 text-OCHER" style={{ fontFamily: fonts.body }}>
            {error}
          </Text>
        ) : null}

        <TouchableOpacity
          onPress={() => void handleCoffeeCreate()}
          disabled={!canSaveCoffee}
          className="mt-4 rounded-xl bg-OCHER px-4 py-4"
          style={{ opacity: canSaveCoffee ? 1 : 0.6 }}
        >
          <Text
            className="text-center text-DARK_BROWN"
            style={{ fontFamily: fonts.body }}
          >
            {loading ? '保存中……' : 'コーヒーを登録'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}
