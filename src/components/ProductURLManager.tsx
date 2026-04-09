'use client';

import { useState, useEffect, useCallback } from 'react';

interface ProductUrl {
  id: string;
  brand: string;
  name: string;
  tags: string[];
  url: string;
  note: string;
  active: boolean;
}

const BRANDS = ['지노큐어', '바디파인', '파인톱', '페아체도', '와이와이와이랩'];

export default function ProductURLManager() {
  const [urls, setUrls] = useState<ProductUrl[]>([]);
  const [selectedBrand, setSelectedBrand] = useState(BRANDS[0]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<Partial<ProductUrl>>({});
  const [showAdd, setShowAdd] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', tags: '', url: '', note: '' });

  const fetchUrls = useCallback(async () => {
    const res = await fetch(`/api/product-urls?brand=${encodeURIComponent(selectedBrand)}`);
    if (res.ok) setUrls(await res.json());
  }, [selectedBrand]);

  useEffect(() => { fetchUrls(); }, [fetchUrls]);

  const handleAdd = async () => {
    if (!newItem.name || !newItem.url) return;
    await fetch('/api/product-urls', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'create',
        brand: selectedBrand,
        name: newItem.name,
        tags: newItem.tags.split(',').map(t => t.trim()).filter(Boolean),
        url: newItem.url,
        note: newItem.note,
      }),
    });
    setNewItem({ name: '', tags: '', url: '', note: '' });
    setShowAdd(false);
    fetchUrls();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('이 제품 URL을 삭제하시겠습니까?')) return;
    await fetch('/api/product-urls', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'delete', id }),
    });
    fetchUrls();
  };

  const startEdit = (item: ProductUrl) => {
    setEditingId(item.id);
    setEditData({ name: item.name, tags: item.tags, url: item.url, note: item.note });
  };

  const handleUpdate = async () => {
    if (!editingId) return;
    await fetch('/api/product-urls', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'update', id: editingId, ...editData }),
    });
    setEditingId(null);
    fetchUrls();
  };

  const handleCopy = async (url: string) => {
    await navigator.clipboard.writeText(url);
    alert('URL이 복사되었습니다.');
  };

  return (
    <div className="space-y-4">
      {/* Brand tabs */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-wrap gap-2">
          {BRANDS.map(brand => (
            <button
              key={brand}
              onClick={() => setSelectedBrand(brand)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedBrand === brand
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {brand}
            </button>
          ))}
        </div>
      </div>

      {/* Header + Add button */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">{selectedBrand} 제품 URL ({urls.length}건)</h3>
        <button onClick={() => setShowAdd(!showAdd)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors">
          + 새 URL 추가
        </button>
      </div>

      {/* Add form */}
      {showAdd && (
        <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input type="text" value={newItem.name} onChange={e => setNewItem(n => ({ ...n, name: e.target.value }))}
              placeholder="제품명 *" className="px-3 py-2 border border-gray-300 rounded-md text-sm" />
            <input type="text" value={newItem.url} onChange={e => setNewItem(n => ({ ...n, url: e.target.value }))}
              placeholder="URL *" className="px-3 py-2 border border-gray-300 rounded-md text-sm" />
            <input type="text" value={newItem.tags} onChange={e => setNewItem(n => ({ ...n, tags: e.target.value }))}
              placeholder="태그 (쉼표로 구분: 정상가격, 향소구)" className="px-3 py-2 border border-gray-300 rounded-md text-sm" />
            <input type="text" value={newItem.note} onChange={e => setNewItem(n => ({ ...n, note: e.target.value }))}
              placeholder="메모 (선택)" className="px-3 py-2 border border-gray-300 rounded-md text-sm" />
          </div>
          <div className="flex gap-2">
            <button onClick={handleAdd} disabled={!newItem.name || !newItem.url}
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 disabled:opacity-50">
              추가
            </button>
            <button onClick={() => setShowAdd(false)}
              className="px-4 py-2 bg-gray-100 text-gray-600 rounded-md text-sm hover:bg-gray-200">
              취소
            </button>
          </div>
        </div>
      )}

      {/* URL List - Desktop table */}
      <div className="hidden md:block bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 font-medium text-gray-700 w-[250px]">제품명</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700">태그</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700">URL</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700 w-[150px]">메모</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700 w-[180px]">관리</th>
              </tr>
            </thead>
            <tbody>
              {urls.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-12 text-gray-400">
                    등록된 제품 URL이 없습니다.
                  </td>
                </tr>
              ) : (
                urls.map(item => (
                  <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                    {editingId === item.id ? (
                      <>
                        <td className="px-4 py-2">
                          <input type="text" value={editData.name || ''} onChange={e => setEditData(d => ({ ...d, name: e.target.value }))}
                            className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm" />
                        </td>
                        <td className="px-4 py-2">
                          <input type="text" value={(editData.tags || []).join(', ')}
                            onChange={e => setEditData(d => ({ ...d, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) }))}
                            className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm" />
                        </td>
                        <td className="px-4 py-2">
                          <input type="text" value={editData.url || ''} onChange={e => setEditData(d => ({ ...d, url: e.target.value }))}
                            className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm" />
                        </td>
                        <td className="px-4 py-2">
                          <input type="text" value={editData.note || ''} onChange={e => setEditData(d => ({ ...d, note: e.target.value }))}
                            className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm" />
                        </td>
                        <td className="px-4 py-2">
                          <div className="flex gap-1">
                            <button onClick={handleUpdate}
                              className="px-2.5 py-1.5 bg-blue-600 text-white rounded text-xs hover:bg-blue-700">저장</button>
                            <button onClick={() => setEditingId(null)}
                              className="px-2.5 py-1.5 bg-gray-100 text-gray-600 rounded text-xs hover:bg-gray-200">취소</button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-4 py-3 font-medium text-gray-900">{item.name}</td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {item.tags.map((tag, i) => (
                              <span key={i} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">{tag}</span>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-xs text-gray-500 break-all">{item.url}</div>
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-xs">{item.note || '-'}</td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1">
                            <button onClick={() => handleCopy(item.url)}
                              className="px-2.5 py-1.5 bg-gray-100 hover:bg-gray-200 rounded text-xs text-gray-700">복사</button>
                            <button onClick={() => startEdit(item)}
                              className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 rounded text-xs text-blue-600">수정</button>
                            <button onClick={() => handleDelete(item.id)}
                              className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 rounded text-xs text-red-600">삭제</button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* URL List - Mobile cards */}
      <div className="md:hidden space-y-3">
        {urls.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-8 text-center text-gray-400">
            등록된 제품 URL이 없습니다.
          </div>
        ) : (
          urls.map(item => (
            <div key={item.id} className="bg-white rounded-lg border border-gray-200 p-4 space-y-2">
              {editingId === item.id ? (
                <div className="space-y-2">
                  <input type="text" value={editData.name || ''} onChange={e => setEditData(d => ({ ...d, name: e.target.value }))}
                    placeholder="제품명" className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                  <input type="text" value={(editData.tags || []).join(', ')}
                    onChange={e => setEditData(d => ({ ...d, tags: e.target.value.split(',').map(t => t.trim()).filter(Boolean) }))}
                    placeholder="태그" className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                  <input type="text" value={editData.url || ''} onChange={e => setEditData(d => ({ ...d, url: e.target.value }))}
                    placeholder="URL" className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                  <input type="text" value={editData.note || ''} onChange={e => setEditData(d => ({ ...d, note: e.target.value }))}
                    placeholder="메모" className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
                  <div className="flex gap-2">
                    <button onClick={handleUpdate}
                      className="px-3 py-1.5 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700">저장</button>
                    <button onClick={() => setEditingId(null)}
                      className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-md text-sm hover:bg-gray-200">취소</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="font-medium text-gray-900 text-sm">{item.name}</div>
                  <div className="flex flex-wrap gap-1">
                    {item.tags.map((tag, i) => (
                      <span key={i} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">{tag}</span>
                    ))}
                  </div>
                  <div className="text-xs text-gray-500 break-all">{item.url}</div>
                  {item.note && <div className="text-xs text-gray-400">{item.note}</div>}
                  <div className="flex gap-2 pt-1">
                    <button onClick={() => handleCopy(item.url)}
                      className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-md text-xs text-gray-700">복사</button>
                    <button onClick={() => startEdit(item)}
                      className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 rounded-md text-xs text-blue-600">수정</button>
                    <button onClick={() => handleDelete(item.id)}
                      className="px-3 py-1.5 bg-red-50 hover:bg-red-100 rounded-md text-xs text-red-600">삭제</button>
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
