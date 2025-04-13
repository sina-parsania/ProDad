'use client';

import { useState, useRef, ChangeEvent } from 'react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  className?: string;
  initialImage?: string;
  onImageChange: (base64Image: string) => void;
}

export function FileUpload({ className, initialImage, onImageChange }: FileUploadProps) {
  const [preview, setPreview] = useState<string | null>(initialImage || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check if file is an image
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Check file size - 2MB limit
    if (file.size > 2 * 1024 * 1024) {
      alert('Image size exceeds 2MB limit');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const base64Data = reader.result as string;
      setPreview(base64Data);
      onImageChange(base64Data);
    };
    reader.readAsDataURL(file);
  };

  const handleClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className={cn('flex flex-col items-center', className)}>
      <div className="mb-4 relative">
        {preview ? (
          <div className="rounded-full w-32 h-32 overflow-hidden relative">
            <Image
              src={preview}
              alt="Profile preview"
              fill
              style={{ objectFit: 'cover' }}
              className="rounded-full"
            />
          </div>
        ) : (
          <div className="rounded-full w-32 h-32 bg-muted flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="40"
              height="40"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-muted-foreground"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
        )}
      </div>

      <div className="w-full max-w-xs">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />
        <Button type="button" variant="outline" onClick={handleClick} className="w-full">
          {preview ? 'Change Photo' : 'Upload Photo'}
        </Button>
      </div>
    </div>
  );
}
