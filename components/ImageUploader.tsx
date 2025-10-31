import React, { useRef } from 'react';
import { CameraIcon } from './icons/CameraIcon';

interface ImageUploaderProps {
  onImageChange: (file: File | null) => void;
  imagePreviewUrl: string | null;
  promptText: string;
  subText: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageChange, imagePreviewUrl, promptText, subText }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

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
            <>
              <CameraIcon />
              <div className="flex text-sm text-slate-600 dark:text-slate-400">
                <p className="pl-1">{promptText}</p>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-500">{subText}</p>
            </>
          )}
        </div>
      </label>
      <input
        id={`fabric-upload-${promptText}`}
        name={`fabric-upload-${promptText}`}
        type="file"
        className="sr-only"
        accept="image/*"
        onChange={handleFileChange}
        ref={fileInputRef}
      />
    </div>
  );
};
