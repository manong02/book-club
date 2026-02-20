import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import type { Book } from '../types';

type SectionKey = 'waiting' | 'previous';

type Props = {
  className?: string;
  initialSection?: SectionKey;
  showOnRoutes?: string[];
};

function sortWaitingOldestFirst(a: Book, b: Book) {
  const ta = a.addedAt ? new Date(a.addedAt).getTime() : 0;
  const tb = b.addedAt ? new Date(b.addedAt).getTime() : 0;
  return ta - tb;
}

function sortReadNewestFirst(a: Book, b: Book) {
  const ta = a.addedAt ? new Date(a.addedAt).getTime() : 0;
  const tb = b.addedAt ? new Date(b.addedAt).getTime() : 0;
  return tb - ta;
}

export default function FullscreenSidebarMenu({
  className,
  initialSection = 'waiting',
  showOnRoutes,
}: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const { books } = useApp();

  const [open, setOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<SectionKey>(initialSection);
  const [contentKey, setContentKey] = useState(0);
  const [isStandalone, setIsStandalone] = useState(false);

  const isHome = location.pathname === '/home';

  const isVisible =
    !showOnRoutes || showOnRoutes.length === 0
      ? true
      : showOnRoutes.includes(location.pathname);

  const waitingBooks = useMemo(
    () =>
      books
        .filter(b => b.status === 'waiting')
        .slice()
        .sort(sortWaitingOldestFirst),
    [books]
  );

  const previousReads = useMemo(
    () =>
      books
        .filter(b => b.status === 'read')
        .slice()
        .sort(sortReadNewestFirst),
    [books]
  );

  const displayedWaiting = isHome ? waitingBooks.slice(0, 1) : waitingBooks;
  const displayedPrevious = isHome ? previousReads.slice(0, 3) : previousReads;

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const mql = window.matchMedia('(display-mode: standalone)');

    const update = () => setIsStandalone(Boolean(mql.matches));
    update();

    if (typeof mql.addEventListener === 'function') {
      mql.addEventListener('change', update);
      return () => mql.removeEventListener('change', update);
    }

    mql.addListener(update);
    return () => mql.removeListener(update);
  }, []);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };

    window.addEventListener('keydown', onKeyDown);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  const handleNavigateToBook = (bookId: number) => {
    setOpen(false);
    navigate(`/book/${bookId}`);
  };

  const renderBookRow = (book: Book, index: number) => {
    const cover = book.imageFile || book.coverImage;

    return (
      <button
        key={book.id}
        type="button"
        onClick={() => handleNavigateToBook(book.id)}
        className={[
          'w-full text-left rounded-xl border border-pink-100 bg-white',
          'hover:bg-pink-50 active:bg-pink-100',
          'transition-colors',
          'px-4 py-3',
          'flex items-start gap-3',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-300',
          'opacity-0 translate-y-1',
          open ? 'animate-[menuItemIn_420ms_ease_forwards]' : '',
        ].join(' ')}
        style={{
          transitionDelay: `${110 + index * 55}ms`,
          animationDelay: `${110 + index * 55}ms`,
        }}
      >
        {cover ? (
          <div className="h-14 w-10 shrink-0 overflow-hidden rounded-md bg-pink-50">
            <img
              src={cover}
              alt={`${book.title} cover`}
              className="h-full w-full object-cover"
            />
          </div>
        ) : (
          <div className="h-14 w-10 shrink-0 rounded-md bg-pink-50" />
        )}

        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold text-gray-900">
            {book.title}
          </div>
          <div className="truncate text-xs text-gray-600">by {book.author}</div>

          {book.genre ? (
            <div className="mt-2 inline-flex max-w-full items-center rounded-full bg-pink-50 px-2 py-0.5 text-[11px] text-pink-800">
              <span className="truncate">{book.genre}</span>
            </div>
          ) : null}
        </div>
      </button>
    );
  };

  const sectionTitle =
    activeSection === 'waiting'
      ? isHome
        ? 'Waiting List'
        : 'Waiting List'
      : 'Previous Reads';

  const sectionBooks = activeSection === 'waiting' ? displayedWaiting : displayedPrevious;

  const handleSelectSection = (key: SectionKey) => {
    if (key === activeSection) return;
    setActiveSection(key);
    setContentKey(v => v + 1);
  };

  if (!isVisible) return null;

  return (
    <>
      <style>{`
        @keyframes menuItemIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0px); }
        }
        @keyframes panelIn {
          from { opacity: 0; transform: translateX(18px); }
          to { opacity: 1; transform: translateX(0px); }
        }
      `}</style>

      <div className={className}>
        <button
          type="button"
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          onClick={() => setOpen(v => !v)}
          className={[
            'relative z-50 inline-flex h-10 w-10 items-center justify-center',
            'bg-transparent',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-300 rounded-lg',
          ].join(' ')}
        >
          <span className="sr-only">{open ? 'Close menu' : 'Open menu'}</span>

          <span className="relative h-5 w-6">
            <span
              className={[
                'absolute left-0 top-0 h-[2px] w-6 rounded-full bg-pink-700',
                'transition-transform transition-opacity duration-300 ease-[cubic-bezier(.2,.9,.2,1)]',
                open ? 'translate-y-[9px] rotate-45' : 'translate-y-0 rotate-0',
              ].join(' ')}
            />
            <span
              className={[
                'absolute left-0 top-[9px] h-[2px] w-6 rounded-full bg-pink-700',
                'transition-opacity duration-200 ease-out',
                open ? 'opacity-0' : 'opacity-100',
              ].join(' ')}
            />
            <span
              className={[
                'absolute left-0 top-[18px] h-[2px] w-6 rounded-full bg-pink-700',
                'transition-transform transition-opacity duration-300 ease-[cubic-bezier(.2,.9,.2,1)]',
                open ? 'translate-y-[-9px] -rotate-45' : 'translate-y-0 rotate-0',
              ].join(' ')}
            />
          </span>
        </button>
      </div>

      <div
        className={['fixed inset-0 z-40', open ? 'pointer-events-auto' : 'pointer-events-none'].join(
          ' '
        )}
      >
        <button
          type="button"
          aria-label="Close menu overlay"
          onClick={() => setOpen(false)}
          className={[
            'absolute inset-0',
            'bg-black/20 backdrop-blur-sm',
            'transition-opacity duration-300',
            open ? 'opacity-100' : 'opacity-0',
          ].join(' ')}
        />

        <aside
          role="dialog"
          aria-modal="true"
          className={[
            'absolute right-0 top-0 h-full w-full sm:max-w-md',
            'bg-white',
            'shadow-2xl',
            'transition-transform duration-300 ease-[cubic-bezier(.2,.9,.2,1)]',
            open ? 'translate-x-0' : 'translate-x-full',
          ].join(' ')}
        >
          <div className="flex h-full flex-col">
            <div
              className="px-5 sm:pt-6"
              style={{
                paddingTop: `calc(${isStandalone ? '5rem' : '5rem'} + env(safe-area-inset-top))`,
              }}
            >

              <div className="mt-4 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => handleSelectSection('waiting')}
                  className={[
                    'w-full rounded-xl px-3 py-3 text-left text-md font-semibold transition-colors',
                    activeSection === 'waiting'
                      ? 'bg-pink-600 text-white'
                      : 'bg-pink-50 text-pink-700 hover:bg-pink-100',
                    'focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-300',
                  ].join(' ')}
                >
                  Waiting List
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectSection('previous')}
                  className={[
                    'w-full rounded-xl px-3 py-3 text-left text-md font-semibold transition-colors',
                    activeSection === 'previous'
                      ? 'bg-pink-600 text-white'
                      : 'bg-pink-50 text-pink-700 hover:bg-pink-100',
                    'focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-300',
                  ].join(' ')}
                >
                  Previous Reads
                </button>
              </div>

              <div className="mt-4 flex items-end justify-between">
                <div className="text-base font-semibold text-gray-900">
                  {sectionTitle}
                </div>
                <div className="text-xs font-semibold text-pink-700/80">
                  {sectionBooks.length}
                </div>
              </div>
            </div>

            <div className="mt-4 min-h-0 flex-1 overflow-hidden px-5 pb-6">
              <div
                key={contentKey}
                className="h-full min-h-0 overflow-auto pr-1 opacity-0 translate-x-2 animate-[panelIn_220ms_ease_forwards]"
              >
                {sectionBooks.length > 0 ? (
                  <div className="space-y-3">
                    {sectionBooks.map((b, i) => renderBookRow(b, i))}
                  </div>
                ) : (
                  <div className="rounded-xl border border-pink-100 bg-pink-50 p-4 text-sm text-pink-900">
                    {activeSection === 'waiting'
                      ? 'No books here yet.'
                      : 'No previous reads yet.'}
                  </div>
                )}
              </div>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}
