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
 * 文字列を正規化して比較用に変換します
 * 全角・半角、大文字・小文字、空白を正規化
 */
const normalizeString = (value: string): string => {
  return value
    .trim()
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[\s　]+/g, ''); // 全角・半角スペースを削除
};

/**
 * 2つのCSVデータセットを指定されたキーに基づいて結合します
 */
export const mergeCSVData = (
  mainData: Record<string, string>[],
  linkedData: Record<string, string>[],
  mainKey: string,
  linkedKey: string
): Record<string, string>[] => {
  // 結合データのマップを構築
  const linkedMap = new Map<string, Record<string, string>>();
  
  // キーが存在するか確認
  if (!mainData[0] || !mainData[0][mainKey]) {
    console.warn(`メインデータにキー "${mainKey}" が存在しません`);
    return mainData;
  }
  
  if (!linkedData[0] || !linkedData[0][linkedKey]) {
    console.warn(`結合データにキー "${linkedKey}" が存在しません`);
    return mainData;
  }

  // 結合データのマップを構築
  linkedData.forEach(row => {
    const key = row[linkedKey];
    if (!key) return;

    const normalizedKey = normalizeString(key);
    if (!linkedMap.has(normalizedKey)) {
      linkedMap.set(normalizedKey, { ...row });
    } else {
      // 既存のデータと新しいデータをマージ
      const existingRow = linkedMap.get(normalizedKey)!;
      Object.entries(row).forEach(([field, value]) => {
        if (field !== linkedKey && value.trim() !== '') {
          if (!existingRow[field] || existingRow[field].trim() === '') {
            existingRow[field] = value;
          } else if (normalizeString(existingRow[field]) !== normalizeString(value)) {
            // 更新日時が新しい方を優先
            if (field === 'ステータス' || field === '役職' || field === '部署') {
              const existingDate = new Date(existingRow['更新日時'] || '').getTime();
              const newDate = new Date(row['更新日時'] || '').getTime();
              if (newDate > existingDate) {
                existingRow[field] = value;
              }
            } else {
              existingRow[field] = `${existingRow[field]}, ${value}`;
            }
          }
        }
      });
    }
  });

  // メインデータと結合
  return mainData.map(mainRow => {
    const key = mainRow[mainKey];
    if (!key) return mainRow;

    const normalizedKey = normalizeString(key);
    const linkedRow = linkedMap.get(normalizedKey);
    if (!linkedRow) return mainRow;

    const result = { ...mainRow };
    
    // 連携データの各フィールドをマージ
    Object.entries(linkedRow).forEach(([field, value]) => {
      if (field !== linkedKey && value.trim() !== '') {
        if (!result[field] || result[field].trim() === '') {
          result[field] = value;
        } else if (normalizeString(result[field]) !== normalizeString(value)) {
          // 更新日時が新しい方を優先
          if (field === 'ステータス' || field === '役職' || field === '部署') {
            const mainDate = new Date(result['更新日時'] || '').getTime();
            const linkedDate = new Date(linkedRow['更新日時'] || '').getTime();
            if (linkedDate > mainDate) {
              result[field] = value;
            }
          } else {
            result[field] = `${result[field]}, ${value}`;
          }
        }
      }
    });

    return result;
  });
};