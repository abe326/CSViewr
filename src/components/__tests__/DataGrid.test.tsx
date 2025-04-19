import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { DataGrid } from '../DataGrid';
import { ColumnConfig } from '../../types/index';

describe('DataGrid', () => {
  const sampleData = [
    { id: '1', name: '山田太郎', position: '部長', status: '在籍' },
    { id: '2', name: '鈴木一郎', position: '課長', status: '在籍' },
    { id: '3', name: '佐藤次郎', position: '課長', status: '休職' },
  ];

  const headers: ColumnConfig[] = [
    { key: 'id', displayName: 'ID', width: '100px', visible: true, sortable: true, filterable: true },
    { key: 'name', displayName: '氏名', width: '200px', visible: true, sortable: true, filterable: true },
    { key: 'position', displayName: '役職', width: '150px', visible: true, sortable: true, filterable: true },
    { key: 'status', displayName: 'ステータス', width: '150px', visible: true, sortable: true, filterable: true },
  ];

  const handleRowClick = (row: Record<string, string>) => {
    // テスト用のダミー関数
  };

  beforeEach(() => {
    render(<DataGrid headers={headers} data={sampleData} onRowClick={handleRowClick} />);
  });

  describe('フィルタリング機能', () => {
    it('フィルタ入力で正しく絞り込まれること', () => {
      // 各列のフィルタ入力を取得
      const filterInputs = screen.getAllByPlaceholderText('フィルタ...');
      // 氏名列のフィルタに入力
      const nameFilterInput = filterInputs[1]; // 2番目の入力フィールド（氏名列）
      fireEvent.change(nameFilterInput, { target: { value: '山田' } });

      // 結果の検証
      const rows = screen.getAllByRole('row').slice(1); // ヘッダー行を除外
      expect(rows).toHaveLength(1);
      expect(within(rows[0]).getByText('山田太郎')).toBeInTheDocument();
    });

    it('フィルタが空欄の時は全件表示されること', () => {
      const filterInputs = screen.getAllByPlaceholderText('フィルタ...');
      const nameFilterInput = filterInputs[1];
      
      // フィルタを適用して、その後クリア
      fireEvent.change(nameFilterInput, { target: { value: '山田' } });
      fireEvent.change(nameFilterInput, { target: { value: '' } });

      // 結果の検証
      const rows = screen.getAllByRole('row').slice(1);
      expect(rows).toHaveLength(3);
      expect(within(rows[0]).getByText('山田太郎')).toBeInTheDocument();
      expect(within(rows[1]).getByText('鈴木一郎')).toBeInTheDocument();
      expect(within(rows[2]).getByText('佐藤次郎')).toBeInTheDocument();
    });
  });

  describe('結合表示機能', () => {
    it('combine指定のある列で値が正しく結合されていること', () => {
      const combinedData = [
        { id: '1', position: '部長, 次長', status: '在籍' },
      ];
      
      const combinedHeaders: ColumnConfig[] = [
        {
          key: 'position',
          displayName: '役職',
          width: '150px',
          visible: true,
          sortable: true,
          filterable: true,
          formatter: (value: string) => value
        }
      ];

      render(
        <DataGrid
          headers={combinedHeaders}
          data={combinedData}
          onRowClick={handleRowClick}
        />
      );

      expect(screen.getByText('部長, 次長')).toBeInTheDocument();
    });
  });

  describe('空データ処理', () => {
    it('データが0件のとき、空メッセージが表示されること', () => {
      render(<DataGrid headers={headers} data={[]} onRowClick={handleRowClick} />);
      expect(screen.getByText('表示するデータがありません。別のフィルタ条件を試すか、CSVファイルをアップロードしてください。')).toBeInTheDocument();
    });
  });
}); 