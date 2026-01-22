import { DATA_SOURCE_URL } from './constant';

const headers = {
  // Standard User-Agent for a modern Chrome browser on Windows
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
  'Accept-Language': 'en-US,en;q=0.9',
  'Referer': 'https://www.google.com', // Optional: A common referrer site
  // Optional: Modern fetch-specific headers for more realism
  'Sec-Fetch-Site': 'none',
  'Sec-Fetch-Mode': 'navigate',
  'Sec-Fetch-User': '?1',
  'Sec-Fetch-Dest': 'document',
};

const main = async () => {
  const res = await fetch(DATA_SOURCE_URL, { headers });
  const html = await res.text();

  return html;
};

export default main;