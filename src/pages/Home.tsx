import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import type { Book } from '../types';
import ConfirmationModal from '../components/ConfirmationModal';

const Home = () => {
  const { currentUser, books, getBookResponses, completeBookMeeting, deleteBook } = useApp();
  const navigate = useNavigate();
  const [bookToDelete, setBookToDelete] = useState<Book | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const currentBook = books.find((book: Book) => book.status === 'current');
  const waitingBooks = books
    .filter((book: Book) => book.status === 'waiting')
    .sort((a: Book, b: Book) => (a.addedAt && b.addedAt ? new Date(a.addedAt).getTime() - new Date(b.addedAt).getTime() : 0));
  const previousBooks = books
    .filter((book: Book) => book.status === 'read')
    .sort((a: Book, b: Book) => (a.addedAt && b.addedAt ? new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime() : 0));

  const handleDeleteClick = (book: Book, e: React.MouseEvent) => {
    e.stopPropagation();
    setBookToDelete(book);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (bookToDelete) {
      try {
        await deleteBook(bookToDelete.id);
      } catch (error) {
        console.error('Error deleting book:', error);
      } finally {
        setIsDeleteModalOpen(false);
        setBookToDelete(null);
      }
    }
  };
    
  // Check response status for the current book
  const currentBookResponses = currentBook ? getBookResponses(currentBook.id) : { manon: undefined, jerina: undefined };
  const otherUser = currentUser === 'Manon' ? 'Jerina' : 'Manon';
  const currentUserResponded = currentBook ? Boolean(currentUser === 'Manon' ? currentBookResponses.manon : currentBookResponses.jerina) : false;
  const otherUserResponded = currentBook ? Boolean(otherUser === 'Manon' ? currentBookResponses.manon : currentBookResponses.jerina) : false;

  const handleReadBook = (bookId: number) => {
    navigate(`/questionnaire/${bookId}`);
  };

  if (!currentUser) {
    navigate('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white p-6">
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Say goodbye to this book?"
        message={
          <span>
            Are you sure you want to say goodbye to <span className="text-pink-600 font-medium">"{bookToDelete?.title}"</span>? It will be permanently removed from your club.
          </span>
        }
        confirmText="Say goodbye"
      />
      <header className="max-w-4xl mx-auto mb-4">
        <h1 className="text-3xl font-bold text-pink-800 text-center mb-2">Book Club💗</h1>
       
      </header>

      <main className="max-w-4xl mx-auto space-y-5">
        <div className="flex justify-between items-center mb-4 mt-8">
             <p className="text-center text-pink-700 font-semibold">Welcome back, {currentUser}!</p>         
          <button 
            onClick={() => navigate('/add-book')}
            className="bg-pink-400 hover:bg-pink-500 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center"
          >
            <span className="mr-2">+</span> Add New Book
          </button>
        </div>
        
        {currentBook && (
          <section 
            onClick={() => navigate(`/book/${currentBook.id}`)}
            className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer"
          >
            <h2 className="text-2xl font-semibold text-pink-800 mb-4">Current Book</h2>
            <div className="flex flex-col">
             <div className="flex flex-col md:flex-row md:justify-between md:items-start">
                <div className="flex items-start space-x-4 flex-1">
                  {(currentBook.imageFile || currentBook.coverImage) && (
                    <div className="flex-shrink-0 w-20 h-28 bg-gray-100 rounded overflow-hidden">
                      <img
                        src={currentBook.imageFile || currentBook.coverImage}
                        alt={`${currentBook.title} cover`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-800">{currentBook.title}</h3>
                    <p className="text-gray-600">by {currentBook.author}</p>
                    {currentBook.genre && (
                      <span className="inline-block mt-1 px-2 py-1 text-xs font-medium bg-pink-100 text-pink-800 rounded-full">
                        {currentBook.genre}
                      </span>
                    )}
                    {currentUserResponded && otherUserResponded && (
                      <div className="mt-2 text-sm text-pink-600 font-semibold">
                        Your book match is ready!
                      </div>
                    )}
                  </div>
                </div>
                <div  className="mt-4 md:mt-0 md:self-end" onClick={e => e.stopPropagation()}>
                  {!currentUserResponded ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleReadBook(currentBook.id);
                      }}
                      className="whitespace-nowrap bg-pink-400 hover:bg-pink-500 text-white font-medium py-2 px-4 rounded transition-colors duration-200"
                    >
                      I've read it!
                    </button>
                  ) : !otherUserResponded ? (
                    <div className="whitespace-nowrap py-2 px-4 bg-pink-50 text-pink-700 rounded text-sm text-center md:text-right border border-pink-100">
                      Waiting for {otherUser}...
                    </div>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        completeBookMeeting(currentBook.id);
                      }}
className="whitespace-nowrap bg-purple-400 hover:bg-purple-500 text-white font-medium py-2 px-4 rounded transition-colors duration-200 w-full"                    >
                      Chapter Closed ✨
                    </button>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Waiting List Section */}
        {waitingBooks.length > 0 && (
          <section className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-pink-800 mb-4">Waiting List</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {waitingBooks.map((book: Book) => (
                <div 
                  key={book.id} 
                  className="border border-pink-100 rounded-lg p-4 bg-pink-50 hover:bg-pink-100 transition-colors cursor-pointer relative group"
                  onClick={() => navigate(`/book/${book.id}`)}
                >
                  <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/book/${book.id}`, { state: { edit: true } });
                      }}
                      className="p-1.5 bg-pink-100 text-pink-600 hover:bg-pink-600 hover:text-white rounded-full transition-colors group"
                      title="Edit book"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button 
                      onClick={(e) => handleDeleteClick(book, e)}
                      className="p-1.5 bg-pink-100 text-pink-600 hover:bg-pink-600 hover:text-white rounded-full transition-colors"
                      title="Delete book"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                  <div className="flex space-x-3">
                    {(book.imageFile || book.coverImage) && (
                      <div className="flex-shrink-0 w-12 h-16 bg-gray-100 rounded overflow-hidden">
                        <img 
                          src={book.imageFile || book.coverImage} 
                          alt={`${book.title} cover`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="pr-4">
                      <h3 className="font-semibold text-gray-800">{book.title}</h3>
                      <p className="text-sm text-gray-600">by {book.author}</p>
                      {book.genre && (
                        <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-pink-100 text-pink-800 rounded-full">
                          {book.genre}
                        </span>
                      )}
                    </div>
                  </div>
                  {/* <p className="text-xs text-pink-700 mt-2">
                    Added on {book.addedAt ? new Date(book.addedAt).toLocaleDateString() : 'Unknown date'}
                  </p> */}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Previous Books Section */}
        <section className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold text-pink-800 mb-4">Previous Books</h2>
          {previousBooks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {previousBooks.map((book: Book) => (
                  <div 
                    key={book.id} 
                    onClick={() => navigate(`/book/${book.id}`)}
                    className="p-4 border border-pink-100 rounded-lg hover:bg-pink-50 cursor-pointer transition-colors"
                  >
                    <div className="flex space-x-3">
                      {(book.imageFile || book.coverImage) && (
                        <div className="flex-shrink-0 w-12 h-16 bg-gray-100 rounded overflow-hidden">
                          <img 
                            src={book.imageFile || book.coverImage} 
                            alt={`${book.title} cover`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div>
                        <h3 className="font-semibold text-gray-800">{book.title}</h3>
                        <p className="text-sm text-gray-600">by {book.author}</p>
                        {book.genre && (
                          <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-pink-100 text-pink-800 rounded-full">
                            {book.genre}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          ) : (
            <p className="text-gray-500 italic">No previous books yet. Start reading!</p>
          )}
        </section>
      </main>
    </div>
  );
};

export default Home;
