"use client";

import * as React from "react";
import { memo, useState, useCallback, useMemo } from "react";
import { cn } from "../functions";
import Typography from "./Typography";
import { Button } from "./Button";

export interface Column<T> {
  key: keyof T | string;
  title: string;
  render?: (row: T) => React.ReactNode;
}

export interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  selectable?: boolean;
  onSelect?: (selected: T[]) => void;
  showActions?: boolean;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
    onPageChange: (page: number) => void;
  };
  emptyMessage?: string; // 👈 customizable empty message
  className?: string;
}

function TableComponent<T>({
  columns,
  data,
  selectable = false,
  onSelect,
  showActions = false,
  onEdit,
  onDelete,
  pagination,
  emptyMessage = "No records found", // 👈 default empty message
  className,
}: TableProps<T>) {
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());

  const toggleRow = useCallback(
    (index: number) => {
      setSelectedRows((prevSet) => {
        const newSet = new Set(prevSet);
        if (newSet.has(index)) {
          newSet.delete(index);
        } else {
          newSet.add(index);
        }
        if (onSelect) {
          onSelect(data.filter((_, i) => newSet.has(i)));
        }
        return newSet;
      });
    },
    [data, onSelect],
  );

  // Memoize colspan calculation
  const colSpan = useMemo(() => {
    return columns.length + (selectable ? 1 : 0) + (showActions ? 1 : 0);
  }, [columns.length, selectable, showActions]);

  return (
    <div className={cn("overflow-x-auto", className)}>
      <table className="w-full border border-border rounded-lg text-left">
        <thead className="bg-surface">
          <tr>
            {selectable && (
              <th className="p-sm border-b border-border">
                <input type="checkbox" aria-label="Select all" />
              </th>
            )}
            {columns.map((col) => (
              <th key={String(col.key)} className="p-sm border-b border-border">
                <Typography variant="body-strong">{col.title}</Typography>
              </th>
            ))}
            {showActions && (
              <th className="p-sm border-b border-border">
                <Typography variant="body-strong">Actions</Typography>
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td colSpan={colSpan} className="p-md text-center text-muted">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className="hover:bg-[var(--color-surface-hover)] transition-colors duration-150"
              >
                {selectable && (
                  <td className="p-sm border-b border-border">
                    <input
                      type="checkbox"
                      checked={selectedRows.has(rowIndex)}
                      onChange={() => toggleRow(rowIndex)}
                      aria-label={`Select row ${rowIndex + 1}`}
                    />
                  </td>
                )}
                {columns.map((col) => (
                  <td
                    key={String(col.key)}
                    className="p-sm border-b border-border"
                  >
                    {col.render
                      ? col.render(row)
                      : String(row[col.key as keyof T] ?? "")}
                  </td>
                ))}
                {showActions && (
                  <td className="p-sm border-b border-border flex gap-2">
                    {onEdit && (
                      <Button
                        onClick={() => onEdit(row)}
                        variant="outline"
                        fullWidth
                        size="sm"
                      >
                        Edit
                      </Button>
                    )}
                    {onDelete && (
                      <Button
                        onClick={() => onDelete(row)}
                        variant="outline"
                        color="danger"
                        size="sm"
                        fullWidth
                      >
                        Delete
                      </Button>
                    )}
                  </td>
                )}
              </tr>
            ))
          )}
        </tbody>
      </table>

      {pagination && (
        <div className="flex justify-end gap-sm mt-md">
          <button
            onClick={() => pagination.onPageChange(pagination.page - 1)}
            disabled={pagination.page <= 1}
            className="px-sm py-xs border rounded hover:bg-surface disabled:opacity-50"
          >
            Prev
          </button>
          <Typography variant="body">
            {pagination.page} /{" "}
            {Math.ceil(pagination.total / pagination.pageSize)}
          </Typography>
          <button
            onClick={() => pagination.onPageChange(pagination.page + 1)}
            disabled={
              pagination.page >=
              Math.ceil(pagination.total / pagination.pageSize)
            }
            className="px-sm py-xs border rounded hover:bg-surface disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

// Export memoized version
export const Table = memo(TableComponent) as typeof TableComponent;
