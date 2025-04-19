export interface ColumnConfig {
  key: string;
  displayName: string;
  width: number | string;
  visible: boolean;
  sortable?: boolean;
  filterable?: boolean;
  isKey?: boolean;
  formatter?: (value: string) => string;
  combine?: {
    columns: string[];
    delimiter?: string;
  };
}

export interface DetailColumnConfig {
  key: string;
  displayName: string;
  width: number | string;
  formatter?: (value: string) => string;
}

export interface MergeConfig {
  mainKey: string;
  linkedKey: string;
}

export interface AppConfig {
  gridColumns: ColumnConfig[];
  detailColumns: DetailColumnConfig[];
  mergeConfig: MergeConfig;
}

export type CSVRow = Record<string, string>; 