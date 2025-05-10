'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { SignedIn, SignedOut, UserButton } from '@clerk/nextjs';
import { LinkIcon, LayoutDashboardIcon, FolderIcon, HomeIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Navigation() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(`${path}/`);
  };

  return (
    <nav className="border-b bg-background">
      <div className="container mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-xl font-bold text-primary">
                LinkSpace
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-4">
              <Link
                href="/"
                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                  isActive('/')
                    ? 'border-primary text-foreground'
                    : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground'
                }`}
              >
                <HomeIcon className="h-4 w-4 mr-2" />
                Home
              </Link>
              <SignedIn>
                <Link
                  href="/dashboard"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    isActive('/dashboard')
                      ? 'border-primary text-foreground'
                      : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground'
                  }`}
                >
                  <LayoutDashboardIcon className="h-4 w-4 mr-2" />
                  Dashboard
                </Link>
                <Link
                  href="/dashboard/links"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    isActive('/dashboard/links')
                      ? 'border-primary text-foreground'
                      : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground'
                  }`}
                >
                  <LinkIcon className="h-4 w-4 mr-2" />
                  Links
                </Link>
                <Link
                  href="/collections"
                  className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                    isActive('/collections')
                      ? 'border-primary text-foreground'
                      : 'border-transparent text-muted-foreground hover:border-border hover:text-foreground'
                  }`}
                >
                  <FolderIcon className="h-4 w-4 mr-2" />
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
              <Link href="/sign-in">
                <Button variant="ghost" className="mr-2">
                  Sign In
                </Button>
              </Link>
              <Link href="/sign-up">
                <Button>
                  Sign Up
                </Button>
              </Link>
            </SignedOut>
          </div>
        </div>
      </div>
    </nav>
  );
} 