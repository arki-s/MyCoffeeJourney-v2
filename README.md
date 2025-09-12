# ☕ MyCoffeeJourney v2 ☕

![CI](https://github.com/arki-s/MyCoffeeJourney-v2/actions/workflows/ci.yml/badge.svg)

コーヒー好きによるコーヒー好きのためのコーヒーのアプリ。<br>
以前作成した v1 を 1 から新規作成して継続利用可能なアプリを目指しています。

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

## 技術スタック構成

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

## 開発について

本プロジェクトでは GitHub Actions を用いた CI（継続的インテグレーション）を導入しています。

- ESLint（TypeScript + React ルール）による静的コード解析
- push／pull request 時に自動実行
- コード品質を一定水準に保つ仕組みを整備済み

今後はユニットテストやビルド検証も追加予定です。

---

## License

This project is licensed under the MIT License.
