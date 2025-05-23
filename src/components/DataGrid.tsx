import React, { useState, useMemo } from 'react';
import { ArrowUpDown, Search, ArrowUp, ArrowDown, X } from 'lucide-react';
import type { ProcessedColumnConfig } from '../types/index';
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
  const [excludeFilters, setExcludeFilters] = useState<Record<string, string>>({});
  const [globalSearch, setGlobalSearch] = useState('');

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleFilterChange = (key: string, value: string, isExclude: boolean = false) => {
    if (isExclude) {
      setExcludeFilters(prev => ({
        ...prev,
        [key]: value
      }));
    } else {
      setFilters(prev => ({
        ...prev,
        [key]: value
      }));
    }
  };

  // グローバル検索とフィルターの適用
  const filteredData = useMemo(() => {
    return data.filter(row => {
      // グローバル検索
      if (globalSearch) {
        const allValues = Object.values(row).join(' ').toLowerCase();
        if (!allValues.includes(globalSearch.toLowerCase())) {
          return false;
        }
      }

      // 通常のフィルター（含む）
      const includeFilterResult = Object.entries(filters).every(([key, filterValue]) => {
        if (!filterValue) return true;
        const cellValue = row[key] || '';
        return cellValue.toLowerCase().includes(filterValue.toLowerCase());
      });

      if (!includeFilterResult) return false;

      // 除外フィルター（含まない）
      return Object.entries(excludeFilters).every(([key, filterValue]) => {
        if (!filterValue) return true;
        const cellValue = row[key] || '';
        return !cellValue.toLowerCase().includes(filterValue.toLowerCase());
      });
    });
  }, [data, filters, excludeFilters, globalSearch]);

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
      <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center sticky top-0 z-10 w-full">
        <h3 className="text-base font-medium text-gray-900 mr-4">データ一覧</h3>
        <div className="flex items-center flex-1">
          <div className="relative w-[600px]">
            <input
              type="text"
              className="block w-full rounded-md border-2 border-gray-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm h-10 pl-10 bg-white"
              placeholder="全文検索..."
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
            />
            <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
          <div className="text-sm text-gray-500 whitespace-nowrap ml-auto min-w-[120px] text-right pr-4">{sortedData.length} 件表示中</div>
        </div>
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
                    px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-b-2 border-gray-200
                    ${header.width ? `w-${header.width}` : ''}
                  `}
                >
                  <div className="grid grid-rows-[minmax(48px,auto)_auto] gap-2 min-h-[140px]">
                    <div 
                      className={`flex items-start ${header.sortable ? 'cursor-pointer hover:bg-gray-200' : ''}`}
                      onClick={() => header.sortable && handleSort(header.key)}
                    >
                      <span className="leading-tight">{header.displayName}</span>
                      {sortField === header.key && (
                        <span className="ml-1 flex-shrink-0">
                          {sortDirection === 'asc' ? (
                            <ArrowUp size={14} className="text-indigo-600" />
                          ) : (
                            <ArrowDown size={14} className="text-indigo-600" />
                          )}
                        </span>
                      )}
                    </div>
                    {header.filterable !== false && (
                      <div className="space-y-2 self-end">
                        <div className="relative">
                          <input
                            type="text"
                            className="block w-full rounded-md border-2 border-gray-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm h-8 pl-8 bg-white"
                            placeholder="含む..."
                            onChange={(e) => handleFilterChange(header.key, e.target.value, false)}
                            value={filters[header.key] || ''}
                          />
                          <Search size={14} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        </div>
                        <div className="relative">
                          <input
                            type="text"
                            className="block w-full rounded-md border-2 border-gray-200 shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm h-8 pl-8 bg-white"
                            placeholder="除外..."
                            onChange={(e) => handleFilterChange(header.key, e.target.value, true)}
                            value={excludeFilters[header.key] || ''}
                          />
                          <X size={14} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-red-400" />
                        </div>
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
                className="border-b border-gray-200 hover:bg-gray-50"
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
                <td colSpan={headers.length} className="px-6 py-4 text-center text-sm text-gray-500 border-b border-gray-100">
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