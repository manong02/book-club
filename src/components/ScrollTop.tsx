import { useLayoutEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function ScrollToTop() {
  const location = useLocation();

  useLayoutEffect(() => {
    const scroll = () => {
      const container = document.getElementById('app-scroll-container');
      const root = document.getElementById('root');

      if (container) {
        container.scrollTop = 0;

        try {
          container.scrollTo({ top: 0, behavior: 'auto' });
        } catch {
          // ignore
        }
      }

      if (root) {
        root.scrollTop = 0;

        try {
          root.scrollTo({ top: 0, behavior: 'auto' });
        } catch {
          // ignore
        }
      }

      try {
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      } catch {
        window.scrollTo(0, 0);
      }
    };

    scroll();
    requestAnimationFrame(scroll);
    setTimeout(scroll, 0);
  }, [location.key]);

  return null;
}