import React from 'react';
import type { StyleSuggestion } from '../types';

interface StyleSuggestionsProps {
  suggestions: StyleSuggestion[];
}

export const StyleSuggestions: React.FC<StyleSuggestionsProps> = ({ suggestions }) => {
  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 text-slate-900 dark:text-white">Your Style Suggestions</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {suggestions.map((suggestion, index) => (
          <div 
            key={index} 
            className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden border border-slate-200 dark:border-slate-700 flex flex-col transform hover:-translate-y-2 transition-transform duration-300"
          >
            <div className="bg-slate-200 dark:bg-slate-700 aspect-w-1 aspect-h-1">
                <img 
                    src={suggestion.sketchUrl} 
                    alt={`Sketch for ${suggestion.styleName}`}
                    className="w-full h-full object-cover"
                />
            </div>
            <div className="p-6 flex flex-col flex-grow">
              <h3 className="text-xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">{suggestion.styleName}</h3>
              <p className="text-slate-600 dark:text-slate-300 mb-4 text-sm leading-relaxed flex-grow">{suggestion.description}</p>
              <div className="mt-auto pt-4 border-t border-slate-200 dark:border-slate-700">
                <h4 className="font-semibold text-slate-700 dark:text-slate-200 mb-2">Perfect for:</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400">{suggestion.occasions}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};