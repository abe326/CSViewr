import { useState, useEffect } from 'react';
import { AppConfig, ProcessedAppConfig, FormatterFunction, ProcessedColumnConfig, ColumnConfig } from '../types';
import { formatters } from '../utils/formatters';

// 文字列formatterを関数に変換
const reviveFormatter = (formatter: unknown): FormatterFunction | undefined => {
  if (typeof formatter === 'string') {
    if (formatter.includes('=>')) {
      try {
        // eslint-disable-next-line no-new-func
        return new Function('return ' + formatter)();
      } catch (err) {
        console.warn('formatter parse error:', err);
      }
    }
    return formatters[formatter];
  }
  return undefined;
};

const processFormatter = (formatter: string | FormatterFunction | undefined): FormatterFunction | undefined => {
  if (!formatter) return undefined;
  if (typeof formatter === 'function') return formatter;
  return reviveFormatter(formatter);
};

const processColumns = (columns: ColumnConfig[]): ProcessedColumnConfig[] => {
  return columns.map(column => {
    const { formatter, ...rest } = column;
    return {
      ...rest,
      processedFormatter: processFormatter(formatter)
    };
  });
};

export const useConfig = () => {
  const [config, setConfig] = useState<ProcessedAppConfig | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const configElement = document.getElementById('app-config');
      if (!configElement) {
        throw new Error('設定が見つかりません');
      }

      const configJson = configElement.textContent;
      if (!configJson) {
        throw new Error('設定が空です');
      }

      const data: AppConfig = JSON.parse(configJson);
      
      const processedConfig: ProcessedAppConfig = {
        gridConfig: {
          gridColumns: processColumns(data.gridConfig.gridColumns)
        },
        detailConfig: {
          detailColumns: processColumns(data.detailConfig.detailColumns)
        },
        mergeConfig: data.mergeConfig
      };
      
      setConfig(processedConfig);
    } catch (err) {
      setError(err instanceof Error ? err.message : '設定の読み込みに失敗しました');
    }
  }, []);

  return { config, error };
};