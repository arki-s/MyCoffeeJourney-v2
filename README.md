# ☕ MyCoffeeJourney v2 ☕

コーヒー好きによるコーヒー好きのためのコーヒーのアプリ。
以前作成した v1 を 1 から新規作成して継続利用可能なアプリを目指す。

## 全体機能・画面遷移構成

### 主な機能一覧

- 新規ユーザー登録／ログイン（Supabase Auth）
- コーヒー豆情報登録・編集・削除
- 飲み始めた豆の記録
- 飲み終えた豆のレビュー記録
- 飲用履歴カレンダー表示
- コーヒー情報一覧＆検索／お気に入り管理
- 飲用データ分析（集計・グラフ表示）

---

## 🔧 技術スタック構成

### バックエンド

- **Supabase**

  - PostgreSQL ベースの RDB
  - 認証：Email 対応
  - ストレージ：画像アップロードも将来的に検討

### フロントエンド

- React Native
- TypeScript
- nativewind（Tailwind 記法でスタイリング）
- react-native-calendars（カレンダー表示）
- @react-native-community/datetimepicker（日付入力）

### 状態管理

- Zustand
- Context API との併用検討可能性あり

---

## License

This project is licensed under the MIT License.
