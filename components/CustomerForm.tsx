import React, { useState, useEffect } from 'react';
import type { CustomerDetails } from '../types';

interface CustomerFormProps {
  details: CustomerDetails;
  onDetailsChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

const BODY_SIZES = [
  "US 2 / UK 6 / EU 34",
  "US 4 / UK 8 / EU 36",
  "US 6 / UK 10 / EU 38",
  "US 8 / UK 12 / EU 40",
  "US 10 / UK 14 / EU 42",
  "US 12 / UK 16 / EU 44",
  "US 14 / UK 18 / EU 46 (Plus-size)",
  "US 16 / UK 20 / EU 48 (Plus-size)",
  "US 18 / UK 22 / EU 50 (Plus-size)",
  "Other"
];

const BODY_NATURES = [
  "Pear-shaped (wider hips)",
  "Apple-shaped (wider torso)",
  "Hourglass (defined waist)",
  "Athletic/Rectangle (straight)",
  "Inverted Triangle (broad shoulders)",
  "Tall",
  "Petite",
  "Other"
];


export const CustomerForm: React.FC<CustomerFormProps> = ({ details, onDetailsChange }) => {
  const [showOtherSize, setShowOtherSize] = useState(() => !!details.bodySize && !BODY_SIZES.includes(details.bodySize));
  const [showOtherNature, setShowOtherNature] = useState(() => !!details.bodyNature && !BODY_NATURES.includes(details.bodyNature));

  const handleSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === 'Other') {
      setShowOtherSize(true);
      onDetailsChange({ target: { name: 'bodySize', value: '' } } as any);
    } else {
      setShowOtherSize(false);
      onDetailsChange(e);
    }
  };

  const handleNatureChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    if (value === 'Other') {
      setShowOtherNature(true);
      onDetailsChange({ target: { name: 'bodyNature', value: '' } } as any);
    } else {
      setShowOtherNature(false);
      onDetailsChange(e);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="block text-base font-medium text-slate-700 dark:text-slate-300">
          Customer Details
        </h3>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Structured options help generate higher quality, better-fitting designs.</p>
      </div>
      <div>
        <label htmlFor="bodySize" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          Body Size
        </label>
        <div className="mt-1">
          <select
            name="bodySize"
            id="bodySize"
            value={showOtherSize ? 'Other' : details.bodySize}
            onChange={handleSizeChange}
            className="block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="" disabled>Select a size</option>
            {BODY_SIZES.map(size => <option key={size} value={size}>{size}</option>)}
          </select>
        </div>
        {showOtherSize && (
            <div className="mt-2">
                 <input
                    type="text"
                    name="bodySize"
                    id="bodySizeOther"
                    value={details.bodySize}
                    onChange={onDetailsChange}
                    className="block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Please specify size (e.g., Bust: 40, Petite)"
                />
            </div>
        )}
      </div>
      <div>
        <label htmlFor="bodyNature" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          Body Nature / Type
        </label>
        <div className="mt-1">
           <select
            name="bodyNature"
            id="bodyNature"
            value={showOtherNature ? 'Other' : details.bodyNature}
            onChange={handleNatureChange}
            className="block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="" disabled>Select a body type</option>
            {BODY_NATURES.map(nature => <option key={nature} value={nature}>{nature}</option>)}
          </select>
        </div>
        {showOtherNature && (
            <div className="mt-2">
                <input
                    type="text"
                    name="bodyNature"
                    id="bodyNatureOther"
                    value={details.bodyNature}
                    onChange={onDetailsChange}
                    className="block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Please describe body type"
                />
            </div>
        )}
      </div>
    </div>
  );
};