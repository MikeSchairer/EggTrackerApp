import React, { useState } from 'react';
import { 
  Package, 
  Plus, 
  AlertTriangle, 
  TrendingDown, 
  DollarSign, 
  Clock, 
  Calendar, 
  Check, 
  Edit3, 
  Trash2, 
  Layers, 
  Sparkles, 
  Wheat, 
  ShieldAlert 
} from 'lucide-react';
import { FeedItem, Chicken, EggLog } from '../../types/flock';
import { 
  calculateDailyFeedConsumption, 
  calculateFeedDaysRemaining,
  STANDARD_DAILY_FEED_LBS_PER_HEN 
} from '../../utils/flockCalculations';
import { getTodayDateStr } from '../../utils/dateUtils';

interface FeedInventoryTabProps {
  feedItems: FeedItem[];
  chickens: Chicken[];
  eggLogs: EggLog[];
  onSaveFeedItem: (item: FeedItem) => void;
  onDeleteFeedItem: (itemId: string) => void;
}

export const FeedInventoryTab: React.FC<FeedInventoryTabProps> = ({
  feedItems,
  chickens,
  eggLogs,
  onSaveFeedItem,
  onDeleteFeedItem,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<FeedItem | null>(null);

  // Form state
  const [formName, setFormName] = useState<string>('');
  const [formCategory, setFormCategory] = useState<FeedItem['category']>('layer_feed');
  const [formBrand, setFormBrand] = useState<string>('');
  const [formQty, setFormQty] = useState<number>(50);
  const [formThreshold, setFormThreshold] = useState<number>(15);
  const [formCost, setFormCost] = useState<number>(24.99);
  const [formBagWeight, setFormBagWeight] = useState<number>(50);
  const [formPurchaseDate, setFormPurchaseDate] = useState<string>(() => getTodayDateStr());
  const [formNotes, setFormNotes] = useState<string>('');

  const activeChickens = chickens.filter(c => c.status !== 'deceased' && c.status !== 'sold' && c.status !== 'rehomed');
  const consumption = calculateDailyFeedConsumption(activeChickens.length);

  // Calculate total main feed lbs (layer_feed, chick_starter, grower, scratch_grain)
  const mainFeedItems = feedItems.filter(f => 
    f.category === 'layer_feed' || f.category === 'chick_starter' || f.category === 'grower' || f.category === 'scratch_grain'
  );
  const totalMainFeedLbs = mainFeedItems.reduce((acc, f) => acc + f.currentQuantityLbs, 0);
  const daysRemaining = calculateFeedDaysRemaining(totalMainFeedLbs, activeChickens.length);

  // Cost per chicken & cost per dozen eggs calculation
  const avgCostPerLb = mainFeedItems.length > 0
    ? mainFeedItems.reduce((acc, f) => acc + (f.costPerBag / Math.max(1, f.bagWeightLbs)), 0) / mainFeedItems.length
    : 0.50; // $0.50/lb default fallback

  const monthlyFeedCostPerChicken = Math.round((STANDARD_DAILY_FEED_LBS_PER_HEN * 30.4 * avgCostPerLb) * 100) / 100;
  
  // Last 14 days eggs
  const recentEggs = eggLogs.slice(0, 14).reduce((sum, l) => sum + l.totalEggs, 0);
  const dailyAverageEggs = recentEggs > 0 ? recentEggs / Math.min(14, Math.max(1, eggLogs.length)) : 8;
  const feedCostPerDozen = dailyAverageEggs > 0
    ? Math.round(((consumption.lbsPerDay * avgCostPerLb) / (dailyAverageEggs / 12)) * 100) / 100
    : 1.85;

  const lowStockItems = feedItems.filter(item => item.currentQuantityLbs <= item.lowStockThresholdLbs);

  const filteredItems = feedItems.filter(item => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'feed') {
      return item.category === 'layer_feed' || item.category === 'chick_starter' || item.category === 'grower' || item.category === 'scratch_grain';
    }
    if (selectedCategory === 'supplements') {
      return item.category === 'oyster_shell' || item.category === 'grit' || item.category === 'supplement';
    }
    if (selectedCategory === 'bedding') {
      return item.category === 'bedding';
    }
    return item.category === selectedCategory;
  });

  const handleOpenNew = () => {
    setEditingItem(null);
    setFormName('');
    setFormCategory('layer_feed');
    setFormBrand('');
    setFormQty(50);
    setFormThreshold(15);
    setFormCost(24.99);
    setFormBagWeight(50);
    setFormPurchaseDate(getTodayDateStr());
    setFormNotes('');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: FeedItem) => {
    setEditingItem(item);
    setFormName(item.name);
    setFormCategory(item.category);
    setFormBrand(item.brand || '');
    setFormQty(item.currentQuantityLbs);
    setFormThreshold(item.lowStockThresholdLbs);
    setFormCost(item.costPerBag);
    setFormBagWeight(item.bagWeightLbs);
    setFormPurchaseDate(item.purchaseDate);
    setFormNotes(item.notes || '');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    const itemToSave: FeedItem = {
      id: editingItem ? editingItem.id : `feed-${Date.now()}`,
      name: formName.trim(),
      category: formCategory,
      brand: formBrand.trim() || undefined,
      currentQuantityLbs: Number(formQty),
      lowStockThresholdLbs: Number(formThreshold),
      costPerBag: Number(formCost),
      bagWeightLbs: Number(formBagWeight),
      purchaseDate: formPurchaseDate,
      notes: formNotes.trim() || undefined,
    };

    onSaveFeedItem(itemToSave);
    setIsModalOpen(false);
  };

  const handleQuickAdjust = (item: FeedItem, amountLbs: number) => {
    const updatedQty = Math.max(0, Math.round((item.currentQuantityLbs + amountLbs) * 10) / 10);
    onSaveFeedItem({
      ...item,
      currentQuantityLbs: updatedQty,
    });
  };

  const getCategoryLabel = (category: FeedItem['category']) => {
    switch (category) {
      case 'layer_feed': return 'Layer Feed';
      case 'chick_starter': return 'Starter / Grower';
      case 'scratch_grain': return 'Scratch Grains';
      case 'oyster_shell': return 'Calcium Oyster Shell';
      case 'grit': return 'Gizzard Grit';
      case 'bedding': return 'Bedding Material';
      case 'supplement': return 'Health Supplement';
      default: return 'Supply';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-stone-200 dark:border-stone-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100 flex items-center gap-2.5">
            <Wheat className="w-6 h-6 text-amber-700 dark:text-amber-500" />
            Feed & Supply Inventory
          </h1>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
            Real-time feed levels, daily consumption estimates, low-stock alerts, and production cost metrics.
          </p>
        </div>

        <button
          onClick={handleOpenNew}
          className="px-4 py-2 text-xs font-bold text-white bg-amber-700 hover:bg-amber-800 dark:bg-amber-600 dark:hover:bg-amber-500 rounded-xl shadow-xs transition-colors flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add Supply / Feed Bag
        </button>
      </div>

      {/* Low-stock Warning Banner */}
      {lowStockItems.length > 0 && (
        <div className="p-4 rounded-xl border border-amber-300 dark:border-amber-800/80 bg-amber-50/90 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 flex items-start gap-3 shadow-xs">
          <AlertTriangle className="w-5 h-5 text-amber-700 dark:text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <h4 className="font-bold text-amber-950 dark:text-amber-100">
              Low Stock Warning: {lowStockItems.length} {lowStockItems.length === 1 ? 'item needs' : 'items need'} restocking
            </h4>
            <p className="text-amber-800 dark:text-amber-300">
              The following supplies have dropped below your safety threshold:{' '}
              <strong>{lowStockItems.map(i => `${i.name} (${i.currentQuantityLbs} lbs)`).join(', ')}</strong>.
            </p>
          </div>
        </div>
      )}

      {/* Consumption & Financial Summary KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Main Feed Stock */}
        <div className="p-4 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
            <span>Total Feed On Hand</span>
            <Package className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-stone-900 dark:text-stone-100">{totalMainFeedLbs}</span>
            <span className="text-xs font-semibold text-stone-500">lbs</span>
          </div>
          <p className="mt-1 text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold">
            ~{daysRemaining} days remaining ({activeChickens.length} active birds)
          </p>
        </div>

        {/* Daily Consumption Rate */}
        <div className="p-4 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
            <span>Daily Consumption</span>
            <TrendingDown className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono text-stone-900 dark:text-stone-100">{consumption.lbsPerDay}</span>
            <span className="text-xs font-semibold text-stone-500">lbs/day</span>
          </div>
          <p className="mt-1 text-[11px] text-stone-500 dark:text-stone-400">
            Based on ~0.25 lb / hen / day standard
          </p>
        </div>

        {/* Monthly Cost Per Hen */}
        <div className="p-4 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
            <span>Feed Cost / Hen</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-bold font-mono text-stone-900 dark:text-stone-100">${monthlyFeedCostPerChicken.toFixed(2)}</span>
            <span className="text-xs font-semibold text-stone-500">/mo</span>
          </div>
          <p className="mt-1 text-[11px] text-stone-500 dark:text-stone-400">
            Avg ~${avgCostPerLb.toFixed(2)}/lb complete grain
          </p>
        </div>

        {/* Feed Cost Per Dozen Eggs */}
        <div className="p-4 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
            <span>Feed Cost / Dozen Eggs</span>
            <Sparkles className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-bold font-mono text-stone-900 dark:text-stone-100">${feedCostPerDozen.toFixed(2)}</span>
            <span className="text-xs font-semibold text-stone-500">/dozen</span>
          </div>
          <p className="mt-1 text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold">
            High feed-to-egg conversion efficiency
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-stone-200 dark:border-stone-800 pb-2 text-xs">
        {[
          { id: 'all', label: `All Supplies (${feedItems.length})` },
          { id: 'feed', label: 'Main Feeds & Grains' },
          { id: 'supplements', label: 'Oyster Shell & Grit' },
          { id: 'bedding', label: 'Bedding Shavings' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setSelectedCategory(tab.id)}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              selectedCategory === tab.id
                ? 'bg-amber-700 text-white dark:bg-amber-600'
                : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Supplies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map(item => {
          const isLow = item.currentQuantityLbs <= item.lowStockThresholdLbs;
          const percentFull = Math.min(100, Math.round((item.currentQuantityLbs / Math.max(1, item.bagWeightLbs)) * 100));

          return (
            <div
              key={item.id}
              className={`p-4 rounded-xl border transition-all bg-white dark:bg-stone-900 shadow-xs flex flex-col justify-between ${
                isLow
                  ? 'border-amber-400 dark:border-amber-700/80 ring-1 ring-amber-400/30'
                  : 'border-stone-200 dark:border-stone-800 hover:border-stone-300'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
                      {getCategoryLabel(item.category)}
                    </span>
                    <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 mt-1.5">
                      {item.name}
                    </h3>
                    {item.brand && (
                      <p className="text-xs text-stone-500 dark:text-stone-400">{item.brand}</p>
                    )}
                  </div>

                  {isLow && (
                    <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-300 dark:border-amber-700 flex items-center gap-1 shrink-0">
                      <AlertTriangle className="w-3 h-3" />
                      Low Stock
                    </span>
                  )}
                </div>

                {/* Progress bar */}
                <div className="mt-4 space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-stone-500 dark:text-stone-400">Current Stock</span>
                    <span className="font-bold font-mono text-stone-900 dark:text-stone-100">
                      {item.currentQuantityLbs} / {item.bagWeightLbs} lbs ({percentFull}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-stone-100 dark:bg-stone-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isLow
                          ? 'bg-amber-500'
                          : percentFull > 50
                          ? 'bg-emerald-600 dark:bg-emerald-500'
                          : 'bg-amber-600'
                      }`}
                      style={{ width: `${percentFull}%` }}
                    />
                  </div>
                </div>

                {/* Specs row */}
                <div className="mt-3 grid grid-cols-2 gap-2 text-[11px] text-stone-500 dark:text-stone-400 pt-2 border-t border-stone-100 dark:border-stone-800">
                  <div>
                    <span>Cost / Bag:</span>{' '}
                    <strong className="text-stone-800 dark:text-stone-200 font-mono">${item.costPerBag.toFixed(2)}</strong>
                  </div>
                  <div>
                    <span>Threshold:</span>{' '}
                    <strong className="text-stone-800 dark:text-stone-200 font-mono">{item.lowStockThresholdLbs} lbs</strong>
                  </div>
                  <div className="col-span-2 flex items-center gap-1 text-[10px]">
                    <Calendar className="w-3 h-3" />
                    <span>Purchased: {item.purchaseDate}</span>
                  </div>
                </div>

                {item.notes && (
                  <p className="mt-2 text-[11px] text-stone-500 dark:text-stone-400 italic line-clamp-2">
                    {item.notes}
                  </p>
                )}
              </div>

              {/* Bottom Actions */}
              <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800 flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleQuickAdjust(item, -5)}
                    disabled={item.currentQuantityLbs <= 0}
                    className="px-2 py-1 text-[11px] font-bold text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded border border-stone-200 dark:border-stone-700 transition-colors disabled:opacity-40"
                    title="Deduct 5 lbs used"
                  >
                    -5 lbs
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickAdjust(item, 5)}
                    className="px-2 py-1 text-[11px] font-bold text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 rounded border border-stone-200 dark:border-stone-700 transition-colors"
                    title="Add 5 lbs"
                  >
                    +5 lbs
                  </button>
                  <button
                    type="button"
                    onClick={() => handleQuickAdjust(item, item.bagWeightLbs)}
                    className="px-2 py-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded border border-emerald-200 dark:border-emerald-800 transition-colors"
                    title="Add full new bag"
                  >
                    +New Bag
                  </button>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleOpenEdit(item)}
                    className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors"
                    title="Edit item"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteFeedItem(item.id)}
                    className="p-1.5 text-stone-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-lg transition-colors"
                    title="Delete item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Feed Item Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-lg bg-white dark:bg-stone-900 rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-850">
              <h2 className="text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <Wheat className="w-5 h-5 text-amber-700" />
                {editingItem ? 'Edit Supply Details' : 'Add Feed or Barnyard Supply'}
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Feed / Supply Name *
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  placeholder="e.g. Organic Layer Pellets 16%"
                  className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg px-3 py-2 text-xs text-stone-900 dark:text-stone-100 focus:outline-hidden focus:border-amber-600"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Category *
                  </label>
                  <select
                    value={formCategory}
                    onChange={e => setFormCategory(e.target.value as FeedItem['category'])}
                    className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg px-3 py-2 text-xs text-stone-900 dark:text-stone-100 focus:outline-hidden focus:border-amber-600"
                  >
                    <option value="layer_feed">Layer Feed (16-18%)</option>
                    <option value="chick_starter">Chick Starter / Grower (20%)</option>
                    <option value="scratch_grain">Scratch Grains</option>
                    <option value="oyster_shell">Oyster Shell (Calcium)</option>
                    <option value="grit">Granite Grit</option>
                    <option value="bedding">Bedding (Shavings / Hemp)</option>
                    <option value="supplement">Supplements & Electrolytes</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Brand / Manufacturer
                  </label>
                  <input
                    type="text"
                    value={formBrand}
                    onChange={e => setFormBrand(e.target.value)}
                    placeholder="e.g. Scratch & Peck, Purina"
                    className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg px-3 py-2 text-xs text-stone-900 dark:text-stone-100 focus:outline-hidden focus:border-amber-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Current Lbs
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    required
                    value={formQty}
                    onChange={e => setFormQty(Number(e.target.value))}
                    className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg px-3 py-2 text-xs font-mono text-stone-900 dark:text-stone-100 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Full Bag Lbs
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="1"
                    required
                    value={formBagWeight}
                    onChange={e => setFormBagWeight(Number(e.target.value))}
                    className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg px-3 py-2 text-xs font-mono text-stone-900 dark:text-stone-100 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Low Alert (Lbs)
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="1"
                    required
                    value={formThreshold}
                    onChange={e => setFormThreshold(Number(e.target.value))}
                    className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg px-3 py-2 text-xs font-mono text-stone-900 dark:text-stone-100 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Cost ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formCost}
                    onChange={e => setFormCost(Number(e.target.value))}
                    className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg px-3 py-2 text-xs font-mono text-stone-900 dark:text-stone-100 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Purchase Date
                </label>
                <input
                  type="date"
                  value={formPurchaseDate}
                  onChange={e => setFormPurchaseDate(e.target.value)}
                  className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg px-3 py-2 text-xs text-stone-900 dark:text-stone-100 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Feeding Notes / Instructions
                </label>
                <textarea
                  rows={2}
                  value={formNotes}
                  onChange={e => setFormNotes(e.target.value)}
                  placeholder="e.g. Free choice feeder, clean dispenser weekly."
                  className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg px-3 py-2 text-xs text-stone-900 dark:text-stone-100 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-stone-200 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-amber-700 hover:bg-amber-800 dark:bg-amber-600 dark:hover:bg-amber-500 rounded-xl shadow-xs transition-colors"
                >
                  {editingItem ? 'Update Supply' : 'Save Supply'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
