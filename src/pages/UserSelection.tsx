import { useNavigate } from 'react-router-dom';
import { useApp } from '../contexts/AppContext';
import type { User } from '../types';

const UserSelection = () => {
  const { setCurrentUser } = useApp();
  const navigate = useNavigate();

  const handleUserSelect = (user: User) => {
    setCurrentUser(user);
    navigate('/home');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-pink-50 to-white p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center">
        <h1 className="text-3xl font-bold text-pink-800 mb-8">Book Club 💗</h1>
        <h2 className="text-2xl font-semibold text-gray-800 mb-8">Who are you?</h2>
        <div className="space-y-4">
          <button
            onClick={() => handleUserSelect('Manon')}
            className="w-full bg-pink-400 hover:bg-pink-500 text-white font-bold py-4 px-6 rounded-lg transition-colors duration-200 text-lg"
          >
            Manon
          </button>
          <button
            onClick={() => handleUserSelect('Jerina')}
            className="w-full bg-pink-400 hover:bg-pink-500 text-white font-bold py-4 px-6 rounded-lg transition-colors duration-200 text-lg"
          >
            Jerina
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserSelection;
