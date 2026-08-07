export function normalizeAvatarUrl(url: string | null): string | undefined {
  if (!url) return undefined;
  const match = url.match(/avatars\.dicebear\.com\/api\/([^/]+)\/(.+)\.svg/);
  if (match) {
    const [, style, seed] = match;
    return `https://api.dicebear.com/9.x/${style}/svg?seed=${seed}`;
  }
  return url;
}