'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2 } from 'lucide-react';

export interface ColumnConfig {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'dropdown' | 'checkbox';
  options?: string[];
  required?: boolean;
  placeholder?: string;
}

export interface TableRow {
  id?: string;
  [key: string]: any;
  order_index: number;
}

interface GenericTableProps {
  questionId: string;
  applicationId: string;
  value: TableRow[];
  onChange: (rows: TableRow[]) => void;
  columns: ColumnConfig[];
  isRequired?: boolean;
  addButtonText?: string;
  emptyStateText?: string;
}

export default function GenericTable({
  questionId,
  applicationId,
  value,
  onChange,
  columns,
  isRequired = false,
  addButtonText = 'Add Row',
  emptyStateText = 'No entries yet. Click "Add Row" to get started.'
}: GenericTableProps) {
  const [rows, setRows] = useState<TableRow[]>(value || []);

  // Sync with parent when rows change
  useEffect(() => {
    onChange(rows);
  }, [rows]);

  // Sync with parent value changes
  useEffect(() => {
    setRows(value || []);
  }, [value]);

  const addRow = () => {
    const newRow: TableRow = {
      order_index: rows.length
    };

    // Initialize all fields with empty values
    columns.forEach(col => {
      if (col.type === 'checkbox') {
        newRow[col.name] = false;
      } else {
        newRow[col.name] = '';
      }
    });

    const updated = [...rows, newRow];
    setRows(updated);
  };

  const deleteRow = (index: number) => {
    const updated = rows.filter((_, i) => i !== index)
      .map((row, i) => ({ ...row, order_index: i }));
    setRows(updated);
  };

  const updateRow = (index: number, field: string, value: any) => {
    const updated = [...rows];
    updated[index] = { ...updated[index], [field]: value };
    setRows(updated);
  };

  const renderField = (row: TableRow, column: ColumnConfig, rowIndex: number) => {
    const fieldId = `${questionId}-row-${rowIndex}-${column.name}`;
    const value = row[column.name] || '';

    switch (column.type) {
      case 'text':
        return (
          <input
            id={fieldId}
            type="text"
            value={value}
            onChange={(e) => updateRow(rowIndex, column.name, e.target.value)}
            placeholder={column.placeholder || ''}
            required={column.required}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        );

      case 'textarea':
        return (
          <textarea
            id={fieldId}
            value={value}
            onChange={(e) => updateRow(rowIndex, column.name, e.target.value)}
            placeholder={column.placeholder || ''}
            required={column.required}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        );

      case 'dropdown':
        return (
          <select
            id={fieldId}
            value={value}
            onChange={(e) => updateRow(rowIndex, column.name, e.target.value)}
            required={column.required}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select...</option>
            {column.options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );

      case 'checkbox':
        return (
          <div className="flex items-center justify-center">
            <input
              id={fieldId}
              type="checkbox"
              checked={!!value}
              onChange={(e) => updateRow(rowIndex, column.name, e.target.checked)}
              className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {rows.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg">
          <p className="text-gray-500">{emptyStateText}</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 border border-gray-300 rounded-lg">
            <thead className="bg-gray-50">
              <tr>
                {columns.map((column) => (
                  <th
                    key={column.name}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider"
                  >
                    {column.label}
                    {column.required && <span className="text-red-500 ml-1">*</span>}
                  </th>
                ))}
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {rows.map((row, rowIndex) => (
                <tr key={row.id || rowIndex} className="hover:bg-gray-50">
                  {columns.map((column) => (
                    <td key={column.name} className="px-6 py-4 whitespace-nowrap">
                      {renderField(row, column, rowIndex)}
                    </td>
                  ))}
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button
                      type="button"
                      onClick={() => deleteRow(rowIndex)}
                      className="text-red-600 hover:text-red-800 p-1"
                      title="Delete row"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <button
        type="button"
        onClick={addRow}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
      >
        <Plus className="w-4 h-4" />
        {addButtonText}
      </button>

      {isRequired && rows.length === 0 && (
        <p className="text-sm text-red-600">At least one entry is required</p>
      )}
    </div>
  );
}
