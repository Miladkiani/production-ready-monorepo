"use client";

import { Control, Controller, FieldValues, Path } from "react-hook-form";
import {
  MultiSelect,
  MultiSelectProps,
  MultiSelectOption,
} from "../MultiSelect";

export interface IMultiSelectForm<TFieldValue extends FieldValues> {
  control: Control<TFieldValue>;
  name: Path<TFieldValue>;
  isSingleSelect?: boolean; // New prop to handle single value
}

type MultiSelectFormProps<TFieldValue extends FieldValues> =
  IMultiSelectForm<TFieldValue> & MultiSelectProps;

export const MultiSelectForm = <TFieldValue extends FieldValues>({
  name,
  control,
  isSingleSelect = false,
  ...props
}: MultiSelectFormProps<TFieldValue>) => {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field }) => {
        // Handle single select mode
        const value = isSingleSelect
          ? field.value
            ? [
                props.options?.find((opt) => opt.value === field.value) ||
                  props.options?.[0],
              ].filter(Boolean)
            : []
          : field.value || [];

        const onChange = isSingleSelect
          ? (selected: MultiSelectOption[]) => {
              field.onChange(selected[0]?.value || "");
            }
          : field.onChange;

        return (
          <MultiSelect
            {...props}
            name={name}
            value={value}
            onChange={onChange}
          />
        );
      }}
    />
  );
};
