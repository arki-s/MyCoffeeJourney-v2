import { ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { GrindSize } from '../../../type';
import { useUserStore } from '../../../stores/useUserStore';
import { createGrindSize, deleteGrindSize, listGrindSizes, updateGrindSize } from '../../auth/services/grindSizeService';
import { colors } from '../../../app/main/theme/colors';
import { fonts } from '../../../app/main/theme/fonts';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import DeleteBlockModal from '../components/DeleteBlockModal';

export default function GrindSizeScreen() {
  const user = useUserStore((state) => state.user);

  const [grindSizes, setGrindSizes] = useState<GrindSize[]>([]);
  const [grindSizeName, setGrindSizeName] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [isCreateFormVisible, setIsCreateFormVisible] = useState<boolean>(false);
  const [editingGrindSizeId, setEditingGrindSizeId] = useState<string | null>(null);
  const [editGrindSizeNames, setEditGrindSizeNames] = useState<Record<string, string>>({});
  const [createError, setCreateError] = useState<string | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const [deleteBlockType, setDeleteBlockType] = useState<"grindSize" | "error" | null>(null);

  useEffect(() => {
    void fetchGrindSizes();
  }, []);

  const fetchGrindSizes = async () => {
    try {
      const data = await listGrindSizes();
      setGrindSizes(data);
    } catch (error) {
      console.error("Error fetching grind sizes:", error);
    }
  };

  const handleGrindSizeCreate = async (name: string) => {
    const trimmedName = name.trim();
    if (!user || !trimmedName) return;

    try {
      setCreateError(null);
      setLoading(true);
      await createGrindSize(trimmedName, user.id);
      await fetchGrindSizes();
      setGrindSizeName('');
      setIsCreateFormVisible(false);
    } catch {
      setCreateError('※挽き目の作成に失敗しました。もう一度お試しください。');
    } finally {
      setLoading(false);
    }
  };

  const handleGrindSizeEdit = async (id: string) => {
    const trimmedName = (editGrindSizeNames[id] ?? '').trim();
    if (!user || !id || !trimmedName) return;

    try {
      setEditError(null);
      setLoading(true);
      await updateGrindSize(id, trimmedName);
      await fetchGrindSizes();
      setEditingGrindSizeId(null);
    } catch {
      setEditError('※挽き目の更新に失敗しました。もう一度お試しください。');
    } finally {
      setLoading(false);
    }
  };

  const handleGrindSizeDelete = async (id: string) => {
    if (!user || !id) return;
    setLoading(true);
    try {
      await deleteGrindSize(id);
      await fetchGrindSizes();
    } catch (error) {
      console.error("Error deleting grindsize:", error);

      const errorCode =
        typeof error === "object" &&
          error !== null &&
          "code" in error &&
          typeof error.code === "string"
          ? error.code
          : undefined;

      if (errorCode === "23503") {
        // 外部キー制約。関連データがあるので削除不可。
        setDeleteBlockType("grindSize");
      } else {
        // それ以外は汎用エラー扱い。
        setDeleteBlockType("error");
      }

    } finally {
      setLoading(false);
    }
  };

  const handleCreateCancel = () => {
    setGrindSizeName('');
    setCreateError(null);
    setIsCreateFormVisible(false);
  };

  const handleEditStart = (grindSize: GrindSize) => {
    setEditError(null);
    setEditingGrindSizeId(grindSize.id);
    setEditGrindSizeNames((prev) => ({ ...prev, [grindSize.id]: grindSize.name }));
  };

  const handleEditCancel = (id: string) => {
    setEditError(null);
    setEditingGrindSizeId(null);
    setEditGrindSizeNames((prev) => ({ ...prev, [id]: '' }));
  };

  const grindSizesList = grindSizes.length ? grindSizes.map((grindSize) => {
    const editValue = editGrindSizeNames[grindSize.id] ?? '';
    const canSaveEdit = editValue.trim().length > 0 && !loading;
    const isEditing = editingGrindSizeId === grindSize.id;

    return (
      <View
        key={grindSize.id}
        className="mb-3 rounded-2xl border border-OCHER bg-BROWN px-4 py-4"
      >
        {isEditing ? (
          <View className="rounded-xl border border-OCHER bg-DARK_BROWN px-4 py-4">
            <TextInput
              placeholder='新しい挽き目を入力'
              placeholderTextColor={colors.LIGHT_BROWN}
              value={editValue}
              onChangeText={(text) => {
                if (editError) {
                  setEditError(null);
                }
                setEditGrindSizeNames((prev) => ({ ...prev, [grindSize.id]: text }));
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
                onPress={() => void handleGrindSizeEdit(grindSize.id)}
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
                onPress={() => handleEditCancel(grindSize.id)}
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
                {grindSize.name}
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => handleEditStart(grindSize)}
              disabled={loading}
              className="mr-3"
              style={{ opacity: loading ? 0.6 : 1 }}
            >
              <FontAwesome name="pencil" size={16} color={colors.OCHER} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => { void handleGrindSizeDelete(grindSize.id) }}
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
        挽き目の登録がありません
      </Text>
    </View>
  );

  const canSaveGrindSize = grindSizeName.trim().length > 0 && !loading;

  return (
    <ScrollView
      className="flex-1 border-2 border-OCHER bg-DARK_BROWN"
      contentContainerStyle={{ flexGrow: 1, paddingBottom: 24 }}
    >
      <View className="px-5 py-6">
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
                コーヒー挽き目を新規登録
              </Text>
            </TouchableOpacity>
          ) : (
            <View className="mt-4 rounded-2xl border border-OCHER bg-DARK-BROWN px-4 py-4">
              <TextInput
                placeholder='コーヒーの挽き目を入力'
                placeholderTextColor={colors.OCHER}
                value={grindSizeName}
                onChangeText={(text) => {
                  setGrindSizeName(text);
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
                  onPress={() => void handleGrindSizeCreate(grindSizeName)}
                  disabled={!canSaveGrindSize}
                  className="flex-1 rounded-xl bg-OCHER px-4 py-3"
                  style={{ opacity: canSaveGrindSize ? 1 : 0.6 }}
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
            登録済み挽き目
          </Text>
          {grindSizesList}
        </View>
      </View>

      {deleteBlockType && (
        <DeleteBlockModal
          visible
          selectedItemName={deleteBlockType}
          onClose={() => setDeleteBlockType(null)}
        />
      )}
    </ScrollView>
  )
}
