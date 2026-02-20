import './App.css';
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './contexts/AppContext';
import UserSelection from './pages/UserSelection.tsx';
import Home from './pages/Home.tsx';
import BookDetail from './pages/BookDetail.tsx';
import Questionnaire from './pages/Questionnaire.tsx';
import AddBook from './pages/AddBook.tsx';
import Loading from './components/Loading';
import ScrollToTop from './components/ScrollTop.tsx';

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      id="app-scroll-container"
      className="h-dvh w-full overflow-y-auto overflow-x-hidden bg-gradient-to-br from-pink-50 to-white pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]"
    >
      {loading ? (
        <Loading />
      ) : (
        <AppProvider>
          <Router>
            <div className="min-h-dvh">
              <ScrollToTop />
              <Routes>
                <Route path="/" element={<UserSelection />} />
                <Route path="/home" element={<Home />} />
                <Route path="/book/:bookId" element={<BookDetail />} />
                <Route path="/questionnaire/:bookId" element={<Questionnaire />} />
                <Route path="/add-book" element={<AddBook />} />
                <Route path="*" element={<Navigate to="/" />} />
              </Routes>
            </div>
          </Router>
        </AppProvider>
      )}
    </div>
  );
}

export default App;
