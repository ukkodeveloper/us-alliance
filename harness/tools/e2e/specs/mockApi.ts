import type { Page, Route } from '@playwright/test';

type Content = {
  id: number;
  title: string;
  body: string;
  categories: string[];
  link_url?: string | null;
  status: 'public' | 'private';
  publish_status: 'draft' | 'scheduled' | 'published';
  published_at: string | null;
  notification_status?: { has_notification: boolean; send_status: string };
};

type Notification = {
  id: number;
  content_id: number;
  title: string;
  target_type: string;
  send_status: 'pending' | 'sent' | 'failed';
  scheduled_at: string;
  stats?: { success_count: number; failure_count: number } | null;
};

export type MockState = {
  contents: Content[];
  notifications: Notification[];
  schedules: Record<number, string | null>;
  requests: { method: string; path: string; body: unknown }[];
  failNext?: { method: string; pathIncludes: string; status: number; error: string };
};

export function createState(): MockState {
  return {
    contents: [
      {
        id: 7,
        title: '60화. 경제지표 바로 알고 갑시다',
        body: '본문',
        categories: ['macroEconomics'],
        status: 'private',
        publish_status: 'draft',
        published_at: null,
        notification_status: { has_notification: false, send_status: 'pending' },
      },
    ],
    notifications: [],
    schedules: {},
    requests: [],
  };
}

function ok(route: Route, data: unknown, status = 200) {
  return route.fulfill({ status, json: { success: true, data } });
}

export async function mockApi(page: Page, state: MockState, { loggedIn = true } = {}) {
  if (loggedIn) {
    await page.addInitScript(() => {
      localStorage.setItem('us-alliance:tokens', JSON.stringify({ accessToken: 'access', refreshToken: 'refresh' }));
    });
  }
  await page.route('**/api/v1/**', async route => {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.pathname;
    const method = request.method();
    const body = request.postDataJSON() as Record<string, unknown> | null;
    state.requests.push({ method, path, body });

    const fail = state.failNext;
    if (fail != null && fail.method === method && path.includes(fail.pathIncludes)) {
      state.failNext = undefined;
      return route.fulfill({ status: fail.status, json: { success: false, error: fail.error } });
    }

    const contentMatch = path.match(/^\/api\/v1\/contents\/(\d+)(\/\w+)?$/);
    const contentId = contentMatch == null ? null : Number(contentMatch[1]);
    const content = state.contents.find(item => item.id === contentId);

    if (path === '/api/v1/auth/login' && method === 'POST') {
      return ok(route, {
        access_token: 'access',
        refresh_token: 'refresh',
        access_expires_at: '2099-01-01T00:00:00Z',
        refresh_expires_at: '2099-01-01T00:00:00Z',
        user: { id: 1, email: body?.email, created_at: '2026-01-01T00:00:00Z' },
      });
    }
    if (path === '/api/v1/contents' && method === 'GET') {
      return ok(route, { contents: state.contents, page: 1, limit: 10, total: state.contents.length });
    }
    if (path === '/api/v1/contents' && method === 'POST') {
      const created: Content = {
        id: 100 + state.contents.length,
        title: String(body?.title),
        body: String(body?.body),
        categories: body?.categories as string[],
        link_url: (body?.link_url as string | undefined) ?? null,
        status: 'private',
        publish_status: 'draft',
        published_at: null,
        notification_status: { has_notification: false, send_status: 'pending' },
      };
      state.contents.unshift(created);
      return ok(route, created, 201);
    }
    if (content != null && contentMatch?.[2] == null && method === 'GET') {
      return ok(route, content);
    }
    if (content != null && contentMatch?.[2] == null && method === 'PUT') {
      Object.assign(content, body);
      return ok(route, content);
    }
    if (content != null && contentMatch?.[2] === '/status' && method === 'PATCH') {
      content.status = body?.status as 'public' | 'private';
      if (content.status === 'public') {
        content.publish_status = 'published';
        content.published_at = new Date().toISOString();
        state.schedules[content.id] = null;
      } else {
        content.publish_status = 'draft';
      }
      return ok(route, content);
    }
    if (content != null && contentMatch?.[2] === '/schedule') {
      if (method === 'GET') {
        const scheduledAt = state.schedules[content.id] ?? null;
        return ok(route, { content_id: content.id, is_scheduled: scheduledAt != null, published_at: scheduledAt ?? content.published_at });
      }
      if (method === 'POST' || method === 'PUT') {
        state.schedules[content.id] = String(body?.published_at);
        content.publish_status = 'scheduled';
        content.published_at = String(body?.published_at);
        return ok(route, { content_id: content.id, is_scheduled: true, published_at: body?.published_at });
      }
      if (method === 'DELETE') {
        state.schedules[content.id] = null;
        content.publish_status = content.status === 'public' ? 'published' : 'draft';
        return ok(route, { content_id: content.id, is_scheduled: false, published_at: null });
      }
    }
    if (content != null && contentMatch?.[2] === '/notification' && method === 'GET') {
      return ok(route, state.notifications.find(item => item.content_id === content.id) ?? null);
    }
    if (path === '/api/v1/notifications' && method === 'GET') {
      return ok(route, { notifications: state.notifications, page: 1, limit: 10, total: state.notifications.length });
    }
    if (path === '/api/v1/notifications' && method === 'POST') {
      const scheduledAt = body?.scheduled_at as string | undefined;
      const created: Notification = {
        id: 1000 + state.notifications.length,
        content_id: Number(body?.content_id),
        title: String(body?.title),
        target_type: String(body?.target_type),
        send_status: scheduledAt == null ? 'sent' : 'pending',
        scheduled_at: scheduledAt ?? new Date().toISOString(),
        stats: scheduledAt == null ? { success_count: 10, failure_count: 0 } : null,
      };
      state.notifications.unshift(created);
      const target = state.contents.find(item => item.id === created.content_id);
      if (target != null) {
        target.notification_status = { has_notification: true, send_status: created.send_status };
      }
      return ok(route, created, 201);
    }
    const notificationMatch = path.match(/^\/api\/v1\/notifications\/(\d+)(\/schedule)?$/);
    if (notificationMatch != null) {
      const id = Number(notificationMatch[1]);
      const notification = state.notifications.find(item => item.id === id);
      if (notification != null && method === 'DELETE') {
        state.notifications = state.notifications.filter(item => item.id !== id);
        const target = state.contents.find(item => item.id === notification.content_id);
        if (target != null) {
          target.notification_status = { has_notification: false, send_status: 'pending' };
        }
        return ok(route, null);
      }
      if (notification != null && method === 'PUT') {
        Object.assign(notification, body);
        return ok(route, notification);
      }
    }
    return route.fulfill({ status: 404, json: { success: false, error: `mock 없음: ${method} ${path}` } });
  });
}
