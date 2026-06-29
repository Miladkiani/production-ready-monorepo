"use client";

import React, { useRef, useState, useCallback, useEffect } from "react";
import { cn } from "../functions";
import Typography from "./Typography";
import { Button } from "./Button";

export interface ImageUploaderProps {
  name?: string;
  value?: File | null;
  onChange?: (file: File | null) => void;
  onBlur?: () => void;
  disabled?: boolean;
  className?: string;
  accept?: string;
  initialPreview?: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  name,
  value,
  onChange,
  onBlur,
  disabled = false,
  className,
  accept = "image/*",
  initialPreview,
}) => {
  const [internalFile, setInternalFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null | undefined>(
    initialPreview ?? null,
  );
  const inputRef = useRef<HTMLInputElement>(null);

  const file = value ?? internalFile;

  // update preview when initialPreview changes
  useEffect(() => {
    if (!file) {
      setPreview(initialPreview ?? null);
    }
  }, [initialPreview, file]);

  // update preview when file changes
  useEffect(() => {
    if (file instanceof File) {
      const url = URL.createObjectURL(file);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [file]);

  const handleFiles = useCallback(
    (newFiles: FileList | null) => {
      if (!newFiles || newFiles.length === 0) return;
      const selectedFile = newFiles[0];
      if (onChange) onChange(selectedFile);
      if (!value) setInternalFile(selectedFile);
    },
    [onChange, value],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      if (disabled) return;
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles, disabled],
  );

  const handleClick = () => {
    if (!disabled) inputRef.current?.click();
  };

  return (
    <div
      className={cn(
        " flex min-h-32  items-center justify-center border-2 border-dashed border-border rounded-lg p-4 cursor-pointer transition-colors duration-200",
        disabled ? "opacity-50 cursor-not-allowed" : "hover:border-primary",
        className,
      )}
      onClick={handleClick}
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      onBlur={onBlur}
      role="button"
      tabIndex={0}
      aria-disabled={disabled}
      aria-describedby={name ? `${name}-desc` : undefined}
    >
      <input
        ref={inputRef}
        name={name}
        id={name}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
        disabled={disabled}
      />

      {preview && preview?.length ? (
        <div className="relative w-24 h-24 flex items-center justify-center">
          <img
            src={preview}
            alt="Image preview"
            className="object-cover rounded-xl w-full h-full"
          />
          <Button
            iconOnly
            icon="X"
            onClick={(e) => {
              e.stopPropagation(); // prevent triggering file dialog
              setInternalFile(null);
              setPreview(null);
              if (inputRef.current) inputRef.current.value = "";
              if (onChange) onChange(null);
            }}
            className="absolute top-1 right-1  focus:outline-none focus:ring-2 focus:ring-primary"
            aria-label="Remove image"
            size="xs"
            color="danger"
            isRounded
          />
        </div>
      ) : (
        <Typography variant="body" color={disabled ? "muted" : "text"}>
          Drag and drop an image here or click to upload
        </Typography>
      )}
    </div>
  );
};

ImageUploader.displayName = "ImageUploader";
