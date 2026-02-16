import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Book, Response, User } from '../types';

interface AppContextType {
  currentUser: User | null;
  setCurrentUser: (user: User | null) => void;
  books: Book[];
  responses: Response[];
  addResponse: (response: Omit<Response, 'id' | 'createdAt'>) => void;
  getBookResponses: (bookId: number) => { manon?: Response; jerina?: Response };
  markBookAsRead: (bookId: number) => void;
  addBook: (book: Omit<Book, 'id' | 'isCurrent' | 'status' | 'addedAt'>) => void;
  updateBook: (bookId: number, updates: Partial<Book>) => Promise<void>;
  completeBookMeeting: (bookId: number) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

//todo: remove hardcoded books
const initialBooks: Book[] = [
  {
    id: 1,
    title: "The Midnight Library",
    author: "Matt Haig",
    isCurrent: false,
    status: 'read',
    addedAt: new Date('2023-01-01').toISOString()
  },
  {
    id: 2,
    title: "Project Hail Mary",
    author: "Andy Weir",
    isCurrent: false,
    status: 'read',
    addedAt: new Date('2023-02-01').toISOString()
  },
  {
    id: 3,
    title: "The House in the Cerulean Sea",
    author: "TJ Klune",
    isCurrent: false,
    status: 'read',
    coverImage: "https://images-na.ssl-images-amazon.com/images/I/71Xw6KZ2BRL._AC_UL600_SR600,400_.jpg",
    addedAt: new Date('2023-03-01').toISOString()
  },
];

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    return localStorage.getItem('bookClubUser') as User || null;
  });
  
  const [books, setBooks] = useState<Book[]>(() => {
    const savedBooks = localStorage.getItem('bookClubBooks');
    return savedBooks ? JSON.parse(savedBooks) : initialBooks;
  });
  
  const [responses, setResponses] = useState<Response[]>(() => {
    const savedResponses = localStorage.getItem('bookClubResponses');
    return savedResponses ? JSON.parse(savedResponses) : [];
  });

  // Save to localStorage whenever state changes
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('bookClubUser', currentUser);
    }
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('bookClubBooks', JSON.stringify(books));
  }, [books]);

  useEffect(() => {
    localStorage.setItem('bookClubResponses', JSON.stringify(responses));
  }, [responses]);

  const addResponse = (response: Omit<Response, 'id' | 'createdAt'>) => {
    setResponses(prevResponses => {
      // Check if this user already has a response for this book
      const existingResponseIndex = prevResponses.findIndex(
        r => r.bookId === response.bookId && r.user === response.user
      );

      let updatedResponses;
      
      if (existingResponseIndex >= 0) {
        // Update existing response
        const existingResponse = prevResponses[existingResponseIndex];
        updatedResponses = [...prevResponses];
        updatedResponses[existingResponseIndex] = {
          ...existingResponse,
          ...response,
          // Keep the original creation date
          createdAt: existingResponse.createdAt
        };
      } else {
        // Create new response
        const newResponse: Response = {
          ...response,
          id: Date.now(),
          createdAt: new Date().toISOString(),
        };
        updatedResponses = [...prevResponses, newResponse];
      }

      // Save to localStorage
      localStorage.setItem('bookClubResponses', JSON.stringify(updatedResponses));
      return updatedResponses;
    });
  };

  const addBook = (bookData: Omit<Book, 'id' | 'isCurrent' | 'status' | 'addedAt'>) => {
    const hasCurrentBook = books.some(book => book.isCurrent);
    
    const newBook: Book = {
      ...bookData,
      id: Date.now(),
      isCurrent: !hasCurrentBook, // Set as current only if there's no current book
      status: hasCurrentBook ? 'waiting' : 'current',
      addedAt: new Date().toISOString()
    };
    
    let updatedBooks: Book[];
    
    if (hasCurrentBook) {
      // If there's already a current book, just add the new one to waiting list
      updatedBooks = [...books, newBook];
    } else {
      // If no current book, make this one current
      updatedBooks = [...books, newBook];
    }
    
    setBooks(updatedBooks);
    localStorage.setItem('bookClubBooks', JSON.stringify(updatedBooks));
  };

  const getBookResponses = (bookId: number) => {
    const bookResponses = responses.filter(r => r.bookId === bookId);
    return {
      manon: bookResponses.find(r => r.user === 'Manon'),
      jerina: bookResponses.find(r => r.user === 'Jerina'),
    };
  };

  const updateBook = async (bookId: number, updates: Partial<Book>) => {
    const updatedBooks = books.map(book => {
      if (book.id === bookId) {
        return { ...book, ...updates };
      }
      return book;
    });
    setBooks(updatedBooks);
  };

  const completeBookMeeting = (bookId: number) => {
    const updatedBooks = books.map(book => {
      if (book.id === bookId) {
        return { 
          ...book, 
          isCurrent: false, 
          status: 'read' as const
        };
      }
      return book;
    });

    // Find the next book in the waiting list (oldest first)
    const nextBook = [...updatedBooks]
      .filter(book => book.status === 'waiting')
      .sort((a, b) => (a.addedAt && b.addedAt ? 
        new Date(a.addedAt).getTime() - new Date(b.addedAt).getTime() : 0))[0];

    // If there's a book in the waiting list, make it current
    if (nextBook) {
      updatedBooks.forEach((book, index) => {
        if (book.id === nextBook.id) {
          updatedBooks[index] = { 
            ...book, 
            isCurrent: true, 
            status: 'current' as const
          };
        }
      });
    }

    setBooks(updatedBooks);
  };

  const markBookAsRead = () => {
    // This function is now just for marking a book as read by a single user
    // It doesn't change the book's status to 'read' or move it to previous books
    // The response is already added by the addResponse function, so we just need to ensure it's saved
    localStorage.setItem('bookClubResponses', JSON.stringify(responses));
  };

  return (
    <AppContext.Provider 
      value={{ 
        currentUser, 
        setCurrentUser, 
        books,
        responses,
        addResponse,
        getBookResponses,
        markBookAsRead,
        addBook,
        updateBook,
        completeBookMeeting
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
