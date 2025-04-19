import Papa, { ParseResult, ParseError, ParseConfig } from 'papaparse';

/**
 * CSVデータを処理するためのユーティリティモジュール
 * 
 * @module csvUtils
 */

/**
 * CSVの値を解析する際のオプション
 */
interface CSVParseOptions {
  hasHeader: boolean;
}

/**
 * タイムスタンプ付きのデータエントリ
 */
interface TimestampedEntry {
  value: string;
  timestamp: string;
}

/**
 * CSVセルの値をエスケープします
 * 改行、ダブルクオート、カンマ、バックスラッシュ、パーセント記号に対応
 * 
 * @param value - エスケープする値
 * @returns エスケープされた値
 */
export const escapeCSVCell = (value: string): string => {
  if (!value) return '';
  
  // 特殊文字が含まれているかチェック
  const needsEscape = /["\n\r,\\%]/.test(value);
  if (needsEscape) {
    // ダブルクォートをエスケープ（" → ""）
    const escaped = value.replace(/"/g, '""');
    // 値全体をダブルクォートで囲む
    return `"${escaped}"`;
  }
  return value;
};

/**
 * オブジェクトの配列をCSV文字列に変換します
 * 
 * @param data - 変換するデータ
 * @param headers - 出力するヘッダー（指定がない場合は最初の行のキーを使用）
 * @returns CSV文字列
 */
export const generateCSV = (
  data: Record<string, string>[],
  headers?: { key: string; displayName: string }[]
): string => {
  if (data.length === 0) return '';

  // ヘッダーが指定されていない場合は、最初の行のキーを使用
  const keys = headers?.map(h => h.key) || Object.keys(data[0]);
  const headerNames = headers?.map(h => h.displayName) || keys;

  // ヘッダー行の生成
  const headerRow = headerNames.map(escapeCSVCell).join(',');

  // データ行の生成
  const rows = data.map(row => 
    keys.map(key => escapeCSVCell(row[key] || '')).join(',')
  );

  // ヘッダーとデータを結合
  return [headerRow, ...rows].join('\n');
};

/**
 * CSV文字列をオブジェクトの配列に変換します
 * PapaParseを使用して、セル内の改行にも対応します
 * 
 * @param csvString - 解析対象のCSV文字列
 * @returns 各行をオブジェクトに変換した配列
 */
export const parseCSV = (csvString: string): Promise<Record<string, string>[]> => {
  return new Promise((resolve, reject) => {
    if (!csvString) {
      resolve([]);
      return;
    }

    try {
      const result = Papa.parse(csvString, {
        header: true,
        skipEmptyLines: 'greedy',
        transformHeader: (header: string) => header.trim(),
        transform: (value: string) => value.trim()
      });

      if (!result.data || !Array.isArray(result.data) || result.data.length === 0) {
        resolve([]);
        return;
      }

      resolve(result.data as Record<string, string>[]);
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * 2つの値のうち、より新しいタイムスタンプを持つ値を返します
 * 
 * @param oldEntry - 古い値とそのタイムスタンプ
 * @param newEntry - 新しい値とそのタイムスタンプ
 * @returns タイムスタンプが新しい方の値
 */
const selectLatestValue = (oldEntry: TimestampedEntry, newEntry: TimestampedEntry): string => {
  if (!oldEntry.timestamp || !newEntry.timestamp) {
    return `${oldEntry.value}, ${newEntry.value}`;
  }
  return new Date(newEntry.timestamp) > new Date(oldEntry.timestamp) 
    ? newEntry.value 
    : oldEntry.value;
};

/**
 * 2つのCSVデータセットを指定されたキーに基づいて結合します
 * 
 * @param mainData - メインとなるCSVデータ
 * @param linkedData - 結合するCSVデータ
 * @param mainKey - メインデータの結合キー
 * @param linkedKey - 結合データの結合キー
 * @returns 結合されたデータセット
 * 
 * @example
 * const main = [{ id: '1', name: '田中' }];
 * const linked = [{ id: '1', dept: '営業' }];
 * const merged = mergeCSVData(main, linked, 'id', 'id');
 * // 結果: [{ id: '1', name: '田中', dept: '営業' }]
 */
export const mergeCSVData = (
  mainData: Record<string, string>[],
  linkedData: Record<string, string>[],
  mainKey: string,
  linkedKey: string
): Record<string, string>[] => {
  const linkedMap = new Map<string, Record<string, string>>();

  // 結合データのマップを構築
  linkedData.forEach(row => {
    const key = row[linkedKey];
    if (!linkedMap.has(key)) {
      linkedMap.set(key, { ...row });
    } else {
      mergeRows(linkedMap.get(key)!, row);
    }
  });

  // メインデータと結合
  return mainData.map(mainRow => {
    const result = { ...mainRow };
    const linkedRow = linkedMap.get(mainRow[mainKey]);
    
    if (linkedRow) {
      mergeRows(result, linkedRow, linkedKey);
    }
    
    return result;
  });
};

/**
 * 2つのデータ行をマージします
 * 
 * @param target - マージ先の行データ
 * @param source - マージ元の行データ
 * @param excludeKey - マージから除外するキー
 */
const mergeRows = (
  target: Record<string, string>,
  source: Record<string, string>,
  excludeKey?: string
): void => {
  Object.entries(source).forEach(([field, value]) => {
    if (field === excludeKey || value.trim() === '') return;

    if (!target[field] || target[field].trim() === '') {
      target[field] = value;
    } else if (target[field] !== value) {
      if (field === 'status' || field === 'position') {
        target[field] = selectLatestValue(
          { value: target[field], timestamp: target['updated_at'] },
          { value, timestamp: source['updated_at'] }
        );
      } else {
        // 結合時もエスケープ処理を適用
        target[field] = escapeCSVCell(`${target[field]}, ${value}`);
      }
    }
  });
};