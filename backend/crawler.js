import * as cheerio from 'cheerio';

const DEFAULT_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8'
};

const VIDEO_EXTENSIONS = ['.mp4', '.webm', '.ogg', '.mov', '.m4v', '.avi', '.mkv'];

function isDirectVideoUrl(url) {
  try {
    const path = new URL(url).pathname.toLowerCase();
    return VIDEO_EXTENSIONS.some(ext => path.endsWith(ext));
  } catch {
    return false;
  }
}

function toAbsolute(base, url) {
  if (!url) return '';
  try {
    return new URL(url, base).href;
  } catch {
    return url;
  }
}

export async function crawlPage(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  let html;
  let finalUrl = url;
  let statusCode = 0;
  try {
    const res = await fetch(url, {
      headers: DEFAULT_HEADERS,
      signal: controller.signal,
      redirect: 'follow'
    });
    clearTimeout(timeout);
    statusCode = res.status;
    if (!res.ok) {
      throw new Error(`请求失败，状态码 ${res.status}`);
    }
    finalUrl = res.url || url;
    html = await res.text();
  } catch (e) {
    clearTimeout(timeout);
    if (e.name === 'AbortError') throw new Error('请求超时');
    throw new Error(e.message || '请求失败');
  }

  const $ = cheerio.load(html);

  const title = $('title').first().text().trim();
  const description = $('meta[name="description"]').attr('content') || '';
  const keywords = $('meta[name="keywords"]').attr('content') || '';

  const links = [];
  const seenLinks = new Set();
  $('a[href]').each((_, el) => {
    const href = $(el).attr('href').trim();
    if (!href || href.startsWith('#') || href.startsWith('javascript:')) return;
    const absolute = toAbsolute(finalUrl, href);
    if (seenLinks.has(absolute)) return;
    seenLinks.add(absolute);
    links.push({ url: absolute, text: $(el).text().trim().slice(0, 100) });
  });

  const images = [];
  const seenImages = new Set();
  $('img[src]').each((_, el) => {
    const src = $(el).attr('src').trim();
    if (!src || src.startsWith('data:')) return;
    const absolute = toAbsolute(finalUrl, src);
    if (seenImages.has(absolute)) return;
    seenImages.add(absolute);
    images.push({
      url: absolute,
      alt: ($(el).attr('alt') || '').slice(0, 100)
    });
  });

  const videos = [];
  const seenVideos = new Set();
  $('video[src], video source[src], source[src]').each((_, el) => {
    const src = $(el).attr('src');
    if (!src) return;
    const absolute = toAbsolute(finalUrl, src);
    if (seenVideos.has(absolute)) return;
    seenVideos.add(absolute);
    videos.push(absolute);
  });
  $('meta[property="og:video"], meta[property="og:video:secure_url"]').each((_, el) => {
    const src = $(el).attr('content');
    if (!src) return;
    const absolute = toAbsolute(finalUrl, src);
    if (seenVideos.has(absolute)) return;
    seenVideos.add(absolute);
    videos.push(absolute);
  });
  const videoRegex = /https?:\/\/[^\s"'<>]+\.(?:mp4|webm|m4v|mov)(?:\?[^\s"'<>]*)?/gi;
  const matches = html.match(videoRegex) || [];
  for (const m of matches) {
    const absolute = toAbsolute(finalUrl, m);
    if (seenVideos.has(absolute)) continue;
    seenVideos.add(absolute);
    videos.push(absolute);
  }

  const bodyText = $('body').text().replace(/\s+/g, ' ').trim().slice(0, 3000);

  return {
    url: finalUrl,
    requestedUrl: url,
    statusCode,
    title,
    description,
    keywords,
    linkCount: links.length,
    imageCount: images.length,
    videoCount: videos.length,
    links: links.slice(0, 200),
    images: images.slice(0, 100),
    videos: videos.slice(0, 50),
    textPreview: bodyText
  };
}
