'use client';

import { useState, useEffect, useCallback } from 'react';
import { UTMTag } from '@/types/utm';

interface Filters {
  source: string;
  medium: string;
  campaign: string;
  term: string;
  content: string;
  brand: string;
  product: string;
}

interface FilterOptions {
  sources: string[];
  mediums: string[];
  campaigns: string[];
  terms: string[];
  contents: string[];
  brands: string[];
  products: string[];
}

interface Props {
  refreshKey: number;
}

export default function UTMList({ refreshKey }: Props) {
  const [tags, setTags] = useState<UTMTag[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(20);
  const [filters, setFilters] = useState<Filters>({
    source: '', medium: '', campaign: '', term: '', content: '', brand: '', product: '',
  });
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    sources: [], mediums: [], campaigns: [], terms: [], contents: [], brands: [], products: [],
  });

  const fetchFilters = useCallback(async () => {
    const res = await fetch('/api/utm/filters');
    if (res.ok) {
      setFilterOptions(await res.json());
    }
  }, []);

  const fetchTags = useCallback(async () => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(filters.source && { source: filters.source }),
      ...(filters.medium && { medium: filters.medium }),
      ...(filters.campaign && { campaign: filters.campaign }),
      ...(filters.term && { term: filters.term }),
      ...(filters.content && { content: filters.content }),
      ...(filters.brand && { brand: filters.brand }),
      ...(filters.product && { product: filters.product }),
    });
    const res = await fetch(`/api/utm?${params}`);
    if (res.ok) {
      const data = await res.json();
      setTags(data.tags);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    }
  }, [page, limit, filters]);

  useEffect(() => { fetchFilters(); }, [fetchFilters, refreshKey]);
  useEffect(() => { fetchTags(); }, [fetchTags, refreshKey]);

  const handleDelete = async (id: string) => {
    if (!confirm('이 UTM 태그를 삭제하시겠습니까?')) return;
    const res = await fetch('/api/utm', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      fetchTags();
      fetchFilters();
    }
  };

  const handleCopy = async (url: string) => {
    await navigator.clipboard.writeText(url);
    alert('URL이 클립보드에 복사되었습니다.');
  };

  const handleSearch = () => {
    setPage(1);
    fetchTags();
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-wrap gap-3 items-center">
          <FilterSelect label="브랜드 전체" value={filters.brand} options={filterOptions.brands}
            onChange={v => setFilters(f => ({ ...f, brand: v }))} />
          <FilterSelect label="제품 전체" value={filters.product} options={filterOptions.products}
            onChange={v => setFilters(f => ({ ...f, product: v }))} />
          <FilterSelect label="채널 전체" value={filters.source} options={filterOptions.sources}
            onChange={v => setFilters(f => ({ ...f, source: v }))} />
          <FilterSelect label="유형 전체" value={filters.medium} options={filterOptions.mediums}
            onChange={v => setFilters(f => ({ ...f, medium: v }))} />
          <FilterSelect label="캠페인 전체" value={filters.campaign} options={filterOptions.campaigns}
            onChange={v => setFilters(f => ({ ...f, campaign: v }))} />
          <FilterSelect label="키워드 전체" value={filters.term} options={filterOptions.terms}
            onChange={v => setFilters(f => ({ ...f, term: v }))} />
          <FilterSelect label="세부항목 전체" value={filters.content} options={filterOptions.contents}
            onChange={v => setFilters(f => ({ ...f, content: v }))} />
          <button onClick={handleSearch}
            className="px-4 py-2 bg-white border border-gray-300 rounded-md text-sm hover:bg-gray-50 transition-colors">
            조회
          </button>
          <div className="ml-auto flex items-center gap-3">
            <span className="text-sm text-gray-600">{total} 건 조회됨</span>
            <select value={limit} onChange={e => { setLimit(Number(e.target.value)); setPage(1); }}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm">
              <option value={10}>10개씩 보기</option>
              <option value={20}>20개씩 보기</option>
              <option value={50}>50개씩 보기</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-4 py-3 font-medium text-gray-700 min-w-[300px]">태그 제목</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700">브랜드</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700">제품</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700">채널 (source)</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700">유형 (medium)</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700">캠페인 (campaign)</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700">키워드 (term)</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700">세부항목 (content)</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700">생성일</th>
                <th className="text-left px-4 py-3 font-medium text-gray-700">관리</th>
              </tr>
            </thead>
            <tbody>
              {tags.length === 0 ? (
                <tr>
                  <td colSpan={10} className="text-center py-12 text-gray-400">
                    등록된 UTM 태그가 없습니다.
                  </td>
                </tr>
              ) : (
                tags.map(tag => (
                  <tr key={tag.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-900">{tag.title}</div>
                      <div className="text-xs text-gray-400 truncate max-w-[280px]">{tag.generatedUrl}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{tag.brand || '-'}</td>
                    <td className="px-4 py-3 text-gray-600">{tag.product || '-'}</td>
                    <td className="px-4 py-3 text-gray-600">{tag.utmSource}</td>
                    <td className="px-4 py-3 text-gray-600">{tag.utmMedium}</td>
                    <td className="px-4 py-3 text-gray-600">{tag.utmCampaign || '-'}</td>
                    <td className="px-4 py-3 text-gray-600">{tag.utmTerm || '-'}</td>
                    <td className="px-4 py-3 text-gray-600">{tag.utmContent || '-'}</td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{formatDate(tag.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button onClick={() => handleCopy(tag.generatedUrl)}
                          className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded text-xs text-gray-700 transition-colors">
                          복사
                        </button>
                        <button onClick={() => handleDelete(tag.id)}
                          className="px-3 py-1.5 bg-red-50 hover:bg-red-100 rounded text-xs text-red-600 transition-colors">
                          삭제
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-1">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="px-3 py-1.5 border border-gray-300 rounded text-sm disabled:opacity-30 hover:bg-gray-50">
            이전
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).slice(
            Math.max(0, page - 3), Math.min(totalPages, page + 2)
          ).map(p => (
            <button key={p} onClick={() => setPage(p)}
              className={`px-3 py-1.5 border rounded text-sm ${p === page ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 hover:bg-gray-50'}`}>
              {p}
            </button>
          ))}
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            className="px-3 py-1.5 border border-gray-300 rounded text-sm disabled:opacity-30 hover:bg-gray-50">
            다음
          </button>
        </div>
      )}
    </div>
  );
}

function FilterSelect({ label, value, options, onChange }: {
  label: string; value: string; options: string[]; onChange: (v: string) => void;
}) {
  return (
    <select value={value} onChange={e => onChange(e.target.value)}
      className="px-3 py-2 border border-gray-300 rounded-md text-sm bg-white min-w-[120px]">
      <option value="">{label}</option>
      {options.map(opt => (
        <option key={opt} value={opt}>{opt}</option>
      ))}
    </select>
  );
}
