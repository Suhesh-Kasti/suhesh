/**
 * Archive pagination. Kept in its own module so client components can import the values
 * without pulling in the content registry (which holds every article's metadata).
 */
export const POSTS_PER_PAGE = 9;

/** Page 1 lives at /braindump; later pages get their own crawlable path. */
export function archivePageHref(page: number): string {
  return page <= 1 ? "/braindump" : `/braindump/page/${page}`;
}
