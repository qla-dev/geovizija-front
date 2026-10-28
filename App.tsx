import React, { Suspense, lazy, useEffect, useLayoutEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ContentProvider } from './components/ContentProvider';
import { HomePage } from './pages/HomePage';
import { CategoryPage } from './pages/CategoryPage';
import { ArticlePage } from './pages/ArticlePage';
import { CategoryNewsPage } from './pages/CategoryNewsPage';
import { QuizHomePage } from './pages/QuizHomePage';
import { QuizPlayPage } from './pages/QuizPlayPage';
import { PublishPage } from './pages/PublishPage';
import { PrivacyPage } from './pages/PrivacyPage';
// Loaded only on /admin, so visitors do not download the panel (and its date picker).
const AdminPage = lazy(() => import('./pages/AdminPage').then(m => ({ default: m.AdminPage })));
import { API_BASE_URL } from './services/api';

// Every new page opens at the top. Runs before paint and again on the next frame, so a
// still-running touch fling on mobile (e.g. tapping a category in the list) cannot override it.
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useLayoutEffect(() => {
    if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
    const toTop = () => window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    toTop();
    const frame = requestAnimationFrame(toTop);
    return () => cancelAnimationFrame(frame);
  }, [pathname]);

  return null;
}

// Counts every page shown (admin statistics): a beacon to the backend on each route change.
// text/plain keeps it a simple request (no CORS preflight); the browser id is random, kept locally.
const PageTracker = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    if (pathname.startsWith('/admin') || !navigator.sendBeacon) return;
    let visitor = '';
    try {
      visitor = localStorage.getItem('geo-visitor') || '';
      if (!visitor) {
        visitor = Math.random().toString(36).slice(2) + Date.now().toString(36);
        localStorage.setItem('geo-visitor', visitor);
      }
    } catch {
      visitor = 'anon';
    }
    const body = JSON.stringify({ p: pathname, r: document.referrer, v: visitor });
    navigator.sendBeacon(`${API_BASE_URL}/track`, new Blob([body], { type: 'text/plain' }));
  }, [pathname]);

  return null;
};

const Site: React.FC = () => (
  <ContentProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/categories" element={<CategoryPage />} />
          <Route path="/category/:categoryId" element={<CategoryNewsPage />} />
          <Route path="/article/:slug" element={<ArticlePage />} />
          <Route path="/quiz" element={<QuizHomePage />} />
          <Route path="/quiz/:date" element={<QuizPlayPage />} />
          <Route path="/objavi" element={<PublishPage />} />
          <Route path="/privatnost" element={<PrivacyPage />} />
          <Route path="*" element={<div className="p-10 text-center">404 - Stranica nije pronađena</div>} />
        </Routes>
      </Layout>
  </ContentProvider>
);

const App: React.FC = () => {
  return (
    <Router>
      <ScrollToTop />
      <PageTracker />
      <Routes>
        {/* The admin panel stands alone, without the site's header, footer and content loading. */}
        <Route path="/admin/*" element={<Suspense fallback={null}><AdminPage /></Suspense>} />
        <Route path="*" element={<Site />} />
      </Routes>
    </Router>
  );
};

export default App;
