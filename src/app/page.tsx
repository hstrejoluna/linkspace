import Link from 'next/link';
import { SignedIn, SignedOut } from '@clerk/nextjs';
import SecuredDataDemo from '@/components/supabase/secured-data-demo';

export default function HomePage() {
  return (
    <div className="bg-white">
      <div className="relative isolate px-6 pt-14 lg:px-8">
        <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
          <div className="text-center">
            <SecuredDataDemo />
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Organize and share your links with LinkSpace
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              The easiest way to collect, organize, and share your favorite links. Create collections, add tags, and share with others.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <SignedOut>
                <Link
                  href="/sign-up"
                  className="rounded-md bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                >
                  Get started
                </Link>
                <Link
                  href="/sign-in"
                  className="text-sm font-semibold leading-6 text-gray-900"
                >
                  Sign in <span aria-hidden="true">→</span>
                </Link>
              </SignedOut>
              <SignedIn>
                <Link
                  href="/dashboard"
                  className="rounded-md bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                >
                  Go to Dashboard
                </Link>
              </SignedIn>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
