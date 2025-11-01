import React, { useState, useEffect } from 'react';

const loadingMessages = [
  "Fusing global styles into a unique masterpiece...",
  "Sketching your custom design...",
  "Consulting the virtual design muse...",
  "Selecting the perfect color accents...",
  "Adding the finishing touches...",
];

export const Loader: React.FC = () => {
  const [currentMessage, setCurrentMessage] = useState(loadingMessages[0]);

  useEffect(() => {
    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % loadingMessages.length;
      setCurrentMessage(loadingMessages[index]);
    }, 2500); // This duration matches the animation duration in tailwind.config.js

    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  return (
    <div className="flex flex-col items-center justify-center space-y-4 my-8">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      <p className="text-slate-600 dark:text-slate-400 animate-fade-in-out w-full text-center px-4 min-h-[24px]">
        {currentMessage}
      </p>
    </div>
  );
};
