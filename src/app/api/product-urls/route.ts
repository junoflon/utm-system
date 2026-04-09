import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getAllProductUrls, addProductUrl, updateProductUrl, deleteProductUrl, ProductUrl } from '@/lib/store';

export async function GET(request: NextRequest) {
  const brand = request.nextUrl.searchParams.get('brand') || '';
  let urls = getAllProductUrls();
  if (brand) urls = urls.filter(u => u.brand === brand);
  return NextResponse.json(urls);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { action } = body;

  if (action === 'create') {
    const { brand, name, tags, url, note } = body;
    if (!brand || !name || !url) {
      return NextResponse.json({ error: '브랜드, 제품명, URL은 필수입니다.' }, { status: 400 });
    }
    const item: ProductUrl = {
      id: uuidv4(),
      brand,
      name,
      tags: tags || [],
      url,
      note: note || '',
      active: true,
    };
    addProductUrl(item);
    return NextResponse.json(item, { status: 201 });
  }

  if (action === 'update') {
    const { id, ...updates } = body;
    if (!id) return NextResponse.json({ error: 'ID가 필요합니다.' }, { status: 400 });
    const updated = updateProductUrl(id, updates);
    if (!updated) return NextResponse.json({ error: '항목을 찾을 수 없습니다.' }, { status: 404 });
    return NextResponse.json(updated);
  }

  if (action === 'delete') {
    const { id } = body;
    if (!id) return NextResponse.json({ error: 'ID가 필요합니다.' }, { status: 400 });
    const deleted = deleteProductUrl(id);
    if (!deleted) return NextResponse.json({ error: '항목을 찾을 수 없습니다.' }, { status: 404 });
    return NextResponse.json({ success: true });
  }

  if (action === 'seed') {
    const { items } = body;
    if (!Array.isArray(items)) return NextResponse.json({ error: 'items 배열이 필요합니다.' }, { status: 400 });
    for (const item of items) {
      addProductUrl({ ...item, id: uuidv4(), active: true });
    }
    return NextResponse.json({ success: true, count: items.length });
  }

  return NextResponse.json({ error: '잘못된 action입니다.' }, { status: 400 });
}
