import { UTMTag } from '@/types/utm';
import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'utm-tags.json');

function ensureDataDir() {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
  }
}

export function getAllTags(): UTMTag[] {
  ensureDataDir();
  const data = fs.readFileSync(DATA_FILE, 'utf-8');
  return JSON.parse(data);
}

export function addTag(tag: UTMTag): void {
  const tags = getAllTags();
  tags.unshift(tag);
  fs.writeFileSync(DATA_FILE, JSON.stringify(tags, null, 2));
}

export function deleteTag(id: string): boolean {
  const tags = getAllTags();
  const filtered = tags.filter(t => t.id !== id);
  if (filtered.length === tags.length) return false;
  fs.writeFileSync(DATA_FILE, JSON.stringify(filtered, null, 2));
  return true;
}

export function getDistinctValues(field: keyof UTMTag): string[] {
  const tags = getAllTags();
  const values = new Set(tags.map(t => t[field]).filter(Boolean));
  return Array.from(values) as string[];
}

export function getBrandProductMap(): Record<string, string[]> {
  const tags = getAllTags();
  const map: Record<string, Set<string>> = {};
  for (const tag of tags) {
    if (!tag.brand) continue;
    if (!map[tag.brand]) map[tag.brand] = new Set();
    if (tag.product) map[tag.brand].add(tag.product);
  }
  const result: Record<string, string[]> = {};
  for (const [brand, products] of Object.entries(map)) {
    result[brand] = Array.from(products);
  }
  return result;
}
