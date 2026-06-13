import { getSettings } from '@/lib/services/settings';

export const revalidate = 0; // Serve dynamically to ensure immediate updates

export async function GET() {
  try {
    const settings = await getSettings();
    const faviconUrl = settings.faviconUrl || settings.logoUrl;
    
    if (faviconUrl) {
      const res = await fetch(faviconUrl);
      if (res.ok) {
        const contentType = res.headers.get('content-type') || 'image/x-icon';
        const buffer = await res.arrayBuffer();
        return new Response(buffer, {
          headers: {
            'Content-Type': contentType,
            'Cache-Control': 'public, max-age=60, stale-while-revalidate=600',
          },
        });
      }
    }
  } catch (e) {
    console.error('Failed to serve dynamic favicon:', e);
  }

  // Fallback if no favicon is set or fetch fails
  return new Response('', { status: 404 });
}
