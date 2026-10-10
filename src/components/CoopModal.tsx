import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { Coop } from '../types/flock';

interface CoopModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveCoop: (coop: Coop) => void;
  editingCoop?: Coop | null;
}

const COOP_COLORS = ['#059669', '#D97706', '#2563EB', '#7C3AED', '#DC2626', '#4B5563'];

export const CoopModal: React.FC<CoopModalProps> = ({
  isOpen,
  onClose,
  onSaveCoop,
  editingCoop,
}) => {
  if (!isOpen) return null;

  const [name, setName] = useState<string>(editingCoop?.name || '');
  const [locationDescription, setLocationDescription] = useState<string>(editingCoop?.locationDescription || '');
  const [capacity, setCapacity] = useState<number>(editingCoop?.capacity || 10);
  const [nestingBoxes, setNestingBoxes] = useState<number>(editingCoop?.nestingBoxes || 3);
  const [roostLengthFeet, setRoostLengthFeet] = useState<number>(editingCoop?.roostLengthFeet || 10);
  const [beddingType, setBeddingType] = useState<Coop['beddingType']>(editingCoop?.beddingType || 'Pine Shavings');
  const [lastCleanedDate, setLastCleanedDate] = useState<string>(editingCoop?.lastCleanedDate || '2026-10-01');
  const [targetTempFahrenheit, setTargetTempFahrenheit] = useState<number>(editingCoop?.targetTempFahrenheit || 65);
  const [colorTheme, setColorTheme] = useState<string>(editingCoop?.colorTheme || COOP_COLORS[0]);
  const [notes, setNotes] = useState<string>(editingCoop?.notes || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const coop: Coop = {
      id: editingCoop?.id || `coop-${Date.now()}`,
      name: name.trim() || 'Untitled Coop',
      locationDescription: locationDescription.trim() || 'Homestead perimeter',
      capacity,
      nestingBoxes,
      roostLengthFeet,
      beddingType,
      lastCleanedDate,
      targetTempFahrenheit,
      colorTheme,
      notes: notes.trim() || undefined,
    };
    onSaveCoop(coop);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-stone-900 rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl border border-stone-200 dark:border-stone-800 transition-colors">
        <div className="px-6 py-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">
              {editingCoop ? `Edit Coop: ${editingCoop.name}` : 'Set Up New Coop'}
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              Manage roosting dimensions, nesting capacity, and maintenance schedules.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">Coop Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. South Pasture Mobile Coop..."
              className="w-full text-xs font-medium text-stone-800 dark:text-stone-200 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg px-3 py-2 focus:outline-hidden focus:border-amber-700 dark:focus:border-amber-500 focus:bg-white dark:focus:bg-stone-900 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">Location & Setup Description</label>
            <input
              type="text"
              value={locationDescription}
              onChange={e => setLocationDescription(e.target.value)}
              placeholder="e.g. Orchard perimeter with shaded run..."
              className="w-full text-xs font-medium text-stone-800 dark:text-stone-200 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg px-3 py-2 focus:outline-hidden focus:border-amber-700 dark:focus:border-amber-500 focus:bg-white dark:focus:bg-stone-900 transition-colors"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">Capacity (Birds)</label>
              <input
                type="number"
                min="1"
                max="100"
                value={capacity}
                onChange={e => setCapacity(parseInt(e.target.value) || 1)}
                className="w-full text-xs font-medium text-stone-800 dark:text-stone-200 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg px-3 py-2 font-mono tabular-nums"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">Nest Boxes</label>
              <input
                type="number"
                min="1"
                max="30"
                value={nestingBoxes}
                onChange={e => setNestingBoxes(parseInt(e.target.value) || 1)}
                className="w-full text-xs font-medium text-stone-800 dark:text-stone-200 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg px-3 py-2 font-mono tabular-nums"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">Roost Bar (ft)</label>
              <input
                type="number"
                min="2"
                max="100"
                value={roostLengthFeet}
                onChange={e => setRoostLengthFeet(parseInt(e.target.value) || 2)}
                className="w-full text-xs font-medium text-stone-800 dark:text-stone-200 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg px-3 py-2 font-mono tabular-nums"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">Bedding Substrate</label>
              <select
                value={beddingType}
                onChange={e => setBeddingType(e.target.value as any)}
                className="w-full text-xs font-medium text-stone-800 dark:text-stone-200 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg px-3 py-2"
              >
                <option value="Pine Shavings">Kiln-Dried Pine Shavings</option>
                <option value="Hemp Fiber">Natural Hemp Fiber</option>
                <option value="Clean Straw">Clean Wheat/Oat Straw</option>
                <option value="Washed Sand">Coarse Washed Sand</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">Last Cleaned Date</label>
              <input
                type="date"
                value={lastCleanedDate}
                onChange={e => setLastCleanedDate(e.target.value)}
                className="w-full text-xs font-medium text-stone-800 dark:text-stone-200 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg px-3 py-2"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">Color Badge Identifier</label>
            <div className="flex items-center gap-2">
              {COOP_COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColorTheme(c)}
                  className={`w-7 h-7 rounded-full transition-transform ${colorTheme === c ? 'scale-115 ring-2 ring-stone-900 dark:ring-stone-100 ring-offset-2 dark:ring-offset-stone-900' : 'hover:scale-105'}`}
                  style={{ backgroundColor: c }}
                  aria-label={`Color ${c}`}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">Maintenance & Ventilation Notes</label>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. Predator-proof hardware cloth, cross ventilation vents..."
              className="w-full text-xs font-medium text-stone-800 dark:text-stone-200 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg p-2.5 focus:outline-hidden focus:border-amber-700 dark:focus:border-amber-500 focus:bg-white dark:focus:bg-stone-900 transition-colors resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-200 dark:border-stone-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-stone-600 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-amber-700 hover:bg-amber-800 active:bg-amber-900 dark:bg-amber-600 dark:hover:bg-amber-500 rounded-lg shadow-xs transition-colors"
            >
              <Check className="w-4 h-4" />
              <span>{editingCoop ? 'Save Changes' : 'Create Coop'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
