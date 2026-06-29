"use client";

import React, { useState, useRef, useEffect } from "react";
import { cn } from "../functions";
import { Icon } from "./Icon";

export interface EditableTextProps {
  value: string;
  onSave: (newValue: string) => Promise<void> | void;
  as?: "p" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "span";
  multiline?: boolean;
  placeholder?: string;
  className?: string;
  editIconSize?: number;
  maxLength?: number;
  disabled?: boolean;
  required?: boolean;
  label?: string;
  "aria-label"?: string;
}

export const EditableText: React.FC<EditableTextProps> = ({
  value,
  onSave,
  as: Component = "p",
  multiline = false,
  placeholder = "Click to edit...",
  className,
  editIconSize = 16,
  maxLength,
  disabled = false,
  required = false,
  label,
  "aria-label": ariaLabel,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [currentValue, setCurrentValue] = useState(value);
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fieldId = useRef(`editable-${Math.random().toString(36).substr(2, 9)}`);

  // Compute accessible label
  const accessibleLabel = ariaLabel || label || "Editable text field";

  // Update internal state when prop changes
  useEffect(() => {
    setCurrentValue(value);
  }, [value]);

  // Focus input when entering edit mode
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      // Select all text
      if (inputRef.current instanceof HTMLTextAreaElement) {
        inputRef.current.select();
      } else {
        inputRef.current.setSelectionRange(0, inputRef.current.value.length);
      }
    }
  }, [isEditing]);

  // Close on click outside
  useEffect(() => {
    if (!isEditing) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        handleCancel();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEditing, currentValue]);

  const handleSave = async () => {
    if (required && !currentValue.trim()) {
      // Reset to original value if required and empty
      setCurrentValue(value);
      setIsEditing(false);
      return;
    }

    if (currentValue === value) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    try {
      await onSave(currentValue);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to save:", error);
      // Reset to original value on error
      setCurrentValue(value);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setCurrentValue(value);
    setIsEditing(false);
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    if (e.key === "Escape") {
      handleCancel();
    } else if (e.key === "Enter" && !multiline) {
      e.preventDefault();
      handleSave();
    } else if (e.key === "Enter" && multiline && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSave();
    }
  };

  if (isEditing) {
    return (
      <div
        ref={containerRef}
        className="relative"
        role="group"
        aria-labelledby={label ? `${fieldId.current}-label` : undefined}
      >
        {label && (
          <label
            id={`${fieldId.current}-label`}
            htmlFor={fieldId.current}
            className="block text-sm font-medium text-text mb-2"
          >
            {label}
            {required && (
              <span className="text-primary ml-1" aria-label="required">
                *
              </span>
            )}
          </label>
        )}

        {multiline ? (
          <textarea
            id={fieldId.current}
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={currentValue}
            onChange={(e) => setCurrentValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            maxLength={maxLength}
            disabled={isSaving}
            required={required}
            aria-label={!label ? accessibleLabel : undefined}
            aria-invalid={required && !currentValue.trim()}
            aria-describedby={`${fieldId.current}-hint ${maxLength ? `${fieldId.current}-counter` : ""}`}
            className={cn(
              "w-full px-3 py-2 rounded-lg border border-primary",
              "bg-surface text-text placeholder:text-muted",
              "focus:outline-none focus:ring-2 focus:ring-primary/50",
              "resize-none min-h-[100px]",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              className,
            )}
            rows={4}
          />
        ) : (
          <input
            id={fieldId.current}
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type="text"
            value={currentValue}
            onChange={(e) => setCurrentValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            maxLength={maxLength}
            disabled={isSaving}
            required={required}
            aria-label={!label ? accessibleLabel : undefined}
            aria-invalid={required && !currentValue.trim()}
            aria-describedby={`${fieldId.current}-hint ${maxLength ? `${fieldId.current}-counter` : ""}`}
            className={cn(
              "w-full px-3 py-2 rounded-lg border border-primary",
              "bg-surface text-text placeholder:text-muted",
              "focus:outline-none focus:ring-2 focus:ring-primary/50",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              className,
            )}
          />
        )}

        <div className="flex items-center gap-2 mt-2">
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            aria-label="Save changes"
            className={cn(
              "px-3 py-1.5 rounded-lg text-sm font-medium",
              "bg-primary text-text-inverse",
              "hover:bg-primary/90 transition-colors",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "flex items-center gap-1.5",
            )}
          >
            {isSaving ? (
              <>
                <Icon
                  name="Loader2"
                  size={14}
                  className="animate-spin"
                  aria-hidden="true"
                />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Icon name="Check" size={14} aria-hidden="true" />
                <span>Save</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleCancel}
            disabled={isSaving}
            aria-label="Cancel editing"
            className={cn(
              "px-3 py-1.5 rounded-lg text-sm font-medium",
              "bg-border text-text",
              "hover:bg-border/80 transition-colors",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "flex items-center gap-1.5",
            )}
          >
            <Icon name="X" size={14} aria-hidden="true" />
            <span>Cancel</span>
          </button>

          {multiline && (
            <span
              id={`${fieldId.current}-hint`}
              className="text-xs text-muted ml-auto"
              role="status"
            >
              Ctrl+Enter to save, Escape to cancel
            </span>
          )}
        </div>

        {maxLength && (
          <div
            id={`${fieldId.current}-counter`}
            className="text-xs text-muted mt-1 text-right"
            role="status"
            aria-live="polite"
          >
            {currentValue.length} / {maxLength} characters
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        "group relative inline-flex items-start gap-2 w-full",
        !disabled && "cursor-pointer",
        disabled && "cursor-not-allowed opacity-50",
      )}
      onClick={() => !disabled && setIsEditing(true)}
      role="button"
      tabIndex={disabled ? -1 : 0}
      onKeyDown={(e) => {
        if (!disabled && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          setIsEditing(true);
        }
      }}
      aria-label={`${accessibleLabel}. Current value: ${value || "empty"}. Press Enter or Space to edit.`}
      aria-disabled={disabled}
    >
      <Component
        className={cn(
          "flex-1",
          !value && "text-muted italic",
          !disabled && "group-hover:text-primary/80 transition-colors",
          className,
        )}
        aria-hidden="true"
      >
        {value || placeholder}
      </Component>

      {!disabled && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsEditing(true);
          }}
          className={cn(
            "opacity-0 group-hover:opacity-100 transition-opacity",
            "p-1 rounded hover:bg-primary/10",
            "text-muted hover:text-primary",
            "focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-primary/50",
          )}
          aria-label={`Edit ${accessibleLabel}`}
          tabIndex={0}
        >
          <Icon name="Pencil" size={editIconSize} aria-hidden="true" />
        </button>
      )}
    </div>
  );
};

export default EditableText;
