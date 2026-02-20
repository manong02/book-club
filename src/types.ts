export type User = 'Manon' | 'Jerina';

export type BookStatus = 'current' | 'waiting' | 'read';

export interface Book {
  id: number;
  title: string;
  author: string;
  genre?: string;
  isCurrent: boolean;
  status: BookStatus;
  coverImage?: string;
  imageFile?: string; // Base64 string of the uploaded image
  addedAt?: string;
}

export interface Response {
  id: number;
  bookId: number;
  user: User;
  rating: number;
  favoriteCharacter: string;
  favoriteQuote: string;
  discussionQuestions: string[];
  thoughts: string;
  createdAt: string;
}
