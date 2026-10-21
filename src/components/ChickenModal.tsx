import React, { useState, useRef } from 'react';
import { X, Check, Camera, Image as ImageIcon, Trash2, Egg, Sparkles } from 'lucide-react';
import { Coop, Chicken, LifeStage, EggColor } from '../types/flock';
import { CHICKEN_BREEDS, EGG_COLORS } from '../data/breeds';
import { getTodayDateStr } from '../utils/dateUtils';

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
  const [coopId, setCoopId] = useState<string>(editingChicken?.coopId || coops[0]?.id || 'main-coop');
  const [hatchDate, setHatchDate] = useState<string>(editingChicken?.hatchDate || '2026-03-15');
  const [gender, setGender] = useState<'hen' | 'rooster'>(editingChicken?.gender || 'hen');
  const [lifeStage, setLifeStage] = useState<LifeStage>(editingChicken?.lifeStage || 'active_layer');
  const [status, setStatus] = useState<Chicken['status']>(editingChicken?.status || 'active');
  const [colorDescription, setColorDescription] = useState<string>(editingChicken?.colorDescription || '');
  const [statusNotes, setStatusNotes] = useState<string>(editingChicken?.statusNotes || '');
  const [avatarColor, setAvatarColor] = useState<string>(editingChicken?.avatarColor || AVATAR_COLORS[0]);
  const [notes, setNotes] = useState<string>(editingChicken?.notes || '');
  const [initialWeight, setInitialWeight] = useState<string>('');

  // Photo upload and default egg color
  const [photoUrl, setPhotoUrl] = useState<string>(editingChicken?.photoUrl || '');
  const [defaultEggColor, setDefaultEggColor] = useState<EggColor>(() => {
    if (editingChicken?.defaultEggColor) return editingChicken.defaultEggColor;
    const initialBreed = CHICKEN_BREEDS.find(b => b.id === (editingChicken?.breedId || CHICKEN_BREEDS[0].id));
    return initialBreed?.eggColorType || 'terracotta_brown';
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const selectedBreed = CHICKEN_BREEDS.find(b => b.id === breedId) || CHICKEN_BREEDS[0];

  const handleBreedChange = (newBreedId: string) => {
    setBreedId(newBreedId);
    // If not editing an existing chicken with custom egg color, auto-suggest breed's egg color
    if (!editingChicken) {
      const breed = CHICKEN_BREEDS.find(b => b.id === newBreedId);
      if (breed) {
        setDefaultEggColor(breed.eggColorType);
      }
    }
  };

  // Image upload and client-side compression
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 500;
        let width = img.width;
        let height = img.height;

        if (width > height && width > maxDim) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else if (height > maxDim) {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', 0.82);
          setPhotoUrl(compressed);
        }
      };
      if (event.target?.result) {
        img.src = event.target.result as string;
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const chickenId = editingChicken?.id || `chicken-${Date.now()}`;
    const weightRecords = editingChicken?.weightRecords ? [...editingChicken.weightRecords] : [];

    if (!editingChicken && initialWeight && parseInt(initialWeight) > 0) {
      weightRecords.push({
        id: `w-${Date.now()}`,
        date: getTodayDateStr(),
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
      photoUrl: photoUrl.trim() || undefined,
      defaultEggColor: gender === 'hen' ? defaultEggColor : undefined,
      weightRecords,
      notes: notes.trim() || undefined,
      isFavorite: editingChicken?.isFavorite || false,
    };

    onSaveChicken(chicken);
    onClose();
  };

  const selectedEggColorMeta = EGG_COLORS.find(c => c.id === defaultEggColor) || EGG_COLORS[3];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-stone-900 rounded-2xl max-w-lg w-full max-h-[92vh] flex flex-col shadow-2xl border border-stone-200 dark:border-stone-800 transition-colors">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-stone-900 dark:text-stone-100">
              {editingChicken ? `Edit Bird: ${editingChicken.name}` : 'Register New Chicken'}
            </h2>
            <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
              Enter bird details, photo, egg laying color, and coop placement.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          
          {/* PHOTO UPLOAD SECTION */}
          <div className="p-4 bg-stone-50 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-700/80 rounded-2xl space-y-3">
            <label className="block text-xs font-bold text-stone-800 dark:text-stone-200 uppercase tracking-wider flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>Bird Profile Photo</span>
            </label>

            <div className="flex items-center gap-4">
              {/* Photo Preview Container */}
              <div className="relative shrink-0">
                {photoUrl ? (
                  <img
                    src={photoUrl}
                    alt="Chicken Preview"
                    className="w-18 h-18 rounded-2xl object-cover ring-2 ring-amber-500/80 shadow-md"
                  />
                ) : (
                  <div
                    className="w-18 h-18 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-sm ring-1 ring-black/10 dark:ring-white/10"
                    style={{ backgroundColor: avatarColor }}
                  >
                    {name ? name.charAt(0).toUpperCase() : <ImageIcon className="w-8 h-8 opacity-60" />}
                  </div>
                )}
              </div>

              <div className="flex-1 space-y-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-amber-700 hover:bg-amber-800 dark:bg-amber-600 dark:hover:bg-amber-500 rounded-lg shadow-xs transition-colors cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>{photoUrl ? 'Change Photo' : 'Upload Photo'}</span>
                  </button>

                  {photoUrl && (
                    <button
                      type="button"
                      onClick={() => setPhotoUrl('')}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-rose-700 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Remove</span>
                    </button>
                  )}
                </div>

                <p className="text-[11px] text-stone-500 dark:text-stone-400 leading-tight">
                  Upload a photo from your camera or gallery. Automatically compressed for speed.
                </p>
              </div>
            </div>
          </div>

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

          {/* Breed Selection */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">Breed</label>
            <select
              value={breedId}
              onChange={e => handleBreedChange(e.target.value)}
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
            </div>
          </div>

          {/* DEFAULT EGG COLOR SELECTION (For Hens) */}
          {gender === 'hen' && (
            <div className="p-4 bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/50 rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-amber-950 dark:text-amber-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Egg className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                  <span>Default Egg Color</span>
                </label>

                {/* Selected Color Pill Indicator */}
                <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 shadow-2xs">
                  <span
                    className="w-3.5 h-3.5 rounded-full border shrink-0"
                    style={{
                      backgroundColor: selectedEggColorMeta.hex,
                      borderColor: selectedEggColorMeta.borderHex,
                    }}
                  />
                  <span className="text-stone-800 dark:text-stone-200">{selectedEggColorMeta.label}</span>
                </div>
              </div>

              <p className="text-[11px] text-stone-600 dark:text-stone-400 leading-tight">
                When logging daily eggs for {name ? name : 'this hen'}, the egg color will automatically default to this selection.
              </p>

              {/* Egg Color Swatches Grid (Includes Mint Green, Aqua, Porcelain White) */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                {EGG_COLORS.map(color => {
                  const isSelected = defaultEggColor === color.id;
                  return (
                    <button
                      key={color.id}
                      type="button"
                      onClick={() => setDefaultEggColor(color.id as EggColor)}
                      className={`flex items-center gap-2 p-2 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-amber-100/80 dark:bg-amber-900/40 border-amber-500 ring-2 ring-amber-500/40'
                          : 'bg-white dark:bg-stone-900 border-stone-200 dark:border-stone-700/80 hover:border-amber-300'
                      }`}
                    >
                      <span
                        className="w-4 h-4 rounded-full shrink-0 shadow-2xs"
                        style={{
                          backgroundColor: color.hex,
                          border: `1.5px solid ${color.borderHex}`,
                        }}
                      />
                      <span className="text-[11px] font-semibold text-stone-800 dark:text-stone-200 truncate">
                        {color.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">Assigned Coop</label>
              <select
                value={coopId}
                onChange={e => setCoopId(e.target.value)}
                className="w-full text-xs font-medium text-stone-800 dark:text-stone-200 bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg px-3 py-2 focus:outline-hidden focus:border-amber-700 dark:focus:border-amber-500 focus:bg-white dark:focus:bg-stone-900 transition-colors"
              >
                {coops.length === 0 ? (
                  <option value="main-coop">Main Coop (Default)</option>
                ) : (
                  coops.map(coop => (
                    <option key={coop.id} value={coop.id}>{coop.name}</option>
                  ))
                )}
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
                  className={`w-7 h-7 rounded-full transition-transform cursor-pointer ${avatarColor === c ? 'scale-115 ring-2 ring-stone-900 dark:ring-stone-100 ring-offset-2 dark:ring-offset-stone-900' : 'hover:scale-105'}`}
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
              className="px-4 py-2 text-xs font-semibold text-stone-600 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-amber-700 hover:bg-amber-800 active:bg-amber-900 dark:bg-amber-600 dark:hover:bg-amber-500 rounded-lg shadow-xs transition-colors cursor-pointer"
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
