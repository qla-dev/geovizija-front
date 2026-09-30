import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Layout } from './components/Layout';
import { ContentProvider } from './components/ContentProvider';
import { HomePage } from './pages/HomePage';
import { CategoryPage } from './pages/CategoryPage';
import { ArticlePage } from './pages/ArticlePage';
import { CategoryNewsPage } from './pages/CategoryNewsPage';
import { QuizHomePage } from './pages/QuizHomePage';
import { QuizPlayPage } from './pages/QuizPlayPage';
import { PublishPage } from './pages/PublishPage';

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
      <ContentProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/categories" element={<CategoryPage />} />
          <Route path="/category/:categoryId" element={<CategoryNewsPage />} />
          <Route path="/article/:id" element={<ArticlePage />} />
          <Route path="/quiz" element={<QuizHomePage />} />
          <Route path="/quiz/:date" element={<QuizPlayPage />} />
          <Route path="/objavi" element={<PublishPage />} />
          <Route path="*" element={<div className="p-10 text-center">404 - Stranica nije pronađena</div>} />
        </Routes>
      </Layout>
      </ContentProvider>
    </Router>
  );
};

export default App;
