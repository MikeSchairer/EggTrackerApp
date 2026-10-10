import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import { Coop, Chicken, LifeStage } from '../types/flock';
import { CHICKEN_BREEDS } from '../data/breeds';

interface ChickenModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveChicken: (chicken: Chicken) => void;
  editingChicken?: Chicken | null;
  coops: Coop[];
}

const AVATAR_COLORS = [
  '#B91C1C', // Crimson
  '#C2410C', // Rust
  '#D97706', // Amber
  '#059669', // Emerald
  '#0284C7', // Blue
  '#7C3AED', // Purple
  '#451A03', // Russet Brown
  '#334155', // Slate
];

export const ChickenModal: React.FC<ChickenModalProps> = ({
  isOpen,
  onClose,
  onSaveChicken,
  editingChicken,
  coops,
}) => {
  if (!isOpen) return null;

  const [name, setName] = useState<string>(editingChicken?.name || '');
  const [legBandId, setLegBandId] = useState<string>(editingChicken?.legBandId || '');
  const [bandColor, setBandColor] = useState<string>(editingChicken?.bandColor || 'Yellow');
  const [breedId, setBreedId] = useState<string>(editingChicken?.breedId || CHICKEN_BREEDS[0].id);
  const [coopId, setCoopId] = useState<string>(editingChicken?.coopId || coops[0]?.id || '');
  const [hatchDate, setHatchDate] = useState<string>(editingChicken?.hatchDate || '2026-03-15');
  const [gender, setGender] = useState<'hen' | 'rooster'>(editingChicken?.gender || 'hen');
  const [lifeStage, setLifeStage] = useState<LifeStage>(editingChicken?.lifeStage || 'active_layer');
  const [status, setStatus] = useState<Chicken['status']>(editingChicken?.status || 'active');
  const [colorDescription, setColorDescription] = useState<string>(editingChicken?.colorDescription || '');
  const [statusNotes, setStatusNotes] = useState<string>(editingChicken?.statusNotes || '');
  const [avatarColor, setAvatarColor] = useState<string>(editingChicken?.avatarColor || AVATAR_COLORS[0]);
  const [notes, setNotes] = useState<string>(editingChicken?.notes || '');
  const [initialWeight, setInitialWeight] = useState<string>('');

  const selectedBreed = CHICKEN_BREEDS.find(b => b.id === breedId) || CHICKEN_BREEDS[0];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const chickenId = editingChicken?.id || `chicken-${Date.now()}`;
    const weightRecords = editingChicken?.weightRecords ? [...editingChicken.weightRecords] : [];

    if (!editingChicken && initialWeight && parseInt(initialWeight) > 0) {
      weightRecords.push({
        id: `w-${Date.now()}`,
        date: '2026-10-09',
        weightGrams: parseInt(initialWeight),
        ageWeeks: 20,
        featheringStage: 'full_plumage',
        notes: 'Initial weight recorded at bird registration.',
      });
    }

    const chicken: Chicken = {
      id: chickenId,
      name: name.trim() || 'Unnamed Bird',
      legBandId: legBandId.trim() || undefined,
      bandColor: bandColor.trim() || undefined,
      breedId,
      coopId,
      hatchDate,
      gender,
      lifeStage,
      status,
      colorDescription: colorDescription.trim() || undefined,
      statusNotes: statusNotes.trim() || undefined,
      avatarColor,
      weightRecords,
      notes: notes.trim() || undefined,
      isFavorite: editingChicken?.isFavorite || false,
    };

    onSaveChicken(chicken);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-stone-900 rounded-2xl max-w-lg w-full max-h-[90vh] flex flex-col shadow-2xl border border-stone-200 dark:border-stone-800 transition-colors">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">
              {editingChicken ? `Edit Bird: ${editingChicken.name}` : 'Register New Chicken'}
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              Enter bird details, breed ancestry, hatch date, and coop placement.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">Bird Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Ruby, Marigold..."
                className="w-full text-xs font-medium text-stone-800 dark:text-stone-200 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg px-3 py-2 focus:outline-hidden focus:border-amber-700 dark:focus:border-amber-500 focus:bg-white dark:focus:bg-stone-900 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">Leg Band Tag / ID</label>
              <input
                type="text"
                value={legBandId}
                onChange={e => setLegBandId(e.target.value)}
                placeholder="e.g. R-104 (Optional)"
                className="w-full text-xs font-medium text-stone-800 dark:text-stone-200 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg px-3 py-2 focus:outline-hidden focus:border-amber-700 dark:focus:border-amber-500 focus:bg-white dark:focus:bg-stone-900 transition-colors"
              />
            </div>
          </div>

          {/* Breed & Preview */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">Breed</label>
            <select
              value={breedId}
              onChange={e => setBreedId(e.target.value)}
              className="w-full text-xs font-medium text-stone-800 dark:text-stone-200 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg px-3 py-2 focus:outline-hidden focus:border-amber-700 dark:focus:border-amber-500 focus:bg-white dark:focus:bg-stone-900 transition-colors"
            >
              {CHICKEN_BREEDS.map(breed => (
                <option key={breed.id} value={breed.id}>
                  {breed.name} ({breed.classification} · {breed.eggColorDisplay})
                </option>
              ))}
            </select>

            {/* Breed details banner */}
            <div className="mt-2 p-3 bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 rounded-lg text-xs space-y-1 text-stone-600 dark:text-stone-300">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-stone-800 dark:text-stone-200">{selectedBreed.name}</span>
                <span className="text-amber-800 dark:text-amber-400 font-semibold">{selectedBreed.eggColorDisplay}</span>
              </div>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 leading-relaxed">{selectedBreed.description}</p>
              <div className="flex items-center gap-3 text-[11px] text-stone-600 dark:text-stone-400 pt-1 border-t border-stone-200/60 dark:border-stone-700">
                <span>Annual: ~{selectedBreed.expectedAnnualEggs} eggs</span>
                <span>·</span>
                <span>Hen standard: {Math.round(selectedBreed.standardAdultHenWeightGrams / 453.6 * 10) / 10} lbs ({selectedBreed.standardAdultHenWeightGrams}g)</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">Assigned Coop</label>
              <select
                value={coopId}
                onChange={e => setCoopId(e.target.value)}
                className="w-full text-xs font-medium text-stone-800 dark:text-stone-200 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg px-3 py-2 focus:outline-hidden focus:border-amber-700 dark:focus:border-amber-500 focus:bg-white dark:focus:bg-stone-900 transition-colors"
              >
                {coops.map(coop => (
                  <option key={coop.id} value={coop.id}>{coop.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">Hatch Date</label>
              <input
                type="date"
                required
                value={hatchDate}
                onChange={e => setHatchDate(e.target.value)}
                className="w-full text-xs font-medium text-stone-800 dark:text-stone-200 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg px-3 py-2 focus:outline-hidden focus:border-amber-700 dark:focus:border-amber-500 focus:bg-white dark:focus:bg-stone-900 transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">Gender</label>
              <select
                value={gender}
                onChange={e => setGender(e.target.value as any)}
                className="w-full text-xs font-medium text-stone-800 dark:text-stone-200 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg px-3 py-2 focus:outline-hidden focus:border-amber-700 dark:focus:border-amber-500 focus:bg-white dark:focus:bg-stone-900 transition-colors"
              >
                <option value="hen">Hen / Pullet (Female)</option>
                <option value="rooster">Rooster / Cockerel (Male)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">Life Stage</label>
              <select
                value={lifeStage}
                onChange={e => setLifeStage(e.target.value as LifeStage)}
                className="w-full text-xs font-medium text-stone-800 dark:text-stone-200 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg px-3 py-2 focus:outline-hidden focus:border-amber-700 dark:focus:border-amber-500 focus:bg-white dark:focus:bg-stone-900 transition-colors"
              >
                <option value="chick">Chick (0-6 weeks)</option>
                <option value="pullet">Pullet / Juvenile (6-18 weeks)</option>
                <option value="point_of_lay">Point of Lay (18-24 weeks)</option>
                <option value="active_layer">Active Layer (Prime Adult)</option>
                <option value="broody">Broody (Sitting on eggs)</option>
                <option value="molting">Molting (Feather regeneration)</option>
                <option value="retired">Retired / Senior Pet</option>
                <option value="rooster">Flock Guardian / Rooster</option>
              </select>
            </div>
          </div>

          {/* Bird Status & Feathering Color */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">Flock Status</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value as any)}
                className="w-full text-xs font-medium text-stone-800 dark:text-stone-200 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg px-3 py-2 focus:outline-hidden focus:border-amber-700 dark:focus:border-amber-500 focus:bg-white dark:focus:bg-stone-900 transition-colors"
              >
                <option value="active">Active Flock Member</option>
                <option value="deceased">Deceased</option>
                <option value="sold">Sold</option>
                <option value="rehomed">Rehomed / Relocated</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">Color / Plumage Description</label>
              <input
                type="text"
                value={colorDescription}
                onChange={e => setColorDescription(e.target.value)}
                placeholder="e.g. Silver laced, white bouffant crest"
                className="w-full text-xs font-medium text-stone-800 dark:text-stone-200 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg px-3 py-2 focus:outline-hidden focus:border-amber-700 dark:focus:border-amber-500 focus:bg-white dark:focus:bg-stone-900 transition-colors"
              />
            </div>
          </div>

          {status !== 'active' && (
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                Status Notes ({status})
              </label>
              <input
                type="text"
                value={statusNotes}
                onChange={e => setStatusNotes(e.target.value)}
                placeholder={`e.g. ${status === 'deceased' ? 'Passed away of old age peacefully' : 'Transferred to neighbor coop'}`}
                className="w-full text-xs font-medium text-stone-800 dark:text-stone-200 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg px-3 py-2 focus:outline-hidden"
              />
            </div>
          )}

          {/* Initial weight for new bird */}
          {!editingChicken && (
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">Current Weight (Optional)</label>
              <div className="relative">
                <input
                  type="number"
                  min="50"
                  max="6000"
                  value={initialWeight}
                  onChange={e => setInitialWeight(e.target.value)}
                  placeholder="e.g. 2400 (grams)"
                  className="w-full text-xs font-medium text-stone-800 dark:text-stone-200 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg px-3 py-2 pr-12 focus:outline-hidden focus:border-amber-700 dark:focus:border-amber-500 focus:bg-white dark:focus:bg-stone-900 transition-colors font-mono tabular-nums"
                />
                <span className="absolute right-3 top-2 text-xs text-stone-400 dark:text-stone-500 font-medium">grams</span>
              </div>
            </div>
          )}

          {/* Avatar color swatch */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1.5">Tag Color Accent</label>
            <div className="flex items-center gap-2">
              {AVATAR_COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setAvatarColor(c)}
                  className={`w-7 h-7 rounded-full transition-transform ${avatarColor === c ? 'scale-115 ring-2 ring-stone-900 dark:ring-stone-100 ring-offset-2 dark:ring-offset-stone-900' : 'hover:scale-105'}`}
                  style={{ backgroundColor: c }}
                  aria-label={`Color ${c}`}
                />
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">Health & Personality Notes</label>
            <textarea
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="e.g. Very friendly, eats from hand, healthy clean wattles..."
              className="w-full text-xs font-medium text-stone-800 dark:text-stone-200 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg p-2.5 focus:outline-hidden focus:border-amber-700 dark:focus:border-amber-500 focus:bg-white dark:focus:bg-stone-900 transition-colors resize-none"
            />
          </div>

          {/* Buttons */}
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
              <span>{editingChicken ? 'Save Changes' : 'Register Bird'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
