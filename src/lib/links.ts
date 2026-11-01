export function canonicalPagePath(path: string): string {
  const absolutePath = path.startsWith("/") ? path : `/${path}`;
  return absolutePath === "/" ? "/" : absolutePath.replace(/\/+$/, "");
}

export function canonicalizeInternalHref(href: string): string {
  if (!href.startsWith("/") || href.startsWith("//")) return href;

  const suffixStart = href.search(/[?#]/);
  const path = suffixStart === -1 ? href : href.slice(0, suffixStart);
  const suffix = suffixStart === -1 ? "" : href.slice(suffixStart);
  return `${canonicalPagePath(path)}${suffix}`;
}

export function normalizeLegacyHtmlLinks(html: string): string {
  return html.replace(/(\s+href\s*=\s*)(?:"([^"]*)"|'([^']*)')/gi, (_match, attribute: string, doubleQuoted: string | undefined, singleQuoted: string | undefined) => {
    const quote = doubleQuoted === undefined ? "'" : '"';
    const href = doubleQuoted ?? singleQuoted ?? "";
    return `${attribute}${quote}${canonicalizeInternalHref(href)}${quote}`;
  });
}
