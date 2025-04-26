import React from 'react';
import { Link } from 'react-router-dom';
import { HomeIcon, AlertTriangleIcon } from 'lucide-react';

const NotFound: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <AlertTriangleIcon className="h-16 w-16 text-yellow-500 mb-6" />
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Page Not Found</h1>
      <p className="text-lg text-gray-600 max-w-md text-center mb-8">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link
        to="/"
        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
      >
        <HomeIcon className="w-4 h-4 mr-2" />
        Return to Dashboard
      </Link>
    </div>
  );
};

export default NotFound;