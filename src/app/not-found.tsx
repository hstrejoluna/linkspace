'use client';

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
      <h2 className="text-4xl font-bold text-gray-900 mb-4">404</h2>
      <p className="text-xl text-gray-600 mb-8">Page not found</p>
      <p className="text-gray-500 mb-6 text-center max-w-md">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <Link 
        href="/"
        className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
      >
        Return to Home
      </Link>
    </div>
  );
} 