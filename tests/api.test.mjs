import assert from 'node:assert/strict';
import { after, before, test } from 'node:test';
import { createServer } from 'vite';

let server;
let api;
const originalFetch = globalThis.fetch;

before(async () => {
  server = await createServer({
    configFile: false,
    optimizeDeps: { noDiscovery: true, include: [] },
    server: { middlewareMode: true, watch: null, hmr: false, ws: false },
  });
  ({ api } = await server.ssrLoadModule('/services/api.ts'));
});

after(async () => {
  globalThis.fetch = originalFetch;
  await server?.close();
});

test('loads the entire archive in page order and keeps filters on every request', async () => {
  const articles = Array.from({ length: 615 }, (_, i) => ({
    id: String(i + 1), categoryId: 'putovanja', title: `Article ${i + 1}`,
  }));
  const requestedPages = [];

  globalThis.fetch = async url => {
    const query = new URL(url).searchParams;
    assert.equal(query.get('category'), 'putovanja');
    assert.equal(query.get('search'), 'grad & rijeka');
    assert.equal(query.get('featured'), '1');
    assert.equal(query.get('per_page'), '100');
    const page = Number(query.get('page') || 1);
    requestedPages.push(page);
    // Later pages deliberately arrive first.
    await new Promise(resolve => setTimeout(resolve, (8 - page) * 2));
    return Response.json({
      data: articles.slice((page - 1) * 100, page * 100),
      meta: { current_page: page, last_page: 7, total: articles.length },
    });
  };

  const result = await api.posts({ category: 'putovanja', search: 'grad & rijeka', featured: true });
  assert.deepEqual(result, articles);
  assert.deepEqual(requestedPages, [1, 2, 3, 4, 5, 6, 7]);
});

test('uses the server page count even when the requested batch size is capped', async () => {
  const requestedPages = [];
  globalThis.fetch = async url => {
    const query = new URL(url).searchParams;
    assert.equal(query.get('per_page'), '1000');
    const page = Number(query.get('page') || 1);
    requestedPages.push(page);
    return Response.json({
      data: [{ id: String(page) }],
      meta: { current_page: page, last_page: 2, total: 2 },
    });
  };

  assert.deepEqual(await api.posts({ perPage: 1000 }), [{ id: '1' }, { id: '2' }]);
  assert.deepEqual(requestedPages, [1, 2]);
});

test('does not request extra pages for single-page or empty archives', async () => {
  for (const data of [[{ id: '1' }], []]) {
    let requests = 0;
    globalThis.fetch = async () => {
      requests++;
      return Response.json({ data, meta: { current_page: 1, last_page: 1, total: data.length } });
    };
    assert.deepEqual(await api.posts(), data);
    assert.equal(requests, 1);
  }
});

test('rejects a failed later page instead of returning an incomplete archive', async () => {
  globalThis.fetch = async url => {
    if (new URL(url).searchParams.get('page') === '2') {
      return Response.json({ message: 'Temporary failure' }, { status: 503 });
    }
    return Response.json({
      data: [{ id: '1' }], meta: { current_page: 1, last_page: 2, total: 2 },
    });
  };

  await assert.rejects(api.posts(), error => error.status === 503);
});
