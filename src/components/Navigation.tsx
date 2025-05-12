'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import { useState, useEffect } from 'react';

export default function Navigation() {
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);

  // This ensures we only render Clerk components on the client side
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(path + '/');
  };

  if (!isMounted) {
    // Return a skeleton loader version of the navigation
    return (
      <nav className="bg-white shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <span className="text-xl font-bold text-blue-600">LinkSpace</span>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-4">
                <span className="inline-flex items-center px-1 pt-1 border-b-2 border-transparent text-sm font-medium text-gray-500">
                  Home
                </span>
              </div>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              <div className="flex space-x-2">
                <span className="text-gray-500 px-3 py-2 rounded-md text-sm font-medium">
                  Sign In
                </span>
                <span className="bg-blue-500 text-white px-3 py-2 rounded-md text-sm font-medium ml-2">
                  Sign Up
                </span>
              </div>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-xl font-bold text-blue-600">
                LinkSpace
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-4">
              <Link
                href="/"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive('/')
                    ? 'border-blue-500 text-gray-900'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }`}
              >
                Home
              </Link>
              <SignedIn>
                <Link
                  href="/dashboard"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    isActive('/dashboard')
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  href="/dashboard/links"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    isActive('/dashboard/links')
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  Manage Links
                </Link>
                <Link
                  href="/collections"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    isActive('/collections')
                      ? 'border-blue-500 text-gray-900'
                      : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                  }`}
                >
                  Collections
                </Link>
              </SignedIn>
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <SignedIn>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
            <SignedOut>
              <Link
                href="/sign-in"
                className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
              >
                Sign In
              </Link>
              <Link
                href="/sign-up"
                className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-md text-sm font-medium ml-2"
              >
                Sign Up
              </Link>
            </SignedOut>
          </div>
        </div>
      </div>
    </nav>
  );
} 