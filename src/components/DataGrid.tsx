import React, { useState, useMemo } from 'react';
import { ArrowUpDown, Search, ArrowUp, ArrowDown } from 'lucide-react';
import { ColumnConfig, ProcessedColumnConfig } from '../types';
import { formatters, FormatterFunction } from '../utils/formatters';

interface DataGridProps {
  headers: ProcessedColumnConfig[];
  data: Record<string, string>[];
  onRowClick?: (row: Record<string, string>) => void;
}

export const DataGrid: React.FC<DataGridProps> = ({ headers, data, onRowClick }) => {
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filters, setFilters] = useState<Record<string, string>>({});

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // フィルターとソートの適用
  const filteredData = data.filter(row => {
    return Object.entries(filters).every(([key, filterValue]) => {
      if (!filterValue) return true;
      const cellValue = row[key] || '';
      return cellValue.toLowerCase().includes(filterValue.toLowerCase());
    });
  });

  const sortedData = useMemo(() => {
    if (!sortField) return filteredData;

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortField] || '';
      const bValue = b[sortField] || '';
      const direction = sortDirection === 'asc' ? 1 : -1;

      // 数値として比較可能な場合は数値比較
      const aNum = Number(aValue);
      const bNum = Number(bValue);
      if (!isNaN(aNum) && !isNaN(bNum)) {
        return (aNum - bNum) * direction;
      }

      // それ以外は文字列比較
      return aValue.localeCompare(bValue) * direction;
    });
  }, [filteredData, sortField, sortDirection]);

  const processDisplayValue = (value: string): string => {
    // 引用符で囲まれた値から外側の引用符を削除
    let processed = value.replace(/^"(.*)"$/s, '$1');
    
    // エスケープされた特殊文字を元に戻す
    processed = processed
      .replace(/\\([!@#$%^&*()_+\-=<>,./?:;'{}[\]|])/g, '$1')  // エスケープされた特殊文字
      .replace(/\\\\/, '\\')  // エスケープされたバックスラッシュ
      .replace(/""/g, '"');   // エスケープされた引用符
    
    // グリッド表示用に改行をスペースに変換
    return processed.replace(/\r?\n/g, ' ');
  };

  const renderCell = (value: string, header: ProcessedColumnConfig) => {
    // グリッド表示用に改行をスペースに変換
    const displayValue = value.replace(/\r?\n/g, ' ');

    if (header.processedFormatter) {
      const formattedValue = header.processedFormatter(displayValue);
      return (
        <div
          className="cell-content"
          dangerouslySetInnerHTML={{ __html: formattedValue }}
        />
      );
    }
    return displayValue;
  };

  return (
    <div className="w-full overflow-x-auto">
      <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center sticky top-0 z-10 w-full">
        <h3 className="text-base font-medium text-gray-900">データ一覧</h3>
        <div className="text-sm text-gray-500">{sortedData.length} 件表示中</div>
      </div>
      
      <div className="max-h-[calc(100vh-300px)] overflow-y-auto w-full">
        <table className="w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              {headers.map((header) => (
                <th
                  key={header.key}
                  scope="col"
                  className={`
                    px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider
                    ${header.sortable ? 'cursor-pointer hover:bg-gray-200' : ''}
                    ${header.width ? `w-${header.width}` : ''}
                  `}
                  onClick={() => header.sortable && handleSort(header.key)}
                >
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center">
                      <span>{header.displayName}</span>
                      {sortField === header.key && (
                        <span className="ml-1">
                          {sortDirection === 'asc' ? (
                            <ArrowUp size={14} className="text-indigo-600" />
                          ) : (
                            <ArrowDown size={14} className="text-indigo-600" />
                          )}
                        </span>
                      )}
                    </div>
                    {header.filterable !== false && (
                      <div className="relative">
                        <input
                          type="text"
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm h-8 pl-8"
                          placeholder="フィルタ..."
                          onChange={(e) => handleFilterChange(header.key, e.target.value)}
                          value={filters[header.key] || ''}
                        />
                        <Search size={14} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      </div>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedData.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className="hover:bg-gray-50"
              >
                {headers.map((header, colIndex) => {
                  const rawValue = row[header.key] || '';
                  const isKeyColumn = colIndex === 0;
                  return (
                    <td
                      key={`${rowIndex}-${colIndex}`}
                      className={`
                        px-6 py-4 text-sm text-gray-900 break-words
                        ${isKeyColumn ? 'cursor-pointer hover:text-indigo-600 hover:underline' : ''}
                      `}
                      onClick={() => isKeyColumn && onRowClick?.(row)}
                    >
                      {renderCell(rawValue, header)}
                    </td>
                  );
                })}
              </tr>
            ))}
            {sortedData.length === 0 && (
              <tr>
                <td colSpan={headers.length} className="px-6 py-4 text-center text-sm text-gray-500">
                  表示するデータがありません。別のフィルタ条件を試すか、CSVファイルをアップロードしてください。
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};