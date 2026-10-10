import React, { useState } from 'react';
import { X, Check, Scale } from 'lucide-react';
import { Chicken, WeightRecord } from '../types/flock';
import { CHICKEN_BREEDS } from '../data/breeds';
import { calculateAgeInWeeks } from '../utils/analytics';

interface GrowthWeighInModalProps {
  isOpen: boolean;
  onClose: () => void;
  chicken: Chicken | null;
  onSaveWeight: (chickenId: string, record: WeightRecord) => void;
}

export const GrowthWeighInModal: React.FC<GrowthWeighInModalProps> = ({
  isOpen,
  onClose,
  chicken,
  onSaveWeight,
}) => {
  if (!isOpen || !chicken) return null;

  const [date, setDate] = useState<string>('2026-10-09');
  const [weightGrams, setWeightGrams] = useState<number>(2200);
  const [featheringStage, setFeatheringStage] = useState<'chick_down' | 'partial_plumage' | 'full_plumage' | 'molting'>('full_plumage');
  const [notes, setNotes] = useState<string>('');

  const breed = CHICKEN_BREEDS.find(b => b.id === chicken.breedId) || CHICKEN_BREEDS[0];
  const ageWeeks = calculateAgeInWeeks(chicken.hatchDate, date);

  // Target weight calculation for breed
  let expectedTarget = breed.standardAdultHenWeightGrams;
  if (ageWeeks <= 4) expectedTarget = breed.growthMilestones.week4;
  else if (ageWeeks <= 8) expectedTarget = breed.growthMilestones.week8;
  else if (ageWeeks <= 12) expectedTarget = breed.growthMilestones.week12;
  else if (ageWeeks <= 16) expectedTarget = breed.growthMilestones.week16;
  else if (ageWeeks <= 20) expectedTarget = breed.growthMilestones.week20;

  const weightLbs = Math.round((weightGrams / 453.6) * 10) / 10;
  const deltaGrams = weightGrams - expectedTarget;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const record: WeightRecord = {
      id: `weight-${Date.now()}`,
      date,
      weightGrams,
      ageWeeks,
      featheringStage,
      notes: notes.trim() || undefined,
    };
    onSaveWeight(chicken.id, record);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-stone-900 rounded-2xl max-w-md w-full max-h-[90vh] flex flex-col shadow-2xl border border-stone-200 dark:border-stone-800">
        <div className="px-6 py-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/40 flex items-center justify-center">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-stone-900 dark:text-stone-100">Record Growth Weigh-In</h2>
              <p className="text-xs text-stone-500 dark:text-stone-400">{chicken.name} · {breed.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="p-3 bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700 rounded-xl space-y-2 text-xs">
            <div className="flex justify-between text-stone-600 dark:text-stone-300">
              <span>Current Age:</span>
              <span className="font-semibold text-stone-800 dark:text-stone-100 font-mono">{ageWeeks} weeks</span>
            </div>
            <div className="flex justify-between text-stone-600 dark:text-stone-300">
              <span>Breed Milestone Target:</span>
              <span className="font-semibold text-stone-800 dark:text-stone-100 font-mono">{expectedTarget}g ({Math.round((expectedTarget / 453.6) * 10) / 10} lbs)</span>
            </div>
            <div className="flex justify-between text-stone-600 dark:text-stone-300">
              <span>Standard Adult Hen:</span>
              <span className="text-stone-700 dark:text-stone-300 font-mono">{breed.standardAdultHenWeightGrams}g</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">Weigh-In Date</label>
            <input
              type="date"
              required
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full text-xs font-medium text-stone-800 dark:text-stone-100 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg px-3 py-2 focus:outline-hidden focus:border-amber-700 focus:bg-white dark:focus:bg-stone-800 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">Scale Weight</label>
            <div className="relative">
              <input
                type="number"
                required
                min="40"
                max="7000"
                value={weightGrams}
                onChange={e => setWeightGrams(parseInt(e.target.value) || 0)}
                className="w-full text-base font-bold text-stone-900 dark:text-stone-100 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg px-3 py-2.5 pr-20 font-mono tabular-nums focus:outline-hidden focus:border-amber-700 focus:bg-white dark:focus:bg-stone-800 transition-colors"
              />
              <span className="absolute right-3 top-3 text-xs text-stone-500 dark:text-stone-400 font-medium">
                grams ({weightLbs} lbs)
              </span>
            </div>
            <div className="mt-1 flex items-center justify-between text-[11px] text-stone-500 dark:text-stone-400">
              <span>Variance vs expected target:</span>
              <span className={`font-mono font-medium ${deltaGrams >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-400'}`}>
                {deltaGrams >= 0 ? `+${deltaGrams}g` : `${deltaGrams}g`}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">Feathering & Coat Stage</label>
            <select
              value={featheringStage}
              onChange={e => setFeatheringStage(e.target.value as any)}
              className="w-full text-xs font-medium text-stone-800 dark:text-stone-100 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg px-3 py-2 focus:outline-hidden focus:border-amber-700 focus:bg-white dark:focus:bg-stone-800 transition-colors"
            >
              <option value="chick_down">Chick Down (Fuzz)</option>
              <option value="partial_plumage">Partial Juvenile Plumage</option>
              <option value="full_plumage">Full Adult Plumage</option>
              <option value="molting">Molting (Dropping old feathers)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">Health Observations</label>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. Bright alert eyes, clean crop, good muscle tone on keel..."
              className="w-full text-xs font-medium text-stone-800 dark:text-stone-100 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg p-2.5 focus:outline-hidden focus:border-amber-700 focus:bg-white dark:focus:bg-stone-800 transition-colors resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-stone-200 dark:border-stone-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-stone-600 dark:text-stone-300 hover:text-stone-800 dark:hover:text-stone-100 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-amber-700 hover:bg-amber-800 dark:bg-amber-600 dark:hover:bg-amber-500 rounded-lg shadow-xs transition-colors"
            >
              <Check className="w-4 h-4" />
              <span>Save Weight</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
