# ☕ MyCoffeeJourney v2 ☕

![CI](https://github.com/arki-s/MyCoffeeJourney-v2/actions/workflows/ci.yml/badge.svg)

コーヒーの記録・管理・評価を行うための個人向けアプリケーションです。<br>
以前作成した v1 を 1 から新規作成して継続利用可能なアプリを目指しています。<br>
<br>
ブランド・豆・挽き目といった要素を正規化して管理し、コーヒー情報を再利用可能な構造として設計しています。また、飲用記録とレビューを分離することで、「消費の記録」と「評価」を明確に区別しています。
<br>
単なるメモとしてではなく、コーヒー体験を構造化されたデータとして蓄積し、後から振り返りや検索がしやすい形で管理できるように設計しました。
<br>
データモデリングとUXに重点を置いて構築し、アプリケーションの構造と使いやすさの両方に力を入れて設計しています。

<p align="center">
  <img src="./screenshots/HowToUseScreenshot.png" alt="Top" width="30%" />
  <img src="./screenshots/CalendarScreenshot.png" alt="Calendar" width="30%" />
  <img src="./screenshots/BeansScreenshot.png" alt="Beans" width="30%" />
</p>

## 全体機能・画面遷移構成

### 主な機能一覧

- 新規ユーザー登録／ログイン（Supabase Auth）
- コーヒー豆情報登録・編集・削除
- 飲み始めた豆の記録
- 飲み終えた豆のレビュー記録
- 飲用履歴カレンダー表示
- コーヒー情報一覧
- 飲用データ分析（集計・グラフ表示）

---

## 技術スタック構成

### バックエンド

- **Supabase**
  - PostgreSQL ベースの RDB
  - 認証：OTP 対応
  - ストレージ：画像アップロードも将来的に検討

### フロントエンド

- React Native
- TypeScript
- nativewind（Tailwind 記法でスタイリング）
- react-native-calendars（カレンダー表示）
- @react-native-community/datetimepicker（日付入力）
- @react-native-community/slider（味わい評価のスライダー）

### 状態管理

- Zustand
- Context API との併用検討可能性あり

### ER図

- ユーザーごとのコーヒー記録を中心に、ブランド・豆・挽き目はマスタとして分離しています。
- 飲用中の記録と飲用後のレビューを分けることで、記録フェーズと評価フェーズを分離した構成にしています。

```mermaid
erDiagram
    users {
        uuid id PK
        text display_name
        text icon_url
        timestamptz created_at
    }

    coffee_brands {
        uuid id PK
        text name
        uuid user_id FK
        timestamptz created_at
    }

    coffee_beans {
        uuid id PK
        text name
        uuid user_id FK
        timestamptz created_at
    }

    coffee {
        uuid id PK
        text name
        text comments
        text photo_url
        int roast_level
        int body
        int sweetness
        int fruity
        int bitter
        int aroma
        uuid brand_id FK
        uuid user_id FK
        timestamptz created_at
    }

    coffee_bean_inclusions {
        uuid id PK
        uuid coffee_id FK
        uuid bean_id FK
        uuid user_id FK
        timestamptz created_at
    }

    grind_sizes {
        uuid id PK
        text name
        uuid user_id FK
        timestamptz created_at
    }

    drinking_records {
        uuid id PK
        int weight_grams
        int price_yen
        date start_date
        date end_date
        date purchase_date
        uuid coffee_id FK
        uuid user_id FK
        timestamptz created_at
    }

    drinking_grind_sizes {
        uuid id PK
        uuid grind_size_id FK
        uuid record_id FK
        uuid user_id FK
        timestamptz created_at
    }

    reviews {
        uuid id PK
        int score
        text comments
        uuid record_id FK
        uuid user_id FK
        timestamptz created_at
    }

    users ||--o{ coffee_brands : owns
    users ||--o{ coffee_beans : owns
    users ||--o{ coffee : owns
    users ||--o{ grind_sizes : owns
    users ||--o{ drinking_records : owns
    users ||--o{ reviews : owns
    users ||--o{ coffee_bean_inclusions : owns
    users ||--o{ drinking_grind_sizes : owns

    coffee_brands ||--o{ coffee : categorizes
    coffee ||--o{ drinking_records : recorded_as
    drinking_records ||--|| reviews : has

    coffee ||--o{ coffee_bean_inclusions : includes
    coffee_beans ||--o{ coffee_bean_inclusions : used_in

    grind_sizes ||--o{ drinking_grind_sizes : linked_to
    drinking_records ||--o{ drinking_grind_sizes : uses
```

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
