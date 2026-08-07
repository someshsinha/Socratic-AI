const CACHE = new Map(); // query -> { videoId, title, cachedAt }
const CACHE_TTL_MS = 1000 * 60 * 60 * 24; // 24h — plenty for a hackathon demo, saves quota on repeat lesson views

export const searchVideos = async (query) => {
  if (!query) return { ok: false, error: 'Empty query' };

  const cached = CACHE.get(query);
  if (cached && Date.now() - cached.cachedAt < CACHE_TTL_MS) {
    return { ok: true, videoId: cached.videoId, title: cached.title, cached: true };
  }

  const apiKey = process.env.YOUTUBE_API_KEY?.trim();
  if (!apiKey) throw new Error('YOUTUBE_API_KEY is missing from environment variables');

  const url = new URL('https://www.googleapis.com/youtube/v3/search');
  url.searchParams.set('part', 'snippet');
  url.searchParams.set('q', query);
  url.searchParams.set('type', 'video');
  url.searchParams.set('videoEmbeddable', 'true');
  url.searchParams.set('maxResults', '1');
  url.searchParams.set('key', apiKey);

  const res = await fetch(url);
  const data = await res.json();

  if (!res.ok) {
    return { ok: false, error: data?.error?.message || 'YouTube API error' };
  }
  const item = data.items?.[0];
  if (!item) return { ok: false, error: 'No results found' };

  const result = { videoId: item.id.videoId, title: item.snippet.title };
  CACHE.set(query, { ...result, cachedAt: Date.now() });
  return { ok: true, ...result, cached: false };
};
