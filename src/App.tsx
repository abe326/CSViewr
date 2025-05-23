import React, { useState } from 'react';
import { FileUploadArea } from './components/FileUploadArea';
import { DataGrid } from './components/DataGrid';
import { DetailModal } from './components/DetailModal';
import { Layout } from './components/Layout';
import { parseCSV, mergeCSVData } from './utils/csvUtils';
import { useConfig } from './hooks/useConfig';
import { CSVRow } from './types';

function App() {
  const [showModal, setShowModal] = useState(false);
  const [selectedRow, setSelectedRow] = useState<Record<string, string> | null>(null);
  const [data, setData] = useState<Record<string, string>[]>([]);
  const [availableColumns, setAvailableColumns] = useState<string[]>([]);
  const { config, error } = useConfig();

  const handleFileUpload = async (mainFiles: File[], linkedFiles: File[]) => {
    try {
      if (mainFiles.length === 0) {
        setData([]);
        return;
      }

      // --- メインCSVの読み込み（行方向に統合） ---
      const mainDataArrays = await Promise.all(
        mainFiles.map(async file => parseCSV(await file.text()))
      );
      const baseColumns = Object.keys(mainDataArrays[0][0]);

      let mergedMainData = mainDataArrays[0];
      for (let i = 1; i < mainDataArrays.length; i++) {
        const currentData = mainDataArrays[i];
        const filteredData = currentData.map(row => {
          const filteredRow: Record<string, string> = {};
          baseColumns.forEach(col => {
            filteredRow[col] = row[col] || '';
          });
          return filteredRow;
        });
        mergedMainData = [...mergedMainData, ...filteredData];
      }

      let finalData = mergedMainData;

      // --- 連携CSVの読み込み（列方向に統合） ---
      if (linkedFiles.length > 0 && config?.mergeConfig) {
        const linkedDataArrays = await Promise.all(
          linkedFiles.map(async file => parseCSV(await file.text()))
        );

        let mergedLinkedData = linkedDataArrays[0];
        for (let i = 1; i < linkedDataArrays.length; i++) {
          mergedLinkedData = [...mergedLinkedData, ...linkedDataArrays[i]];
        }

        finalData = mergeCSVData(
          mergedMainData,
          mergedLinkedData,
          config.mergeConfig.mainKey,
          config.mergeConfig.linkedKey
        );
      }

      // --- 列結合処理 ---
      if (config?.gridConfig.gridColumns) {
        finalData = finalData.map(row => {
          const combinedRow = { ...row };
          config.gridConfig.gridColumns.forEach(col => {
            if (col.combine) {
              const { columns, delimiter } = col.combine;
              const values = columns
                .map(key => row[key])
                .filter(value => value && value.trim() !== '');
              combinedRow[col.key] = values.join(delimiter || ' ');
            }
          });
          return combinedRow;
        });
      }

      // --- 表示データセット ---
      if (finalData.length > 0) {
        setData(finalData);
        const allColumns = new Set([
          ...Object.keys(finalData[0]),
          ...(config?.gridConfig.gridColumns?.map(col => col.key) || [])
        ]);
        setAvailableColumns(Array.from(allColumns));
      } else {
        setData([]);
        setAvailableColumns([]);
      }
    } catch (error) {
      console.error('CSVファイルの読み込みエラー:', error);
      alert('CSVファイルの読み込みに失敗しました。');
      setData([]);
      setAvailableColumns([]);
    }
  };

  const handleRowClick = (row: CSVRow) => {
    setSelectedRow(row);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedRow(null);
  };

  if (!config || error) {
    return (
      <Layout>
        <div className="p-4 text-red-600">
          {error || '設定の読み込み中...'}
        </div>
      </Layout>
    );
  }

  const visibleHeaders = config.gridConfig.gridColumns
    .filter(col => col.visible)
    .map((col, index) => ({
      ...col,
      isKey: index === 0,
      clickable: index === 0
    }));

  return (
    <Layout>
      <FileUploadArea onUpload={handleFileUpload} />
      {data.length > 0 ? (
        <DataGrid 
          headers={visibleHeaders}
          data={data} 
          onRowClick={handleRowClick}
        />
      ) : (
        <div className="p-4 text-center text-gray-500">
          データがありません。CSVファイルをアップロードしてください。
        </div>
      )}
      {showModal && selectedRow && (
        <DetailModal 
          data={selectedRow}
          columns={config.detailConfig.detailColumns}
          onClose={handleCloseModal}
        />
      )}
    </Layout>
  );
}

export default App;
