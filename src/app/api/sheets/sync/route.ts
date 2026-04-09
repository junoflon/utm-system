import { NextResponse } from 'next/server';
import { getAllTags } from '@/lib/store';
import { syncAllToSheet } from '@/lib/sheets';

export async function POST() {
  try {
    const tags = getAllTags();
    await syncAllToSheet(tags);
    return NextResponse.json({ success: true, synced: tags.length });
  } catch (e) {
    const message = e instanceof Error ? e.message : '알 수 없는 오류';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
