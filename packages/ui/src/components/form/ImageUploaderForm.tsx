"use client";

import { Control, Controller, FieldValues, Path } from "react-hook-form";
import { cn } from "../../functions";
import { ImageUploader, ImageUploaderProps } from "../ImageUploader";
import { Typography } from "../Typography";

export interface IImageUploaderForm<TFieldValue extends FieldValues> {
  control: Control<TFieldValue>;
  name: Path<TFieldValue>;
  description?: string;
  label?: string;
  initialPreview?: string;
}

type ImageUploaderFormProps<TFieldValue extends FieldValues> =
  IImageUploaderForm<TFieldValue> &
    Omit<ImageUploaderProps, "onChange" | "value">;

export const ImageUploaderForm = <TFieldValue extends FieldValues>({
  control,
  name,
  label,
  description,
  className,
  initialPreview,
  ...rest
}: ImageUploaderFormProps<TFieldValue>) => {
  return (
    <div className={cn("flex flex-col gap-2 w-full", className)}>
      {label && (
        <label className="text-sm font-medium text-text-primary mb-1">
          {label}
        </label>
      )}

      <Controller
        name={name}
        control={control}
        render={({ field, fieldState }) => (
          <>
            <ImageUploader
              {...rest}
              value={field.value ?? null}
              onChange={field.onChange}
              onBlur={field.onBlur}
              name={name}
              initialPreview={initialPreview}
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

ImageUploaderForm.displayName = "ImageUploaderForm";
