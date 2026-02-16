import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Layout } from './components/Layout';
import { HomePage } from './pages/HomePage';
import { CategoryPage } from './pages/CategoryPage';
import { ArticlePage } from './pages/ArticlePage';
import { CategoryNewsPage } from './pages/CategoryNewsPage';

// Scroll to top component that listens to location changes
const ScrollToTop = () => {
  const { pathname } = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

const App: React.FC = () => {
  return (
    <Router>
      <ScrollToTop />
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/categories" element={<CategoryPage />} />
          <Route path="/category/:categoryId" element={<CategoryNewsPage />} />
          <Route path="/article/:id" element={<ArticlePage />} />
          <Route path="*" element={<div className="p-10 text-center">404 - Stranica nije pronađena</div>} />
        </Routes>
      </Layout>
    </Router>
  );
};

export default App;
