import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Bean, SettingStackParamList } from '../../../type';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { useUserStore } from '../../../stores/useUserStore';
import { createBean, deleteBean, listBeans, updateBean } from '../../auth/services/beanService';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import { colors } from '../../../app/main/theme/colors';
import { fonts } from '../../../app/main/theme/fonts';
import FontAwesome from '@expo/vector-icons/FontAwesome';

export default function CoffeeBeanScreen() {
  const user = useUserStore((state) => state.user);

  const [beans, setBeans] = useState<Bean[]>([]);
  const [beanName, setBeanName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [isCreateFormVisible, setIsCreateFormVisible] = useState<boolean>(false);
  const [editingBeanId, setEditingBeanId] = useState<string | null>(null);
  const [editBeanNames, setEditBeanNames] = useState<Record<string, string>>({});
  const [createError, setCreateError] = useState<string | null>(null);
  const [editError, setEditError] = useState<string | null>(null);

  type RecordsNav = NativeStackNavigationProp<SettingStackParamList, 'Beans'>;
  const navigation = useNavigation<RecordsNav>();

  const handleSettingPress = () => {
    navigation.navigate('SettingsHome');
  };

  useEffect(() => {
    void fetchBeans();
  }, []);

  const fetchBeans = async () => {
    try {
      const data = await listBeans();
      setBeans(data);
    } catch (error) {
      console.error("Error fetching beans:", error);
    }
  };

  const handleBeanCreate = async (name: string) => {
    const trimmedName = name.trim();
    if (!user || !trimmedName) return;

    try {
      setCreateError(null);
      setLoading(true);
      await createBean(trimmedName, user.id);
      await fetchBeans();
      setBeanName('');
      setIsCreateFormVisible(false);
    } catch {
      setCreateError('※豆産地の作成に失敗しました。もう一度お試しください。');
    } finally {
      setLoading(false);
    }
  };

  const handleBeanEdit = async (id: string) => {
    const trimmedName = (editBeanNames[id] ?? '').trim();
    if (!user || !id || !trimmedName) return;

    try {
      setEditError(null);
      setLoading(true);
      await updateBean(id, trimmedName);
      await fetchBeans();
      setEditingBeanId(null);
    } catch {
      setEditError('※豆産地の更新に失敗しました。もう一度お試しください。');
    } finally {
      setLoading(false);
    }
  };

  const handleBeanDelete = async (id: string) => {
    if (!user || !id) return;
    setLoading(true);
    try {
      await deleteBean(id);
      await fetchBeans();
    } catch (error) {
      console.error("Error deleting bean:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCancel = () => {
    setBeanName('');
    setCreateError(null);
    setIsCreateFormVisible(false);
  };

  const handleEditStart = (bean: Bean) => {
    setEditError(null);
    setEditingBeanId(bean.id);
    setEditBeanNames((prev) => ({ ...prev, [bean.id]: bean.name }));
  };

  const handleEditCancel = (id: string) => {
    setEditError(null);
    setEditingBeanId(null);
    setEditBeanNames((prev) => ({ ...prev, [id]: '' }));
  };

  const beansList = beans.length ? beans.map((bean) => {
    const editValue = editBeanNames[bean.id] ?? '';
    const canSaveEdit = editValue.trim().length > 0 && !loading;
    const isEditing = editingBeanId === bean.id;

    return (
      <View
        key={bean.id}
        className="mb-3 rounded-2xl border border-OCHER bg-BROWN px-4 py-4"
      >
        {isEditing ? (
          <View className="rounded-xl border border-OCHER bg-DARK_BROWN px-4 py-4">
            <TextInput
              placeholder='新しい豆産地を入力'
              placeholderTextColor={colors.LIGHT_BROWN}
              value={editValue}
              onChangeText={(text) => {
                if (editError) {
                  setEditError(null);
                }
                setEditBeanNames((prev) => ({ ...prev, [bean.id]: text }));
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
                onPress={() => void handleBeanEdit(bean.id)}
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
                onPress={() => handleEditCancel(bean.id)}
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
                {bean.name}
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => handleEditStart(bean)}
              disabled={loading}
              className="mr-3"
              style={{ opacity: loading ? 0.6 : 1 }}
            >
              <FontAwesome name="pencil" size={16} color={colors.OCHER} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => { void handleBeanDelete(bean.id) }}
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
        豆産地の登録がありません
      </Text>
    </View>
  );

  const canSaveBean = beanName.trim().length > 0 && !loading;

  return (
    <ScrollView
      className="flex-1 border-2 border-OCHER bg-DARK_BROWN"
      contentContainerStyle={{ flexGrow: 1, paddingBottom: 24 }}
    >
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
                コーヒー豆産地を新規登録
              </Text>
            </TouchableOpacity>
          ) : (
            <View className="mt-4 rounded-2xl border border-OCHER bg-DARK-BROWN px-4 py-4">
              <TextInput
                placeholder='コーヒー豆の産地を入力'
                placeholderTextColor={colors.OCHER}
                value={beanName}
                onChangeText={(text) => {
                  setBeanName(text);
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
                  onPress={() => void handleBeanCreate(beanName)}
                  disabled={!canSaveBean}
                  className="flex-1 rounded-xl bg-OCHER px-4 py-3"
                  style={{ opacity: canSaveBean ? 1 : 0.6 }}
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
            登録済み豆産地
          </Text>
          {beansList}
        </View>
      </View>
    </ScrollView>
  )
}
