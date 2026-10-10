import React, { useState } from 'react';
import { BookOpen, Search, Filter, ShieldCheck, Feather, Egg, Check } from 'lucide-react';
import { CHICKEN_BREEDS, EGG_COLORS, EGG_SIZES } from '../../data/breeds';
import { Chicken, BreedInfo, EggColor } from '../../types/flock';
import { EggVisual } from '../EggVisual';

interface BreedsTabProps {
  chickens: Chicken[];
  onRegisterBreedBird?: (breedId: string) => void;
}

export const BreedsTab: React.FC<BreedsTabProps> = ({ chickens, onRegisterBreedBird }) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [purposeFilter, setPurposeFilter] = useState<string>('all');
  const [eggColorFilter, setEggColorFilter] = useState<string>('all');
  const [selectedBreed, setSelectedBreed] = useState<BreedInfo>(CHICKEN_BREEDS[0]);

  const filteredBreeds = CHICKEN_BREEDS.filter(breed => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match = breed.name.toLowerCase().includes(q) || breed.origin.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (purposeFilter !== 'all' && breed.purpose !== purposeFilter) return false;
    if (eggColorFilter !== 'all' && breed.eggColorType !== eggColorFilter) return false;
    return true;
  });

  const getFlockCountForBreed = (breedId: string) => {
    return chickens.filter(c => c.breedId === breedId).length;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-stone-200 dark:border-stone-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100">Breed Standards & Egg Library</h1>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
            Encyclopedic standards for heritage poultry, egg shell pigments, comb classifications, and growth milestones.
          </p>
        </div>
      </div>

      {/* Filter toolbar */}
      <div className="p-4 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-stone-400 dark:text-stone-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search breed by name or origin..."
              className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-md pl-8 pr-3 py-1.5 text-xs text-stone-800 dark:text-stone-200 placeholder-stone-400"
            />
          </div>

          <select
            value={purposeFilter}
            onChange={e => setPurposeFilter(e.target.value)}
            className="bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-md px-2.5 py-1.5 text-xs text-stone-800 dark:text-stone-200 font-medium"
          >
            <option value="all">All Purposes (Dual, Layer, Ornamental)</option>
            <option value="Egg Layer">Egg Layer</option>
            <option value="Dual Purpose">Dual Purpose</option>
            <option value="Ornamental">Ornamental</option>
          </select>

          <select
            value={eggColorFilter}
            onChange={e => setEggColorFilter(e.target.value)}
            className="bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-md px-2.5 py-1.5 text-xs text-stone-800 dark:text-stone-200 font-medium"
          >
            <option value="all">All Egg Colors</option>
            {EGG_COLORS.map(c => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </select>
        </div>

        <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 pt-1 border-t border-stone-100 dark:border-stone-800">
          <span>Showing <strong className="text-stone-900 dark:text-stone-100 font-mono">{filteredBreeds.length}</strong> breed profiles</span>
          {(searchQuery || purposeFilter !== 'all' || eggColorFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setPurposeFilter('all');
                setEggColorFilter('all');
              }}
              className="text-amber-700 dark:text-amber-400 hover:underline font-semibold"
            >
              Reset filters
            </button>
          )}
        </div>
      </div>

      {/* Main 2-Column Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Breeds grid/list (5 cols) */}
        <div className="lg:col-span-5 space-y-3 min-w-0">
          {filteredBreeds.map(breed => {
            const flockCount = getFlockCountForBreed(breed.id);
            const isSelected = selectedBreed.id === breed.id;

            return (
              <div
                key={breed.id}
                onClick={() => setSelectedBreed(breed)}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  isSelected
                    ? 'item-card-selected ring-1 ring-amber-500/50'
                    : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 hover:border-stone-300 dark:hover:border-stone-700 hover:bg-stone-50/50 dark:hover:bg-stone-800/40'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <EggVisual color={breed.eggColorType} size="small" className="w-6 h-8" />
                    <div>
                      <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 item-title">{breed.name}</h3>
                      <p className="text-xs text-stone-500 dark:text-stone-400 item-subtext">{breed.origin}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200/80 dark:border-stone-700">
                      {breed.purpose}
                    </span>
                    {flockCount > 0 && (
                      <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-bold mt-1">
                        {flockCount} in your flock
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-2.5 pt-2 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between text-[11px] text-stone-500 dark:text-stone-400">
                  <span>~{breed.expectedAnnualEggs} eggs/yr</span>
                  <span>·</span>
                  <span>{breed.eggColorDisplay}</span>
                  <span>·</span>
                  <span>{breed.combType} comb</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Comprehensive Breed Encyclopedia Card (7 cols) */}
        <div className="lg:col-span-7 min-w-0">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-xs p-6 space-y-6 transition-colors">
            {/* Header */}
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-stone-200 dark:border-stone-800">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100">{selectedBreed.name}</h2>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200/80 dark:border-stone-700">
                    {selectedBreed.classification}
                  </span>
                </div>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-1">
                  Origin: {selectedBreed.origin} · Purpose: {selectedBreed.purpose}
                </p>
              </div>

              <div className="flex flex-col items-center p-3 bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700 rounded-xl">
                <EggVisual color={selectedBreed.eggColorType} size="large" className="w-8 h-11" />
                <span className="text-[10px] font-bold text-stone-700 dark:text-stone-300 mt-1.5 uppercase">Standard Shell</span>
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-stone-700 dark:text-stone-300 leading-relaxed bg-stone-50/70 dark:bg-stone-800/60 p-4 rounded-xl border border-stone-200/80 dark:border-stone-700/80">
              {selectedBreed.description}
            </p>

            {/* Egg Production Specifications */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-stone-800 dark:text-stone-200 uppercase tracking-wider">
                Egg Production Characteristics
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-stone-50 dark:bg-stone-800/80 rounded-xl border border-stone-200/80 dark:border-stone-700/80">
                  <span className="text-[11px] font-bold text-stone-500 dark:text-stone-400 block uppercase">Annual Egg Output</span>
                  <span className="text-base font-bold font-mono text-stone-900 dark:text-stone-100 tabular-nums">
                    ~{selectedBreed.expectedAnnualEggs}
                  </span>
                  <span className="text-[10px] text-stone-400 dark:text-stone-500 block">eggs per year</span>
                </div>

                <div className="p-3 bg-stone-50 dark:bg-stone-800/80 rounded-xl border border-stone-200/80 dark:border-stone-700/80">
                  <span className="text-[11px] font-bold text-stone-500 dark:text-stone-400 block uppercase">Shell Pigmentation</span>
                  <span className="text-xs font-bold text-amber-700 dark:text-amber-400 block truncate mt-1">
                    {selectedBreed.eggColorDisplay}
                  </span>
                </div>

                <div className="p-3 bg-stone-50 dark:bg-stone-800/80 rounded-xl border border-stone-200/80 dark:border-stone-700/80">
                  <span className="text-[11px] font-bold text-stone-500 dark:text-stone-400 block uppercase">Standard Egg Size</span>
                  <span className="text-base font-bold capitalize text-stone-900 dark:text-stone-100">
                    {selectedBreed.expectedEggSize.replace('_', ' ')}
                  </span>
                  <span className="text-[10px] text-stone-400 dark:text-stone-500 block">50g–60g standard</span>
                </div>
              </div>
            </div>

            {/* Bird Morphology & Physiology */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-stone-800 dark:text-stone-200 uppercase tracking-wider">
                Morphology & Hardiness
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 bg-stone-50 dark:bg-stone-800/80 rounded-xl border border-stone-200/80 dark:border-stone-700/80">
                  <span className="text-[11px] font-bold text-stone-500 dark:text-stone-400 block uppercase">Comb Type</span>
                  <strong className="text-stone-900 dark:text-stone-100 block mt-0.5">{selectedBreed.combType} Comb</strong>
                </div>

                <div className="p-3 bg-stone-50 dark:bg-stone-800/80 rounded-xl border border-stone-200/80 dark:border-stone-700/80">
                  <span className="text-[11px] font-bold text-stone-500 dark:text-stone-400 block uppercase">Cold Hardiness</span>
                  <strong className={`block mt-0.5 ${selectedBreed.coldHardy ? 'text-emerald-700 dark:text-emerald-400' : 'text-stone-500 dark:text-stone-400'}`}>
                    {selectedBreed.coldHardy ? '✓ Cold Hardy' : 'Moderate'}
                  </strong>
                </div>

                <div className="p-3 bg-stone-50 dark:bg-stone-800/80 rounded-xl border border-stone-200/80 dark:border-stone-700/80">
                  <span className="text-[11px] font-bold text-stone-500 dark:text-stone-400 block uppercase">Heat Tolerance</span>
                  <strong className={`block mt-0.5 ${selectedBreed.heatTolerant ? 'text-emerald-700 dark:text-emerald-400' : 'text-stone-500 dark:text-stone-400'}`}>
                    {selectedBreed.heatTolerant ? '✓ Heat Tolerant' : 'Moderate'}
                  </strong>
                </div>

                <div className="p-3 bg-stone-50 dark:bg-stone-800/80 rounded-xl border border-stone-200/80 dark:border-stone-700/80">
                  <span className="text-[11px] font-bold text-stone-500 dark:text-stone-400 block uppercase">Temperament</span>
                  <span className="text-stone-800 dark:text-stone-200 block truncate mt-0.5 font-medium">{selectedBreed.temperament}</span>
                </div>
              </div>
            </div>

            {/* Standard Adult Weights */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-stone-800 dark:text-stone-200 uppercase tracking-wider">
                Adult Target Weights
              </h3>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-stone-50 dark:bg-stone-800/80 rounded-xl border border-stone-200/80 dark:border-stone-700/80 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-stone-700 dark:text-stone-300">Adult Hen Standard</span>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400">Mature laying female</p>
                  </div>
                  <div className="text-right font-mono">
                    <span className="text-base font-bold text-stone-900 dark:text-stone-100 tabular-nums">
                      {selectedBreed.standardAdultHenWeightGrams}g
                    </span>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400">
                      ({Math.round((selectedBreed.standardAdultHenWeightGrams / 453.6) * 10) / 10} lbs)
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-stone-50 dark:bg-stone-800/80 rounded-xl border border-stone-200/80 dark:border-stone-700/80 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-stone-700 dark:text-stone-300">Adult Rooster Standard</span>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400">Mature flock sire</p>
                  </div>
                  <div className="text-right font-mono">
                    <span className="text-base font-bold text-stone-900 dark:text-stone-100 tabular-nums">
                      {selectedBreed.standardAdultRoosterWeightGrams}g
                    </span>
                    <p className="text-[11px] text-stone-500 dark:text-stone-400">
                      ({Math.round((selectedBreed.standardAdultRoosterWeightGrams / 453.6) * 10) / 10} lbs)
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Growth Curve Table */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-stone-800 dark:text-stone-200 uppercase tracking-wider">
                Growth Milestone Weight Table
              </h3>

              <div className="border border-stone-200 dark:border-stone-700/80 rounded-xl overflow-x-auto bg-white dark:bg-stone-900 shadow-xs">
                <table className="w-full min-w-[420px] text-left text-xs">
                  <thead className="bg-stone-100 dark:bg-stone-800 border-b border-stone-200 dark:border-stone-700 font-semibold text-stone-700 dark:text-stone-200">
                    <tr>
                      <th className="p-2.5">Milestone</th>
                      <th className="p-2.5">Standard Weight (g)</th>
                      <th className="p-2.5">Weight (lbs/oz)</th>
                      <th className="p-2.5">Development Phase</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 dark:divide-stone-800 font-mono tabular-nums">
                    <tr>
                      <td className="p-2.5 font-sans font-medium text-stone-900 dark:text-stone-100">Week 4</td>
                      <td className="p-2.5 text-stone-800 dark:text-stone-200">{selectedBreed.growthMilestones.week4}g</td>
                      <td className="p-2.5 text-stone-500 dark:text-stone-400">{Math.round((selectedBreed.growthMilestones.week4 / 453.6) * 10) / 10} lb</td>
                      <td className="p-2.5 font-sans text-stone-600 dark:text-stone-300">Chick plumage sprouting</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-sans font-medium text-stone-900 dark:text-stone-100">Week 8</td>
                      <td className="p-2.5 text-stone-800 dark:text-stone-200">{selectedBreed.growthMilestones.week8}g</td>
                      <td className="p-2.5 text-stone-500 dark:text-stone-400">{Math.round((selectedBreed.growthMilestones.week8 / 453.6) * 10) / 10} lb</td>
                      <td className="p-2.5 font-sans text-stone-600 dark:text-stone-300">Juvenile transition</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-sans font-medium text-stone-900 dark:text-stone-100">Week 12</td>
                      <td className="p-2.5 text-stone-800 dark:text-stone-200">{selectedBreed.growthMilestones.week12}g</td>
                      <td className="p-2.5 text-stone-500 dark:text-stone-400">{Math.round((selectedBreed.growthMilestones.week12 / 453.6) * 10) / 10} lb</td>
                      <td className="p-2.5 font-sans text-stone-600 dark:text-stone-300">Pullet growth acceleration</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-sans font-medium text-stone-900 dark:text-stone-100">Week 16</td>
                      <td className="p-2.5 text-stone-800 dark:text-stone-200">{selectedBreed.growthMilestones.week16}g</td>
                      <td className="p-2.5 text-stone-500 dark:text-stone-400">{Math.round((selectedBreed.growthMilestones.week16 / 453.6) * 10) / 10} lb</td>
                      <td className="p-2.5 font-sans text-stone-600 dark:text-stone-300">Pre-laying conditioning</td>
                    </tr>
                    <tr>
                      <td className="p-2.5 font-sans font-medium text-stone-900 dark:text-stone-100">Week 20</td>
                      <td className="p-2.5 text-stone-800 dark:text-stone-200">{selectedBreed.growthMilestones.week20}g</td>
                      <td className="p-2.5 text-stone-500 dark:text-stone-400">{Math.round((selectedBreed.growthMilestones.week20 / 453.6) * 10) / 10} lb</td>
                      <td className="p-2.5 font-sans text-stone-600 dark:text-stone-300">Point of lay reddening comb</td>
                    </tr>
                    <tr className="bg-amber-500/10 dark:bg-amber-950/40 font-bold text-amber-950 dark:text-amber-300">
                      <td className="p-2.5 font-sans">Adult (24w+)</td>
                      <td className="p-2.5">{selectedBreed.growthMilestones.adult}g</td>
                      <td className="p-2.5">{Math.round((selectedBreed.growthMilestones.adult / 453.6) * 10) / 10} lb</td>
                      <td className="p-2.5 font-sans">Full maturity layer</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
