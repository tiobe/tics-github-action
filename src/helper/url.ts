export function joinUrl(url: string, path: string) {
  if (!url.endsWith('/')) {
    url += '/';
  }

  if (path.startsWith('/')) {
    url += path.substring(1);
  } else {
    url += path;
  }

  return url;
}
