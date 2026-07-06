export function resolveStoreImageUrl(url: string) {
  if (/^https?:\/\//.test(url)) {
    return url;
  }

  return `${import.meta.env.VITE_API_BASE_URL}${url}`;
}
