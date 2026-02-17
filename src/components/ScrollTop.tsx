import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    const container = document.getElementById('app-scroll-container');
    if (container) {
      container.scrollTo({ top: 0, behavior: 'auto' });
    }
  }, [pathname]);

  return null;
}