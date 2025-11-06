import React from 'react';
// Fix: Aliased the imported type `StylePreferences` to `StylePreferencesType` to resolve a name collision with the `StylePreferences` component.
import type { StylePreferences as StylePreferencesType } from '../types';

interface StylePreferencesProps {
  preferences: StylePreferencesType;
  onPreferencesChange: (newPreferences: StylePreferencesType) => void;
}

const INSPIRATIONS = [
  "Middle Eastern", 
  "East Asian", 
  "European", 
  "South Asian"
];

const GARMENT_TYPES = [
    "Any",
    "Long Gown",
    "Short Gown",
    "Skirt",
    "Skirt and Top",
    "Trousers and Blouse"
];

const EMBELLISHMENT_TYPES = [
    "Normal",
    "Beading",
    "Sequins",
    "Threadwork",
    "Lace Appliqué"
];

export const StylePreferences: React.FC<StylePreferencesProps> = ({ preferences, onPreferencesChange }) => {
  const handleInspirationChange = (inspiration: string) => {
    const newInspirations = preferences.inspirations.includes(inspiration)
      ? preferences.inspirations.filter(i => i !== inspiration)
      : [...preferences.inspirations, inspiration];
    onPreferencesChange({ ...preferences, inspirations: newInspirations });
  };

  const handleGarmentTypeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onPreferencesChange({ ...preferences, garmentType: e.target.value });
  };

  const handleEmbellishmentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onPreferencesChange({ ...preferences, embellishment: e.target.value });
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="block text-base font-medium text-slate-700 dark:text-slate-300 mb-2">
          Cultural Inspirations (Select at least one)
        </h3>
        <div className="grid grid-cols-2 gap-4">
          {INSPIRATIONS.map((inspiration) => (
            <label key={inspiration} className="flex items-center space-x-3 p-3 bg-white dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-md cursor-pointer hover:border-indigo-500 has-[:checked]:bg-indigo-50 dark:has-[:checked]:bg-indigo-900/50 has-[:checked]:border-indigo-500 transition-colors">
              <input
                type="checkbox"
                name="inspiration"
                value={inspiration}
                checked={preferences.inspirations.includes(inspiration)}
                onChange={() => handleInspirationChange(inspiration)}
                className="h-4 w-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
              />
              <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{inspiration}</span>
            </label>
          ))}
        </div>
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Nigerian styles are always included.</p>
      </div>
      <div>
        <h3 className="block text-base font-medium text-slate-700 dark:text-slate-300 mb-2">
          Garment Type
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {GARMENT_TYPES.map((type) => (
             <label key={type} className="flex items-center space-x-3 p-3 bg-white dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-md cursor-pointer hover:border-indigo-500 has-[:checked]:bg-indigo-50 dark:has-[:checked]:bg-indigo-900/50 has-[:checked]:border-indigo-500 transition-colors">
              <input
                type="radio"
                name="garmentType"
                value={type}
                checked={preferences.garmentType === type}
                onChange={handleGarmentTypeChange}
                className="h-4 w-4 text-indigo-600 border-slate-300 focus:ring-indigo-500"
              />
               <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{type}</span>
            </label>
          ))}
        </div>
      </div>
      <div>
        <h3 className="block text-base font-medium text-slate-700 dark:text-slate-300 mb-2">
          Embellishment Style
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {EMBELLISHMENT_TYPES.map((type) => (
             <label key={type} className="flex items-center space-x-3 p-3 bg-white dark:bg-slate-700/50 border border-slate-300 dark:border-slate-600 rounded-md cursor-pointer hover:border-indigo-500 has-[:checked]:bg-indigo-50 dark:has-[:checked]:bg-indigo-900/50 has-[:checked]:border-indigo-500 transition-colors">
              <input
                type="radio"
                name="embellishment"
                value={type}
                checked={preferences.embellishment === type}
                onChange={handleEmbellishmentChange}
                className="h-4 w-4 text-indigo-600 border-slate-300 focus:ring-indigo-500"
              />
               <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{type}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
};