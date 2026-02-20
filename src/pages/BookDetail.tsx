import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { FaStar, FaRegStar } from 'react-icons/fa';
import type { Book, Response } from '../types';

const BookDetail = () => {
  const { bookId } = useParams<{ bookId: string }>();
  const { books, getBookResponses, currentUser, updateBook } = useApp();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [editedBook, setEditedBook] = useState<Partial<Book>>({});

  if (!bookId) {
    navigate('/home');
    return null;
  }

  const book = books.find((book: Book) => book.id === parseInt(bookId));

  if (!book) {
    navigate('/home');
    return null;
  }

  const responses = getBookResponses(parseInt(bookId));
  const currentUserName = currentUser || 'Manon'; // Default to 'Manon' if currentUser is null
  const otherUser = currentUserName === 'Manon' ? 'Jerina' : 'Manon';
  const currentUserResponse = currentUserName === 'Manon' ? responses.manon : responses.jerina;
  const otherUserResponse = currentUserName === 'Manon' ? responses.jerina : responses.manon;

  const handleSave = async () => {
    if (!bookId) return;
    
    try {
      await updateBook(parseInt(bookId), editedBook);
      setIsEditing(false);
      setEditedBook({});
    } catch (error) {
      console.error('Error updating book:', error);
    }
  };

  const renderResponse = (response: Response | undefined, user: string) => {
    const isCurrentUser = user === currentUserName;
    
    return (
      <div className="space-y-4 relative group">
        {isCurrentUser && response && (
          <button
            onClick={() => navigate(`/questionnaire/${bookId}`)}
            className="absolute -top-2 -right-2 p-1.5 bg-pink-100 text-pink-600 hover:bg-pink-600 hover:text-white rounded-full transition-colors"
            aria-label="Edit your response"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-pink-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
        )}
        <h2 className="text-2xl font-semibold text-pink-800">
          {isCurrentUser ? 'Your Thoughts' : `${user}'s Thoughts`}
        </h2>
        {response ? (
          <>
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Rating</h4>
            <div className="flex items-center">
              {[1, 2, 3, 4, 5].map((star) => (
                star <= response.rating ? (
                  <FaStar key={star} className="h-5 w-5 text-yellow-400" />
                ) : (
                  <FaRegStar key={star} className="h-5 w-5 text-yellow-400" />
                )
              ))}
              <span className="ml-2 text-gray-600">({response.rating}/5)</span>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-700">Favorite Character</h4>
            <p className="text-gray-800">{response.favoriteCharacter}</p>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-700">Favorite Quote</h4>
            <p className="text-gray-800 italic">"{response.favoriteQuote}"</p>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-700">Discussion Question</h4>
            <div className="text-gray-800 space-y-1">
              {Array.isArray((response as any).discussionQuestions) ? (
                (response as any).discussionQuestions
                  .filter((q: unknown) => typeof q === 'string' && q.trim().length > 0)
                  .map((q: string, idx: number) => (
                    <p key={idx}>{q}</p>
                  ))
              ) : (
                <p>{(response as any).discussionQuestion}</p>
              )}
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-700">Thoughts</h4>
            <p className="text-gray-800 whitespace-pre-line">{response.thoughts}</p>
          </div>
        </>
      ) : (
        <p className="text-gray-500 italic">{user} hasn’t shared their thoughts yet 🌷</p>
      )}
    </div>
  );
};

  return (
    <div className="w-full p-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <button 
            onClick={() => navigate(-1)}
            className="inline-flex items-center text-sm font-medium p-2 rounded-lg bg-pink-100 text-pink-700 hover:bg-pink-200 transition-colors mb-4"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back
          </button>
          <div className="flex items-start gap-4">
            <div className="flex-1 w-full">
              <div className="flex items-center gap-2">
                {isEditing ? (
                  <input
                    type="text"
                    value={editedBook.title || book.title}
                    onChange={(e) => setEditedBook({...editedBook, title: e.target.value})}
                    className="text-3xl font-bold text-pink-800 bg-white border border-pink-200 rounded px-2 py-1 w-auto min-w-[200px]"
                  />
                ) : (
                  <h1 className="text-3xl font-bold text-pink-800">{book.title}</h1>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-lg text-gray-600">by</span>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedBook.author || book.author}
                    onChange={(e) => setEditedBook({...editedBook, author: e.target.value})}
                    className="text-lg text-gray-600 bg-white border border-pink-200 rounded px-2 py-1 w-auto min-w-[150px]"
                  />
                ) : (
                  <span className="text-lg text-gray-600">{book.author}</span>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsEditing(!isEditing);
                    if (!isEditing) {
                      setEditedBook({ title: book.title, author: book.author });
                    } else {
                      handleSave();
                    }
                  }}
                  className="p-1.5 bg-pink-100 text-pink-600 hover:bg-pink-600 hover:text-white rounded-full transition-colors ml-1"
                  aria-label={isEditing ? 'Save changes' : 'Edit book details'}
                >
                  {isEditing ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              {renderResponse(currentUserResponse, currentUserName)}
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              {renderResponse(otherUserResponse, otherUser)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookDetail;
