import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="bg-white dark:bg-slate-800 shadow-md sticky top-0 z-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2">
             <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                T
             </div>
            <span className="text-xl font-bold text-slate-800 dark:text-white">Tailora</span>
          </div>
        </div>
      </div>
    </header>
  );
};