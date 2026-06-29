"use client";

import { Control, Controller, FieldValues, Path } from "react-hook-form";
import { cn } from "../../functions";
import { FileUploader, FileUploaderProps } from "../FileUploader";
import { Typography } from "../Typography";

export interface IFileUploaderForm<TFieldValue extends FieldValues> {
  control: Control<TFieldValue>;
  name: Path<TFieldValue>;
  description?: string;
  label?: string;
}

type FileUploaderFormProps<TFieldValue extends FieldValues> =
  IFileUploaderForm<TFieldValue> &
    FileUploaderProps & {
      /** Optional callback when file changes */
      onChange?: (file: File | null) => void;
    };

export const FileUploaderForm = <TFieldValue extends FieldValues>({
  name,
  control,
  description,
  label,
  className,
  onChange,
  ...rest
}: FileUploaderFormProps<TFieldValue>) => {
  return (
    <div className={cn("flex flex-col gap-1 w-full", className)}>
      {label && (
        <label
          htmlFor={name}
          className="text-sm font-medium text-text-primary mb-1"
        >
          {label}
        </label>
      )}

      <Controller
        name={name}
        control={control}
        render={({ field, fieldState }) => (
          <>
            <FileUploader
              {...rest}
              name={name}
              value={field.value}
              onChange={(file) => {
                field.onChange(file);
                onChange?.(file as File | null);
              }}
              onBlur={field.onBlur}
              aria-invalid={!!fieldState.error}
            />

            {description && (
              <Typography id={`${name}-desc`} variant="caption" color="muted">
                {description}
              </Typography>
            )}
            {fieldState.error && (
              <Typography variant="caption" color="error">
                {fieldState.error.message}
              </Typography>
            )}
          </>
        )}
      />
    </div>
  );
};

FileUploaderForm.displayName = "FileUploaderForm";
