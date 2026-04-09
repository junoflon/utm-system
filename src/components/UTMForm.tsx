'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { UTM_SOURCES, UTM_MEDIUMS, UTM_SOURCE_LABELS, UTM_MEDIUM_LABELS } from '@/types/utm';

interface Props {
  onCreated: () => void;
}

export default function UTMForm({ onCreated }: Props) {
  const [title, setTitle] = useState('');
  const [landingUrl, setLandingUrl] = useState('');
  const [brand, setBrand] = useState('');
  const [product, setProduct] = useState('');
  const [brandOptions, setBrandOptions] = useState<string[]>([]);
  const [brandProductMap, setBrandProductMap] = useState<Record<string, string[]>>({});
  const [newBrand, setNewBrand] = useState('');
  const [newProduct, setNewProduct] = useState('');
  const [showNewBrand, setShowNewBrand] = useState(false);
  const [showNewProduct, setShowNewProduct] = useState(false);
  const [utmSource, setUtmSource] = useState('');
  const [customSource, setCustomSource] = useState('');
  const [utmMedium, setUtmMedium] = useState('');
  const [customMedium, setCustomMedium] = useState('');
  const [utmCampaign, setUtmCampaign] = useState('');

  const [utmContent, setUtmContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  const filteredProducts = brand ? (brandProductMap[brand] || []) : [];

  const fetchOptions = useCallback(async () => {
    const res = await fetch('/api/utm/filters');
    if (res.ok) {
      const data = await res.json();
      setBrandOptions(data.brands || []);
      setBrandProductMap(data.brandProductMap || {});
    }
  }, []);

  useEffect(() => { fetchOptions(); }, [fetchOptions]);

  const handleBrandChange = (value: string) => {
    setBrand(value);
    setProduct('');
    setShowNewProduct(false);
  };

  const handleAddBrand = () => {
    if (!newBrand.trim()) return;
    const trimmed = newBrand.trim();
    if (!brandOptions.includes(trimmed)) {
      setBrandOptions(prev => [...prev, trimmed]);
      setBrandProductMap(prev => ({ ...prev, [trimmed]: [] }));
    }
    handleBrandChange(trimmed);
    setNewBrand('');
    setShowNewBrand(false);
  };

  const handleAddProduct = () => {
    if (!newProduct.trim() || !brand) return;
    const trimmed = newProduct.trim();
    setBrandProductMap(prev => ({
      ...prev,
      [brand]: [...(prev[brand] || []), trimmed].filter((v, i, a) => a.indexOf(v) === i),
    }));
    setProduct(trimmed);
    setNewProduct('');
    setShowNewProduct(false);
  };

  const effectiveSource = utmSource === '_custom' ? customSource : utmSource;
  const effectiveMedium = utmMedium === '_custom' ? customMedium : utmMedium;

  const generatedUrl = useMemo(() => {
    if (!landingUrl) return '';
    try {
      const url = new URL(landingUrl.startsWith('http') ? landingUrl : `https://${landingUrl}`);
      if (effectiveSource) url.searchParams.set('utm_source', effectiveSource);
      if (effectiveMedium) url.searchParams.set('utm_medium', effectiveMedium);
      if (utmCampaign) url.searchParams.set('utm_campaign', utmCampaign);
      if (utmContent) url.searchParams.set('utm_content', utmContent);
      return url.toString();
    } catch {
      return '';
    }
  }, [landingUrl, effectiveSource, effectiveMedium, utmCampaign, utmContent]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !landingUrl || !effectiveSource || !effectiveMedium || !utmCampaign || !utmContent) return;

    setSubmitting(true);
    try {
      const finalUrl = landingUrl.startsWith('http') ? landingUrl : `https://${landingUrl}`;
      const res = await fetch('/api/utm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title, landingUrl: finalUrl, brand, product,
          utmSource: effectiveSource, utmMedium: effectiveMedium,
          utmCampaign, utmTerm: '', utmContent,
        }),
      });
      if (res.ok) {
        // Reset form
        setTitle(''); setLandingUrl(''); setBrand(''); setProduct('');
        setUtmSource(''); setCustomSource(''); setUtmMedium(''); setCustomMedium('');
        setUtmCampaign(''); setUtmContent('');
        setShowNewBrand(false); setShowNewProduct(false);
        fetchOptions();
        onCreated();
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyUrl = async () => {
    if (!generatedUrl) return;
    await navigator.clipboard.writeText(generatedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 기본 정보 */}
      <section className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">기본 정보</h2>
        <p className="text-sm text-gray-500 mb-6">캠페인을 식별할 수 있는 태그 제목과 랜딩 URL을 입력하세요.</p>

        <div className="space-y-4">
          <div className="grid grid-cols-[180px_1fr] items-center gap-4">
            <label className="text-sm font-medium text-gray-700">
              태그 제목 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="광고 집행 이름과 동일하게 해주세요"
              maxLength={100}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-[180px_1fr] items-center gap-4">
            <label className="text-sm font-medium text-gray-700">
              랜딩 URL <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={landingUrl}
              onChange={e => setLandingUrl(e.target.value)}
              placeholder="https://"
              className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-[180px_1fr] items-center gap-4">
            <label className="text-sm font-medium text-gray-700">
              생성된 URL 미리보기
            </label>
            <div className="flex gap-2">
              <div className="flex-1 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-md text-sm text-gray-600 truncate">
                {generatedUrl || 'https://'}
              </div>
              {generatedUrl && (
                <button
                  type="button"
                  onClick={handleCopyUrl}
                  className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-sm text-gray-700 whitespace-nowrap transition-colors"
                >
                  {copied ? '복사됨!' : '복사'}
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 카테고리 분류 */}
      <section className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">카테고리 분류</h2>
        <p className="text-sm text-gray-500 mb-6">브랜드와 제품별로 UTM 태그를 분류하세요.</p>

        <div className="space-y-4">
          <div className="grid grid-cols-[180px_1fr] items-center gap-4">
            <label className="text-sm font-medium text-gray-700">브랜드</label>
            <div className="flex gap-2">
              <select
                value={brand}
                onChange={e => {
                  if (e.target.value === '_add') { setShowNewBrand(true); }
                  else { handleBrandChange(e.target.value); }
                }}
                className="flex-1 px-3 py-2.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                <option value="">브랜드 선택</option>
                {brandOptions.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
                <option value="_add">+ 새 브랜드 추가</option>
              </select>
              {showNewBrand && (
                <>
                  <input
                    type="text"
                    value={newBrand}
                    onChange={e => setNewBrand(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddBrand())}
                    placeholder="새 브랜드명"
                    className="flex-1 px-3 py-2.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                  />
                  <button type="button" onClick={handleAddBrand}
                    className="px-3 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors whitespace-nowrap">
                    추가
                  </button>
                  <button type="button" onClick={() => { setShowNewBrand(false); setNewBrand(''); }}
                    className="px-3 py-2 bg-gray-100 text-gray-600 rounded-md text-sm hover:bg-gray-200 transition-colors">
                    취소
                  </button>
                </>
              )}
            </div>
          </div>
          <div className="grid grid-cols-[180px_1fr] items-center gap-4">
            <label className="text-sm font-medium text-gray-700">제품</label>
            <div className="flex gap-2">
              <select
                value={product}
                onChange={e => {
                  if (e.target.value === '_add') { setShowNewProduct(true); }
                  else { setProduct(e.target.value); }
                }}
                disabled={!brand}
                className="flex-1 px-3 py-2.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white disabled:bg-gray-100 disabled:text-gray-400"
              >
                <option value="">{brand ? '제품 선택' : '브랜드를 먼저 선택하세요'}</option>
                {filteredProducts.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
                {brand && <option value="_add">+ 새 제품 추가</option>}
              </select>
              {showNewProduct && (
                <>
                  <input
                    type="text"
                    value={newProduct}
                    onChange={e => setNewProduct(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddProduct())}
                    placeholder="새 제품명"
                    className="flex-1 px-3 py-2.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                  />
                  <button type="button" onClick={handleAddProduct}
                    className="px-3 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 transition-colors whitespace-nowrap">
                    추가
                  </button>
                  <button type="button" onClick={() => { setShowNewProduct(false); setNewProduct(''); }}
                    className="px-3 py-2 bg-gray-100 text-gray-600 rounded-md text-sm hover:bg-gray-200 transition-colors">
                    취소
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* UTM 파라미터 */}
      <section className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">UTM 파라미터</h2>
        <p className="text-sm text-gray-500 mb-6">트래픽 유입 경로를 추적하기 위한 UTM 파라미터를 설정하세요.</p>

        <div className="space-y-6">
          {/* utm_source */}
          <div className="grid grid-cols-[180px_1fr] gap-4">
            <label className="text-sm font-medium text-gray-700 pt-1">
              utm_source (채널) <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-3">
              {UTM_SOURCES.map(src => (
                <label key={src} className="flex items-center gap-1.5 text-sm cursor-pointer">
                  <input
                    type="radio"
                    name="utmSource"
                    value={src}
                    checked={utmSource === src}
                    onChange={e => setUtmSource(e.target.value)}
                    className="w-4 h-4 text-blue-600"
                  />
                  {UTM_SOURCE_LABELS[src]}
                </label>
              ))}
              <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                <input
                  type="radio"
                  name="utmSource"
                  value="_custom"
                  checked={utmSource === '_custom'}
                  onChange={e => setUtmSource(e.target.value)}
                  className="w-4 h-4 text-blue-600"
                />
                직접 입력
              </label>
              {utmSource === '_custom' && (
                <input
                  type="text"
                  value={customSource}
                  onChange={e => setCustomSource(e.target.value)}
                  placeholder="채널명 입력"
                  className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              )}
            </div>
          </div>

          {/* utm_medium */}
          <div className="grid grid-cols-[180px_1fr] gap-4">
            <label className="text-sm font-medium text-gray-700 pt-1">
              utm_medium (유형) <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-3">
              {UTM_MEDIUMS.map(med => (
                <label key={med} className="flex items-center gap-1.5 text-sm cursor-pointer">
                  <input
                    type="radio"
                    name="utmMedium"
                    value={med}
                    checked={utmMedium === med}
                    onChange={e => setUtmMedium(e.target.value)}
                    className="w-4 h-4 text-blue-600"
                  />
                  {UTM_MEDIUM_LABELS[med]}
                </label>
              ))}
              <label className="flex items-center gap-1.5 text-sm cursor-pointer">
                <input
                  type="radio"
                  name="utmMedium"
                  value="_custom"
                  checked={utmMedium === '_custom'}
                  onChange={e => setUtmMedium(e.target.value)}
                  className="w-4 h-4 text-blue-600"
                />
                직접 입력
              </label>
              {utmMedium === '_custom' && (
                <input
                  type="text"
                  value={customMedium}
                  onChange={e => setCustomMedium(e.target.value)}
                  placeholder="유형 입력"
                  className="px-3 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              )}
            </div>
          </div>

          {/* utm_campaign */}
          <div className="grid grid-cols-[180px_1fr] items-center gap-4">
            <label className="text-sm font-medium text-gray-700">
              utm_campaign (캠페인) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={utmCampaign}
              onChange={e => setUtmCampaign(e.target.value)}
              placeholder="#캠페인번호_#광고세트번호 (예: #1-1_#1-2 / 최대 50자)"
              maxLength={50}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          {/* utm_content */}
          <div className="grid grid-cols-[180px_1fr] items-center gap-4">
            <label className="text-sm font-medium text-gray-700">
              utm_content (세부항목) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={utmContent}
              onChange={e => setUtmContent(e.target.value)}
              placeholder="ad_대본번호 (예: ad_01 / 최대 50자)"
              maxLength={50}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
        </div>
      </section>

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={submitting || !title || !landingUrl || !effectiveSource || !effectiveMedium || !utmCampaign || !utmContent}
          className="px-6 py-2.5 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {submitting ? 'UTM 생성 중...' : 'UTM 태그 생성'}
        </button>
      </div>
    </form>
  );
}
