'use client';

import { useState } from 'react';
import { Plus, Trash2, GripVertical, ChevronDown, ChevronRight } from 'lucide-react';

export interface FieldConfig {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'dropdown';
  options?: string[];
  required?: boolean;
  placeholder?: string;
}

interface FieldConfiguratorProps {
  title: string;
  fields: FieldConfig[];
  onChange: (fields: FieldConfig[]) => void;
  allowedTypes?: Array<'text' | 'textarea' | 'dropdown'>;
}

export default function FieldConfigurator({
  title,
  fields,
  onChange,
  allowedTypes = ['text', 'textarea', 'dropdown']
}: FieldConfiguratorProps) {
  const [expandedFields, setExpandedFields] = useState<Set<number>>(new Set());

  const addField = () => {
    const newField: FieldConfig = {
      name: `field_${fields.length + 1}`,
      label: `New Field ${fields.length + 1}`,
      type: 'text',
      required: false,
      placeholder: ''
    };
    onChange([...fields, newField]);
    // Auto-expand the new field
    setExpandedFields(new Set([...expandedFields, fields.length]));
  };

  const removeField = (index: number) => {
    const updated = fields.filter((_, i) => i !== index);
    onChange(updated);
    // Remove from expanded set
    const newExpanded = new Set(expandedFields);
    newExpanded.delete(index);
    setExpandedFields(newExpanded);
  };

  const updateField = (index: number, updates: Partial<FieldConfig>) => {
    const updated = [...fields];
    updated[index] = { ...updated[index], ...updates };

    // If changing to non-dropdown type, remove options
    if (updates.type && updates.type !== 'dropdown') {
      delete updated[index].options;
    }

    // If changing to dropdown type and no options, add empty array
    if (updates.type === 'dropdown' && !updated[index].options) {
      updated[index].options = [];
    }

    onChange(updated);
  };

  const addOption = (fieldIndex: number) => {
    const updated = [...fields];
    const options = updated[fieldIndex].options || [];
    updated[fieldIndex].options = [...options, ''];
    onChange(updated);
  };

  const updateOption = (fieldIndex: number, optionIndex: number, value: string) => {
    const updated = [...fields];
    const options = [...(updated[fieldIndex].options || [])];
    options[optionIndex] = value;
    updated[fieldIndex].options = options;
    onChange(updated);
  };

  const removeOption = (fieldIndex: number, optionIndex: number) => {
    const updated = [...fields];
    const options = (updated[fieldIndex].options || []).filter((_, i) => i !== optionIndex);
    updated[fieldIndex].options = options;
    onChange(updated);
  };

  const moveField = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === fields.length - 1) return;

    const updated = [...fields];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [updated[index], updated[targetIndex]] = [updated[targetIndex], updated[index]];
    onChange(updated);
  };

  const toggleExpanded = (index: number) => {
    const newExpanded = new Set(expandedFields);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedFields(newExpanded);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-gray-900">{title}</h4>
        <button
          type="button"
          onClick={addField}
          className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-camp-green border border-camp-green rounded hover:bg-camp-green hover:text-white transition-colors"
        >
          <Plus className="h-3 w-3" />
          Add Field
        </button>
      </div>

      <div className="space-y-2">
        {fields.map((field, index) => (
          <div key={index} className="border border-gray-300 rounded-lg overflow-hidden bg-white">
            {/* Field Header - Collapsible */}
            <div className="flex items-center gap-2 p-3 bg-gray-50 border-b border-gray-300">
              <button
                type="button"
                onClick={() => toggleExpanded(index)}
                className="p-1 hover:bg-gray-200 rounded transition-colors"
              >
                {expandedFields.has(index) ? (
                  <ChevronDown className="h-4 w-4 text-gray-600" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-gray-600" />
                )}
              </button>

              <GripVertical className="h-4 w-4 text-gray-400" />

              <div className="flex-1 flex items-center gap-2">
                <span className="font-medium text-sm">{field.label}</span>
                <span className="text-xs text-gray-500">({field.type})</span>
                {field.required && (
                  <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded">Required</span>
                )}
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => moveField(index, 'up')}
                  disabled={index === 0}
                  className="p-1 text-gray-600 hover:bg-gray-200 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Move up"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => moveField(index, 'down')}
                  disabled={index === fields.length - 1}
                  className="p-1 text-gray-600 hover:bg-gray-200 rounded disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Move down"
                >
                  ↓
                </button>
                <button
                  type="button"
                  onClick={() => removeField(index)}
                  className="p-1 text-red-600 hover:bg-red-50 rounded"
                  title="Remove field"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Field Configuration - Collapsible */}
            {expandedFields.has(index) && (
              <div className="p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  {/* Field Name */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Field Name <span className="text-gray-500">(internal)</span>
                    </label>
                    <input
                      type="text"
                      value={field.name}
                      onChange={(e) => updateField(index, { name: e.target.value })}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:border-camp-green focus:ring-1 focus:ring-camp-green"
                      placeholder="field_name"
                    />
                  </div>

                  {/* Field Label */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Label <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={field.label}
                      onChange={(e) => updateField(index, { label: e.target.value })}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:border-camp-green focus:ring-1 focus:ring-camp-green"
                      placeholder="Field Label"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Field Type */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Field Type
                    </label>
                    <select
                      value={field.type}
                      onChange={(e) => updateField(index, { type: e.target.value as FieldConfig['type'] })}
                      className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:border-camp-green focus:ring-1 focus:ring-camp-green"
                    >
                      {allowedTypes.includes('text') && <option value="text">Short Text</option>}
                      {allowedTypes.includes('textarea') && <option value="textarea">Long Text</option>}
                      {allowedTypes.includes('dropdown') && <option value="dropdown">Dropdown</option>}
                    </select>
                  </div>

                  {/* Required */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Required?
                    </label>
                    <label className="flex items-center gap-2 px-2 py-1.5">
                      <input
                        type="checkbox"
                        checked={field.required || false}
                        onChange={(e) => updateField(index, { required: e.target.checked })}
                        className="w-4 h-4 rounded border-gray-300 text-camp-green focus:ring-camp-green"
                      />
                      <span className="text-sm text-gray-700">This field is required</span>
                    </label>
                  </div>
                </div>

                {/* Placeholder */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Placeholder Text
                  </label>
                  <input
                    type="text"
                    value={field.placeholder || ''}
                    onChange={(e) => updateField(index, { placeholder: e.target.value })}
                    className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:border-camp-green focus:ring-1 focus:ring-camp-green"
                    placeholder="Placeholder text..."
                  />
                </div>

                {/* Dropdown Options */}
                {field.type === 'dropdown' && (
                  <div className="pt-3 border-t border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-xs font-medium text-gray-700">
                        Dropdown Options
                      </label>
                      <button
                        type="button"
                        onClick={() => addOption(index)}
                        className="text-xs text-camp-green hover:underline"
                      >
                        + Add Option
                      </button>
                    </div>
                    <div className="space-y-2">
                      {(field.options || []).map((option, optIndex) => (
                        <div key={optIndex} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={option}
                            onChange={(e) => updateOption(index, optIndex, e.target.value)}
                            className="flex-1 px-2 py-1.5 text-sm border border-gray-300 rounded focus:border-camp-green focus:ring-1 focus:ring-camp-green"
                            placeholder={`Option ${optIndex + 1}`}
                          />
                          <button
                            type="button"
                            onClick={() => removeOption(index, optIndex)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                      {(!field.options || field.options.length === 0) && (
                        <p className="text-xs text-gray-500 italic">No options added yet</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {fields.length === 0 && (
        <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
          <p className="text-sm text-gray-600 mb-2">No fields configured yet</p>
          <button
            type="button"
            onClick={addField}
            className="text-sm text-camp-green hover:underline"
          >
            Add your first field
          </button>
        </div>
      )}
    </div>
  );
}
