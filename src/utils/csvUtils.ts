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
 * CSV文字列をオブジェクトの配列に変換します
 * 
 * @param csvString - 解析対象のCSV文字列
 * @param options - 解析オプション（デフォルトではヘッダーあり）
 * @returns 各行をオブジェクトに変換した配列
 * 
 * @example
 * const csvString = 'id,name\n1,田中\n2,鈴木';
 * const data = parseCSV(csvString);
 * // 結果: [{ id: '1', name: '田中' }, { id: '2', name: '鈴木' }]
 */
export const parseCSV = (
  csvString: string, 
  { hasHeader = true }: Partial<CSVParseOptions> = {}
): Record<string, string>[] => {
  const lines = csvString.split(/\r?\n/).filter(line => line.trim().length > 0);
  if (lines.length === 0) return [];

  const headers = hasHeader 
    ? parseCSVLine(lines[0]) 
    : generateDefaultHeaders(parseCSVLine(lines[0]).length);

  const startIndex = hasHeader ? 1 : 0;
  return lines.slice(startIndex).map(line => {
    const values = parseCSVLine(line);
    return headers.reduce((row, header, index) => {
      row[header] = values[index] || '';
      return row;
    }, {} as Record<string, string>);
  });
};

/**
 * CSV行を個別の値に分解します
 * 引用符で囲まれた値や、エスケープされた引用符に対応しています
 * 
 * @param line - 解析対象のCSV行
 * @returns 分解された値の配列
 */
const parseCSVLine = (line: string): string[] => {
  const result: string[] = [];
  let currentValue = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"' && !inQuotes) {
      inQuotes = true;
    } else if (char === '"' && inQuotes) {
      if (nextChar === '"') {
        currentValue += '"';
        i++;
      } else {
        inQuotes = false;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(currentValue);
      currentValue = '';
    } else {
      currentValue += char;
    }
  }

  result.push(currentValue);
  return result;
};

/**
 * デフォルトのヘッダー名を生成します
 * 
 * @param count - 生成するヘッダーの数
 * @returns ヘッダー名の配列
 */
const generateDefaultHeaders = (count: number): string[] => 
  Array.from({ length: count }, (_, i) => `列${i + 1}`);

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
        target[field] = `${target[field]}, ${value}`;
      }
    }
  });
};