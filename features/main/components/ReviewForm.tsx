import { Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'

type Props = {
  initialScore?: number; // 1-5
  initialComments?: string;
  onSubmit: (data: { score: number; comments: string }) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  error?: string | null;
  title?: string; //コーヒー名を入れる予定
}

export default function ReviewForm(props: Props) {

  const [score, setScore] = useState<number>(props.initialScore || 0);
  const [comments, setComments] = useState<string>(props.initialComments || "");
  const [title, setTitle] = useState<string>(props.title || "レビューを追加");

  // やることリスト
  //  props定義（initialScore, initialComments, onSubmit, onCancel, loading, error, title）
  //  useStateでscoreとcommentsを内部管理（initial*を初期値に）
  //  星UI（1..5をmapで並べ、選択以下を強調）PressableでonPress時にscore更新
  //  TextInput（multiline、placeholder、value=comments、onChangeTextで更新）
  //  errorがあれば赤字表示
  //  キャンセル/送信ボタン（送信はloading中とscore===0でdisabled）
  //  accessibilityLabel/testIDの付与（星、入力、ボタン）
  //  スタイル（パディング、タップ領域、色）と押下時のフィードバック
  //  送信時にprops.onSubmit({ score, comments })、成功後の初期化は親の判断に委ねる
  return (
    <Modal>
      <Text>ReviewForm</Text>
      <Text>{title}</Text>
      <TextInput
        placeholder='1-5のスコアを入力'
        value={score ? score.toString() : ''}
        onChangeText={(text) => {
          const num = parseInt(text, 10);
          if (!isNaN(num) && num >= 1 && num <= 5) {
            setScore(num);
          } else {
            setScore(0); // 無効な値の場合は0にリセット
          }
        }}
        keyboardType='numeric'
        maxLength={1}
      ></TextInput>
      <TextInput
        placeholder='コメントを入力'
        value={comments}
        onChangeText={(text) => setComments(text)}
        multiline
      ></TextInput>
      <TouchableOpacity
        onPress={props.onCancel}
        disabled={props.loading}
      >
        <Text>後で入力する</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => props.onSubmit({ score, comments })}
        disabled={props.loading || score === 0}
      >
        <Text>送信</Text>
      </TouchableOpacity>
      {props.error ? <Text style={{ color: 'red' }}>{props.error}</Text> : null}
    </Modal>
  )
}

const styles = StyleSheet.create({})
