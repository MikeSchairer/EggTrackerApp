import React, { useState, useRef } from 'react';
import { Plus, Search, Filter, Scale, ChevronRight, Edit3, Trash2, ArrowRightLeft, Calendar, Info, Heart, ArrowDown } from 'lucide-react';
import { Coop, Chicken, LifeStage, WeightRecord, EggLog } from '../../types/flock';
import { CHICKEN_BREEDS } from '../../data/breeds';
import { calculateAgeInWeeks, formatAgeFriendly, getLatestWeight } from '../../utils/analytics';
import { GrowthWeighInModal } from '../GrowthWeighInModal';

interface FlockTabProps {
  coops: Coop[];
  chickens: Chicken[];
  eggLogs: EggLog[];
  onOpenAddChicken: () => void;
  onEditChicken: (chicken: Chicken) => void;
  onDeleteChicken: (chickenId: string) => void;
  onSaveWeight: (chickenId: string, record: WeightRecord) => void;
  onTransferChicken: (chickenId: string, targetCoopId: string) => void;
}

export const FlockTab: React.FC<FlockTabProps> = ({
  coops,
  chickens,
  eggLogs,
  onOpenAddChicken,
  onEditChicken,
  onDeleteChicken,
  onSaveWeight,
  onTransferChicken,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCoopFilter, setSelectedCoopFilter] = useState<string>('all');
  const [selectedBreedFilter, setSelectedBreedFilter] = useState<string>('all');
  const [selectedStageFilter, setSelectedStageFilter] = useState<string>('all');
  const [selectedChicken, setSelectedChicken] = useState<Chicken | null>(chickens[0] || null);
  const [isWeighInOpen, setIsWeighInOpen] = useState<boolean>(false);
  const [highlightDetails, setHighlightDetails] = useState<boolean>(false);

  const detailsSectionRef = useRef<HTMLDivElement>(null);

  const coopMap = new Map(coops.map(c => [c.id, c]));
  const breedMap = new Map(CHICKEN_BREEDS.map(b => [b.id, b]));

  const handleSelectAndJump = (chicken: Chicken) => {
    setSelectedChicken(chicken);
    setHighlightDetails(true);
    setTimeout(() => {
      detailsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 40);
    setTimeout(() => {
      setHighlightDetails(false);
    }, 1500);
  };

  // Filter chickens
  const filteredChickens = chickens.filter(chicken => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = chicken.name.toLowerCase().includes(q);
      const matchBand = chicken.legBandId?.toLowerCase().includes(q);
      if (!matchName && !matchBand) return false;
    }
    if (selectedCoopFilter !== 'all' && chicken.coopId !== selectedCoopFilter) return false;
    if (selectedBreedFilter !== 'all' && chicken.breedId !== selectedBreedFilter) return false;
    if (selectedStageFilter !== 'all' && chicken.lifeStage !== selectedStageFilter) return false;
    return true;
  });

  // Active selected bird details
  const activeBird = selectedChicken ? (chickens.find(c => c.id === selectedChicken.id) || selectedChicken) : null;
  const activeBreed = activeBird ? breedMap.get(activeBreedId(activeBird.breedId)) : null;
  function activeBreedId(id: string) { return id; }
  const activeCoop = activeBird ? coopMap.get(activeBird.coopId) : null;
  const activeAgeWeeks = activeBird ? calculateAgeInWeeks(activeBird.hatchDate) : 0;
  const activeLatestWeight = activeBird ? getLatestWeight(activeBird) : null;

  // Attributed eggs count
  const attributedEggs = activeBird
    ? eggLogs.reduce((sum, log) => sum + log.eggs.filter(e => e.chickenId === activeBird.id).length, 0)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-stone-200 dark:border-stone-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100">Flock Inventory & Growth Tracking</h1>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
            Monitor weight trajectories, age milestones, breed standards, and housing across the flock.
          </p>
        </div>

        <button
          onClick={onOpenAddChicken}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-amber-700 hover:bg-amber-800 dark:bg-amber-600 dark:hover:bg-amber-500 rounded-lg shadow-xs transition-colors whitespace-nowrap self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Register New Bird</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-stone-400 dark:text-stone-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by name or band ID..."
              className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-md pl-8 pr-3 py-1.5 text-xs text-stone-800 dark:text-stone-200 placeholder-stone-400 dark:placeholder-stone-500"
            />
          </div>

          {/* Coop filter */}
          <select
            value={selectedCoopFilter}
            onChange={e => setSelectedCoopFilter(e.target.value)}
            className="bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-md px-2.5 py-1.5 text-xs text-stone-800 dark:text-stone-200 font-medium"
          >
            <option value="all">All Coops ({coops.length})</option>
            {coops.map(coop => (
              <option key={coop.id} value={coop.id}>{coop.name}</option>
            ))}
          </select>

          {/* Breed filter */}
          <select
            value={selectedBreedFilter}
            onChange={e => setSelectedBreedFilter(e.target.value)}
            className="bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-md px-2.5 py-1.5 text-xs text-stone-800 dark:text-stone-200 font-medium"
          >
            <option value="all">All Breeds</option>
            {CHICKEN_BREEDS.map(breed => (
              <option key={breed.id} value={breed.id}>{breed.name}</option>
            ))}
          </select>

          {/* Life stage filter */}
          <select
            value={selectedStageFilter}
            onChange={e => setSelectedStageFilter(e.target.value)}
            className="bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-md px-2.5 py-1.5 text-xs text-stone-800 dark:text-stone-200 font-medium"
          >
            <option value="all">All Life Stages</option>
            <option value="chick">Chicks</option>
            <option value="pullet">Pullets / Juveniles</option>
            <option value="point_of_lay">Point of Lay</option>
            <option value="active_layer">Active Layers</option>
            <option value="broody">Broody</option>
            <option value="molting">Molting</option>
            <option value="retired">Retired</option>
          </select>
        </div>

        <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 pt-1 border-t border-stone-100 dark:border-stone-800">
          <span>
            Showing <strong className="text-stone-900 dark:text-stone-100 font-mono">{filteredChickens.length}</strong> of {chickens.length} birds
          </span>
          {(searchQuery || selectedCoopFilter !== 'all' || selectedBreedFilter !== 'all' || selectedStageFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCoopFilter('all');
                setSelectedBreedFilter('all');
                setSelectedStageFilter('all');
              }}
              className="text-amber-800 dark:text-amber-400 hover:underline font-semibold"
            >
              Reset filters
            </button>
          )}
        </div>
      </div>

      {/* Main Split: Left list of birds / Right detailed growth profile */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Chicken Cards List (5 cols) */}
        <div className="lg:col-span-5 space-y-3 min-w-0">
          {filteredChickens.length === 0 ? (
            <div className="p-8 text-center bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl">
              <p className="text-xs text-stone-500 dark:text-stone-400">No chickens match your search criteria.</p>
            </div>
          ) : (
            filteredChickens.map(chicken => {
              const breed = breedMap.get(chicken.breedId);
              const coop = coopMap.get(chicken.coopId);
              const ageWeeks = calculateAgeInWeeks(chicken.hatchDate);
              const weight = getLatestWeight(chicken);
              const isSelected = activeBird?.id === chicken.id;

              return (
                <div
                  key={chicken.id}
                  onClick={() => setSelectedChicken(chicken)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'item-card-selected ring-1 ring-amber-500/50'
                      : 'border-stone-200 dark:border-stone-800 bg-white dark:bg-stone-900 hover:border-stone-300 dark:hover:border-stone-700 hover:bg-stone-50/50 dark:hover:bg-stone-800/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-xs ring-1 ring-black/10 dark:ring-white/20 shrink-0"
                        style={{ backgroundColor: chicken.avatarColor }}
                      >
                        {chicken.name.charAt(0)}
                      </div>

                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 item-title">{chicken.name}</h3>
                          {chicken.legBandId && (
                            <span className="text-[10px] font-mono font-medium bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 px-1.5 py-0.5 rounded-sm border border-stone-200/80 dark:border-stone-700">
                              {chicken.legBandId}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-stone-600 dark:text-stone-400 font-medium item-subtext">
                          {breed?.name || 'Heritage Bird'} · <span className="capitalize">{chicken.gender}</span>
                        </p>
                      </div>
                    </div>

                    <ChevronRight className={`w-4 h-4 transition-transform ${isSelected ? 'text-amber-700 dark:text-amber-400 translate-x-0.5' : 'text-stone-300 dark:text-stone-600'}`} />
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between gap-2 text-xs text-stone-500 dark:text-stone-400">
                    <div className="flex items-center gap-2 truncate">
                      <span className="truncate max-w-[120px] text-stone-600 dark:text-stone-300">{coop?.name || 'Coop'}</span>
                      <span>·</span>
                      <strong className="text-stone-800 dark:text-stone-200 font-mono tabular-nums">{weight ? `${weight}g` : '—'}</strong>
                    </div>

                    {/* Prominent Jump to Details Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectAndJump(chicken);
                      }}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all shrink-0 ${
                        isSelected
                          ? 'bg-amber-700 dark:bg-amber-500 text-white dark:text-stone-950 font-bold shadow-xs'
                          : 'bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 border border-stone-200/80 dark:border-stone-700'
                      }`}
                      title={`Jump to ${chicken.name}'s details dossier`}
                    >
                      <span>Details</span>
                      <ArrowDown className="w-3.5 h-3.5 lg:hidden" />
                      <ChevronRight className="w-3.5 h-3.5 hidden lg:inline" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right: Detailed Bird Dossier & Growth Analytics (7 cols) */}
        <div 
          ref={detailsSectionRef} 
          className={`lg:col-span-7 min-w-0 scroll-mt-24 transition-all duration-300 ${
            highlightDetails ? 'ring-2 ring-amber-500 rounded-2xl shadow-xl' : ''
          }`}
        >
          {activeBird && activeBreed ? (
            <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-xs p-6 space-y-6 transition-colors">
              {/* Header Dossier */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200 dark:border-stone-800">
                <div className="flex items-center gap-3.5">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-xs ring-2 ring-black/10 dark:ring-white/20 shrink-0"
                    style={{ backgroundColor: activeBird.avatarColor }}
                  >
                    {activeBird.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-xl font-bold text-stone-900 dark:text-stone-100">{activeBird.name}</h2>
                      <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200/80 dark:border-stone-700 capitalize">
                        {activeBird.lifeStage.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-xs text-stone-600 dark:text-stone-400 mt-0.5">
                      {activeBreed.name} ({activeBreed.classification}) · {activeBreed.origin}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <button
                    onClick={() => setIsWeighInOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-amber-700 hover:bg-amber-800 dark:bg-amber-600 dark:hover:bg-amber-500 rounded-lg shadow-xs transition-colors"
                  >
                    <Scale className="w-3.5 h-3.5" />
                    <span>Weigh Bird</span>
                  </button>

                  <button
                    onClick={() => onEditChicken(activeBird)}
                    className="p-2 text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors"
                    title="Edit bird details"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      if (window.confirm(`Remove ${activeBird.name} from flock records?`)) {
                        onDeleteChicken(activeBird.id);
                        setSelectedChicken(chickens.find(c => c.id !== activeBird.id) || null);
                      }
                    }}
                    className="p-2 text-stone-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors"
                    title="Delete bird"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Quick Spec Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 bg-stone-50 dark:bg-stone-800/80 rounded-xl border border-stone-200/80 dark:border-stone-700/80">
                  <span className="text-[11px] font-bold text-stone-500 dark:text-stone-400 block uppercase tracking-wider">Current Age</span>
                  <span className="text-base font-bold font-mono text-stone-900 dark:text-stone-100 tabular-nums">
                    {formatAgeFriendly(activeAgeWeeks)}
                  </span>
                  <span className="text-[10px] text-stone-500 dark:text-stone-400 block mt-0.5">Hatched {activeBird.hatchDate}</span>
                </div>

                <div className="p-3.5 bg-stone-50 dark:bg-stone-800/80 rounded-xl border border-stone-200/80 dark:border-stone-700/80">
                  <span className="text-[11px] font-bold text-stone-500 dark:text-stone-400 block uppercase tracking-wider">Latest Weight</span>
                  <span className="text-base font-bold font-mono text-stone-900 dark:text-stone-100 tabular-nums">
                    {activeLatestWeight ? `${activeLatestWeight}g` : 'Unweighed'}
                  </span>
                  <span className="text-[10px] text-stone-500 dark:text-stone-400 block mt-0.5">
                    {activeLatestWeight ? `(${Math.round((activeLatestWeight / 453.6) * 10) / 10} lbs)` : '—'}
                  </span>
                </div>

                <div className="p-3.5 bg-stone-50 dark:bg-stone-800/80 rounded-xl border border-stone-200/80 dark:border-stone-700/80">
                  <span className="text-[11px] font-bold text-stone-500 dark:text-stone-400 block uppercase tracking-wider">Egg Shell Pigment</span>
                  <span className="text-xs font-bold text-amber-700 dark:text-amber-400 block truncate mt-0.5">
                    {activeBreed.eggColorDisplay}
                  </span>
                  <span className="text-[10px] text-stone-500 dark:text-stone-400 block mt-0.5">~{activeBreed.expectedAnnualEggs} eggs/yr</span>
                </div>

                <div className="p-3.5 bg-stone-50 dark:bg-stone-800/80 rounded-xl border border-stone-200/80 dark:border-stone-700/80">
                  <span className="text-[11px] font-bold text-stone-500 dark:text-stone-400 block uppercase tracking-wider">Attributed Eggs</span>
                  <span className="text-base font-bold font-mono text-stone-900 dark:text-stone-100 tabular-nums">
                    {attributedEggs}
                  </span>
                  <span className="text-[10px] text-stone-500 dark:text-stone-400 block mt-0.5">individual logs</span>
                </div>
              </div>

              {/* Coop Relocation Controller */}
              <div className="p-3.5 bg-stone-50 dark:bg-stone-800/80 border border-stone-200/80 dark:border-stone-700/80 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-3">
                <div className="flex items-center gap-2">
                  <ArrowRightLeft className="w-4 h-4 text-stone-500 dark:text-stone-400 shrink-0" />
                  <div>
                    <span className="font-semibold text-stone-800 dark:text-stone-200">Assigned Housing: </span>
                    <span className="text-stone-700 dark:text-stone-300 font-medium">{activeCoop?.name}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-[11px] text-stone-500 dark:text-stone-400 font-medium">Transfer to:</label>
                  <select
                    value={activeBird.coopId}
                    onChange={e => onTransferChicken(activeBird.id, e.target.value)}
                    className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-md px-2.5 py-1 text-xs text-stone-800 dark:text-stone-100 font-semibold focus:ring-1 focus:ring-amber-500"
                  >
                    {coops.map(coop => (
                      <option key={coop.id} value={coop.id}>{coop.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Growth Curve Comparison against Breed Standard */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <h3 className="text-xs font-bold text-stone-800 dark:text-stone-200 uppercase tracking-wider">
                    Weight Curve vs {activeBreed.name} Standard Milestones
                  </h3>
                  <span className="text-xs text-stone-500 dark:text-stone-400 font-mono">
                    Adult Goal: {activeBreed.standardAdultHenWeightGrams}g
                  </span>
                </div>

                <div className="p-4 bg-stone-50 dark:bg-stone-800/70 border border-stone-200/80 dark:border-stone-700/80 rounded-xl space-y-3.5">
                  {/* Legend */}
                  <div className="flex items-center gap-4 text-[11px] text-stone-500 dark:text-stone-400 pb-1 border-b border-stone-200/60 dark:border-stone-700/60">
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-1.5 rounded-full bg-stone-300 dark:bg-stone-600 inline-block" />
                      <span>Breed Benchmark</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-1.5 rounded-full bg-amber-600 dark:bg-amber-400 inline-block" />
                      <span>Actual Bird Scale Weight</span>
                    </div>
                  </div>

                  {/* Milestones comparison bars */}
                  {[
                    { label: 'Week 4 Milestone', standard: activeBreed.growthMilestones.week4 },
                    { label: 'Week 8 Milestone', standard: activeBreed.growthMilestones.week8 },
                    { label: 'Week 12 Milestone', standard: activeBreed.growthMilestones.week12 },
                    { label: 'Week 16 Milestone', standard: activeBreed.growthMilestones.week16 },
                    { label: 'Week 20 Milestone', standard: activeBreed.growthMilestones.week20 },
                    { label: 'Adult Standard (24w+)', standard: activeBreed.growthMilestones.adult },
                  ].map((m, idx) => {
                    // Find actual weigh-in near this week
                    const targetWeek = (idx + 1) * 4;
                    const matchedRecord = activeBird.weightRecords?.find(
                      r => Math.abs(r.ageWeeks - targetWeek) <= 2
                    );
                    const actual = matchedRecord?.weightGrams;
                    const maxWeight = activeBreed.growthMilestones.adult * 1.15;
                    const standardPercent = Math.min(100, Math.round((m.standard / maxWeight) * 100));
                    const actualPercent = actual ? Math.min(100, Math.round((actual / maxWeight) * 100)) : 0;

                    return (
                      <div key={m.label} className="space-y-1">
                        <div className="flex justify-between text-[11px] text-stone-700 dark:text-stone-200">
                          <span className="font-semibold">{m.label}</span>
                          <span className="font-mono tabular-nums">
                            {actual ? (
                              <strong className="text-stone-900 dark:text-stone-100">{actual}g actual</strong>
                            ) : (
                              <span className="text-stone-400 dark:text-stone-500">Not recorded yet</span>
                            )}{' '}
                            <span className="text-stone-400 dark:text-stone-500">/ std {m.standard}g</span>
                          </span>
                        </div>

                        {/* Dual bar: standard benchmark vs actual */}
                        <div className="relative h-2.5 bg-stone-200/80 dark:bg-stone-700/80 rounded-full overflow-hidden border border-stone-200/40 dark:border-stone-600/60">
                          {/* Standard benchmark line/bar */}
                          <div
                            className="absolute top-0 bottom-0 bg-stone-300 dark:bg-stone-600 rounded-full"
                            style={{ width: `${standardPercent}%` }}
                          />
                          {/* Actual recorded weight bar */}
                          {actual && (
                            <div
                              className="absolute top-0 bottom-0 bg-amber-600 dark:bg-amber-400 rounded-full shadow-xs"
                              style={{ width: `${actualPercent}%` }}
                            />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Weigh-In History Ledger Table */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-stone-800 dark:text-stone-200 uppercase tracking-wider">
                    Weigh-In Log History ({activeBird.weightRecords?.length || 0})
                  </h3>
                  <button
                    onClick={() => setIsWeighInOpen(true)}
                    className="text-xs font-semibold text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    <span>New Weigh-In</span>
                  </button>
                </div>

                {(!activeBird.weightRecords || activeBird.weightRecords.length === 0) ? (
                  <div className="p-4 text-center bg-stone-50 dark:bg-stone-800/80 border border-stone-200 dark:border-stone-700/80 rounded-xl text-xs text-stone-500 dark:text-stone-400">
                    No weigh-ins recorded for {activeBird.name} yet. Click "Weigh Bird" to log scale weight.
                  </div>
                ) : (
                  <div className="border border-stone-200 dark:border-stone-700/80 rounded-xl overflow-x-auto bg-white dark:bg-stone-900 shadow-xs">
                    <table className="w-full min-w-[480px] text-left text-xs">
                      <thead className="bg-stone-100 dark:bg-stone-800 border-b border-stone-200 dark:border-stone-700 font-semibold text-stone-700 dark:text-stone-200">
                        <tr>
                          <th className="p-2.5">Date</th>
                          <th className="p-2.5">Age</th>
                          <th className="p-2.5">Scale Weight</th>
                          <th className="p-2.5">Feathering</th>
                          <th className="p-2.5">Observations</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100 dark:divide-stone-800">
                        {[...activeBird.weightRecords]
                          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                          .map(rec => (
                            <tr key={rec.id} className="hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors">
                              <td className="p-2.5 font-medium text-stone-800 dark:text-stone-200">{rec.date}</td>
                              <td className="p-2.5 font-mono text-stone-600 dark:text-stone-400 tabular-nums">{rec.ageWeeks} wks</td>
                              <td className="p-2.5 font-mono font-bold text-stone-900 dark:text-stone-100 tabular-nums">
                                {rec.weightGrams}g <span className="font-normal text-stone-400 dark:text-stone-500">({Math.round((rec.weightGrams / 453.6) * 10) / 10} lb)</span>
                              </td>
                              <td className="p-2.5 text-stone-600 dark:text-stone-300 capitalize">{rec.featheringStage.replace('_', ' ')}</td>
                              <td className="p-2.5 text-stone-500 dark:text-stone-400 truncate max-w-[140px]">{rec.notes || '—'}</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Bird Notes */}
              {activeBird.notes && (
                <div className="p-4 bg-amber-50/80 dark:bg-stone-800/80 border border-amber-200 dark:border-amber-700/60 rounded-xl text-xs space-y-1">
                  <strong className="block text-amber-900 dark:text-amber-300 font-bold uppercase tracking-wider text-[11px]">Manager Notes:</strong>
                  <p className="leading-relaxed text-amber-950 dark:text-stone-200">{activeBird.notes}</p>
                </div>
              )}
            </div>
          ) : (
            <div className="p-12 text-center bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl">
              <p className="text-xs text-stone-500 dark:text-stone-400">Select a chicken to view growth dossier and records.</p>
            </div>
          )}
        </div>
      </div>

      {/* Weigh-In Modal */}
      {isWeighInOpen && activeBird && (
        <GrowthWeighInModal
          isOpen={isWeighInOpen}
          onClose={() => setIsWeighInOpen(false)}
          chicken={activeBird}
          onSaveWeight={onSaveWeight}
        />
      )}
    </div>
  );
};

