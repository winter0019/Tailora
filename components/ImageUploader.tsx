import React, { useRef } from 'react';
import { CameraIcon } from './icons/CameraIcon';
import { CameraIconSmall } from './icons/CameraIconSmall';

interface ImageUploaderProps {
  onImageChange: (file: File | null) => void;
  imagePreviewUrl: string | null;
  promptText: string;
  subText: string;
  capture?: 'user' | 'environment';
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageChange, imagePreviewUrl, promptText, subText, capture }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    onImageChange(file || null);
    event.target.value = ''; // Reset input to allow re-uploading the same file
  };

  const handleDrop = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
    const file = event.dataTransfer.files?.[0];
    onImageChange(file || null);
  };

  const handleDragOver = (event: React.DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    event.stopPropagation();
  };
  
  const handleClick = (e: React.MouseEvent<HTMLLabelElement>) => {
    e.preventDefault(); // Prevent label from double-triggering
    fileInputRef.current?.click();
  };

  const handleCameraClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation(); // Prevent the label's click handler from firing
    e.preventDefault();
    cameraInputRef.current?.click();
  };

  return (
    <div>
      <label
        onClick={handleClick}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        className="mt-1 flex flex-col justify-center items-center p-4 border-2 border-slate-300 dark:border-slate-600 border-dashed rounded-md cursor-pointer hover:border-indigo-500 dark:hover:border-indigo-400 transition-colors duration-200 min-h-[150px] aspect-video"
        aria-label={promptText}
      >
        <div className="space-y-1 text-center">
          {imagePreviewUrl ? (
            <img src={imagePreviewUrl} alt="Preview" className="mx-auto h-full max-h-48 object-contain rounded-md" />
          ) : (
            <div className="flex flex-col items-center">
              <CameraIcon />
              <div className="flex text-sm text-slate-600 dark:text-slate-400">
                <p className="pl-1">{promptText}</p>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-500">{subText}</p>
              {capture && (
                <button
                  type="button"
                  onClick={handleCameraClick}
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:ring-offset-slate-100 dark:focus:ring-offset-slate-800"
                >
                  <CameraIconSmall className="h-5 w-5 mr-2 -ml-1" />
                  Use Camera
                </button>
              )}
            </div>
          )}
        </div>
      </label>
      <input
        id={`file-upload-${promptText.replace(/\s/g, '-')}`}
        name={`file-upload-${promptText.replace(/\s/g, '-')}`}
        type="file"
        className="sr-only"
        accept="image/*"
        onChange={handleFileChange}
        ref={fileInputRef}
      />
      {capture && (
        <input
            id={`camera-upload-${promptText.replace(/\s/g, '-')}`}
            name={`camera-upload-${promptText.replace(/\s/g, '-')}`}
            type="file"
            className="sr-only"
            accept="image/*"
            capture={capture}
            onChange={handleFileChange}
            ref={cameraInputRef}
        />
      )}
    </div>
  );
};