import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { CustomerForm } from './components/CustomerForm';
import { StylePreferences } from './components/StylePreferences';
import { StyleSuggestions } from './components/StyleSuggestions';
import { Loader } from './components/Loader';
import { SparklesIcon } from './components/icons/SparklesIcon';
import { generateStyle } from './services/geminiService';
import type { CustomerDetails, StyleSuggestion, StylePreferences as StylePreferencesType } from './types';

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
  const [error, setError] = useState<string | null>(null);

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

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]); // Remove the "data:mime/type;base64," part
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSubmit = useCallback(async () => {
    if (!fabricImage || !customerImage || !customerDetails.bodySize || !customerDetails.bodyNature || stylePreferences.inspirations.length === 0) {
      setError('Please fill out all fields: fabric image, customer photo, customer details, and at least one cultural inspiration.');
      return;
    }

    setError(null);
    setIsLoading(true);
    
    try {
      const fabricImageBase64 = await fileToBase64(fabricImage);
      const customerImageBase64 = await fileToBase64(customerImage);
      
      const newSuggestion = await generateStyle(
        fabricImageBase64, 
        fabricImage.type, 
        customerImageBase64, 
        customerImage.type, 
        customerDetails, 
        stylePreferences
      );
      if (newSuggestion) {
        setSuggestions(prev => [newSuggestion, ...prev]); // Add new suggestion to the top of the list
      }
      
    } catch (err) {
      console.error(err);
      const errorMessage = err instanceof Error && err.message.includes("quota")
        ? "You've exceeded the free usage limit for today. Please try again tomorrow."
        : "Failed to generate a style. Our creative engine may be busy. Please try again.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [fabricImage, customerImage, customerDetails, stylePreferences]);
  
  const isButtonDisabled = !fabricImage || !customerImage || !customerDetails.bodySize || !customerDetails.bodyNature || stylePreferences.inspirations.length === 0 || isLoading;

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-6 lg:p-8 space-y-8 pb-40">
        <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">Your Creative Style Assistant</h1>
            <p className="mt-2 text-lg text-slate-600 dark:text-slate-400">Unlock unique, creatively designed fashion by fusing Nigerian fabrics with global styles.</p>
        </div>

        <div className="space-y-8 max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700">
                    <h2 className="text-2xl font-semibold mb-4 text-slate-800 dark:text-slate-100">1. Upload Fabric</h2>
                    <ImageUploader 
                      onImageChange={handleFabricImageChange} 
                      imagePreviewUrl={fabricImagePreview} 
                      promptText="Click to upload fabric or drag and drop"
                      subText="PNG, JPG, etc."
                      capture="environment"
                    />
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700">
                    <h2 className="text-2xl font-semibold mb-4 text-slate-800 dark:text-slate-100">2. Customer Details</h2>
                    <CustomerForm 
                        details={customerDetails} 
                        onDetailsChange={handleDetailsChange}
                        onCustomerImageChange={handleCustomerImageChange}
                        customerImagePreviewUrl={customerImagePreview}
                    />
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700">
                <h2 className="text-2xl font-semibold mb-4 text-slate-800 dark:text-slate-100">3. Style Preferences</h2>
                <StylePreferences 
                    preferences={stylePreferences}
                    onPreferencesChange={handlePreferencesChange}
                />
            </div>
        </div>

        {error && (
            <div className="max-w-6xl mx-auto bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md" role="alert">
                <p className="font-bold">Error</p>
                <p>{error}</p>
            </div>
        )}

        {isLoading && <Loader />}

        {suggestions.length > 0 && <StyleSuggestions suggestions={suggestions} />}

      </main>
      
      <footer className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-t border-slate-200 dark:border-slate-700 p-4">
          <div className="container mx-auto max-w-6xl flex flex-col items-center gap-4">
              <button
                  onClick={handleSubmit}
                  disabled={isButtonDisabled}
                  className="w-full md:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-indigo-600 text-white font-bold text-lg rounded-full shadow-lg hover:bg-indigo-700 disabled:bg-slate-400 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-300 ease-in-out disabled:transform-none"
                  aria-label={isLoading ? 'Generating style...' : suggestions.length > 0 ? 'Generate Another Style Idea' : 'Generate Style Idea'}
              >
                  <SparklesIcon />
                  {isLoading ? 'Generating...' : suggestions.length > 0 ? 'Generate Another Style' : 'Generate Style Idea'}
              </button>
          </div>
      </footer>
    </div>
  );
};

export default App;
