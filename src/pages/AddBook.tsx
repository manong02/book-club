import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';

export default function AddBook() {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [genre, setGenre] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { addBook } = useApp();
  const navigate = useNavigate();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    addBook({
      title: title.trim(),
      author: author.trim(),
      genre: genre.trim(),
      coverImage: coverImage.trim() || undefined,
      imageFile: imagePreview || undefined
    });
    
    // Navigate back to home
    navigate('/home');
  };

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
      <div className="max-w-2xl mx-auto h-[90%] bg-white rounded-lg shadow-md p-6 flex flex-col">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-pink-800">Add a New Book</h1>
          <p className="text-gray-600 mt-1">Add a new book to your reading list</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 flex-1 flex flex-col">
          <div className="space-y-4 flex-1">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Book Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-pink-400 focus:border-pink-400"
              placeholder="Enter book title"
              required
            />
          </div>

          <div>
            <label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-1">
              Author <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="author"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-pink-400 focus:border-pink-400"
              placeholder="Enter author name"
              required
            />
          </div>

          <div>
            <label htmlFor="genre" className="block text-sm font-medium text-gray-700 mb-1">
              Genre <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="genre"
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-pink-400 focus:border-pink-400"
              placeholder="e.g., Fiction, Mystery, Science Fiction"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Cover Image
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
              {imagePreview ? 'Image selected' : 'No file chosen'}
            </p>
          </div>

          
          </div>

          <div className="pt-4 border-t mt-auto">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-pink-400 hover:bg-pink-500 text-white font-medium py-2 px-4 rounded transition-colors duration-200 mt-2 disabled:opacity-70 flex items-center justify-center"
            >
              {isSubmitting ? 'Adding Book...' : 'Add Book'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
