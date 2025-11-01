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
        <img 
          src={suggestion.sketchUrl} 
          alt={`Sketch for ${suggestion.styleName}`}
          className="w-full h-full object-cover"
        />
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
