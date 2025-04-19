import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { ColumnConfig } from '../types';
import { formatters } from '../utils/formatters';

interface DetailModalProps {
  data: Record<string, string>;
  columns: ColumnConfig[];
  onClose: () => void;
}

export const DetailModal: React.FC<DetailModalProps> = ({ data, columns, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscKey);
    return () => {
      document.removeEventListener('keydown', handleEscKey);
    };
  }, [onClose]);

  // 表示する列をフィルタリング
  const visibleColumns = columns.filter(col => col.visible);

  return (
    <div className="fixed inset-0 z-10 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-800 opacity-75"></div>
        </div>

        <div 
          className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full"
          ref={modalRef}
        >
          <div className="bg-indigo-600 px-4 py-3 sm:px-6 flex justify-between items-center">
            <h3 className="text-lg leading-6 font-medium text-white" id="modal-title">
              詳細情報
            </h3>
            <button
              type="button"
              className="text-white hover:text-indigo-100 focus:outline-none"
              onClick={onClose}
            >
              <X size={24} />
            </button>
          </div>
          <div className="bg-white px-4 py-5 sm:p-6">
            <div className="space-y-4">
              {visibleColumns.map(column => (
                <div key={column.key} className="border-b border-gray-200 pb-3 last:border-0 last:pb-0">
                  <div className="text-sm font-medium text-gray-500">{column.displayName}</div>
                  <div className="mt-1 text-base text-gray-900">
                    {column.formatter && formatters[column.formatter] ? (
                      column.formatter === 'url' ? (
                        <a 
                          href={`mailto:${data[column.key]}`} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-blue-600 hover:text-blue-800 underline"
                        >
                          {data[column.key]}
                        </a>
                      ) : formatters[column.formatter](data[column.key])
                    ) : data[column.key]}
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={onClose}
            >
              閉じる
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};