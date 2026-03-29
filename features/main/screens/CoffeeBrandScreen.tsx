import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Brand, SettingStackParamList } from '../../../type';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { useUserStore } from '../../../stores/useUserStore';
import { createBrand, deleteBrand, listBrands, updateBrand } from '../../auth/services/brandService';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { colors } from '../../../app/main/theme/colors';
import { fonts } from '../../../app/main/theme/fonts';
import FontAwesome from '@expo/vector-icons/FontAwesome';

export default function CoffeeBrandScreen() {
  const user = useUserStore((state) => state.user);

  const [brands, setBrands] = useState<Brand[]>([]);
  const [brandName, setBrandName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [isCreateFormVisible, setIsCreateFormVisible] = useState<boolean>(false);
  const [editingBrandId, setEditingBrandId] = useState<string | null>(null);
  const [editBrandNames, setEditBrandNames] = useState<Record<string, string>>({});
  const [createError, setCreateError] = useState<string | null>(null);
  const [editError, setEditError] = useState<string | null>(null);

  type RecordsNav = NativeStackNavigationProp<SettingStackParamList, 'Brands'>;
  const navigation = useNavigation<RecordsNav>();

  const handleSettingPress = () => {
    navigation.navigate('SettingsHome');
  };

  useEffect(() => {
    void fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      const data = await listBrands();
      setBrands(data);
    } catch (error) {
      console.error("Error fetching brands:", error);
    }
  };

  const handleBrandCreate = async (name: string) => {
    const trimmedName = name.trim();
    if (!user || !trimmedName) return;

    try {
      setCreateError(null);
      setLoading(true);
      await createBrand(trimmedName, user.id);
      await fetchBrands();
      setBrandName('');
      setIsCreateFormVisible(false);
    } catch {
      setCreateError('※ブランドの作成に失敗しました。もう一度お試しください。');
    } finally {
      setLoading(false);
    }
  };

  const handleBrandEdit = async (id: string) => {
    const trimmedName = (editBrandNames[id] ?? '').trim();
    if (!user || !id || !trimmedName) return;

    try {
      setEditError(null);
      setLoading(true);
      await updateBrand(id, trimmedName);
      await fetchBrands();
      setEditingBrandId(null);
    } catch {
      setEditError('※ブランドの更新に失敗しました。もう一度お試しください。');
    } finally {
      setLoading(false);
    }
  };

  const handleBrandDelete = async (id: string) => {
    if (!user || !id) return;
    setLoading(true);
    try {
      await deleteBrand(id);
      await fetchBrands();
    } catch (error) {
      console.error("Error deleting brand:", error);
    } finally {
      setLoading(false);
    }
  }

  const handleCreateCancel = () => {
    setBrandName('');
    setCreateError(null);
    setIsCreateFormVisible(false);
  };

  const handleEditStart = (brand: Brand) => {
    setEditError(null);
    setEditingBrandId(brand.id);
    setEditBrandNames((prev) => ({ ...prev, [brand.id]: brand.name }));
  };

  const handleEditCancel = (id: string) => {
    setEditError(null);
    setEditingBrandId(null);
    setEditBrandNames((prev) => ({ ...prev, [id]: '' }));
  };

  const brandsList = brands.length ? brands.map((brand) => {
    const editValue = editBrandNames[brand.id] ?? '';
    const canSaveEdit = editValue.trim().length > 0 && !loading;
    const isEditing = editingBrandId === brand.id;

    return (
      <View
        key={brand.id}
        className="mb-3 rounded-2xl border border-OCHER bg-BROWN px-4 py-4"
      >
        {isEditing ? (
          <View className="rounded-xl border border-OCHER bg-DARK_BROWN px-4 py-4">
            <TextInput
              placeholder='新しいブランド名を入力'
              placeholderTextColor={colors.LIGHT_BROWN}
              value={editValue}
              onChangeText={(text) => {
                if (editError) {
                  setEditError(null);
                }
                setEditBrandNames((prev) => ({ ...prev, [brand.id]: text }));
              }}
              keyboardType='default'
              autoCapitalize='none'
              autoCorrect={false}
              className="rounded-xl border border-OCHER bg-BROWN px-4 py-3 text-OCHER"
              style={{ fontFamily: fonts.body_regular }}
            />
            {editError ? (
              <Text className="mt-2 text-OCHER" style={{ fontFamily: fonts.body }}>
                {editError}
              </Text>
            ) : null}

            <View className="mt-4 flex-row gap-3">
              <TouchableOpacity
                onPress={() => void handleBrandEdit(brand.id)}
                disabled={!canSaveEdit}
                className="flex-1 rounded-xl bg-OCHER px-4 py-3"
                style={{ opacity: canSaveEdit ? 1 : 0.6 }}
              >
                <Text
                  className="text-center text-DARK_BROWN"
                  style={{ fontFamily: fonts.body }}
                >
                  {loading ? '保存中……' : '編集を保存'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleEditCancel(brand.id)}
                disabled={loading}
                className="flex-1 rounded-xl border border-OCHER px-4 py-3"
                style={{ opacity: loading ? 0.6 : 1 }}
              >
                <Text
                  className="text-center text-OCHER"
                  style={{ fontFamily: fonts.body }}
                >
                  キャンセル
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View className="flex-row items-center justify-between">
            <View className="flex-1 pr-4">
              <Text className="text-xl text-OCHER" style={{ fontFamily: fonts.title_medium }}>
                {brand.name}
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => handleEditStart(brand)}
              disabled={loading}
              className="mr-3"
              style={{ opacity: loading ? 0.6 : 1 }}
            >
              <FontAwesome name="pencil" size={16} color={colors.OCHER} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => { void handleBrandDelete(brand.id) }}
              disabled={loading}
              style={{ opacity: loading ? 0.6 : 1 }}
            >
              <FontAwesome name="trash" size={18} color={colors.OCHER} />
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  }) : (
    <View className="rounded-2xl border border-OCHER bg-BROWN px-4 py-4">
      <Text className="text-center text-OCHER" style={{ fontFamily: fonts.body }}>
        ブランド登録がありません
      </Text>
    </View>
  );

  const canSaveBrand = brandName.trim().length > 0 && !loading;


  return (
    <ScrollView className="flex-1 border-2 border-OCHER bg-DARK_BROWN"
      contentContainerStyle={{ flexGrow: 1, paddingBottom: 24 }}>
      <View className="px-5 py-6">
        <TouchableOpacity className="self-start" onPress={() => handleSettingPress()}>
          <FontAwesome5 name="arrow-circle-left" size={28} color={colors.OCHER} />
        </TouchableOpacity>

        <View>
          {!isCreateFormVisible ? (
            <TouchableOpacity
              onPress={() => setIsCreateFormVisible(true)}
              disabled={loading}
              className="mt-4 rounded-xl bg-OCHER px-4 py-3"
              style={{ opacity: loading ? 0.6 : 1 }}
            >
              <Text
                className="text-center text-DARK_BROWN"
                style={{ fontFamily: fonts.body }}
              >
                コーヒーブランドを新規登録
              </Text>
            </TouchableOpacity>
          ) : (
            <View className="mt-4 rounded-2xl border border-OCHER bg-DARK-BROWN px-4 py-4">
              <TextInput
                placeholder='コーヒーブランドを入力'
                placeholderTextColor={colors.OCHER}
                value={brandName}
                onChangeText={(text) => {
                  setBrandName(text);
                  if (createError) {
                    setCreateError(null);
                  }
                }}
                keyboardType='default'
                autoCapitalize='none'
                autoCorrect={false}
                className="mt-3 rounded-xl border border-OCHER bg-BROWN px-4 py-3 text-OCHER"
                style={{ fontFamily: fonts.body_regular }}
              />
              {createError ? (
                <Text className="mt-2 text-OCHER" style={{ fontFamily: fonts.body }}>
                  {createError}
                </Text>
              ) : null}

              <View className="mt-4 flex-row gap-3">
                <TouchableOpacity
                  onPress={() => void handleBrandCreate(brandName)}
                  disabled={!canSaveBrand}
                  className="flex-1 rounded-xl bg-OCHER px-4 py-3"
                >
                  <Text
                    className="text-center text-DARK_BROWN"
                    style={{ fontFamily: fonts.body }}
                  >
                    {loading ? '保存中……' : '保存'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleCreateCancel}
                  disabled={loading}
                  className="flex-1 rounded-xl border border-OCHER px-4 py-3"
                  style={{ opacity: loading ? 0.6 : 1 }}
                >
                  <Text
                    className="text-center text-OCHER"
                    style={{ fontFamily: fonts.body }}
                  >
                    キャンセル
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        <View className="mt-4">
          <Text className="text-lg text-OCHER" style={{ fontFamily: fonts.body }}>
            登録済みブランド
          </Text>
          {brandsList}
        </View>
      </View>
    </ScrollView>
  )
}
