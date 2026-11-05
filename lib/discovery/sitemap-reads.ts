import { AsyncLocalStorage } from 'node:async_hooks';

const reads = new AsyncLocalStorage<Map<string, Promise<unknown>>>();

export function withSitemapReads<T>(load: () => Promise<T>): Promise<T> {
  return reads.run(new Map(), load);
}

export function sitemapRead<T>(
  kind: 'product' | 'route',
  slug: string,
  load: () => Promise<T>,
): Promise<T> {
  const pending = reads.getStore();
  if (!pending) return load();

  const key = kind + '/' + slug;
  const existing = pending.get(key);
  if (existing) return existing as Promise<T>;

  const result = Promise.resolve().then(load);
  pending.set(key, result);
  return result;
}
