import { NextRequest, NextResponse } from 'next/server';
import { getCatalog, addBrand, deleteBrand, addProduct, deleteProduct } from '@/lib/store';

export async function GET() {
  return NextResponse.json(getCatalog());
}

export async function POST(request: NextRequest) {
  const { action, brand, product } = await request.json();

  switch (action) {
    case 'addBrand':
      if (!brand) return NextResponse.json({ error: '브랜드명이 필요합니다.' }, { status: 400 });
      return NextResponse.json(addBrand(brand));

    case 'deleteBrand':
      if (!brand) return NextResponse.json({ error: '브랜드명이 필요합니다.' }, { status: 400 });
      return NextResponse.json(deleteBrand(brand));

    case 'addProduct':
      if (!brand || !product) return NextResponse.json({ error: '브랜드명과 제품명이 필요합니다.' }, { status: 400 });
      return NextResponse.json(addProduct(brand, product));

    case 'deleteProduct':
      if (!brand || !product) return NextResponse.json({ error: '브랜드명과 제품명이 필요합니다.' }, { status: 400 });
      return NextResponse.json(deleteProduct(brand, product));

    default:
      return NextResponse.json({ error: '잘못된 요청입니다.' }, { status: 400 });
  }
}
