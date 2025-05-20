'use client'

import { useState } from 'react';
import Link from 'next/link';
import { useAuthContext } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const { state: { isAuthenticated }, logout } = useAuthContext();
  const router = useRouter();

  const handleAuthClick = () => {
    if (isAuthenticated) {
      logout();
      router.push('/auth');
    } else {
      router.push('/auth');
    }
  };

  return (
    <header className="bg-gradient-to-r from-indigo-600 to-purple-600 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo and App Name */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-8 w-8 text-white mr-2" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M7 4v16M17 4v16M3 8h18M3 16h18" 
                />
              </svg>
              <span className="text-white font-bold text-xl">YouTube Summarizer</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8 items-center">
            <Link href="/summary" className="text-white hover:text-indigo-100 px-3 py-2 rounded-md text-sm font-medium">
              New Summary
            </Link>
            <Link href="/history" className="text-white hover:text-indigo-100 px-3 py-2 rounded-md text-sm font-medium">
              History
            </Link>
            <button
              onClick={handleAuthClick}
              className="text-white hover:text-indigo-100 px-3 py-2 rounded-md text-sm font-medium focus:outline-none cursor-pointer"
            >
              {isAuthenticated ? 'Sign Out' : 'Sign In'}
            </button>
            <Link href="/about" className="text-white hover:text-indigo-100 px-3 py-2 rounded-md text-sm font-medium">
              About
            </Link>
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:text-indigo-100 focus:outline-none"
              aria-expanded={isMenuOpen}
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 flex flex-col">
            <Link href="/summary" className="text-white hover:bg-indigo-500 block px-3 py-2 rounded-md text-base font-medium">
              New Summary
            </Link>
            <Link href="/history" className="text-white hover:bg-indigo-500 block px-3 py-2 rounded-md text-base font-medium">
              History
            </Link>
            <button
              onClick={() => {
                setIsMenuOpen(false);
                handleAuthClick();
              }}
              className="text-white hover:bg-indigo-500 block px-3 py-2 rounded-md text-base font-medium text-left focus:outline-none"
            >
              {isAuthenticated ? 'Sign Out' : 'Sign In'}
            </button>
            <Link href="/about" className="text-white hover:bg-indigo-500 block px-3 py-2 rounded-md text-base font-medium">
              About
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;