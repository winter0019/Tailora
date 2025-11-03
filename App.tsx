import React, { useState, useEffect, useCallback } from 'react';

// ==========================================================
// --- 1. TYPE DEFINITIONS (Consolidated for single file) ---
// ==========================================================

/**
 * @typedef {Object} CustomerDetails
 * @property {string} bodySize - The customer's body size (e.g., 'Medium').
 * @property {string} bodyNature - The customer's body build (e.g., 'Curvy').
 */
const CustomerDetails = {
    bodySize: '',
    bodyNature: '',
};

/**
 * @typedef {Object} StylePreferencesType
 * @property {string[]} inspirations - List of cultural/design inspirations.
 * @property {string} garmentType - The type of garment requested.
 */
const StylePreferencesType = {
    inspirations: [],
    garmentType: 'Any',
};

/**
 * @typedef {Object} StyleSuggestion
 * @property {string} id - Unique ID for the suggestion.
 * @property {string} imageBase64 - Base64 image data or placeholder URL for the generated style.
 * @property {string} description - Detailed text description of the style.
 * @property {string} materialsUsed - Suggested materials.
 * @property {string} estimatedCost - Estimated tailoring cost range.
 * @property {string} refinementPrompt - The last prompt used to refine this suggestion.
 */
const StyleSuggestion = {
    id: '',
    imageBase64: '',
    description: '',
    materialsUsed: '',
    estimatedCost: '',
    refinementPrompt: '',
};

// ==========================================================
// --- 2. MOCK SERVICE FUNCTIONS (Simulating API calls) ---
// ==========================================================

const INSPIRATION_OPTIONS = ['Modern', 'Traditional African (Aso-Oke, Adire)', 'Western Casual', 'Avant-Garde', 'Vintage 70s', 'Streetwear'];

/**
 * Generates an initial style suggestion using simulated image processing and Gemini API call.
 * @returns {Promise<Omit<typeof StyleSuggestion, 'id'> | null>}
 */
const generateStyle = async (
  fabricImageBase64,
  fabricMimeType,
  customerImageBase64,
  customerMimeType,
  customerDetails,
  stylePreferences
) => {
  // Simulate an API call delay
  await new Promise(resolve => setTimeout(resolve, 2500));

  // In a real application, you would call the Gemini API here.
  
  const size = "400x500";
  const color = "4f46e5"; // Indigo
  const text = stylePreferences.garmentType.replace(/ /g, '+') || "Style+Idea";
  const placeholderUrl = `https://placehold.co/${size}/${color}/ffffff?text=${text}`;
  
  return {
    imageBase64: placeholderUrl,
    description: `A stunning fusion design: a tailored **${stylePreferences.garmentType.toLowerCase()}** inspired by the **${stylePreferences.inspirations.join(' & ')}** styles. It is designed for a customer with a ${customerDetails.bodySize} size and a ${customerDetails.bodyNature} build, maximizing the visual impact of the vibrant Nigerian fabric provided.`,
    materialsUsed: "Ankara fabric with silk lining and custom gold-finished zipper.",
    estimatedCost: "NGN 45,000 - NGN 75,000 (excluding fabric cost)",
  };
};

/**
 * Refines an existing style suggestion based on a new prompt.
 * @returns {Promise<Omit<typeof StyleSuggestion, 'id'> | null>}
 */
const refineStyle = async (
  fabricImageBase64,
  fabricMimeType,
  customerImageBase64,
  customerMimeType,
  customerDetails,
  originalSuggestion,
  refinementPrompt
) => {
  // Simulate an API call delay
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // In a real application, you would call the Gemini API here for refinement.
  
  const size = "400x500";
  const color = "8b5cf6"; // Violet
  const text = `Refined+${refinementPrompt.substring(0, 15).replace(/ /g, '+')}`;
  const placeholderUrl = `https://placehold.co/${size}/${color}/ffffff?text=${text}`;

  return {
    ...originalSuggestion,
    imageBase64: placeholderUrl,
    description: `[Refined based on: "${refinementPrompt}"] The original concept has been updated to be more elegant and sophisticated, focusing on ${refinementPrompt.toLowerCase()}. This refinement emphasizes the customer's body type with a defined waistline.`,
    refinementPrompt: refinementPrompt
  };
};

// ==========================================================
// --- 3. ICON COMPONENTS ---
// ==========================================================

const Logo = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600 dark:text-indigo-400">
    <path d="M12 2l1.65 4.95h5.25l-4.25 3.1 1.6 4.95L12 13.1l-4.25 3.1 1.6-4.95L5.1 6.95h5.25z" fill="var(--tw-fill-indigo-500)" stroke="none"/>
    <path d="M12 2l1.65 4.95h5.25L12 11.85 5.1 6.95h5.25z" fill="var(--tw-fill-indigo-600)" opacity="0.5"/>
    <path d="M12 13.1l4.25 3.1-1.6 4.95L12 18.25l-2.65 2.9l-1.6-4.95z" fill="var(--tw-fill-indigo-700)" opacity="0.7"/>
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeDasharray="3 3" opacity="0.3"/>
    <text x="12" y="14" fontSize="6" fontWeight="bold" textAnchor="middle" fill="#000000">T</text>
  </svg>
);

const SparklesIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 20.5l-2.173-1.802A.984.984 0 0 0 7.1 17.653L5.27 15.6l-1.802 2.173a.984.984 0 0 0-1.427-.14l-1.927-1.427a.984.984 0 0 0 .14-1.427L2 12l-1.802-2.173a.984.984 0 0 0-.14-1.427l1.927-1.427a.984.984 0 0 0 1.427.14L7.1 6.347l1.83 2.053L10 8.5l1.83-2.053l1.83 2.053L15.6 7.1l1.427-1.927a.984.984 0 0 0 1.427.14l1.927 1.427a.984.984 0 0 0 .14 1.427L22 12l1.802 2.173a.984.984 0 0 0 .14 1.427l-1.927 1.427a.984.984 0 0 0-1.427-.14L16.9 17.653l-1.83 2.053L14 20.5l-2.173 1.802a.984.984 0 0 0-1.427.14L7.1 18.927a.984.984 0 0 0-.14-1.427z"/>
    <path d="M12 2l2 4l-4 4l4-4l-2-4zM10 20.5l-2.173-1.802L12 13.1l-4.25 3.1z"/>
    <path d="M12 13.1l4.25 3.1-1.6 4.95z"/>
  </svg>
);

const InfoIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <path d="M12 16v-4"/>
    <path d="M12 8h.01"/>
  </svg>
);

const RefreshCwIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 2v6h-6"/>
    <path d="M3 12a9 9 0 0 1 15-4.4L21 8"/>
    <path d="M3 22v-6h6"/>
    <path d="M21 12a9 9 0 0 1-15 4.4L3 16"/>
  </svg>
);

// ==========================================================
// --- 4. CORE COMPONENTS ---
// ==========================================================

const Header = () => {
    return (
        <header className="bg-white dark:bg-slate-800 shadow-md sticky top-0 z-10">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center space-x-3">
                        <Logo className="h-8 w-auto" />
                        <span className="text-xl font-extrabold text-slate-900 dark:text-white tracking-wider">Tailora</span>
                    </div>
                </div>
            </div>
        </header>
    );
};

/**
 * @param {{ onImageChange: (file: File | null) => void, imagePreviewUrl: string | null, promptText: string, subText: string, capture: 'user' | 'environment' }} props
 */
const ImageUploader = ({ onImageChange, imagePreviewUrl, promptText, subText, capture }) => {
    const fileInputRef = React.useRef(null);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            onImageChange(e.target.files[0]);
        } else {
            onImageChange(null);
        }
    };

    const handleClear = (e) => {
        e.stopPropagation();
        onImageChange(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }

    return (
        <div 
            className={`relative w-full h-48 sm:h-64 border-2 border-dashed rounded-xl cursor-pointer transition-colors ${imagePreviewUrl 
                ? 'border-indigo-500/50 hover:border-indigo-600' 
                : 'border-slate-300 dark:border-slate-600 hover:border-indigo-400'
            }`}
            onClick={() => fileInputRef.current?.click()}
        >
            <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                capture={capture}
                onChange={handleFileChange}
                className="hidden"
            />
            
            {imagePreviewUrl ? (
                <>
                    <img 
                        src={imagePreviewUrl} 
                        alt="Preview" 
                        className="w-full h-full object-cover rounded-xl"
                    />
                    <button 
                        onClick={handleClear} 
                        className="absolute top-2 right-2 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-opacity z-20"
                        aria-label="Remove image"
                    >
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </>
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-center p-4">
                    <svg className="w-8 h-8 text-slate-400 dark:text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 014 4v1.5"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12L12 8M12 16L16 12M12 8V20"></path></svg>
                    <p className="mt-2 text-sm font-medium text-slate-600 dark:text-slate-300">{promptText}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{subText}</p>
                </div>
            )}
        </div>
    );
};

/**
 * @param {{ details: typeof CustomerDetails, onDetailsChange: (e: React.ChangeEvent<HTMLSelectElement>) => void }} props
 */
const CustomerForm = ({ details, onDetailsChange }) => {
    const bodySizes = ['Small', 'Medium', 'Large', 'Extra Large'];
    const bodyNatures = ['Curvy', 'Athletic', 'Slim', 'Plus Size'];

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300">Customer Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="bodySize" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                        Body Size
                    </label>
                    <select
                        id="bodySize"
                        name="bodySize"
                        value={details.bodySize}
                        // @ts-ignore
                        onChange={onDetailsChange}
                        className="w-full p-2.5 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:text-white"
                        required
                    >
                        <option value="">Select size</option>
                        {bodySizes.map(size => <option key={size} value={size}>{size}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="bodyNature" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                        Body Nature/Build
                    </label>
                    <select
                        id="bodyNature"
                        name="bodyNature"
                        value={details.bodyNature}
                        // @ts-ignore
                        onChange={onDetailsChange}
                        className="w-full p-2.5 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:text-white"
                        required
                    >
                        <option value="">Select build</option>
                        {bodyNatures.map(nature => <option key={nature} value={nature}>{nature}</option>)}
                    </select>
                </div>
            </div>
        </div>
    );
};

/**
 * @param {{ preferences: typeof StylePreferencesType, onPreferencesChange: (preferences: typeof StylePreferencesType) => void }} props
 */
const StylePreferences = ({ preferences, onPreferencesChange }) => {
    const garmentTypes = ['Any', 'Jumpsuit', 'Gown (Long)', 'Gown (Short)', 'Skirt & Top Set', 'Trouser Suit'];

    const handleInspirationToggle = (inspiration) => {
        const newInspirations = preferences.inspirations.includes(inspiration)
            ? preferences.inspirations.filter(i => i !== inspiration)
            : [...preferences.inspirations, inspiration];
        onPreferencesChange({ ...preferences, inspirations: newInspirations });
    };

    const handleGarmentChange = (e) => {
        onPreferencesChange({ ...preferences, garmentType: e.target.value });
    };

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300">Style Preferences</h3>
            <div>
                <label htmlFor="garmentType" className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
                    Garment Type
                </label>
                <select
                    id="garmentType"
                    name="garmentType"
                    value={preferences.garmentType}
                    onChange={handleGarmentChange}
                    className="w-full p-2.5 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:text-white"
                    required
                >
                    {garmentTypes.map(type => <option key={type} value={type}>{type}</option>)}
                </select>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
                    Cultural/Design Inspirations (Select at least one)
                </label>
                <div className="flex flex-wrap gap-2">
                    {INSPIRATION_OPTIONS.map(inspiration => {
                        const isSelected = preferences.inspirations.includes(inspiration);
                        return (
                            <button
                                key={inspiration}
                                type="button"
                                onClick={() => handleInspirationToggle(inspiration)}
                                className={`px-4 py-2 text-xs font-semibold rounded-full transition-colors duration-150 ${isSelected
                                    ? 'bg-indigo-600 text-white shadow-md'
                                    : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'
                                }`}
                            >
                                {inspiration}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

const Loader = () => (
    <div className="flex justify-center items-center py-12">
        <div className="relative">
            <div className="h-12 w-12 rounded-full border-4 border-t-4 border-slate-200 animate-spin"></div>
            <div className="h-12 w-12 rounded-full border-4 border-indigo-500 border-t-transparent absolute top-0 left-0 animate-spin-slow"></div>
            <p className="mt-4 text-indigo-600 dark:text-indigo-400 font-semibold text-center">Thinking up designs...</p>
        </div>
    </div>
);

/**
 * @param {{ suggestion: typeof StyleSuggestion, onRefine: (id: string, prompt: string) => void, isRefining: boolean }} props
 */
const SuggestionCard = ({ suggestion, onRefine, isRefining }) => {
    const [refinementPrompt, setRefinementPrompt] = useState('');

    const handleRefineClick = () => {
        if (refinementPrompt.trim()) {
            onRefine(suggestion.id, refinementPrompt.trim());
            setRefinementPrompt('');
        }
    };

    // Use split('-')[1] safely for display ID
    const displayId = suggestion.id.includes('-') ? suggestion.id.split('-')[1] : suggestion.id;

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700 transition-transform hover:shadow-indigo-500/20">
            <div className="grid grid-cols-1 lg:grid-cols-3">
                {/* Image Placeholder */}
                <div className="lg:col-span-1 bg-slate-100 dark:bg-slate-900 flex items-center justify-center p-4">
                    <img
                        src={suggestion.imageBase64}
                        alt="Generated Style Design"
                        className="w-full h-auto max-h-[400px] object-contain rounded-lg shadow-md"
                        onError={(e) => { e.currentTarget.onerror = null; e.currentTarget.src="https://placehold.co/400x500/ef4444/ffffff?text=Image+Failed+to+Load" }}
                    />
                </div>

                {/* Details */}
                <div className="lg:col-span-2 p-5 sm:p-6 space-y-4">
                    <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold">
                        <SparklesIcon className="h-5 w-5"/>
                        <h3 className="text-xl">Style Idea #{displayId}</h3>
                        {suggestion.refinementPrompt && (
                            <span className="text-xs font-medium text-indigo-500 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-900 px-2 py-0.5 rounded-full">Refined</span>
                        )}
                    </div>

                    <p className="text-slate-700 dark:text-slate-300 text-sm italic">{suggestion.description}</p>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                            <p className="font-semibold text-slate-800 dark:text-slate-100">Materials</p>
                            <p className="text-slate-600 dark:text-slate-400 text-xs mt-1">{suggestion.materialsUsed}</p>
                        </div>
                        <div className="p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                            <p className="font-semibold text-slate-800 dark:text-slate-100">Estimated Cost</p>
                            <p className="text-slate-600 dark:text-slate-400 text-xs mt-1">{suggestion.estimatedCost}</p>
                        </div>
                    </div>

                    {/* Refinement Area */}
                    <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
                        <h4 className="text-base font-semibold text-slate-800 dark:text-slate-100 mb-2">Refine This Look</h4>
                        <div className="flex flex-col sm:flex-row gap-2">
                            <input
                                type="text"
                                placeholder="E.g., 'Make the sleeves puffier' or 'Change the color palette to cooler tones'"
                                value={refinementPrompt}
                                onChange={(e) => setRefinementPrompt(e.target.value)}
                                disabled={isRefining}
                                className="flex-grow p-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 dark:bg-slate-700 dark:text-white text-sm"
                            />
                            <button
                                onClick={handleRefineClick}
                                disabled={!refinementPrompt.trim() || isRefining}
                                className="flex-shrink-0 flex items-center justify-center gap-2 px-4 py-2 bg-violet-600 text-white font-medium rounded-lg shadow-md hover:bg-violet-700 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed text-sm"
                            >
                                {isRefining ? (
                                    <>
                                        <Loader /> Refining...
                                    </>
                                ) : (
                                    <>
                                        <RefreshCwIcon className="h-4 w-4" /> Refine
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

/**
 * @param {{ suggestions: typeof StyleSuggestion[], onRefine: (id: string, prompt: string) => void, refiningId: string | null }} props
 */
const StyleSuggestions = ({ suggestions, onRefine, refiningId }) => {
    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white border-b border-indigo-500 pb-3">
                3. Style Suggestions ({suggestions.length})
            </h2>
            <div className="space-y-6">
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


// ==========================================================
// --- 5. MAIN APP COMPONENT ---
// ==========================================================

const App: React.FC = () => {
    // @ts-ignore - Using null for File and string for base64 is common practice here
    const [fabricImage, setFabricImage] = useState<File | null>(null);
    const [fabricImagePreview, setFabricImagePreview] = useState<string | null>(null);
    // @ts-ignore
    const [customerImage, setCustomerImage] = useState<File | null>(null);
    const [customerImagePreview, setCustomerImagePreview] = useState<string | null>(null);
    const [customerDetails, setCustomerDetails] = useState<typeof CustomerDetails>(CustomerDetails);
    const [stylePreferences, setStylePreferences] = useState<typeof StylePreferencesType>(StylePreferencesType);
    const [suggestions, setSuggestions] = useState<typeof StyleSuggestion[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [refiningId, setRefiningId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [cooldownUntil, setCooldownUntil] = useState<number | null>(null);
    const [cooldownTimer, setCooldownTimer] = useState<string>('');

    // Cooldown Timer Effect
    useEffect(() => {
        if (!cooldownUntil) {
            setCooldownTimer('');
            return;
        }

        const intervalId = setInterval(() => {
            const now = Date.now();
            const secondsLeft = Math.ceil((cooldownUntil - now) / 1000);

            if (secondsLeft <= 0) {
                setCooldownUntil(null);
                clearInterval(intervalId);
            } else {
                setCooldownTimer(`Try again in ${secondsLeft}s`);
            }
        }, 1000);

        // Initial set
        const secondsLeft = Math.ceil((cooldownUntil - Date.now()) / 1000);
        if (secondsLeft > 0) {
            setCooldownTimer(`Try again in ${secondsLeft}s`);
        }

        return () => clearInterval(intervalId);
    }, [cooldownUntil]);

    // Image Upload Handler Factory
    const handleImageChange = useCallback((setter: (file: File | null) => void, previewSetter: (url: string | null) => void) => (file: File | null) => {
        setter(file);
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                // @ts-ignore
                previewSetter(reader.result);
            };
            reader.readAsDataURL(file);
        } else {
            previewSetter(null);
        }
    }, []);

    const handleFabricImageChange = handleImageChange(setFabricImage, setFabricImagePreview);
    const handleCustomerImageChange = handleImageChange(setCustomerImage, setCustomerImagePreview);

    // Form Change Handlers
    const handleDetailsChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setCustomerDetails(prev => ({ ...prev, [name]: value }));
    };

    const handlePreferencesChange = (newPreferences: typeof StylePreferencesType) => {
        setStylePreferences(newPreferences);
    };

    /**
     * Resizes an image file and returns its base64 string and MIME type.
     */
    const resizeImageAndGetBase64 = (file: File, maxSize: number = 1024): Promise<{ base64: string, mimeType: string }> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                // @ts-ignore
                if (!event.target?.result) {
                    return reject(new Error("Failed to read file"));
                }
                // @ts-ignore
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
        if (err instanceof Error) {
            setError(err.message);
            
            // Check for simulated quota error
            if (err.message.includes("creative break")) {
                setCooldownUntil(Date.now() + 60000); // 60 seconds cooldown
            }
        } else {
            setError("An unexpected error occurred. Please try again.");
        }
    }

    // Main Style Generation Handler
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
            
            // @ts-ignore - Ignoring TS error due to mock service return type structure
            const newSuggestionData = await generateStyle(
                fabricImageBase64, 
                fabricMimeType, 
                customerImageBase64, 
                customerMimeType, 
                customerDetails, 
                stylePreferences
            );
            
            if (newSuggestionData) {
                const newSuggestion = {
                    ...newSuggestionData,
                    id: `style-${Date.now()}`
                } as typeof StyleSuggestion;
                setSuggestions(prev => [newSuggestion, ...prev]);
            }
            
        } catch (err) {
            handleError(err);
        } finally {
            setIsLoading(false);
        }
    }, [fabricImage, customerImage, customerDetails, stylePreferences]);

    // Style Refinement Handler
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
            
            // @ts-ignore - Ignoring TS error due to mock service return type structure
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
                const refinedSuggestion = {
                    ...refinedSuggestionData,
                    id: suggestionId, // Keep the same ID
                } as typeof StyleSuggestion;
                setSuggestions(prev => prev.map(s => s.id === suggestionId ? refinedSuggestion : s));
            }
            
        } catch (err) {
            handleError(err)
        } finally {
            setRefiningId(null);
        }
    }, [fabricImage, customerImage, customerDetails, suggestions]);

    const isButtonDisabled = !fabricImage || !customerImage || !customerDetails.bodySize || !customerDetails.bodyNature || stylePreferences.inspirations.length === 0 || isLoading || !!cooldownUntil;

    return (
        <div className="min-h-screen flex flex-col font-sans bg-slate-100 dark:bg-slate-900 transition-colors duration-300">
            <Header />
            <main className="flex-grow container mx-auto p-3 sm:p-4 md:p-6 lg:p-8 space-y-8 pb-32">
                <>
                    <div className="text-center">
                        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white">Your Creative Style Assistant</h1>
                        <p className="mt-2 text-base md:text-lg text-slate-600 dark:text-slate-400">Unlock unique, creatively designed fashion by fusing Nigerian fabrics with global styles.</p>
                    </div>

                    <div className="max-w-6xl mx-auto bg-white dark:bg-slate-800 p-4 sm:p-6 md:p-8 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700">
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
                                    // @ts-ignore
                                    onDetailsChange={handleDetailsChange}
                                />

                                <StylePreferences 
                                    preferences={stylePreferences}
                                    onPreferencesChange={handlePreferencesChange}
                                />

                                <div className="p-4 bg-indigo-50 dark:bg-slate-700/50 rounded-lg flex items-start gap-3">
                                    <div className="flex-shrink-0 text-indigo-500 dark:text-indigo-400 mt-0.5">
                                        <InfoIcon className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-semibold text-indigo-800 dark:text-indigo-200">A Touch of Tailora</h4>
                                        <p className="text-xs text-indigo-700 dark:text-indigo-300 mt-1">
                                            Every generated style subtly incorporates our brand's elegant typography and signature gold color for a unique, branded finish.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>


                    {error && (
                        <div className="max-w-6xl mx-auto bg-red-100 dark:bg-red-900/50 border-l-4 border-red-500 dark:border-red-400 text-red-700 dark:text-red-300 p-4 rounded-md transition-all duration-300 w-full" role="alert">
                            <p className="font-bold">Error</p>
                            <p>{error}</p>
                        </div>
                    )}

                    {isLoading && <Loader />}

                    {suggestions.length > 0 && <StyleSuggestions suggestions={suggestions} onRefine={handleRefine} refiningId={refiningId} />}
                </>
            </main>
            
            <footer className="fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-t border-slate-200 dark:border-slate-700 p-3 sm:p-4">
                <div className="container mx-auto max-w-6xl flex flex-col items-center gap-4">
                    <button
                        onClick={handleSubmit}
                        disabled={isButtonDisabled}
                        className="w-full md:w-auto flex items-center justify-center gap-3 px-6 sm:px-8 py-3 sm:py-4 bg-indigo-600 text-white font-bold text-base sm:text-lg rounded-full shadow-lg shadow-indigo-500/50 hover:bg-indigo-700 disabled:bg-slate-400 disabled:cursor-not-allowed transform hover:scale-[1.02] transition-all duration-300 ease-in-out disabled:transform-none"
                        aria-label={isLoading ? 'Generating style...' : suggestions.length > 0 ? 'Generate Another Style Idea' : 'Generate Style Idea'}
                    >
                        <SparklesIcon className="h-5 w-5 animate-pulse" />
                        {isLoading ? 'Generating...' : cooldownTimer || (suggestions.length > 0 ? 'Generate Another Style' : 'Generate Style Idea')}
                    </button>
                </div>
            </footer>
        </div>
    );
};

export default App;
