/**
 * CSV表示アプリケーションの型定義
 */

/**
 * CSVデータ行
 * CSVファイルの1行分のデータを表現
 */
export interface CSVRow {
  [key: string]: string;
}

/**
 * CSVファイルデータ
 * CSVファイルの解析済みコンテンツを表現
 */
export interface CSVData {
  headers: string[];
  rows: CSVRow[];
}

/**
 * CSV設定
 * 列の表示方法に関する設定
 */
export type FormatterFunction = (value: string) => string;

export interface ColumnConfig {
  key: string;
  displayName: string;
  width?: string;
  visible: boolean;
  sortable?: boolean;
  filterable?: boolean;
  isKey?: boolean;
  clickable?: boolean;
  formatter?: string | FormatterFunction;
  combine?: {
    columns: string[];
    delimiter: string;
  };
  mergeFromLinked?: boolean;
}

/**
 * アプリケーション状態
 * アプリケーション全体の状態を表現
 */
export interface AppState {
  mainCSV: CSVData | null;
  linkedCSV: CSVData | null;
  selectedRow: CSVRow | null;
  showDetailModal: boolean;
  columnConfig: ColumnConfig[];
  filters: Record<string, string>;
  sortField: string | null;
  sortDirection: 'asc' | 'desc';
}

/**
 * ソートオプション
 * データグリッドのソート設定
 */
export interface SortOptions {
  field: string;
  direction: 'asc' | 'desc';
}

/**
 * フィルターオプション
 * データグリッドのフィルター設定
 */
export interface FilterOptions {
  [column: string]: string;
}

export interface MergeConfig {
  mainKey: string;
  linkedKey: string;
}

export interface GridConfig {
  gridColumns: ColumnConfig[];
}

export interface DetailConfig {
  detailColumns: ColumnConfig[];
}

export interface AppConfig {
  gridConfig: {
    gridColumns: ColumnConfig[];
  };
  detailConfig: {
    detailColumns: ColumnConfig[];
  };
  mergeConfig: MergeConfig;
}