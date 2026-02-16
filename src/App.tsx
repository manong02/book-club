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

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="h-screen w-full overflow-y-auto bg-gradient-to-br from-pink-50 to-white">
      {loading ? (
        <Loading />
      ) : (
        <AppProvider>
          <Router>
            <Routes>
              <Route path="/" element={<UserSelection />} />
              <Route path="/home" element={<Home />} />
              <Route path="/book/:bookId" element={<BookDetail />} />
              <Route path="/questionnaire/:bookId" element={<Questionnaire />} />
              <Route path="/add-book" element={<AddBook />} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </Router>
        </AppProvider>
      )}
    </div>
  );
}

export default App;
