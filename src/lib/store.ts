import { UTMTag } from '@/types/utm';
import fs from 'fs';
import path from 'path';

const DATA_DIR = fs.existsSync('/app/data') ? '/app/data' : path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'utm-tags.json');

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

// --- Brand/Product catalog (persistent) ---

const CATALOG_FILE = path.join(DATA_DIR, 'catalog.json');

interface Catalog {
  brands: { name: string; products: string[] }[];
}

function ensureCatalog(): Catalog {
  ensureDataDir();
  if (!fs.existsSync(CATALOG_FILE)) {
    const initial: Catalog = { brands: [] };
    fs.writeFileSync(CATALOG_FILE, JSON.stringify(initial, null, 2));
    return initial;
  }
  return JSON.parse(fs.readFileSync(CATALOG_FILE, 'utf-8'));
}

function saveCatalog(catalog: Catalog) {
  ensureDataDir();
  fs.writeFileSync(CATALOG_FILE, JSON.stringify(catalog, null, 2));
}

export function getCatalog(): Catalog {
  return ensureCatalog();
}

export function addBrand(name: string): Catalog {
  const catalog = ensureCatalog();
  if (!catalog.brands.find(b => b.name === name)) {
    catalog.brands.push({ name, products: [] });
    saveCatalog(catalog);
  }
  return catalog;
}

export function deleteBrand(name: string): Catalog {
  const catalog = ensureCatalog();
  catalog.brands = catalog.brands.filter(b => b.name !== name);
  saveCatalog(catalog);
  return catalog;
}

export function addProduct(brandName: string, productName: string): Catalog {
  const catalog = ensureCatalog();
  const brand = catalog.brands.find(b => b.name === brandName);
  if (brand && !brand.products.includes(productName)) {
    brand.products.push(productName);
    saveCatalog(catalog);
  }
  return catalog;
}

export function deleteProduct(brandName: string, productName: string): Catalog {
  const catalog = ensureCatalog();
  const brand = catalog.brands.find(b => b.name === brandName);
  if (brand) {
    brand.products = brand.products.filter(p => p !== productName);
    saveCatalog(catalog);
  }
  return catalog;
}

// --- Product URL management ---

const PRODUCT_URLS_FILE = path.join(DATA_DIR, 'product-urls.json');

export interface ProductUrl {
  id: string;
  brand: string;
  name: string;
  tags: string[];
  url: string;
  note: string;
  platform: string;
  active: boolean;
}

function ensureProductUrls(): ProductUrl[] {
  ensureDataDir();
  if (!fs.existsSync(PRODUCT_URLS_FILE)) {
    fs.writeFileSync(PRODUCT_URLS_FILE, JSON.stringify([], null, 2));
    return [];
  }
  return JSON.parse(fs.readFileSync(PRODUCT_URLS_FILE, 'utf-8'));
}

function saveProductUrls(urls: ProductUrl[]) {
  ensureDataDir();
  fs.writeFileSync(PRODUCT_URLS_FILE, JSON.stringify(urls, null, 2));
}

export function getAllProductUrls(): ProductUrl[] {
  return ensureProductUrls();
}

export function addProductUrl(item: ProductUrl): void {
  const urls = ensureProductUrls();
  urls.push(item);
  saveProductUrls(urls);
}

export function updateProductUrl(id: string, updates: Partial<ProductUrl>): ProductUrl | null {
  const urls = ensureProductUrls();
  const idx = urls.findIndex(u => u.id === id);
  if (idx === -1) return null;
  urls[idx] = { ...urls[idx], ...updates, id };
  saveProductUrls(urls);
  return urls[idx];
}

export function deleteProductUrl(id: string): boolean {
  const urls = ensureProductUrls();
  const filtered = urls.filter(u => u.id !== id);
  if (filtered.length === urls.length) return false;
  saveProductUrls(filtered);
  return true;
}

export function getBrandProductMap(): Record<string, string[]> {
  const catalog = ensureCatalog();
  const result: Record<string, string[]> = {};
  for (const brand of catalog.brands) {
    result[brand.name] = brand.products;
  }
  return result;
}
