import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import { FaStar, FaRegStar } from 'react-icons/fa';
import type { Book } from '../types';

const Questionnaire = () => {
  const { bookId } = useParams<{ bookId: string }>();
  const { currentUser, books, addResponse, getBookResponses } = useApp();
  const navigate = useNavigate();

  type DetailTab = 'favoriteCharacter' | 'favoriteQuote' | 'discussionQuestion';

  type ErrorKey =
    | DetailTab
    | 'thoughts'
    | 'discussionQ1'
    | 'discussionQ2'
    | 'discussionQ3';

  const [formData, setFormData] = useState({
    rating: 5,
    favoriteCharacter: '',
    favoriteQuote: '',
    discussionQuestions: ['', '', ''] as [string, string, string],
    thoughts: ''
  });

  const [activeTab, setActiveTab] = useState<DetailTab>('favoriteCharacter');
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<ErrorKey, string>>
  >({});
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
        const { id, bookId, user, createdAt, ...responseData } = userResponse as any;

        const normalizedDiscussionQuestions: [string, string, string] = Array.isArray(
          responseData.discussionQuestions
        )
          ? [
              String(responseData.discussionQuestions[0] ?? ''),
              String(responseData.discussionQuestions[1] ?? ''),
              String(responseData.discussionQuestions[2] ?? '')
            ]
          : [String(responseData.discussionQuestion ?? ''), '', ''];

        const nextData = {
          rating: responseData.rating ?? 5,
          favoriteCharacter: responseData.favoriteCharacter ?? '',
          favoriteQuote: responseData.favoriteQuote ?? '',
          discussionQuestions: normalizedDiscussionQuestions,
          thoughts: responseData.thoughts ?? ''
        };

        setFormData(nextData);
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

    setFieldErrors(prev => ({
      ...prev,
      [name as ErrorKey]: undefined
    }));
  };

  const handleDiscussionQuestionChange = (index: 0 | 1 | 2, value: string) => {
    setFormData(prev => ({
      ...prev,
      discussionQuestions: prev.discussionQuestions.map((q, i) => (i === index ? value : q)) as [
        string,
        string,
        string
      ]
    }));

    const key: ErrorKey = index === 0 ? 'discussionQ1' : index === 1 ? 'discussionQ2' : 'discussionQ3';
    setFieldErrors(prev => ({
      ...prev,
      [key]: undefined
    }));
  };

  const validate = () => {
    const errors: Partial<Record<ErrorKey, string>> = {};

    if (!formData.favoriteCharacter.trim()) {
      errors.favoriteCharacter = 'Please add a character.';
    }

    if (!formData.favoriteQuote.trim()) {
      errors.favoriteQuote = 'Please add a quote.';
    }

    if (!formData.discussionQuestions[0].trim()) {
      errors.discussionQ1 = 'Please fill Question 1.';
    }

    if (!formData.discussionQuestions[1].trim()) {
      errors.discussionQ2 = 'Please fill Question 2.';
    }

    if (!formData.discussionQuestions[2].trim()) {
      errors.discussionQ3 = 'Please fill Question 3.';
    }

    setFieldErrors(errors);

    const firstMissingTab: DetailTab | undefined = (['favoriteCharacter', 'favoriteQuote'] as const).find(
      (k) => Boolean(errors[k])
    );

    const firstDiscussionMissingIndex = [0, 1, 2].find((i) => Boolean(errors[i === 0 ? 'discussionQ1' : i === 1 ? 'discussionQ2' : 'discussionQ3']));

    const firstMissing: DetailTab | undefined = firstMissingTab ?? (firstDiscussionMissingIndex !== undefined ? 'discussionQuestion' : undefined);

    if (firstMissing) {
      setActiveTab(firstMissing);
      requestAnimationFrame(() => {
        if (firstMissing === 'discussionQuestion') {
          const idx = (firstDiscussionMissingIndex ?? 0) as 0 | 1 | 2;
          const el = document.getElementById(`discussionQuestion-${idx}`) as HTMLInputElement | null;
          el?.focus();
          return;
        }

        const el = document.querySelector<HTMLInputElement | HTMLTextAreaElement>(`[name="${firstMissing}"]`);
        el?.focus();
      });
    }

    return Object.keys(errors).length === 0;
  };

  const tabOrder: DetailTab[] = ['favoriteCharacter', 'favoriteQuote', 'discussionQuestion'];
  const activeTabIndex = tabOrder.indexOf(activeTab);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !bookId) return;

    if (!validate()) return;

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
    <div className="w-full min-h-dvh bg-white sm:bg-transparent">
      <div className="sm:hidden fixed top-0 left-0 right-0 h-[env(safe-area-inset-top)] bg-white pointer-events-none z-50" />
      <div className="max-w-2xl mx-auto sm:px-6 sm:pt-8 sm:pb-12 pb-28">
          <div className="flex items-center p-4 sm:p-0 sm:mb-4 bg-white sm:bg-transparent">
            <button 
              onClick={() => navigate(-1)}
              className="inline-flex items-center text-sm font-medium p-2 rounded-lg bg-pink-100 text-pink-700 hover:bg-pink-200 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back
            </button>
          </div>
          <div className="bg-white sm:rounded-2xl sm:shadow-md p-5 sm:p-6 h-full">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-pink-800 mb-2">
            {_isEditMode ? 'Edit Your Thoughts' : 'Share Your Thoughts'}
          </h1>
          <p className="text-gray-600 mt-1">by {book.author}</p>
        </div>
        
        <form id="questionnaire-form" onSubmit={handleSubmit} className="flex flex-col h-full">
          <div className="space-y-5 flex-1">
            <div className="rounded-2xl border border-pink-100 bg-white shadow-sm p-4">
              <label className="block text-gray-700 font-medium mb-3">
                How would you rate this book?
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, rating: star }))}
                    className="text-3xl focus:outline-none transition-transform hover:scale-110 p-1"
                    aria-label={`Rate ${star} out of 5`}
                  >
                    {star <= formData.rating ? (
                      <FaStar className="text-yellow-400" />
                    ) : (
                      <FaRegStar className="text-gray-300 hover:text-yellow-300 transition-colors" />
                    )}
                  </button>
                ))}
                <span className="ml-1 text-gray-600 font-medium">
                  {formData.rating} {formData.rating === 1 ? 'star' : 'stars'}
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-pink-100 bg-white shadow-sm p-4">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div>
                  <h2 className="text-base font-semibold text-pink-800">Story Highlights</h2>
                  <p className="text-sm text-gray-600">
                    {activeTab === 'favoriteCharacter' && 'Who stole your heart in this story?'}
                    {activeTab === 'favoriteQuote' && 'Share a line that stayed in your mind.'}
                    {activeTab === 'discussionQuestion' && 'What would you ask to spark a conversation?'}
                  </p>
                </div>
                <div className="hidden sm:block text-xs text-gray-500">{activeTabIndex + 1}/3</div>
              </div>

              <div className="inline-flex w-full rounded-xl bg-pink-50 p-1" role="tablist" aria-label="Question sections">
                <button
                  type="button"
                  role="tab"
                  id="tab-favoriteCharacter"
                  aria-selected={activeTab === 'favoriteCharacter'}
                  aria-controls="tab-panel-favoriteCharacter"
                  tabIndex={activeTab === 'favoriteCharacter' ? 0 : -1}
                  onClick={() => setActiveTab('favoriteCharacter')}
                  className={
                    activeTab === 'favoriteCharacter'
                      ? 'flex-1 rounded-lg bg-white shadow-sm px-3 py-2 text-sm font-medium text-pink-800'
                      : 'flex-1 rounded-lg px-3 py-2 text-sm font-medium text-pink-700/80'
                  }
                >
                  Character
                </button>
                <button
                  type="button"
                  role="tab"
                  id="tab-favoriteQuote"
                  aria-selected={activeTab === 'favoriteQuote'}
                  aria-controls="tab-panel-favoriteQuote"
                  tabIndex={activeTab === 'favoriteQuote' ? 0 : -1}
                  onClick={() => setActiveTab('favoriteQuote')}
                  className={
                    activeTab === 'favoriteQuote'
                      ? 'flex-1 rounded-lg bg-white shadow-sm px-3 py-2 text-sm font-medium text-pink-800'
                      : 'flex-1 rounded-lg px-3 py-2 text-sm font-medium text-pink-700/80'
                  }
                >
                  Quote
                </button>
                <button
                  type="button"
                  role="tab"
                  id="tab-discussionQuestion"
                  aria-selected={activeTab === 'discussionQuestion'}
                  aria-controls="tab-panel-discussionQuestion"
                  tabIndex={activeTab === 'discussionQuestion' ? 0 : -1}
                  onClick={() => setActiveTab('discussionQuestion')}
                  className={
                    activeTab === 'discussionQuestion'
                      ? 'flex-1 rounded-lg bg-white shadow-sm px-3 py-2 text-sm font-medium text-pink-800'
                      : 'flex-1 rounded-lg px-3 py-2 text-sm font-medium text-pink-700/80'
                  }
                >
                  Questions
                </button>
              </div>

              <div className="mt-4">
                <div
                  id="tab-panel-favoriteCharacter"
                  role="tabpanel"
                  aria-labelledby="tab-favoriteCharacter"
                  hidden={activeTab !== 'favoriteCharacter'}
                >
                  <label htmlFor="favoriteCharacter" className="block text-gray-700 font-medium mb-2">
                    Favorite Character
                  </label>
                  <input
                    id="favoriteCharacter"
                    type="text"
                    name="favoriteCharacter"
                    value={formData.favoriteCharacter}
                    onChange={handleChange}
                    className={
                      fieldErrors.favoriteCharacter
                        ? 'w-full px-3 py-3 border border-red-300 rounded-lg focus:ring-2 focus:ring-pink-400 focus:border-pink-400'
                        : 'w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400 focus:border-pink-400'
                    }
                    maxLength={100}
                    autoComplete="off"
                    inputMode="text"
                    aria-invalid={Boolean(fieldErrors.favoriteCharacter)}
                    aria-describedby={fieldErrors.favoriteCharacter ? 'favoriteCharacter-error' : undefined}
                  />
                  {fieldErrors.favoriteCharacter && (
                    <p id="favoriteCharacter-error" className="mt-2 text-sm text-red-600">
                      {fieldErrors.favoriteCharacter}
                    </p>
                  )}
                </div>

                <div
                  id="tab-panel-favoriteQuote"
                  role="tabpanel"
                  aria-labelledby="tab-favoriteQuote"
                  hidden={activeTab !== 'favoriteQuote'}
                >
                  <label htmlFor="favoriteQuote" className="block text-gray-700 font-medium mb-2">
                    Favorite Quote
                  </label>
                  <textarea
                    id="favoriteQuote"
                    name="favoriteQuote"
                    value={formData.favoriteQuote}
                    onChange={handleChange}
                    className={
                      fieldErrors.favoriteQuote
                        ? 'w-full px-3 py-3 border border-red-300 rounded-lg focus:ring-2 focus:ring-pink-400 focus:border-pink-400 min-h-[96px]'
                        : 'w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400 focus:border-pink-400 min-h-[96px]'
                    }
                    maxLength={300}
                    aria-invalid={Boolean(fieldErrors.favoriteQuote)}
                    aria-describedby={fieldErrors.favoriteQuote ? 'favoriteQuote-error' : undefined}
                  />
                  {fieldErrors.favoriteQuote && (
                    <p id="favoriteQuote-error" className="mt-2 text-sm text-red-600">
                      {fieldErrors.favoriteQuote}
                    </p>
                  )}
                </div>

                <div
                  id="tab-panel-discussionQuestion"
                  role="tabpanel"
                  aria-labelledby="tab-discussionQuestion"
                  hidden={activeTab !== 'discussionQuestion'}
                >
                  <div className="space-y-3">
                    <div>
                      <label htmlFor="discussionQuestion-0" className="block text-gray-700 font-medium mb-2">
                        Question 1
                      </label>
                      <input
                        id="discussionQuestion-0"
                        type="text"
                        value={formData.discussionQuestions[0]}
                        onChange={(e) => handleDiscussionQuestionChange(0, e.target.value)}
                        className={
                          fieldErrors.discussionQ1
                            ? 'w-full px-3 py-3 border border-red-300 rounded-lg focus:ring-2 focus:ring-pink-400 focus:border-pink-400'
                            : 'w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400 focus:border-pink-400'
                        }
                        maxLength={200}
                        autoComplete="off"
                        inputMode="text"
                        aria-invalid={Boolean(fieldErrors.discussionQ1)}
                        aria-describedby={fieldErrors.discussionQ1 ? 'discussionQ1-error' : undefined}
                      />
                      {fieldErrors.discussionQ1 && (
                        <p id="discussionQ1-error" className="mt-2 text-sm text-red-600">
                          {fieldErrors.discussionQ1}
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="discussionQuestion-1" className="block text-gray-700 font-medium mb-2">
                        Question 2
                      </label>
                      <input
                        id="discussionQuestion-1"
                        type="text"
                        value={formData.discussionQuestions[1]}
                        onChange={(e) => handleDiscussionQuestionChange(1, e.target.value)}
                        className={
                          fieldErrors.discussionQ2
                            ? 'w-full px-3 py-3 border border-red-300 rounded-lg focus:ring-2 focus:ring-pink-400 focus:border-pink-400'
                            : 'w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400 focus:border-pink-400'
                        }
                        maxLength={200}
                        autoComplete="off"
                        inputMode="text"
                        aria-invalid={Boolean(fieldErrors.discussionQ2)}
                        aria-describedby={fieldErrors.discussionQ2 ? 'discussionQ2-error' : undefined}
                      />
                      {fieldErrors.discussionQ2 && (
                        <p id="discussionQ2-error" className="mt-2 text-sm text-red-600">
                          {fieldErrors.discussionQ2}
                        </p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="discussionQuestion-2" className="block text-gray-700 font-medium mb-2">
                        Question 3
                      </label>
                      <input
                        id="discussionQuestion-2"
                        type="text"
                        value={formData.discussionQuestions[2]}
                        onChange={(e) => handleDiscussionQuestionChange(2, e.target.value)}
                        className={
                          fieldErrors.discussionQ3
                            ? 'w-full px-3 py-3 border border-red-300 rounded-lg focus:ring-2 focus:ring-pink-400 focus:border-pink-400'
                            : 'w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400 focus:border-pink-400'
                        }
                        maxLength={200}
                        autoComplete="off"
                        inputMode="text"
                        aria-invalid={Boolean(fieldErrors.discussionQ3)}
                        aria-describedby={fieldErrors.discussionQ3 ? 'discussionQ3-error' : undefined}
                      />
                      {fieldErrors.discussionQ3 && (
                        <p id="discussionQ3-error" className="mt-2 text-sm text-red-600">
                          {fieldErrors.discussionQ3}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      const idx = tabOrder.indexOf(activeTab);
                      if (idx > 0) setActiveTab(tabOrder[idx - 1]);
                    }}
                    disabled={activeTab === 'favoriteCharacter'}
                    className="inline-flex items-center justify-center rounded-lg px-3 py-2 text-sm font-medium text-pink-700 disabled:opacity-40"
                  >
                    Back
                  </button>
                  {activeTab !== 'discussionQuestion' ? (
                    <button
                      type="button"
                      onClick={() => {
                        const idx = tabOrder.indexOf(activeTab);
                        if (idx < tabOrder.length - 1) setActiveTab(tabOrder[idx + 1]);
                      }}
                      className="inline-flex items-center justify-center rounded-lg bg-pink-100 px-3 py-2 text-sm font-medium text-pink-800 hover:bg-pink-200"
                    >
                      Next
                    </button>
                  ) : (
                    <div />
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-pink-100 bg-white shadow-sm p-4">
              <label htmlFor="thoughts" className="block text-gray-700 font-medium mb-2">
                Your Thoughts
              </label>
              <textarea
                id="thoughts"
                name="thoughts"
                value={formData.thoughts}
                onChange={handleChange}
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400 focus:border-pink-400 min-h-[120px]"
                placeholder="Share your thoughts about the book..."
              />
            </div>
          </div>
          
          <div className="pt-4 sm:border-t sm:mt-4">
            {/* Desktop Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="hidden sm:block w-full bg-pink-500 hover:bg-pink-600 text-white font-medium py-3 rounded-xl transition-all duration-200 shadow-sm hover:shadow"
            >
              {isSubmitting ? 'Saving...' : 'Save Your Thoughts'}
            </button>
          </div>

        </form>
        </div>

      </div>

      {/* Mobile Sticky Submit Button */}
      <div
        className="fixed bottom-0 left-0 right-0 sm:hidden p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] bg-transparent"
      >
        <div className="bg-white/80 backdrop-blur-sm shadow-lg rounded-2xl border border-pink-100 p-3">
          <button
            type="submit"
            form="questionnaire-form"
            disabled={isSubmitting}
            className="w-full bg-pink-500 hover:bg-pink-600 text-white font-medium py-3 rounded-xl transition-all duration-200 shadow-sm"
          >
            {isSubmitting ? 'Saving...' : 'Save Your Thoughts'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Questionnaire;
