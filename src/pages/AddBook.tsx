import { useState } from 'react';
import type { ChangeEvent } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import type { Book } from '../types';

export default function AddBook() {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [genre, setGenre] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addBook } = useApp();
  const navigate = useNavigate();

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check if file is an image
    if (!file.type.match('image.*')) {
      alert('Please select an image file');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setImagePreview(base64String);
      setCoverImage(base64String);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !author.trim()) return;
    
    setIsSubmitting(true);
    
    // Add the new book 
    const newBook: Omit<Book, 'id' | 'status' | 'addedAt'> = {
      isCurrent: true,
      title: title.trim(),
      author: author.trim(),
      genre: genre.trim(),
      coverImage: coverImage.trim() || undefined,
      imageFile: imagePreview || undefined
    };
    
    addBook(newBook);
    
    // Navigate back to home
    navigate('/home');
  };

  return (
    <div className="w-full min-h-dvh bg-white sm:bg-transparent">
      <div className="sm:hidden fixed top-0 left-0 right-0 h-[env(safe-area-inset-top)] bg-white pointer-events-none z-50" />
      <div className="max-w-2xl mx-auto sm:px-6 sm:pt-8 sm:pb-12 pb-28">
          <div className="flex items-center p-4 sm:p-0 sm:mb-4 bg-white sm:bg-transparent">
            <button 
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex items-center text-sm font-medium p-2 rounded-lg bg-pink-100 text-pink-700 hover:bg-pink-200 transition-colors"
            >
              <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back
            </button>
          </div>
          <div className="bg-white sm:rounded-2xl sm:shadow-md p-5 sm:p-6 h-full">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-pink-800">
                Add a New Book 📖
              </h1>
              <p className="text-gray-600 mt-1">
                Tell us what you're reading next
              </p>
            </div>

            <form id="add-book-form" onSubmit={handleSubmit} className="space-y-7 sm:space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Book Title <span className="text-pink-500">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400 focus:border-pink-400"
                  placeholder="Enter book title"
                  required
                />
              </div>

              <div>
                <label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-1">
                  Author's Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="author"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400 focus:border-pink-400"
                  placeholder="Enter author name"
                  required
                />
              </div>

              <div>
                <label htmlFor="genre" className="block text-sm font-medium text-gray-700 mb-1">
                  Genre / Category <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="genre"
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                  className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-400 focus:border-pink-400"
                  placeholder="e.g., Fiction, Mystery, Science Fiction"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload a Cover Image (optional)
                </label>
                <div className="flex items-center space-x-4">
                  <label className="cursor-pointer bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-400">
                    Choose File
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageUpload}
                      className="sr-only"
                    />
                  </label>
                  {imagePreview && (
                    <div className="flex-shrink-0">
                      <img 
                        src={imagePreview} 
                        alt="Preview" 
                        className="h-12 w-12 rounded object-cover"
                      />
                    </div>
                  )}
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  {imagePreview ? 'Image selected' : 'Add a cover to make it feel official ✨'}
                </p>
              </div>

            <div className="pt-4 sm:border-t sm:mt-4">
              {/* Desktop Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="hidden sm:block w-full bg-pink-500 hover:bg-pink-600 text-white font-medium py-3 rounded-xl transition-all duration-200 shadow-sm hover:shadow"
              >
                {isSubmitting ? 'Adding to your shelf…' : 'Add to Shelf'}
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
            form="add-book-form"
            disabled={isSubmitting}
            className="w-full bg-pink-500 hover:bg-pink-600 text-white font-medium py-3 rounded-xl transition-all duration-200 shadow-sm"
          >
            {isSubmitting ? 'Adding...' : 'Add to Shelf'}
          </button>
        </div>
      </div>
    </div>
  );
}
