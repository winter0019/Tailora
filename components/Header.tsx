import React from 'react';
import { Logo } from './icons/Logo';

export const Header: React.FC = () => {
  return (
    <header className="bg-white dark:bg-slate-800 shadow-md sticky top-0 z-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2">
            <Logo className="h-8 w-auto" />
          </div>
        </div>
      </div>
    </header>
  );
};
