'use client';

import Link from 'next/link';
import Logo from '../logo';

const HeaderLanding = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background">
      <div className="container flex h-20 max-w-screen-2xl items-center justify-center px-4 md:px-6">
        <Link href="/" className="flex items-center space-x-2">
          <Logo />
        </Link>
      </div>
    </header>
  );
};

export default HeaderLanding;
