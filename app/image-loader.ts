export default function customImageLoader({ src }: { src: string }) {
  // If the URL is already a full URL (starts with http or https), return it as is
  if (src.startsWith('http://') || src.startsWith('https://')) {
    return src;
  }

  // If it's a relative URL starting with /_next/image, extract the original URL
  if (src.startsWith('/_next/image')) {
    const urlParams = new URLSearchParams(src.split('?')[1]);
    const originalUrl = urlParams.get('url');
    if (originalUrl) {
      return decodeURIComponent(originalUrl);
    }
  }

  return src;
} 