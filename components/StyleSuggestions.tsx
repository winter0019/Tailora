import React, { useState } from 'react';
import type { StyleSuggestion } from '../types';
import { SparklesIcon } from './icons/SparklesIcon';

interface StyleSuggestionsProps {
  suggestions: StyleSuggestion[];
  onRefine: (suggestionId: string, refinementPrompt: string) => void;
  refiningId: string | null;
}

const SuggestionCard: React.FC<{
  suggestion: StyleSuggestion;
  onRefine: (suggestionId: string, refinementPrompt: string) => void;
  isRefining: boolean;
}> = ({ suggestion, onRefine, isRefining }) => {
  const [refinementPrompt, setRefinementPrompt] = useState('');

  const handleRefineClick = () => {
    if (refinementPrompt.trim()) {
      onRefine(suggestion.id, refinementPrompt);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden border border-slate-200 dark:border-slate-700 flex flex-col transform hover:-translate-y-2 transition-transform duration-300">
      <div className="relative bg-slate-200 dark:bg-slate-700 aspect-w-1 aspect-h-1">
        {suggestion.sketchUrl ? (
            <img 
              src={suggestion.sketchUrl} 
              alt={`Sketch for ${suggestion.styleName}`}
              className="w-full h-full object-cover"
            />
        ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center aspect-[1/1]">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                    Sketch could not be generated, but here are the style details.
                </p>
            </div>
        )}
        {isRefining && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white"></div>
          </div>
        )}
      </div>
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">{suggestion.styleName}</h3>
        <p className="text-slate-600 dark:text-slate-300 mb-4 text-sm leading-relaxed flex-grow">{suggestion.description}</p>
        <div className="mt-auto pt-4 border-t border-slate-200 dark:border-slate-700">
          <h4 className="font-semibold text-slate-700 dark:text-slate-200 mb-2">Perfect for:</h4>
          <p className="text-sm text-slate-500 dark:text-slate-400">{suggestion.occasions}</p>
        </div>
      </div>
      <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700">
          <label htmlFor={`refine-${suggestion.id}`} className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Refine this style</label>
          <div className="flex items-center gap-2">
            <input
              id={`refine-${suggestion.id}`}
              type="text"
              value={refinementPrompt}
              onChange={(e) => setRefinementPrompt(e.target.value)}
              disabled={isRefining}
              className="block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm disabled:bg-slate-100 dark:disabled:bg-slate-700/50"
              placeholder="e.g., 'Make it sleeveless'"
            />
            <button
              onClick={handleRefineClick}
              disabled={isRefining || !refinementPrompt.trim()}
              className="flex-shrink-0 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 text-white font-semibold text-sm rounded-md shadow-sm hover:bg-indigo-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors"
              aria-label="Refine style"
            >
              <SparklesIcon />
              <span>Refine</span>
            </button>
          </div>
      </div>
    </div>
  );
}


export const StyleSuggestions: React.FC<StyleSuggestionsProps> = ({ suggestions, onRefine, refiningId }) => {
  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 text-slate-900 dark:text-white">Your Style Suggestions</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {suggestions.map((suggestion) => (
          <SuggestionCard 
            key={suggestion.id} 
            suggestion={suggestion}
            onRefine={onRefine}
            isRefining={refiningId === suggestion.id}
          />
        ))}
      </div>
    </div>
  );
};
