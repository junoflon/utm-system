import { NextResponse } from 'next/server';
import { getDistinctValues } from '@/lib/store';

export async function GET() {
  return NextResponse.json({
    sources: getDistinctValues('utmSource'),
    mediums: getDistinctValues('utmMedium'),
    campaigns: getDistinctValues('utmCampaign'),
    terms: getDistinctValues('utmTerm'),
    contents: getDistinctValues('utmContent'),
    brands: getDistinctValues('brand'),
    products: getDistinctValues('product'),
  });
}
