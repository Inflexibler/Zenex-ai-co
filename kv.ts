// Simple in-memory analytics (for Edge runtime)
// In production, use Vercel KV or Upstash Redis

interface AnalyticsData {
  views: number;
  lastVisit: number;
}

const analyticsCache = new Map<string, AnalyticsData>();

export async function incrementProjectViews(projectId: string): Promise<number> {
  const key = `views:${projectId}`;
  const data = analyticsCache.get(key) || { views: 0, lastVisit: Date.now() };
  
  data.views++;
  data.lastVisit = Date.now();
  
  analyticsCache.set(key, data);
  
  return data.views;
}

export async function getProjectViews(projectId: string): Promise<number> {
  const key = `views:${projectId}`;
  const data = analyticsCache.get(key);
  
  return data?.views || 0;
}

// Clean up old entries (run periodically)
export function cleanupAnalytics() {
  const now = Date.now();
  const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
  
  for (const [key, data] of analyticsCache.entries()) {
    if (now - data.lastVisit > maxAge) {
      analyticsCache.delete(key);
    }
  }
}

// Note: For production with Vercel KV:
// import { kv } from '@vercel/kv';
// 
// export async function incrementProjectViews(projectId: string) {
//   return await kv.incr(`views:${projectId}`);
// }
