import { urls } from 'virtual:fmc-exporters';

const pending = new Map();
const attempts = new Map();

export function loadExporter(format) {
  if (!Object.hasOwn(urls, format)) return Promise.reject(new Error('componentsFailed'));
  if (!pending.has(format)) {
    const attempt = attempts.get(format) || 0;
    const url = new URL(urls[format], import.meta.url);
    if (attempt) url.searchParams.set('fmc-retry', String(attempt));
    const promise = import(/* @vite-ignore */ url.href).catch(error => {
      pending.delete(format);
      attempts.set(format, attempt + 1);
      throw error;
    });
    pending.set(format, promise);
  }
  return pending.get(format);
}
