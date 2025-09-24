
/**
 * 日付ユーティリティ（端末ローカルタイムゾーン前提）
 *
 * なぜ必要か:
 * - `toISOString()` は常にUTC。`toISOString().split('T')[0]` は現地時間帯（JSTなど）で1日ズレることがある。
 * - DBの `date` 型や UI の日付入力が求めるのは "YYYY-MM-DD"（タイムゾーンの概念なし）。
 * - 文字列 "YYYY-MM-DD" を `new Date('YYYY-MM-DD')` でパースすると UTC 解釈になりやすく、JST では9時間ズレる罠がある。
 * そのため、ローカルTZで安全にフォーマット/パースする最小関数を提供する。
 *
 * 原則:
 * - KISS原則: 標準APIのみ、依存なし。
 * - 単一責任の原則(SRP): 表示/通信で使う日付文字列の生成と、文字列→Dateの相互変換だけを担う。
 */

/** 2桁ゼロ詰め。月・日などに使用。例: 3 -> "03" */
export const pad2 = (n: number) => String(n).padStart(2, '0');

/**
 * Dateを端末ローカルTZで "YYYY-MM-DD" に整形する。
 * なぜ: ISO文字列(UTC)では日付がズレるため、ローカル情報から年/月/日を直接取り出して組み立てる。
 * 引数: d - 省略時は現在日時。
 * 返却: "YYYY-MM-DD" 形式の文字列 (例: "2025-09-05")。
 * 使い所: フォーム初期値、DB `date` 型への保存、一覧表示のキーなど。
 */
export const formatLocalYYYYMMDD = (d: Date = new Date()): string => {
  const y = d.getFullYear();
  const m = pad2(d.getMonth() + 1);
  const day = pad2(d.getDate());
  return `${y}-${m}-${day}`;
};

/**
 * "YYYY-MM-DD" を端末ローカルTZのカレンダー日として Date に変換する。
 * なぜ: `new Date('YYYY-MM-DD')` はUTC解釈になり得て、JSTで日付/時刻がズレるため。
 * 実装: 正規表現で分解し、`new Date(y, m-1, d)` コンストラクタを使う（これはローカルTZで解釈）。
 * 注意:
 * - 戻り値の時刻成分は 00:00:00（ローカル）になる（実装依存で秒/ミリ秒は0）。
 * - 不正な文字列は例外を投げる。UI側のバリデーションか、呼び出し側で try/catch を用意せよ。
 */
export const parseYYYYMMDDAsLocalDate = (s: string): Date => {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!m) throw new Error(`Invalid YYYY-MM-DD: ${s}`);
  const y = Number(m[1]);
  const mon = Number(m[2]);
  const day = Number(m[3]);
  // ここでの Date コンストラクタはローカルTZで 00:00 を指すDateを生成する。UTC解釈の罠を回避できる。
  return new Date(y, mon - 1, day);
};

/**
 * 'YYYY-MM-DD' 形式をローカルタイムゾーン基準の Date に変換する。
 * 既存の parse ヘルパーを薄く包んで名前の意図を明瞭にする。
 */
export function parseDate(iso: string): Date {
  return parseYYYYMMDDAsLocalDate(iso);
}

/**
 * ローカル日付の「今日 00:00」を返す。
 * `new Date()` だと時刻が乗るので、format→parse で日付境界に正規化する。
 */
export function today(): Date {
  return parseYYYYMMDDAsLocalDate(formatLocalYYYYMMDD());
}

/** 指定した日数を加算した新しい Date を返す（元の引数は不変）。 */
export function addDays(date: Date, days: number): Date {
  const next = new Date(date.getTime());
  next.setDate(next.getDate() + days);
  return next;
}

export function maxDate(a: Date, b: Date): Date { return a > b ? a : b; }

export function minDate(a: Date, b: Date): Date { return a < b ? a : b; }

/** 2つの日付がローカル年月日で一致するかを判定する。 */
export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
