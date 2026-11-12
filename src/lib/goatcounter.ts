// The path GoatCounter records for a page, and looks up view counts by.
// Drops the query string (campaign tags are still read from the URL) and any
// trailing slash, so /blog/post, /blog/post/ and /blog/post?campaign=x are one page.
export function pagePath(pathname = location.pathname): string {
  return pathname.replace(/\/+$/, '') || '/';
}
