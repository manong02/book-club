import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { FaStar, FaRegStar } from 'react-icons/fa';
import type { Book } from '../types';


const Questionnaire = () => {
  const { bookId } = useParams<{ bookId: string }>();
  const { currentUser, books, addResponse, getBookResponses } = useApp();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    rating: 5,
    favoriteCharacter: '',
    favoriteQuote: '',
    discussionQuestion: '',
    thoughts: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  // These are intentionally unused for now but will be implemented in a future update
  const [_isEditMode, _setIsEditMode] = useState(false);
  const [_existingResponse, _setExistingResponse] = useState<any>(null);

  const book = books.find((b: Book) => b.id === parseInt(bookId || '0'));
  
  // Check if user has already submitted a response
  useEffect(() => {
    if (!currentUser || !bookId) {
      navigate('/');
      return;
    }
    
    const responsesForBook = getBookResponses(parseInt(bookId));
    const userResponse = currentUser === 'Manon' ? responsesForBook.manon : responsesForBook.jerina;
    
    if (userResponse) {
      _setExistingResponse(userResponse);
      _setIsEditMode(true);
    }
  }, [currentUser, bookId, getBookResponses, navigate]);

  // Initialize form with existing response data if available
  useEffect(() => {
    if (!currentUser || !bookId) {
      navigate('/');
      return;
    }
    
    const responsesForBook = getBookResponses(parseInt(bookId));
    const userResponse = currentUser === 'Manon' ? responsesForBook.manon : responsesForBook.jerina;
    
    if (userResponse) {
      // Only update if the form is empty to prevent infinite updates
      if (!formData.favoriteCharacter && !formData.favoriteQuote) {
        const { id, bookId, user, createdAt, ...responseData } = userResponse;
        setFormData(responseData);
      }
    }
  // We only want to run this effect once when the component mounts or when the book changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [book?.id, currentUser]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'rating' ? parseInt(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !bookId) return;

    setIsSubmitting(true);
    
    try {
      // In this simplified version, we're just adding responses, not updating
      // The edit mode functionality can be implemented later
      await addResponse({
        bookId: parseInt(bookId),
        user: currentUser,
        ...formData
      });
      
      navigate(`/book/${bookId}`, { replace: true });
    } catch (error) {
      console.error('Error submitting response:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!currentUser || !book) {
    return null;
  }

  return (
    <div className="min-h-screen h-full bg-gradient-to-br from-pink-50 to-white p-6">
      <div className="max-w-2xl mx-auto flex justify-between items-center mb-4">
        <button 
          onClick={() => navigate(-1)}
          className="inline-flex items-center text-sm font-medium p-2 rounded bg-pink-100 text-pink-700 hover:bg-pink-200 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </button>
      </div>
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6 flex flex-col" style={{ minHeight: 'calc(100vh - 8rem)' }}>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-pink-800 mb-2">
            {_isEditMode ? 'Edit Your Thoughts' : 'Share Your Thoughts'}
          </h1>
          <p className="text-gray-600 mt-1">by {book.author}</p>
        </div>
        
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <div className="space-y-3 flex-1">
            <div>
              <label className="block text-gray-700 font-medium mb-3">
                How would you rate this book?
              </label>
              <div className="flex items-center space-x-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, rating: star }))}
                    className="text-3xl focus:outline-none transition-transform hover:scale-110"
                    aria-label={`Rate ${star} out of 5`}
                  >
                    {star <= formData.rating ? (
                      <FaStar className="text-yellow-400" />
                    ) : (
                      <FaRegStar className="text-gray-300 hover:text-yellow-300 transition-colors" />
                    )}
                  </button>
                ))}
                <span className="ml-2 text-gray-600 font-medium">
                  {formData.rating} {formData.rating === 1 ? 'star' : 'stars'}
                </span>
              </div>
            </div>
            
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Favorite Character
              </label>
              <input
                type="text"
                name="favoriteCharacter"
                value={formData.favoriteCharacter}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-pink-400 focus:border-pink-400"
                required
                maxLength={100}
              />
            </div>
            
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Favorite Quote
              </label>
              <textarea
                name="favoriteQuote"
                value={formData.favoriteQuote}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-pink-400 focus:border-pink-400 min-h-[80px]"
                required
                maxLength={300}
              />
            </div>
            
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Discussion Question
              </label>
              <input
                type="text"
                name="discussionQuestion"
                value={formData.discussionQuestion}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-pink-400 focus:border-pink-400"
                required
                maxLength={200}
              />
            </div>
            
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Your Thoughts
              </label>
              <textarea
                name="thoughts"
                value={formData.thoughts}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-pink-400 focus:border-pink-400 min-h-[120px]"
                placeholder="Share your thoughts about the book..."
                required
                maxLength={1000}
              />
            </div>
            <div className="pt-4 mt-auto">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-pink-400 hover:bg-pink-500 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200 disabled:opacity-70 shadow-md"
              >
                {isSubmitting 
                  ? 'Saving...' 
                  : _isEditMode 
                    ? 'Update Your Thoughts' 
                    : 'Submit Your Thoughts'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Questionnaire;
