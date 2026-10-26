import { parseYouTubeUrl, embedUrl } from '../src/utils/youtube.js';

const ID = 'dQw4w9WgXcQ';

describe('parseYouTubeUrl', () => {
  it.each([
    [`https://www.youtube.com/watch?v=${ID}`, false],
    [`https://youtube.com/watch?v=${ID}&t=42s`, false],
    [`https://youtu.be/${ID}`, false],
    [`https://youtu.be/${ID}?si=abc`, false],
    [`https://www.youtube.com/embed/${ID}`, false],
    [`https://www.youtube-nocookie.com/embed/${ID}`, false],
    [`https://m.youtube.com/watch?v=${ID}`, false],
    [`https://www.youtube.com/shorts/${ID}`, true],
  ])('accepts %s', (url, isShort) => {
    expect(parseYouTubeUrl(url)).toEqual({ videoId: ID, isShort });
  });

  it.each([
    'https://evil.example/watch?v=dQw4w9WgXcQ',
    'https://youtube.com.evil.example/watch?v=dQw4w9WgXcQ',
    'javascript:alert(1)',
    'https://www.youtube.com/watch?v=short',
    'https://www.youtube.com/watch?v="><script>',
    'https://www.youtube.com/',
    'not a url',
    '',
    null,
  ])('rejects %s', (url) => {
    expect(parseYouTubeUrl(url)).toBeNull();
  });

  it('builds a privacy-enhanced embed url', () => {
    expect(embedUrl(ID)).toBe(`https://www.youtube-nocookie.com/embed/${ID}`);
  });
});
