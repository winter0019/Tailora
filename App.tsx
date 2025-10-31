import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { CustomerForm } from './components/CustomerForm';
import { StyleSuggestions } from './components/StyleSuggestions';
import { Loader } from './components/Loader';
import { SparklesIcon } from './components/icons/SparklesIcon';
import { generateStyle } from './services/geminiService';
import type { CustomerDetails, StyleSuggestion } from './types';

const App: React.FC = () => {
  const [fabricImage, setFabricImage] = useState<File | null>(null);
  const [fabricImagePreview, setFabricImagePreview] = useState<string | null>(null);
  const [customerImage, setCustomerImage] = useState<File | null>(null);
  const [customerImagePreview, setCustomerImagePreview] = useState<string | null>(null);
  const [customerDetails, setCustomerDetails] = useState<CustomerDetails>({
    bodySize: '',
    bodyNature: '',
  });
  const [suggestions, setSuggestions] = useState<StyleSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [numStyles, setNumStyles] = useState<number>(3); // State for number of styles

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
    if (!fabricImage || !customerImage || !customerDetails.bodySize || !customerDetails.bodyNature) {
      setError('Please upload a fabric image, a customer photo, and fill in all customer details.');
      return;
    }

    setError(null);
    setIsLoading(true);
    setSuggestions([]);

    try {
      const fabricImageBase64 = await fileToBase64(fabricImage);
      const customerImageBase64 = await fileToBase64(customerImage);
      
      const generationPromises = Array.from({ length: numStyles }, () => 
        generateStyle(fabricImageBase64, fabricImage.type, customerImageBase64, customerImage.type, customerDetails)
      );

      const generated = await Promise.all(generationPromises);
      setSuggestions(generated.filter(s => s !== null) as StyleSuggestion[]);
    } catch (err) {
      console.error(err);
      setError('Failed to generate styles. Our creative engine may be experiencing high demand. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, [fabricImage, customerImage, customerDetails, numStyles]);
  
  const isButtonDisabled = !fabricImage || !customerImage || !customerDetails.bodySize || !customerDetails.bodyNature || isLoading;

  return (
    <div className="min-h-screen flex flex-col font-sans">
      <Header />
      <main className="flex-grow container mx-auto p-4 md:p-6 lg:p-8 space-y-8 pb-40">
        <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white">Your Creative Style Assistant</h1>
            <p className="mt-2 text-lg text-slate-600 dark:text-slate-400">Unlock unique, creatively designed fashion by fusing Nigerian fabrics with global styles.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700">
                <h2 className="text-2xl font-semibold mb-4 text-slate-800 dark:text-slate-100">1. Upload Fabric</h2>
                <ImageUploader 
                  onImageChange={handleFabricImageChange} 
                  imagePreviewUrl={fabricImagePreview} 
                  promptText="Click to upload fabric or drag and drop"
                  subText="PNG, JPG, etc."
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
              <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Style Variety:</span>
                  <div className="flex items-center gap-1 rounded-full bg-slate-200 dark:bg-slate-800 p-1">
                      {[3, 5, 7].map((count) => (
                          <button
                              key={count}
                              onClick={() => setNumStyles(count)}
                              className={`px-4 py-1 rounded-full text-sm font-semibold transition-colors duration-200 ${
                                  numStyles === count
                                  ? 'bg-indigo-600 text-white shadow'
                                  : 'bg-transparent text-slate-600 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700'
                              }`}
                              aria-pressed={numStyles === count}
                          >
                              {count}
                          </button>
                      ))}
                  </div>
              </div>
              <button
                  onClick={handleSubmit}
                  disabled={isButtonDisabled}
                  className="w-full md:w-auto flex items-center justify-center gap-3 px-8 py-4 bg-indigo-600 text-white font-bold text-lg rounded-full shadow-lg hover:bg-indigo-700 disabled:bg-slate-400 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-300 ease-in-out disabled:transform-none"
                  aria-label={isLoading ? 'Generating styles' : `Generate ${numStyles} style ideas`}
              >
                  <SparklesIcon />
                  {isLoading ? 'Generating...' : `Generate ${numStyles} Style Ideas`}
              </button>
          </div>
      </footer>
    </div>
  );
};

export default App;