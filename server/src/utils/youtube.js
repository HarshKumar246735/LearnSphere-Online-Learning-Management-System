// Safe YouTube URL parsing. Only allow-listed hosts are accepted and the video id must be exactly 11 safe characters,
// so an arbitrary URL can never end up inside an iframe.
const HOSTS = new Set([
  'youtube.com', 'www.youtube.com', 'm.youtube.com', 'music.youtube.com',
  'youtube-nocookie.com', 'www.youtube-nocookie.com', 'youtu.be',
]);
const ID = /^[A-Za-z0-9_-]{11}$/;

export function parseYouTubeUrl(input) {
  if (typeof input !== 'string') return null;
  let url;
  try { url = new URL(input.trim()); } catch { return null; }
  if (!['http:', 'https:'].includes(url.protocol)) return null;
  const host = url.hostname.toLowerCase();
  if (!HOSTS.has(host)) return null;

  const parts = url.pathname.split('/').filter(Boolean);
  let id = null;
  let isShort = false;
  if (host === 'youtu.be') id = parts[0];
  else if (parts[0] === 'watch') id = url.searchParams.get('v');
  else if (parts[0] === 'embed' || parts[0] === 'v' || parts[0] === 'live') id = parts[1];
  else if (parts[0] === 'shorts') { id = parts[1]; isShort = true; }
  return id && ID.test(id) ? { videoId: id, isShort } : null;
}

export const embedUrl = (videoId) => `https://www.youtube-nocookie.com/embed/${videoId}`;
