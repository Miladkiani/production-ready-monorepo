"use client";

import React, { useRef, useState, useCallback } from "react";
import { cn } from "../functions";
import { Typography } from "./Typography";
import { Button } from "./Button";
import { Icon } from "./Icon";
import type { IconName } from "./Icon";

export interface FileUploaderProps {
  name?: string;
  value?: File[] | File | null;
  onChange?: (files: File[] | File | null) => void;
  onBlur?: () => void;
  multiple?: boolean;
  disabled?: boolean;
  className?: string;
  accept?: string;
}

// Helper to get appropriate icon for file type
const getFileIcon = (fileName: string): IconName => {
  const ext = fileName.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "pdf":
    case "doc":
    case "docx":
    case "txt":
      return "FileText";
    case "js":
    case "ts":
    case "jsx":
    case "tsx":
    case "json":
    case "html":
    case "css":
      return "FileCode";
    default:
      return "FileText";
  }
};

// Helper to format file size
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

export const FileUploader: React.FC<FileUploaderProps> = ({
  name,
  value,
  onChange,
  onBlur,
  multiple = false,
  disabled = false,
  className,
  accept,
}) => {
  const [internalFiles, setInternalFiles] = useState<File[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Normalize value to array for consistent handling
  const normalizeValue = (
    val: File[] | File | null | undefined,
  ): File[] | null => {
    if (!val) return null;
    if (Array.isArray(val)) return val.length > 0 ? val : null;
    return [val];
  };

  const files = normalizeValue(value) ?? internalFiles;
  const hasFiles = files.length > 0;

  const handleFiles = useCallback(
    (newFiles: FileList | null) => {
      if (!newFiles) return;
      const fileArray = Array.from(newFiles);
      const updatedFiles = multiple ? [...files, ...fileArray] : fileArray;

      if (onChange) {
        onChange(multiple ? updatedFiles : (fileArray[0] ?? null));
      }

      // Maintain internal state only if no controlled `value` is provided
      if (value === undefined) setInternalFiles(updatedFiles);
    },
    [files, multiple, onChange, value],
  );

  const handleRemoveFile = useCallback(
    (e: React.MouseEvent, index: number) => {
      e.stopPropagation();
      const updatedFiles = files.filter((_, i) => i !== index);

      if (onChange) {
        if (multiple) {
          onChange(updatedFiles.length > 0 ? updatedFiles : null);
        } else {
          onChange(null);
        }
      }

      if (value === undefined) {
        setInternalFiles(updatedFiles);
      }

      // Reset input value to allow re-selecting the same file
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    },
    [files, multiple, onChange, value],
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
        "relative flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-4 cursor-pointer transition-colors duration-200 min-h-[80px]",
        disabled
          ? "opacity-50 cursor-not-allowed border-border"
          : hasFiles
            ? "border-success bg-success/5 hover:border-success/80"
            : "border-border hover:border-primary",
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
        multiple={multiple}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
        disabled={disabled}
        accept={accept}
      />

      {hasFiles ? (
        <div className="flex flex-col gap-2 w-full">
          {files.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="flex items-center gap-3 p-2 bg-surface rounded-md border border-border/50"
            >
              <Icon
                name={getFileIcon(file.name)}
                size={24}
                className="text-success flex-shrink-0"
              />
              <div className="flex-1 min-w-0">
                <Typography
                  variant="caption"
                  weight="medium"
                  className="truncate block"
                >
                  {file.name}
                </Typography>
                <Typography variant="caption" color="muted">
                  {formatFileSize(file.size)}
                </Typography>
              </div>
              <Button
                iconOnly
                icon="X"
                onClick={(e) => handleRemoveFile(e, index)}
                className="flex-shrink-0"
                aria-label={`Remove ${file.name}`}
                size="xs"
                color="danger"
                isRounded
                disabled={disabled}
              />
            </div>
          ))}
          {multiple && (
            <Typography
              variant="caption"
              color="muted"
              className="text-center mt-1"
            >
              Click to add more files
            </Typography>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <Icon name="Upload" size={24} className="text-text-muted" />
          <Typography variant="body" color={disabled ? "muted" : "text"}>
            Drag and drop files here or click to upload
          </Typography>
        </div>
      )}
    </div>
  );
};
