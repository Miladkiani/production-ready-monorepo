"use client";

import * as React from "react";
import { memo, useState, useRef, useCallback, useEffect, useMemo } from "react";
import { cn } from "../functions";
import { Typography } from "./Typography";
import { Chip } from "./Chip";
import { Icon, IconName } from "./Icon";

export interface MultiSelectOption {
  value: string | number;
  label: string;
  icon?: IconName | React.ReactNode;
}

export interface MultiSelectProps {
  name?: string;
  options: MultiSelectOption[];
  value?: MultiSelectOption[]; // controlled
  defaultValue?: MultiSelectOption[]; // uncontrolled
  onChange?: (selected: MultiSelectOption[]) => void;
  isMultiple?: boolean;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  showIcons?: boolean; // New prop to control icon display
}

export const MultiSelect = memo<MultiSelectProps>(function MultiSelect({
  name,
  options,
  value,
  defaultValue = [],
  onChange,
  isMultiple = false,
  placeholder = "Select...",
  disabled = false,
  className,
  showIcons = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const [internalValue, setInternalValue] =
    useState<MultiSelectOption[]>(defaultValue);

  const selected = value ?? internalValue;
  const containerRef = useRef<HTMLDivElement>(null);

  const toggleOpen = useCallback(() => {
    if (!disabled) setIsOpen((prev) => !prev);
  }, [disabled]);

  const handleSelect = useCallback(
    (option: MultiSelectOption) => {
      let updated: MultiSelectOption[];
      if (isMultiple) {
        if (selected.find((v) => v.value === option.value)) {
          updated = selected.filter((v) => v.value !== option.value);
        } else {
          updated = [...selected, option];
        }
      } else {
        updated = [option];
        setIsOpen(false);
      }

      if (onChange) onChange(updated);
      if (!value) setInternalValue(updated);
    },
    [isMultiple, selected, onChange, value],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isOpen && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
        setIsOpen(true);
        e.preventDefault();
        return;
      }

      switch (e.key) {
        case "ArrowDown":
          setHighlightedIndex((prev) => (prev + 1) % options.length);
          e.preventDefault();
          break;
        case "ArrowUp":
          setHighlightedIndex(
            (prev) => (prev - 1 + options.length) % options.length,
          );
          e.preventDefault();
          break;
        case "Enter":
          handleSelect(options[highlightedIndex]);
          e.preventDefault();
          break;
        case "Escape":
          setIsOpen(false);
          e.preventDefault();
          break;
      }
    },
    [isOpen, options, highlightedIndex, handleSelect],
  );

  const handleClickOutside = useCallback((e: MouseEvent) => {
    if (
      containerRef.current &&
      !containerRef.current.contains(e.target as Node)
    ) {
      setIsOpen(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [handleClickOutside]);

  const renderIcon = useCallback(
    (icon?: IconName | React.ReactNode) => {
      if (!icon || !showIcons) return null;

      if (typeof icon === "string") {
        return <Icon name={icon as IconName} size={18} color="primary" />;
      }

      return icon;
    },
    [showIcons],
  );

  // Memoize selected display
  const selectedDisplay = useMemo(() => {
    if (isMultiple) {
      return selected.length > 0 ? (
        <div className="flex flex-wrap gap-1">
          {selected.map((item) => (
            <Chip
              key={item.value}
              label={item.label}
              onRemove={() => handleSelect(item)}
            />
          ))}
        </div>
      ) : (
        <Typography variant="body" color="muted">
          {placeholder}
        </Typography>
      );
    }

    return selected.length > 0 ? (
      <div className="flex items-center gap-2">
        {renderIcon(selected[0].icon)}
        <Typography variant="body">{selected[0].label}</Typography>
      </div>
    ) : (
      <Typography variant="body" color="muted">
        {placeholder}
      </Typography>
    );
  }, [isMultiple, selected, placeholder, renderIcon, handleSelect]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative w-full",
        className,
        disabled && "opacity-50 cursor-not-allowed",
      )}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      aria-disabled={disabled}
      aria-haspopup="listbox"
      aria-expanded={isOpen}
    >
      <div
        className={cn(
          "flex items-center gap-2 border-2 rounded-lg px-4 py-3 cursor-pointer",
          "transition-all duration-200 ease-in-out",
          // Default state
          "border-border bg-surface",
          // Hover state
          !disabled && "hover:border-border-hover",
          // Focus state (when open)
          isOpen &&
            "border-primary ring-2 ring-primary/20 shadow-lg shadow-primary/5",
          // Disabled state
          disabled && "cursor-not-allowed opacity-50 bg-surface-hover",
        )}
        onClick={toggleOpen}
      >
        {selectedDisplay}
      </div>

      {isOpen && (
        <ul
          className="absolute z-50 mt-2 w-full bg-surface border-2 border-border rounded-lg shadow-xl max-h-60 overflow-auto"
          role="listbox"
        >
          {options.map((option, idx) => {
            const isSelected = selected.some((v) => v.value === option.value);
            const isHighlighted = idx === highlightedIndex;
            return (
              <li
                key={option.value}
                className={cn(
                  "cursor-pointer px-4 py-3 transition-all duration-150 flex items-center gap-2",
                  "hover:bg-primary/10",
                  isHighlighted && "bg-primary/20",
                  isSelected && "font-semibold bg-primary/5 text-primary",
                  "first:rounded-t-lg last:rounded-b-lg",
                )}
                onMouseEnter={() => setHighlightedIndex(idx)}
                onClick={() => handleSelect(option)}
                role="option"
                aria-selected={isSelected}
              >
                {renderIcon(option.icon)}
                <span>{option.label}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
});
