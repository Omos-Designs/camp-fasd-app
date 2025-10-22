'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, ChevronDown, ChevronRight } from 'lucide-react';

export interface MedicationDose {
  id?: string;
  given_type: string;
  time: string;
  notes: string;
  order_index: number;
}

export interface Medication {
  id?: string;
  medication_name: string;
  strength: string;
  dose_amount: string;
  dose_form: string;
  doses: MedicationDose[];
  order_index: number;
}

interface FieldConfig {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'dropdown';
  options?: string[];
  required?: boolean;
  placeholder?: string;
}

interface MedicationListProps {
  questionId: string;
  applicationId: string;
  value: Medication[];
  onChange: (medications: Medication[]) => void;
  medicationFields?: FieldConfig[];
  doseFields?: FieldConfig[];
  isRequired?: boolean;
}

const DEFAULT_MEDICATION_FIELDS: FieldConfig[] = [
  { name: 'medication_name', label: 'Medication', type: 'text', required: true, placeholder: 'e.g., Adderall' },
  { name: 'strength', label: 'Strength', type: 'text', required: true, placeholder: 'e.g., 15mg' },
  { name: 'dose_amount', label: 'Dose Amount', type: 'text', required: true, placeholder: 'e.g., 1 pill two times a day' },
  {
    name: 'dose_form',
    label: 'Dose Form',
    type: 'dropdown',
    required: true,
    options: ['Pill', 'Tablet', 'Capsule', 'Liquid', 'Eye Drop', 'Nasal Spray', 'Inhaler', 'Injection', 'Topical', 'Patch', 'Suppository']
  }
];

const DEFAULT_DOSE_FIELDS: FieldConfig[] = [
  {
    name: 'given_type',
    label: 'Given',
    type: 'dropdown',
    required: true,
    options: ['At specific time', 'As needed']
  },
  { name: 'time', label: 'Time', type: 'text', required: false, placeholder: 'HH:MM (e.g., 08:00, 14:30) or N/A' },
  { name: 'notes', label: 'Notes', type: 'textarea', required: false, placeholder: 'Additional instructions...' }
];

export default function MedicationList({
  questionId,
  applicationId,
  value,
  onChange,
  medicationFields = DEFAULT_MEDICATION_FIELDS,
  doseFields = DEFAULT_DOSE_FIELDS,
  isRequired = false
}: MedicationListProps) {
  const [medications, setMedications] = useState<Medication[]>(value || []);
  const [expandedMedications, setExpandedMedications] = useState<Set<number>>(new Set());

  // Sync with parent when medications change
  useEffect(() => {
    onChange(medications);
  }, [medications]);

  // Sync with parent value changes
  useEffect(() => {
    setMedications(value || []);
  }, [value]);

  const addMedication = () => {
    const newMedication: Medication = {
      medication_name: '',
      strength: '',
      dose_amount: '',
      dose_form: '',
      doses: [],
      order_index: medications.length
    };
    const updated = [...medications, newMedication];
    setMedications(updated);
    // Auto-expand the new medication
    setExpandedMedications(new Set([...expandedMedications, medications.length]));
  };

  const removeMedication = (index: number) => {
    const updated = medications.filter((_, i) => i !== index);
    // Update order_index for remaining medications
    updated.forEach((med, i) => {
      med.order_index = i;
    });
    setMedications(updated);
    // Remove from expanded set
    const newExpanded = new Set(expandedMedications);
    newExpanded.delete(index);
    setExpandedMedications(newExpanded);
  };

  const updateMedication = (index: number, field: keyof Medication, value: any) => {
    const updated = [...medications];
    updated[index] = { ...updated[index], [field]: value };
    setMedications(updated);
  };

  const addDose = (medicationIndex: number) => {
    const updated = [...medications];
    const newDose: MedicationDose = {
      given_type: '',
      time: '',
      notes: '',
      order_index: updated[medicationIndex].doses.length
    };
    updated[medicationIndex].doses.push(newDose);
    setMedications(updated);
  };

  const removeDose = (medicationIndex: number, doseIndex: number) => {
    const updated = [...medications];
    updated[medicationIndex].doses = updated[medicationIndex].doses.filter((_, i) => i !== doseIndex);
    // Update order_index for remaining doses
    updated[medicationIndex].doses.forEach((dose, i) => {
      dose.order_index = i;
    });
    setMedications(updated);
  };

  const updateDose = (medicationIndex: number, doseIndex: number, field: keyof MedicationDose, value: string) => {
    const updated = [...medications];
    updated[medicationIndex].doses[doseIndex] = {
      ...updated[medicationIndex].doses[doseIndex],
      [field]: value
    };
    setMedications(updated);
  };

  const toggleExpanded = (index: number) => {
    const newExpanded = new Set(expandedMedications);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedMedications(newExpanded);
  };

  const validateTimeFormat = (time: string): boolean => {
    if (!time || time.trim() === '' || time.toUpperCase() === 'N/A') return true;
    // Validate HH:MM format (00:00 to 23:59)
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(time);
  };

  const renderFieldInput = (
    field: FieldConfig,
    value: string,
    onChange: (value: string) => void,
    fieldKey: string
  ) => {
    const baseClasses = "w-full px-3 py-2 text-sm border-2 border-gray-300 rounded-lg focus:border-camp-green focus:ring-2 focus:ring-camp-green/20 transition-colors";

    if (field.type === 'dropdown' && field.options) {
      return (
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={baseClasses}
          required={field.required}
        >
          <option value="">Select {field.label}</option>
          {field.options.map((option, i) => (
            <option key={i} value={option}>{option}</option>
          ))}
        </select>
      );
    }

    if (field.type === 'textarea') {
      return (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          rows={2}
          className={`${baseClasses} resize-y`}
          required={field.required}
        />
      );
    }

    // Special validation for time field
    const isTimeField = field.name === 'time';
    const isInvalidTime = isTimeField && value && !validateTimeFormat(value);

    return (
      <div>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={field.placeholder}
          className={`${baseClasses} ${isInvalidTime ? 'border-red-500' : ''}`}
          required={field.required}
        />
        {isInvalidTime && (
          <p className="text-xs text-red-600 mt-1">
            Please use HH:MM format (e.g., 08:00, 14:30) or enter "N/A"
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          {medications.length === 0 ? (
            <span>No medications added yet</span>
          ) : (
            <span>{medications.length} medication{medications.length !== 1 ? 's' : ''} listed</span>
          )}
        </div>
        <button
          type="button"
          onClick={addMedication}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-camp-green rounded-lg hover:bg-camp-green/90 transition-colors"
        >
          <Plus className="h-4 w-4" />
          Add Medication
        </button>
      </div>

      {/* Medications List */}
      <div className="space-y-4">
        {medications.map((medication, medIndex) => (
          <div key={medIndex} className="border-2 border-gray-300 rounded-lg overflow-hidden">
            {/* Medication Header - Expandable */}
            <div className="bg-gray-50 px-4 py-3 flex items-center justify-between border-b-2 border-gray-300">
              <button
                type="button"
                onClick={() => toggleExpanded(medIndex)}
                className="flex items-center gap-2 text-left flex-1"
              >
                {expandedMedications.has(medIndex) ? (
                  <ChevronDown className="h-5 w-5 text-gray-600 flex-shrink-0" />
                ) : (
                  <ChevronRight className="h-5 w-5 text-gray-600 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <span className="font-semibold text-gray-900">
                    {medication.medication_name || `Medication ${medIndex + 1}`}
                  </span>
                  {medication.medication_name && medication.strength && (
                    <span className="ml-2 text-sm text-gray-600">({medication.strength})</span>
                  )}
                  {!expandedMedications.has(medIndex) && medication.doses.length > 0 && (
                    <span className="ml-3 text-xs text-gray-500">
                      {medication.doses.length} dose{medication.doses.length !== 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </button>
              <button
                type="button"
                onClick={() => removeMedication(medIndex)}
                className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                aria-label="Remove medication"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>

            {/* Medication Details - Collapsible */}
            {expandedMedications.has(medIndex) && (
              <div className="p-4 space-y-4 bg-white">
                {/* Medication Fields Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {medicationFields.map((field) => (
                    <div key={field.name} className={field.name === 'dose_amount' ? 'md:col-span-2' : ''}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {field.label}
                        {field.required && <span className="text-red-500 ml-1">*</span>}
                      </label>
                      {renderFieldInput(
                        field,
                        (medication as any)[field.name] || '',
                        (value) => updateMedication(medIndex, field.name as keyof Medication, value),
                        `med-${medIndex}-${field.name}`
                      )}
                    </div>
                  ))}
                </div>

                {/* Doses Section */}
                <div className="mt-6 pt-6 border-t-2 border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-semibold text-gray-900">
                      Dose Schedule
                      {medication.doses.length > 0 && (
                        <span className="ml-2 text-xs font-normal text-gray-500">
                          ({medication.doses.length} dose{medication.doses.length !== 1 ? 's' : ''})
                        </span>
                      )}
                    </h4>
                    <button
                      type="button"
                      onClick={() => addDose(medIndex)}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-camp-green border-2 border-camp-green rounded-lg hover:bg-camp-green hover:text-white transition-colors"
                    >
                      <Plus className="h-3 w-3" />
                      Add Dose
                    </button>
                  </div>

                  {/* Doses Table */}
                  {medication.doses.length === 0 ? (
                    <div className="text-center py-6 text-sm text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                      No doses scheduled. Click "Add Dose" to add a dose schedule.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {medication.doses.map((dose, doseIndex) => (
                        <div
                          key={doseIndex}
                          className="p-4 bg-blue-50 border-2 border-blue-200 rounded-lg"
                        >
                          <div className="flex items-start justify-between mb-3">
                            <span className="text-sm font-medium text-blue-900">
                              Dose {doseIndex + 1}
                            </span>
                            <button
                              type="button"
                              onClick={() => removeDose(medIndex, doseIndex)}
                              className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                              aria-label="Remove dose"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {doseFields.map((field) => (
                              <div key={field.name} className={field.name === 'notes' ? 'md:col-span-3' : ''}>
                                <label className="block text-xs font-medium text-blue-900 mb-1">
                                  {field.label}
                                  {field.required && <span className="text-red-500 ml-1">*</span>}
                                </label>
                                {renderFieldInput(
                                  field,
                                  (dose as any)[field.name] || '',
                                  (value) => updateDose(medIndex, doseIndex, field.name as keyof MedicationDose, value),
                                  `dose-${medIndex}-${doseIndex}-${field.name}`
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Empty State - Only show when there are no medications */}
      {medications.length === 0 && (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
          <p className="text-gray-600 mb-4">No medications listed</p>
          <p className="text-sm text-gray-500 mb-4">Click the button above to add your first medication</p>
        </div>
      )}

      {/* Required Field Notice */}
      {isRequired && medications.length === 0 && (
        <p className="text-sm text-red-600">
          * At least one medication is required
        </p>
      )}
    </div>
  );
}
