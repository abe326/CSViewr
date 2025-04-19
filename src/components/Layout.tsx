import React, { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-indigo-700">CSViewr</h1>
            <div className="text-sm text-gray-500">最終更新: 2025年4月1日</div>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow">
          {children}
        </div>
      </main>
      <footer className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
        <div className="text-center text-sm text-gray-500">
          © 2025 CSViewr - すべての権利を保有します
        </div>
      </footer>
    </div>
  );
};