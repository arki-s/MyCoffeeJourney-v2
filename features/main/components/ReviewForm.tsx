import React, { useMemo, useState } from 'react'
import { Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import FontAwesome5 from '@expo/vector-icons/FontAwesome5'
import { colors } from '../../../app/main/theme/colors'
import { fonts } from '../../../app/main/theme/fonts'
import SelectModal from './SelectModal'

type Props = {
  initialScore?: number;
  initialComments?: string;
  onSubmit: (data: { score: number; comments: string }) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  error?: string | null;
  title?: string;
}

const scoreOptions = [
  { id: '1', label: '⭐️' },
  { id: '2', label: '⭐️⭐️' },
  { id: '3', label: '⭐️⭐️⭐️' },
  { id: '4', label: '⭐️⭐️⭐️⭐️' },
  { id: '5', label: '⭐️⭐️⭐️⭐️⭐️' },
];

export default function ReviewForm({
  initialScore = 0,
  initialComments = '',
  onSubmit,
  onCancel,
  loading = false,
  error = null,
  title = 'レビューを追加',
}: Props) {
  const [score, setScore] = useState<number>(initialScore);
  const [comments, setComments] = useState<string>(initialComments);
  const [scoreModalVisible, setScoreModalVisible] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [hideExternalError, setHideExternalError] = useState(false);

  const selectedScoreLabel = useMemo(
    () => scoreOptions.find((option) => option.id === String(score))?.label ?? '評価を選択',
    [score]
  );

  const displayedError = localError ?? (hideExternalError ? null : error);
  const canSubmit = score > 0 && !loading;

  const clearErrors = () => {
    if (localError) {
      setLocalError(null);
    }

    if (error) {
      setHideExternalError(true);
    }
  };

  const handleSubmit = async () => {
    if (score === 0) {
      setLocalError('※評価を選択してください。');
      return;
    }

    setLocalError(null);
    setHideExternalError(true);
    await onSubmit({ score, comments: comments.trim() });
  };

  return (
    <Modal visible animationType="fade" transparent onRequestClose={onCancel}>
      <View style={{ flex: 1, backgroundColor: '#0008', justifyContent: 'center', padding: 16 }}>
        <View
          className="rounded-2xl border border-OCHER bg-DARK_BROWN"
          style={{ maxHeight: '92%' }}
        >
          <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 24 }}>
            <Text className="text-lg text-OCHER" style={{ fontFamily: fonts.body }}>
              {title}
            </Text>

            <View className="mt-4 rounded-2xl border border-OCHER bg-BROWN px-4 py-5">

              <View>
                <Text className="mb-2 text-OCHER" style={{ fontFamily: fonts.body }}>
                  スコア
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    clearErrors();
                    setScoreModalVisible(true);
                  }}
                  disabled={loading}
                  className="flex-row items-center justify-between rounded-xl border border-OCHER bg-DARK_BROWN px-4 py-4"
                  style={{ opacity: loading ? 0.6 : 1 }}
                >
                  <Text className="flex-1 pr-3 text-OCHER" style={{ fontFamily: fonts.body_regular }}>
                    {selectedScoreLabel}
                  </Text>
                  <FontAwesome5 name="chevron-right" size={14} color={colors.OCHER} />
                </TouchableOpacity>
              </View>

              <View className="mt-5">
                <Text className="mb-2 text-OCHER" style={{ fontFamily: fonts.body }}>
                  コメント
                </Text>
                <TextInput
                  placeholder="コメントを入力"
                  placeholderTextColor={colors.LIGHT_BROWN}
                  value={comments}
                  onChangeText={(text) => {
                    clearErrors();
                    setComments(text);
                  }}
                  editable={!loading}
                  multiline
                  textAlignVertical="top"
                  className="min-h-[120px] rounded-xl border border-OCHER bg-DARK_BROWN px-4 py-3 text-OCHER"
                  style={{ fontFamily: fonts.body_regular }}
                />
              </View>
            </View>

            {displayedError ? (
              <Text className="mt-4 text-[#E9B4AF]" style={{ fontFamily: fonts.body_regular }}>
                {displayedError}
              </Text>
            ) : null}

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
                disabled={!canSubmit}
                className="flex-1 rounded-xl bg-OCHER px-4 py-4"
                style={{ opacity: canSubmit ? 1 : 0.6 }}
              >
                <Text className="text-center text-DARK_BROWN" style={{ fontFamily: fonts.body }}>
                  {loading ? '保存中……' : '保存'}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>

      <SelectModal
        visible={scoreModalVisible}
        title="評価を選択"
        options={scoreOptions}
        selectedIds={score ? [String(score)] : []}
        isMulti={false}
        onChange={(ids) => {
          clearErrors();
          setScore(Number(ids[0] ?? 0));
        }}
        onClose={() => setScoreModalVisible(false)}
      />
    </Modal>
  )
}
