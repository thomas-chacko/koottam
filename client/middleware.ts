import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Block sitemap.xml for regular users, but allow search engine bots
  if (pathname === '/sitemap.xml') {
    const userAgent = request.headers.get('user-agent') || '';
    
    // Allow known search engine bots
    const allowedBots = [
      'Googlebot',
      'Bingbot',
      'Slurp',           // Yahoo
      'DuckDuckBot',     // DuckDuckGo
      'Baiduspider',     // Baidu
      'YandexBot',       // Yandex
    ];

    const isBot = allowedBots.some(bot => 
      userAgent.toLowerCase().includes(bot.toLowerCase())
    );

    // If not a search engine bot, block access
    if (!isBot) {
      return new NextResponse('Access Denied', { status: 403 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/sitemap.xml',
};
