import React, { useState } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Plus, 
  Egg, 
  ShoppingBag, 
  Receipt, 
  PiggyBank, 
  ArrowUpRight, 
  ArrowDownRight, 
  Filter, 
  Calendar 
} from 'lucide-react';
import { FinancialTransaction, EggLog } from '../../types/flock';

interface FinancesTabProps {
  transactions: FinancialTransaction[];
  eggLogs: EggLog[];
  onSaveTransaction: (tx: FinancialTransaction) => void;
  onDeleteTransaction: (txId: string) => void;
}

export const FinancesTab: React.FC<FinancesTabProps> = ({
  transactions,
  eggLogs,
  onSaveTransaction,
  onDeleteTransaction,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [txType, setTxType] = useState<'income' | 'expense'>('income');
  const [txTitle, setTxTitle] = useState<string>('');
  const [txCategory, setTxCategory] = useState<FinancialTransaction['category']>('egg_sales');
  const [txAmount, setTxAmount] = useState<number>(12.00);
  const [txQty, setTxQty] = useState<number>(2);
  const [txUnitPrice, setTxUnitPrice] = useState<number>(6.00);
  const [txDate, setTxDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [txNotes, setTxNotes] = useState<string>('');

  // Total egg count produced
  const totalEggsProduced = eggLogs.reduce((sum, l) => sum + l.totalEggs, 0);
  const totalDozensProduced = Math.max(1, Math.round((totalEggsProduced / 12) * 10) / 10);

  // Income & Expenses
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netProfit = Math.round((totalIncome - totalExpenses) * 100) / 100;

  // Cost per egg & dozen
  const feedAndOperatingExpenses = totalExpenses;
  const costPerDozen = Math.round((feedAndOperatingExpenses / totalDozensProduced) * 100) / 100;
  const costPerEgg = Math.round((costPerDozen / 12) * 100) / 100;

  // Dozens sold
  const eggSalesTxs = transactions.filter(t => t.type === 'income' && t.category === 'egg_sales');
  const totalDozensSold = eggSalesTxs.reduce((sum, t) => sum + (t.quantity || Math.round(t.amount / 6)), 0);
  const totalEggRevenue = eggSalesTxs.reduce((sum, t) => sum + t.amount, 0);
  const avgSalePricePerDozen = totalDozensSold > 0 ? Math.round((totalEggRevenue / totalDozensSold) * 100) / 100 : 6.00;

  const filteredTransactions = transactions.filter(t => {
    if (filterType === 'all') return true;
    return t.type === filterType;
  });

  const handleOpenAdd = (type: 'income' | 'expense') => {
    setTxType(type);
    if (type === 'income') {
      setTxCategory('egg_sales');
      setTxTitle('Egg Sale (Farm Fresh Cartons)');
      setTxAmount(12.00);
      setTxQty(2);
      setTxUnitPrice(6.00);
    } else {
      setTxCategory('feed');
      setTxTitle('Layer Feed Restock');
      setTxAmount(25.50);
      setTxQty(1);
      setTxUnitPrice(25.50);
    }
    setTxDate(new Date().toISOString().split('T')[0]);
    setTxNotes('');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!txTitle.trim()) return;

    const newTx: FinancialTransaction = {
      id: `tx-${Date.now()}`,
      date: txDate,
      type: txType,
      category: txCategory,
      title: txTitle.trim(),
      amount: Number(txAmount),
      quantity: txQty ? Number(txQty) : undefined,
      unitPrice: txUnitPrice ? Number(txUnitPrice) : undefined,
      notes: txNotes.trim() || undefined,
    };

    onSaveTransaction(newTx);
    setIsModalOpen(false);
  };

  const getCategoryBadge = (category: FinancialTransaction['category']) => {
    switch (category) {
      case 'egg_sales': return 'Egg Sales';
      case 'bird_sales': return 'Bird Sales';
      case 'hatching_eggs': return 'Hatching Eggs';
      case 'feed': return 'Feed & Grain';
      case 'bedding': return 'Bedding';
      case 'supplies_meds': return 'Supplies & Health';
      case 'equipment': return 'Equipment';
      case 'coop_infrastructure': return 'Infrastructure';
      default: return 'General';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-stone-200 dark:border-stone-800">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-stone-900 dark:text-stone-100 flex items-center gap-2.5">
            <DollarSign className="w-6 h-6 text-emerald-600 dark:text-emerald-500" />
            Flock Profit, Expenses & Egg Sales
          </h1>
          <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
            Track feed investments, egg revenues, true cost per dozen produced, and net homestead profitability.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenAdd('income')}
            className="px-3.5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 dark:bg-emerald-600 rounded-xl shadow-xs transition-colors flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-4 h-4" />
            Log Egg Sale
          </button>
          <button
            onClick={() => handleOpenAdd('expense')}
            className="px-3.5 py-2 text-xs font-bold text-stone-700 dark:text-stone-200 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 rounded-xl transition-colors flex items-center gap-1.5 shrink-0"
          >
            <Plus className="w-4 h-4" />
            Log Expense
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Net Balance */}
        <div className="p-4 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-xs text-stone-500">
            <span>Net Operating Balance</span>
            <PiggyBank className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className={`text-2xl font-extrabold font-mono ${
              netProfit >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
            }`}>
              {netProfit >= 0 ? `+$${netProfit.toFixed(2)}` : `-$${Math.abs(netProfit).toFixed(2)}`}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-stone-500 dark:text-stone-400">
            Income: ${totalIncome.toFixed(2)} · Expenses: ${totalExpenses.toFixed(2)}
          </p>
        </div>

        {/* Cost Per Dozen Produced */}
        <div className="p-4 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-xs text-stone-500">
            <span>True Cost / Dozen</span>
            <Egg className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-extrabold font-mono text-stone-900 dark:text-stone-100">
              ${costPerDozen.toFixed(2)}
            </span>
            <span className="text-xs font-semibold text-stone-500">/doz</span>
          </div>
          <p className="mt-1 text-[11px] text-stone-500 dark:text-stone-400">
            ~${costPerEgg.toFixed(2)} per single egg produced
          </p>
        </div>

        {/* Dozens Sold */}
        <div className="p-4 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-xs text-stone-500">
            <span>Dozens Sold</span>
            <ShoppingBag className="w-4 h-4 text-blue-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-extrabold font-mono text-stone-900 dark:text-stone-100">
              {totalDozensSold}
            </span>
            <span className="text-xs font-semibold text-stone-500">dozens</span>
          </div>
          <p className="mt-1 text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold">
            Avg sale: ${avgSalePricePerDozen.toFixed(2)}/dozen
          </p>
        </div>

        {/* Production Margin */}
        <div className="p-4 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl shadow-xs">
          <div className="flex items-center justify-between text-xs text-stone-500">
            <span>Profit Margin / Dozen</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-2xl font-extrabold font-mono text-emerald-700 dark:text-emerald-400">
              +${Math.max(0, avgSalePricePerDozen - costPerDozen).toFixed(2)}
            </span>
            <span className="text-xs font-semibold text-stone-500">/doz profit</span>
          </div>
          <p className="mt-1 text-[11px] text-stone-500 dark:text-stone-400">
            Over total operating overhead
          </p>
        </div>
      </div>

      {/* Transactions Ledger Table */}
      <div className="p-6 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
              <Receipt className="w-4 h-4 text-amber-600" />
              Transaction History & Expense Journal
            </h2>
            <p className="text-xs text-stone-500">
              Complete audited log of homestead poultry cash flows.
            </p>
          </div>

          <div className="flex items-center gap-1.5 text-xs bg-stone-100 dark:bg-stone-800 p-1 rounded-lg">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 rounded-md font-semibold transition-colors ${
                filterType === 'all' ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-2xs' : 'text-stone-600 dark:text-stone-400'
              }`}
            >
              All ({transactions.length})
            </button>
            <button
              onClick={() => setFilterType('income')}
              className={`px-3 py-1 rounded-md font-semibold transition-colors ${
                filterType === 'income' ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-2xs' : 'text-stone-600 dark:text-stone-400'
              }`}
            >
              Sales / Income
            </button>
            <button
              onClick={() => setFilterType('expense')}
              className={`px-3 py-1 rounded-md font-semibold transition-colors ${
                filterType === 'expense' ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-2xs' : 'text-stone-600 dark:text-stone-400'
              }`}
            >
              Expenses
            </button>
          </div>
        </div>

        <div className="border border-stone-200 dark:border-stone-800 rounded-xl overflow-x-auto">
          <table className="w-full min-w-[580px] text-left text-xs">
            <thead className="bg-stone-50 dark:bg-stone-800/80 text-stone-600 dark:text-stone-400 font-semibold border-b border-stone-200 dark:border-stone-800">
              <tr>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Description</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Quantity / Rate</th>
                <th className="py-2.5 px-3 text-right">Amount</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 dark:divide-stone-800 text-stone-800 dark:text-stone-200">
              {filteredTransactions.map(tx => {
                const isInc = tx.type === 'income';
                return (
                  <tr key={tx.id} className="hover:bg-stone-50/50 dark:hover:bg-stone-800/40 transition-colors">
                    <td className="py-3 px-3 font-mono text-stone-500 whitespace-nowrap">{tx.date}</td>
                    <td className="py-3 px-3">
                      <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${
                        isInc
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : 'bg-stone-100 text-stone-700 dark:bg-stone-800 dark:text-stone-300'
                      }`}>
                        {isInc ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {isInc ? 'Income' : 'Expense'}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <strong className="block text-stone-900 dark:text-stone-100">{tx.title}</strong>
                      {tx.notes && <span className="text-[11px] text-stone-400 block line-clamp-1">{tx.notes}</span>}
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300">
                        {getCategoryBadge(tx.category)}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-stone-500">
                      {tx.quantity ? `${tx.quantity} ${tx.category === 'egg_sales' ? 'doz' : 'units'}` : '—'}
                      {tx.unitPrice ? ` @ $${tx.unitPrice.toFixed(2)}` : ''}
                    </td>
                    <td className={`py-3 px-3 text-right font-mono font-bold text-sm ${
                      isInc ? 'text-emerald-700 dark:text-emerald-400' : 'text-stone-900 dark:text-stone-100'
                    }`}>
                      {isInc ? `+$${tx.amount.toFixed(2)}` : `-$${tx.amount.toFixed(2)}`}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => onDeleteTransaction(tx.id)}
                        className="text-stone-400 hover:text-red-600 text-xs transition-colors"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Transaction Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-md bg-white dark:bg-stone-900 rounded-2xl shadow-2xl border border-stone-200 dark:border-stone-800 overflow-hidden my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-850">
              <h2 className="text-base font-bold text-stone-900 dark:text-stone-100 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-600" />
                {txType === 'income' ? 'Record Egg or Bird Sale' : 'Record Homestead Expense'}
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
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Transaction Type
                  </label>
                  <select
                    value={txType}
                    onChange={e => setTxType(e.target.value as any)}
                    className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg px-3 py-2 text-xs text-stone-900 dark:text-stone-100"
                  >
                    <option value="income">Income / Sale</option>
                    <option value="expense">Expense / Purchase</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Category
                  </label>
                  <select
                    value={txCategory}
                    onChange={e => setTxCategory(e.target.value as any)}
                    className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg px-3 py-2 text-xs text-stone-900 dark:text-stone-100"
                  >
                    {txType === 'income' ? (
                      <>
                        <option value="egg_sales">Table Egg Sales</option>
                        <option value="hatching_eggs">Fertile Hatching Eggs</option>
                        <option value="bird_sales">Live Chick / Pullet Sales</option>
                      </>
                    ) : (
                      <>
                        <option value="feed">Feed & Grain</option>
                        <option value="bedding">Bedding & Shavings</option>
                        <option value="supplies_meds">Health Supplies & Supplements</option>
                        <option value="equipment">Feeders, Drinkers & Hardware</option>
                        <option value="coop_infrastructure">Coop Building & Wire</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Description / Title *
                </label>
                <input
                  type="text"
                  required
                  value={txTitle}
                  onChange={e => setTxTitle(e.target.value)}
                  placeholder="e.g. 3 Dozen Rainbow Eggs to local market"
                  className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg px-3 py-2 text-xs text-stone-900 dark:text-stone-100"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Quantity
                  </label>
                  <input
                    type="number"
                    step="1"
                    min="1"
                    value={txQty}
                    onChange={e => {
                      const q = Number(e.target.value);
                      setTxQty(q);
                      setTxAmount(Math.round(q * txUnitPrice * 100) / 100);
                    }}
                    className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg px-3 py-2 text-xs font-mono text-stone-900 dark:text-stone-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Unit Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.25"
                    min="0"
                    value={txUnitPrice}
                    onChange={e => {
                      const u = Number(e.target.value);
                      setTxUnitPrice(u);
                      setTxAmount(Math.round(txQty * u * 100) / 100);
                    }}
                    className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg px-3 py-2 text-xs font-mono text-stone-900 dark:text-stone-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                    Total Amount ($) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={txAmount}
                    onChange={e => setTxAmount(Number(e.target.value))}
                    className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg px-3 py-2 text-xs font-mono text-stone-900 dark:text-stone-100 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Transaction Date
                </label>
                <input
                  type="date"
                  value={txDate}
                  onChange={e => setTxDate(e.target.value)}
                  className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg px-3 py-2 text-xs text-stone-900 dark:text-stone-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Notes
                </label>
                <textarea
                  rows={2}
                  value={txNotes}
                  onChange={e => setTxNotes(e.target.value)}
                  placeholder="e.g. Paid in cash at farm gate."
                  className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg px-3 py-2 text-xs text-stone-900 dark:text-stone-100"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-stone-200 dark:border-stone-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-stone-600 dark:text-stone-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl"
                >
                  Save Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
