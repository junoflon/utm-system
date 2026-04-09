'use client';

import { useState } from 'react';
import UTMForm from '@/components/UTMForm';
import UTMList from '@/components/UTMList';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'create' | 'list'>('create');
  const [refreshKey, setRefreshKey] = useState(0);

  const handleCreated = () => {
    setRefreshKey(k => k + 1);
    setActiveTab('list');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-xl font-bold text-gray-900">UTM Builder</h1>
          <p className="text-sm text-gray-500">UTM 파라미터를 쉽게 생성하고 관리하세요</p>
        </div>
      </header>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto px-6 pt-6">
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit">
          <button
            onClick={() => setActiveTab('create')}
            className={`px-5 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'create'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            UTM 생성
          </button>
          <button
            onClick={() => { setActiveTab('list'); setRefreshKey(k => k + 1); }}
            className={`px-5 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'list'
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            UTM 관리
          </button>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-6 py-6">
        {activeTab === 'create' ? (
          <UTMForm onCreated={handleCreated} />
        ) : (
          <UTMList refreshKey={refreshKey} />
        )}
      </main>
    </div>
  );
}
