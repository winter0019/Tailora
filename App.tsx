
import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { CustomerForm } from './components/CustomerForm';
import { StylePreferences } from './components/StylePreferences';
import { StyleSuggestions } from './components/StyleSuggestions';
import { Loader } from './components/Loader';
import { SparklesIcon } from './components/icons/SparklesIcon';
import { generateStyle, refineStyle } from './services/geminiService';
import type { CustomerDetails, StyleSuggestion, StylePreferences as StylePreferencesType } from './types';

// Fix: Removed conflicting global declaration for `window.aistudio`.
// The type definition is expected to be provided by the execution environment,
// and this redeclaration caused a conflict.

const ApiKeySelector: React.FC<{ onKeySelected: () => void }> = ({ onKeySelected }) => (
  <div className="max-w-xl mx-auto text-center bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 mt-16">
    <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">Select Your API Key to Begin</h2>
    <p className="text-slate-600 dark:text-slate-400 mb-6">
      To generate styles, Tailora requires a Gemini API key. Using your own key ensures you have sufficient quota for your creative work. Please select a key associated with a billing-enabled Google Cloud project to avoid free-tier limitations.
    </p>
    <button
      onClick={onKeySelected}
      className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-indigo-600 text-white font-bold text-lg rounded-full shadow-lg hover:bg-indigo-700 transform hover:scale-105 transition-all duration-300 ease-in-out"
    >
      Select Your API Key
    </button>
    <p className="mt-4 text-xs text-slate-500">
      Need to set up billing?{' '}
      <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noopener noreferrer" className="font-semibold underline hover:text-indigo-500">
        Learn more here.
      </a>
    </p>
  </div>
);


const App: React.FC = () => {
  const [fabricImage, setFabricImage] = useState<File | null>(null);
  const [fabricImagePreview, setFabricImagePreview] = useState<string | null>(null);
  const [customerImage, setCustomerImage] = useState<File | null>(null);
  const [customerImagePreview, setCustomerImagePreview] = useState<string | null>(null);
  const [customerDetails, setCustomerDetails] = useState<CustomerDetails>({
    bodySize: '',
    bodyNature: '',
  });
  const [stylePreferences, setStylePreferences] = useState<StylePreferencesType>({
    inspirations: [],
    garmentType: 'Any',
  });
  const [suggestions, setSuggestions] = useState<StyleSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [refiningId, setRefiningId] = useState<string | null>(null);
  const [error, setError] = useState<React.ReactNode | null>(null);
  const [isKeySelected, setIsKeySelected] = useState<boolean>(false);
  
  useEffect(() => {
    const checkApiKey = async () => {
        if (window.aistudio) {
            const hasKey = await window.aistudio.hasSelectedApiKey();
            setIsKeySelected(hasKey);
        }
    };
    checkApiKey();
  }, []);

  const handleSelectKey = async () => {
    if (window.aistudio) {
      await window.aistudio.openSelectKey();
      // Assume selection is successful and let the user proceed.
      // A failed API call will provide more specific feedback if the key is invalid.
      setIsKeySelected(true);
    }
  };


  const handleImageChange = (setter: (file: File | null) => void, previewSetter: (url: string | null) => void) => (file: File | null) => {
    setter(file);
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        previewSetter(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      previewSetter(null);
    }
  };
  
  const handleFabricImageChange = handleImageChange(setFabricImage, setFabricImagePreview);
  const handleCustomerImageChange = handleImageChange(setCustomerImage, setCustomerImagePreview);


  const handleDetailsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCustomerDetails(prev => ({ ...prev, [name]: value }));
  };

  const handlePreferencesChange = (newPreferences: StylePreferencesType) => {
    setStylePreferences(newPreferences);
  };

  const resizeImageAndGetBase64 = (file: File, maxSize: number = 1024): Promise<{ base64: string, mimeType: string }> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            if (!event.target?.result) {
                return reject(new Error("Failed to read file"));
            }
            img.src = event.target.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let { width, height } = img;

                if (width > height) {
                    if (width > maxSize) {
                        height = Math.round(height * (maxSize / width));
                        width = maxSize;
                    }
                } else {
                    if (height > maxSize) {
                        width = Math.round(width * (maxSize / height));
                        height = maxSize;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    return reject(new Error('Could not get canvas context'));
                }
                ctx.drawImage(img, 0, 0, width, height);

                const mimeType = 'image/jpeg';
                const dataUrl = canvas.toDataURL(mimeType, 0.85); // 85% quality
                const base64 = dataUrl.split(',')[1];
                resolve({ base64, mimeType });
            };
            img.onerror = (error) => reject(error);
        };
        reader.onerror = (error) => reject(error);
    });
  };

  const handleError = (err: unknown) => {
      console.error(err);
      if (err instanceof Error && (err.message.includes("quota") || err.message.includes("RESOURCE_EXHAUSTED"))) {
        setError(
          <>
            You've exceeded your usage limit. Please ensure your selected API key is linked to a billing-enabled project.
            {' '}
            <a href="https://ai.google.dev/gemini-api/docs/rate-limits" target="_blank" rel="noopener noreferrer" className="font-semibold underline hover:text-red-800">
              Learn more.
            </a>
          </>
        );
      } else if (err instanceof Error && (err.message.includes("API key") || err.message.includes("not found"))) {
        setError(<>The API key is missing, invalid, or not authorized for this project. Please select a valid key. <button onClick={() => setIsKeySelected(false)} className="font-semibold underline hover:text-red-800">Select a different key</button></>);
      } else {
        setError("Failed to generate a style. Our creative engine may be busy. Please try again.");
      }
  }

  const handleSubmit = useCallback(async () => {
    if (!fabricImage || !customerImage || !customerDetails.bodySize || !customerDetails.bodyNature || stylePreferences.inspirations.length === 0) {
      setError('Please fill out all fields: fabric image, customer photo, customer details, and at least one cultural inspiration.');
      return;
    }

    setError(null);
    setIsLoading(true);
    
    try {
      const { base64: fabricImageBase64, mimeType: fabricMimeType } = await resizeImageAndGetBase64(fabricImage);
      const { base64: customerImageBase64, mimeType: customerMimeType } = await resizeImageAndGetBase64(customerImage);
      
      const newSuggestionData = await generateStyle(
        fabricImageBase64, 
        fabricMimeType, 
        customerImageBase64, 
        customerMimeType, 
        customerDetails, 
        stylePreferences
      );
      if (newSuggestionData) {
        const newSuggestion: StyleSuggestion = {
            ...newSuggestionData,
            id: `style-${Date.now()}`
        };
        setSuggestions(prev => [newSuggestion, ...prev]);
      }
      
    } catch (err) {
      handleError(err);
    } finally {
      setIsLoading(false);
    }
  }, [fabricImage, customerImage, customerDetails, stylePreferences]);
  
  const handleRefine = useCallback(async (suggestionId: string, refinementPrompt: string) => {
    const originalSuggestion = suggestions.find(s => s.id === suggestionId);
    if (!fabricImage || !customerImage || !originalSuggestion) {
      setError('Cannot refine style. Original images or suggestion data is missing.');
      return;
    }
    
    setError(null);
    setRefiningId(suggestionId);
    
    try {
      const { base64: fabricImageBase64, mimeType: fabricMimeType } = await resizeImageAndGetBase64(fabricImage);
      const { base64: customerImageBase64, mimeType: customerMimeType } = await resizeImageAndGetBase64(customerImage);
      
      const refinedSuggestionData = await refineStyle(
        fabricImageBase64,
        fabricMimeType,
        customerImageBase64,
        customerMimeType,
        customerDetails,
        originalSuggestion,
        refinementPrompt
      );
      
      if (refinedSuggestionData) {
        const refinedSuggestion: StyleSuggestion = {
          ...refinedSuggestionData,
          id: suggestionId, // Keep the same ID
        };
        setSuggestions(prev => prev.map(s => s.id === suggestionId ? refinedSuggestion : s));
      }
      
    } catch (err) {
      handleError(err)
    } finally {
      setRefiningId(null);
    }
  }, [fabricImage, customerImage, customerDetails, suggestions]);

  const isButtonDisabled = !fabricImage || !customerImage || !customerDetails.bodySize || !customerDetails.bodyNature || stylePreferences.inspirations.length === 0 || isLoading;

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Header />
      <main className="flex-grow container mx-auto p-3 sm:p-4 md:p-6 lg:p-8 space-y-8 pb-32">
        {!isKeySelected ? (
            <ApiKeySelector onKeySelected={handleSelectKey} />
        ) : (
        <>
            <div className="text-center">
                <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">Your Creative Style Assistant</h1>
                <p className="mt-2 text-base md:text-lg text-slate-600 dark:text-slate-400">Unlock unique, creatively designed fashion by fusing Nigerian fabrics with global styles.</p>
            </div>

            <div className="max-w-6xl mx-auto bg-white dark:bg-slate-800 p-4 sm:p-6 md:p-8 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
                    {/* Left Column: Visual Inputs */}
                    <div className="space-y-6">
                        <h2 className="text-xl sm:text-2xl font-semibold text-slate-800 dark:text-slate-100 border-b border-slate-200 dark:border-slate-700 pb-3">1. Add Visuals</h2>
                        
                        <div>
                            <label className="block text-base font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Fabric Photo
                            </label>
                            <ImageUploader 
                              onImageChange={handleFabricImageChange} 
                              imagePreviewUrl={fabricImagePreview} 
                              promptText="Upload fabric photo"
                              subText="PNG, JPG, etc."
                              capture="environment"
                            />
                        </div>

                        <div>
                             <label className="block text-base font-medium text-slate-700 dark:text-slate-300 mb-2">
                                Customer Photo
                            </label>
                            <ImageUploader 
                                onImageChange={handleCustomerImageChange} 
                                imagePreviewUrl={customerImagePreview} 
                                promptText="Upload customer photo"
                                subText="Helps with color matching"
                                capture="user"
                            />
                        </div>

                    </div>

                    {/* Right Column: Textual Inputs */}
                    <div className="space-y-8">
                        <h2 className="text-xl sm:text-2xl font-semibold text-slate-800 dark:text-slate-100 border-b border-slate-200 dark:border-slate-700 pb-3">2. Define Style</h2>

                        <CustomerForm 
                            details={customerDetails} 
                            onDetailsChange={handleDetailsChange}
                        />

                        <StylePreferences 
                            preferences={stylePreferences}
                            onPreferencesChange={handlePreferencesChange}
                        />
                    </div>
                </div>
            </div>


            {error && (
                <div className="max-w-6xl mx-auto bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md" role="alert">
                    <p className="font-bold">Error</p>
                    <p>{error}</p>
                </div>
            )}

            {isLoading && <Loader />}

            {suggestions.length > 0 && <StyleSuggestions suggestions={suggestions} onRefine={handleRefine} refiningId={refiningId} />}
        </>
        )}
      </main>
      
      {isKeySelected && (
        <footer className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-t border-slate-200 dark:border-slate-700 p-3 sm:p-4">
            <div className="container mx-auto max-w-6xl flex flex-col items-center gap-4">
                <button
                    onClick={handleSubmit}
                    disabled={isButtonDisabled}
                    className="w-full md:w-auto flex items-center justify-center gap-3 px-6 sm:px-8 py-3 sm:py-4 bg-indigo-600 text-white font-bold text-base sm:text-lg rounded-full shadow-lg hover:bg-indigo-700 disabled:bg-slate-400 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-300 ease-in-out disabled:transform-none"
                    aria-label={isLoading ? 'Generating style...' : suggestions.length > 0 ? 'Generate Another Style Idea' : 'Generate Style Idea'}
                >
                    <SparklesIcon />
                    {isLoading ? 'Generating...' : suggestions.length > 0 ? 'Generate Another Style' : 'Generate Style Idea'}
                </button>
            </div>
        </footer>
      )}
    </div>
  );
};

export default App;
