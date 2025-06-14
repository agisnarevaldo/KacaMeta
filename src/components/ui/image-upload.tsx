"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Icon } from "@iconify/react";
import Image from "next/image";

interface ImageUploadProps {
  onImageSelect: (imageBase64: string | null) => void;
  currentImage?: string | null;
  className?: string;
}

export function ImageUpload({ onImageSelect, currentImage, className }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setPreview(result);
        onImageSelect(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleRemoveImage = () => {
    setPreview(null);
    onImageSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`grid gap-2 ${className}`}>
      <Label>Gambar Produk</Label>
      
      {preview ? (
        <div className="relative group">
          <div className="relative w-full h-48 border-2 border-gray-200 rounded-lg overflow-hidden">
            {preview.startsWith('data:') ? (
              // We use a div with background image for data URLs to avoid ESLint warnings
              // while maintaining compatibility (Next Image doesn't support data URLs)
              <div 
                className="w-full h-full bg-cover bg-center"
                style={{ backgroundImage: `url(${preview})` }}
                role="img"
                aria-label="Image preview"
              />
            ) : (
              <Image
                src={preview}
                alt="Preview"
                fill
                className="object-cover"
              />
            )}
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={triggerFileInput}
                  className="bg-white text-gray-700 hover:bg-gray-50"
                >
                  <Icon icon="ph:pencil-bold" className="h-4 w-4 mr-1" />
                  Ganti
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleRemoveImage}
                  className="bg-white text-red-600 hover:bg-red-50 hover:text-red-700"
                >
                  <Icon icon="ph:trash-bold" className="h-4 w-4 mr-1" />
                  Hapus
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div
          className={`
            w-full h-48 border-2 border-dashed rounded-lg cursor-pointer transition-all duration-200
            ${isDragging 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
            }
          `}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={triggerFileInput}
        >
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <Icon 
              icon="ph:image-bold" 
              className={`h-12 w-12 mb-3 ${isDragging ? 'text-blue-500' : 'text-gray-400'}`} 
            />
            <p className="text-sm font-medium mb-1">
              {isDragging ? 'Lepaskan file di sini' : 'Klik atau drag & drop'}
            </p>
            <p className="text-xs text-gray-400">
              PNG, JPG, JPEG (max. 5MB)
            </p>
          </div>
        </div>
      )}
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
      />
    </div>
  );
}
