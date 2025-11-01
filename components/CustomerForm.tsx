import React from 'react';
import type { CustomerDetails } from '../types';

interface CustomerFormProps {
  details: CustomerDetails;
  onDetailsChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

export const CustomerForm: React.FC<CustomerFormProps> = ({ details, onDetailsChange }) => {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="block text-base font-medium text-slate-700 dark:text-slate-300">
          Customer Details
        </h3>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">The more descriptive you are, the better the style suggestions will be!</p>
      </div>
      <div>
        <label htmlFor="bodySize" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          Body Size
        </label>
        <div className="mt-1">
          <input
            type="text"
            name="bodySize"
            id="bodySize"
            value={details.bodySize}
            onChange={onDetailsChange}
            className="block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="e.g., Size 12, Bust: 36, Waist: 30"
          />
        </div>
      </div>
      <div>
        <label htmlFor="bodyNature" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          Body Nature / Type
        </label>
        <div className="mt-1">
          <input
            type="text"
            name="bodyNature"
            id="bodyNature"
            value={details.bodyNature}
            onChange={onDetailsChange}
            className="block w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-md shadow-sm placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="e.g., Pear-shaped, Tall, Plus-size"
          />
        </div>
      </div>
    </div>
  );
};
