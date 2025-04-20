import React, { useState } from 'react';
import { ArrowUpDown, Search, ArrowUp, ArrowDown } from 'lucide-react';
import { ColumnConfig } from '../types';
import { formatters, FormatterFunction } from '../utils/formatters';

interface DataGridProps {
  headers: ColumnConfig[];
  data: Record<string, string>[];
  onRowClick: (row: Record<string, string>) => void;
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

  const handleCellClick = (row: Record<string, string>, column: ColumnConfig) => {
    if (column.isKey || column.clickable) {
      onRowClick(row);
    }
  };

  // フィルターとソートの適用
  const filteredData = data.filter(row => {
    return Object.entries(filters).every(([key, filterValue]) => {
      if (!filterValue) return true;
      const cellValue = row[key] || '';
      return cellValue.toLowerCase().includes(filterValue.toLowerCase());
    });
  });

  const sortData = (data: Record<string, string>[], field: string, direction: 'asc' | 'desc') => {
    return [...data].sort((a, b) => {
      const aValues = String(a[field] || '').split(',').map(v => v.trim());
      const bValues = String(b[field] || '').split(',').map(v => v.trim());
      
      // 複数の値がある場合は最初の値でソート
      const aValue = aValues[0] || '';
      const bValue = bValues[0] || '';
      
      return direction === 'asc'
        ? aValue.localeCompare(bValue, 'ja', { sensitivity: 'base' })
        : bValue.localeCompare(aValue, 'ja', { sensitivity: 'base' });
    });
  };

  const sortedData = sortData(filteredData, sortField || '', sortDirection);

  return (
    <div className="overflow-x-auto">
      <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center sticky top-0 z-10">
        <h3 className="text-base font-medium text-gray-900">データ一覧</h3>
        <div className="text-sm text-gray-500">{sortedData.length} 件表示中</div>
      </div>
      
      <div className="max-h-[calc(100vh-300px)] overflow-y-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              {headers.map((header) => (
                <th
                  key={header.key}
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  style={header.width ? { width: header.width } : undefined}
                >
                  <div className="flex flex-col space-y-2">
                    <div 
                      className="flex items-center cursor-pointer hover:text-indigo-600 transition-colors"
                      onClick={() => handleSort(header.key)}
                    >
                      <span>{header.displayName}</span>
                      <span className="ml-1">
                        {sortField === header.key ? (
                          sortDirection === 'asc' ? (
                            <ArrowUp size={14} className="text-indigo-600" />
                          ) : (
                            <ArrowDown size={14} className="text-indigo-600" />
                          )
                        ) : (
                          <ArrowUpDown size={14} className="text-gray-400" />
                        )}
                      </span>
                    </div>
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
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedData.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-50 transition-colors">
                {headers.map(header => {
                  const rawValue = row[header.key] || '';
                  // 引用符で囲まれた値から引用符を削除し、改行をスペースに置換
                  const value = rawValue.replace(/^"(.*)"$/, '$1');
                  const displayValue = value.replace(/\r?\n/g, ' ');
                  
                  const formattedValue = header.formatter && typeof header.formatter === 'string' && formatters[header.formatter] 
                    ? formatters[header.formatter](displayValue)
                    : displayValue;

                  return (
                    <td 
                      key={header.key} 
                      className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${
                        header.isKey || header.clickable ? 'cursor-pointer hover:text-indigo-600 hover:underline' : ''
                      }`}
                      onClick={() => handleCellClick(row, header)}
                      {...(header.formatter && typeof header.formatter === 'string' && formatters[header.formatter]
                        ? { dangerouslySetInnerHTML: { __html: formattedValue } }
                        : { children: formattedValue }
                      )}
                    />
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