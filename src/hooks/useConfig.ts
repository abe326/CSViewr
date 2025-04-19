import { useState, useEffect } from 'react';
import { ColumnConfig } from '../types';

interface GridConfig {
  gridColumns: ColumnConfig[];
}

interface DetailConfig {
  detailColumns: ColumnConfig[];
}

interface MergeConfig {
  mergeConfig: {
    mainKey: string;
    linkedKey: string;
  };
}

interface AppConfig {
  gridConfig: GridConfig;
  detailConfig: DetailConfig;
  mergeConfig: MergeConfig;
}

export const useConfig = () => {
  const [config, setConfig] = useState<AppConfig | null>(null);
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

      const parsedConfig: AppConfig = JSON.parse(configJson);
      setConfig(parsedConfig);
    } catch (err) {
      setError(err instanceof Error ? err.message : '設定の読み込みに失敗しました');
      console.error('設定の読み込みエラー:', err);
    }
  }, []);

  return {
    gridColumns: config?.gridConfig.gridColumns || [],
    detailColumns: config?.detailConfig.detailColumns || [],
    mergeConfig: config?.mergeConfig.mergeConfig || { mainKey: 'id', linkedKey: 'id' },
    error
  };
}; 