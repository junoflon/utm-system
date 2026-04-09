import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getAllTags, addTag, deleteTag } from '@/lib/store';
import { UTMTag } from '@/types/utm';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '20');
  const source = searchParams.get('source') || '';
  const medium = searchParams.get('medium') || '';
  const campaign = searchParams.get('campaign') || '';
  const term = searchParams.get('term') || '';
  const content = searchParams.get('content') || '';
  const brand = searchParams.get('brand') || '';
  const product = searchParams.get('product') || '';

  let tags = getAllTags();

  // Apply filters
  if (source) tags = tags.filter(t => t.utmSource === source);
  if (medium) tags = tags.filter(t => t.utmMedium === medium);
  if (campaign) tags = tags.filter(t => t.utmCampaign === campaign);
  if (term) tags = tags.filter(t => t.utmTerm === term);
  if (content) tags = tags.filter(t => t.utmContent === content);
  if (brand) tags = tags.filter(t => t.brand === brand);
  if (product) tags = tags.filter(t => t.product === product);

  const total = tags.length;
  const start = (page - 1) * limit;
  const paginated = tags.slice(start, start + limit);

  return NextResponse.json({
    tags: paginated,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { title, landingUrl, brand, product, utmSource, utmMedium, utmCampaign, utmTerm, utmContent } = body;

  if (!title || !landingUrl || !utmSource || !utmMedium) {
    return NextResponse.json({ error: '필수 항목을 입력해주세요.' }, { status: 400 });
  }

  // Build UTM URL
  const url = new URL(landingUrl);
  if (utmSource) url.searchParams.set('utm_source', utmSource);
  if (utmMedium) url.searchParams.set('utm_medium', utmMedium);
  if (utmCampaign) url.searchParams.set('utm_campaign', utmCampaign);
  if (utmTerm) url.searchParams.set('utm_term', utmTerm);
  if (utmContent) url.searchParams.set('utm_content', utmContent);

  const tag: UTMTag = {
    id: uuidv4(),
    title,
    landingUrl,
    generatedUrl: url.toString(),
    brand: brand || '',
    product: product || '',
    utmSource,
    utmMedium,
    utmCampaign: utmCampaign || '',
    utmTerm: utmTerm || '',
    utmContent: utmContent || '',
    createdAt: new Date().toISOString(),
  };

  addTag(tag);

  return NextResponse.json(tag, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const { id } = await request.json();
  if (!id) {
    return NextResponse.json({ error: 'ID가 필요합니다.' }, { status: 400 });
  }

  const deleted = deleteTag(id);
  if (!deleted) {
    return NextResponse.json({ error: '태그를 찾을 수 없습니다.' }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
