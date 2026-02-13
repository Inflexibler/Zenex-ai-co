import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api|public).*)',
  ],
};

const GITHUB_OWNER = process.env.GITHUB_OWNER || 'Inflexibler';
const GITHUB_REPO = process.env.GITHUB_REPO || 'Zenex-users-data-1';

export async function middleware(request: NextRequest) {
  const { pathname, hostname } = request.nextUrl;

  // Main domain check
  const isMainDomain = hostname.includes('localhost') ||
                       hostname.includes('vercel.app') ||
                       hostname === 'zenex.app' ||
                       hostname === 'www.zenex.app';

  // Public site serving (custom domains or preview paths)
  if (!isMainDomain || pathname.startsWith('/preview/')) {
    return handlePublicSiteRequest(request, hostname, pathname);
  }

  // Protected routes - dashboard and editor
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/editor')) {
    const authToken = request.cookies.get('auth-token')?.value;
    
    if (!authToken) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

async function handlePublicSiteRequest(
  request: NextRequest,
  hostname: string,
  pathname: string
): Promise<NextResponse> {
  let userId = '';
  let projectId = '';

  // Extract from preview path: /preview/userId/projectId
  if (pathname.startsWith('/preview/')) {
    const parts = pathname.split('/').filter(Boolean);
    if (parts.length >= 3) {
      userId = parts[1];
      projectId = parts[2];
    }
  } else {
    // Subdomain format: projectId-userId.zenex.app
    const subdomain = hostname.split('.')[0];
    const match = subdomain.match(/^(.+)-(.+)$/);
    
    if (match) {
      projectId = match[1];
      userId = match[2];
    }
  }

  if (!userId || !projectId) {
    return new NextResponse('Invalid site configuration', { status: 404 });
  }

  // Determine file to serve
  const filePath = pathname === '/' || pathname === `/preview/${userId}/${projectId}` 
    ? 'index.html' 
    : pathname.split('/').pop() || 'index.html';

  // Use jsDelivr CDN
  const cdnUrl = `https://cdn.jsdelivr.net/gh/${GITHUB_OWNER}/${GITHUB_REPO}@main/users/${userId}/${projectId}/${filePath}`;

  try {
    // Create timeout controller
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    // Fetch from GitHub CDN
    const response = await fetch(cdnUrl, {
      headers: {
        'User-Agent': 'ZENEX-AI-Bot',
      },
      signal: controller.signal,
    }).finally(() => clearTimeout(timeoutId));

    if (!response.ok) {
      return new NextResponse('Site not found', { status: 404 });
    }

    const content = await response.text();
    const contentType = response.headers.get('content-type') || 'text/html';

    // Return with proper caching headers
    return new NextResponse(content, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=60, stale-while-revalidate=86400',
        'X-Zenex-Served': 'edge',
      },
    });
  } catch (error) {
    console.error('Error fetching site:', error);
    return new NextResponse('Error loading site', { status: 500 });
  }
}