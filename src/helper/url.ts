export function joinUrl(url: string, ...paths: string[]): string {
  if (url.endsWith('/')) {
    url = url.slice(0, -1);
  }

  for (const path of paths) {
    let pathcopy: string;
    if (path.endsWith('/')) {
      pathcopy = path.slice(0, -1);
    } else {
      pathcopy = path;
    }

    if (pathcopy.startsWith('/')) {
      url += pathcopy;
    } else {
      url += '/' + pathcopy;
    }
  }

  return url;
}
