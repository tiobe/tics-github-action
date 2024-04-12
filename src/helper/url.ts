export function joinUrl(url: string, ...paths: string[]) {
  if (!url.endsWith('/')) {
    url += '/';
  }

  for (const path of paths) {
    if (path.startsWith('/')) {
      url += path.substring(1);
    } else {
      url += path;
    }
  }

  return url;
}
