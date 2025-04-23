import React, { useState, useRef } from 'react';
import { Upload, Link, X } from 'lucide-react';

interface FileUploadAreaProps {
  onUpload: (mainFiles: File[], linkedFiles: File[]) => void;
}

export const FileUploadArea: React.FC<FileUploadAreaProps> = ({ onUpload }) => {
  const [mainFiles, setMainFiles] = useState<File[]>([]);
  const [linkedFiles, setLinkedFiles] = useState<File[]>([]);
  const mainFileInputRef = useRef<HTMLInputElement>(null);
  const linkedFileInputRef = useRef<HTMLInputElement>(null);

  const handleMainFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      setMainFiles(prev => [...prev, ...files]);
      onUpload([...mainFiles, ...files], linkedFiles);
    }
    if (mainFileInputRef.current) {
      mainFileInputRef.current.value = '';
    }
  };

  const handleLinkedFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const files = Array.from(e.target.files);
      setLinkedFiles(prev => [...prev, ...files]);
      onUpload(mainFiles, [...linkedFiles, ...files]);
    }
    if (linkedFileInputRef.current) {
      linkedFileInputRef.current.value = '';
    }
  };

  const removeMainFile = (index: number) => {
    const newFiles = mainFiles.filter((_, i) => i !== index);
    setMainFiles(newFiles);
    onUpload(newFiles, linkedFiles);
    if (mainFileInputRef.current) {
      mainFileInputRef.current.value = '';
    }
  };

  const removeLinkedFile = (index: number) => {
    const newFiles = linkedFiles.filter((_, i) => i !== index);
    setLinkedFiles(newFiles);
    onUpload(mainFiles, newFiles);
    if (linkedFileInputRef.current) {
      linkedFileInputRef.current.value = '';
    }
  };

  return (
    <div className="p-6 border-b border-gray-200">
      <h2 className="text-lg font-medium text-gray-900 mb-4">CSVファイル選択</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            メインCSVファイル
          </label>
          <div className="relative">
            <input
              ref={mainFileInputRef}
              type="file"
              accept=".csv"
              onChange={handleMainFilesChange}
              className="sr-only"
              id="main-file"
              multiple
            />
            <label
              htmlFor="main-file"
              className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer transition duration-150 ease-in-out w-full h-12"
            >
              <Upload size={20} className="mr-2 text-indigo-600" />
              ファイルを選択
            </label>
          </div>
          <div className="mt-2 space-y-2">
            {mainFiles.map((file, index) => (
              <div key={`${file.name}-${index}`} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                <span className="text-sm text-gray-600">
                  {file.name} ({(file.size / 1024).toFixed(1)} KB)
                </span>
                <button
                  onClick={() => removeMainFile(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            連結CSVファイル（オプション）
          </label>
          <div className="relative">
            <input
              ref={linkedFileInputRef}
              type="file"
              accept=".csv"
              onChange={handleLinkedFilesChange}
              className="sr-only"
              id="linked-file"
              multiple
            />
            <label
              htmlFor="linked-file"
              className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 cursor-pointer transition duration-150 ease-in-out w-full h-12"
            >
              <Link size={20} className="mr-2 text-indigo-600" />
              連結ファイルを選択（任意）
            </label>
          </div>
          <div className="mt-2 space-y-2">
            {linkedFiles.map((file, index) => (
              <div key={`${file.name}-${index}`} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                <span className="text-sm text-gray-600">
                  {file.name} ({(file.size / 1024).toFixed(1)} KB)
                </span>
                <button
                  onClick={() => removeLinkedFile(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  <X size={16} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};