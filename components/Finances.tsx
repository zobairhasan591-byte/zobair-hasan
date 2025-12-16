import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Deposit, Expense, Translation, Language } from '../types';
import { Plus, Trash2, ShoppingBag, Receipt, DollarSign, Share2, ChevronLeft, ChevronRight, Filter, Check, Edit2, X, Copy, StickyNote } from 'lucide-react';
import { Button } from './Button';
import { Modal } from './Modal';

interface FinancesProps {
  deposits: Deposit[];
  expenses: Expense[];
  onAddDeposit: (deposit: Omit<Deposit, 'id'>) => void;
  onAddExpense: (expense: Omit<Expense, 'id'>) => void;
  onDeleteDeposit: (id: string) => void;
  onDeleteExpense: (id: string) => void;
  expenseCategories: string[];
  onAddCategory: (category: string) => void;
  onDeleteCategory: (category: string) => void;
  onEditCategory: (oldCat: string, newCat: string, updateHistory: boolean) => void;
  t: Translation;
  language: Language;
}

export const Finances: React.FC<FinancesProps> = ({ 
  deposits, expenses, onAddDeposit, onAddExpense, onDeleteDeposit, onDeleteExpense, 
  expenseCategories, onAddCategory, onDeleteCategory, onEditCategory, t, language
}) => {
  const [activeTab, setActiveTab] = useState<'deposits' | 'expenses'>('expenses');
  const [isDepositModalOpen, setDepositModalOpen] = useState(false);
  const [isExpenseModalOpen, setExpenseModalOpen] = useState(false);
  const [isShareModalOpen, setShareModalOpen] = useState(false);
  const [shareText, setShareText] = useState('');
  
  const [currentMonth, setCurrentMonth] = useState(new Date());
  
  // Filtering (Multi-select)
  const [filterCategories, setFilterCategories] = useState<string[]>([]);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const filterRef = useRef<HTMLDivElement>(null);

  // Dropdown Logic for Modal
  const [showItemDropdown, setShowItemDropdown] = useState(false);
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editCategoryValue, setEditCategoryValue] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Input styling
  const inputClass = "w-full rounded-lg border-slate-300 border p-2.5 text-sm bg-white text-slate-900 focus:ring-indigo-500 focus:border-indigo-500 placeholder-slate-400";

  // Form States
  const [depositForm, setDepositForm] = useState({ amount: '', date: new Date().toISOString().split('T')[0], notes: '' });
  const [expenseForm, setExpenseForm] = useState({ items: '', amount: '', date: new Date().toISOString().split('T')[0], notes: '' });

  // --- Helpers ---
  const formatMoney = (amount: number) => `৳${Math.round(amount)}`;
  const formatDateDisplay = (isoDate: string) => {
    if (!isoDate) return '';
    const [y, m, d] = isoDate.split('-');
    return `${d}/${m}/${y}`;
  };

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        // Only close if we are not currently editing
        if (!editingCategory) {
           setShowItemDropdown(false);
        }
      }
      if (filterRef.current && !filterRef.current.contains(event.target as Node)) {
        setShowFilterDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [editingCategory]);

  // Navigation
  const changeMonth = (offset: number) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + offset);
    setCurrentMonth(newMonth);
  };

  // Filter Data by Month
  const expensesInMonth = useMemo(() => {
    return expenses.filter(e => {
        const eDate = new Date(e.date);
        return eDate.getMonth() === currentMonth.getMonth() && eDate.getFullYear() === currentMonth.getFullYear();
    });
  }, [expenses, currentMonth]);

  const depositsInMonth = useMemo(() => {
    return deposits.filter(d => {
        const dDate = new Date(d.date);
        return dDate.getMonth() === currentMonth.getMonth() && dDate.getFullYear() === currentMonth.getFullYear();
    });
  }, [deposits, currentMonth]);

  // Apply Category Filter for Expenses
  const displayedExpenses = useMemo(() => {
    if (filterCategories.length === 0) return expensesInMonth;
    return expensesInMonth.filter(e => filterCategories.includes(e.items));
  }, [expensesInMonth, filterCategories]);

  const displayedDeposits = depositsInMonth;

  // Global Cash In Hand (All Time)
  const cashInHand = useMemo(() => {
    const totalIn = deposits.reduce((sum, d) => sum + d.amount, 0);
    const totalOut = expenses.reduce((sum, e) => sum + e.amount, 0);
    return totalIn - totalOut;
  }, [deposits, expenses]);

  // Totals
  const totalFilteredExpenses = displayedExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalMonthDeposits = depositsInMonth.reduce((sum, d) => sum + d.amount, 0);
  const totalMonthExpensesAll = expensesInMonth.reduce((sum, e) => sum + e.amount, 0);

  // Available categories based on input filter
  const filteredDropdownCategories = expenseCategories.filter(c => 
    c.toLowerCase().includes(expenseForm.items.toLowerCase())
  );

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddDeposit({
      amount: parseFloat(depositForm.amount),
      date: depositForm.date,
      notes: depositForm.notes
    });
    setDepositModalOpen(false);
    setDepositForm({ amount: '', date: new Date().toISOString().split('T')[0], notes: '' });
  };

  const handleExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddExpense({
      items: expenseForm.items,
      amount: parseFloat(expenseForm.amount),
      date: expenseForm.date,
      notes: expenseForm.notes
    });
    setExpenseModalOpen(false);
    setExpenseForm({ items: '', amount: '', date: new Date().toISOString().split('T')[0], notes: '' });
  };

  const handleAddNewCategory = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (expenseForm.items.trim()) {
      onAddCategory(expenseForm.items.trim());
      setShowItemDropdown(false);
    }
  };

  const startEditingCategory = (e: React.MouseEvent, cat: string) => {
    e.stopPropagation();
    e.preventDefault();
    setEditingCategory(cat);
    setEditCategoryValue(cat);
  };

  const saveEditedCategory = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (editingCategory && editCategoryValue.trim()) {
      const confirmUpdate = window.confirm(t.updateHistoryPrompt);
      onEditCategory(editingCategory, editCategoryValue.trim(), confirmUpdate);
      setEditingCategory(null);
      setEditCategoryValue('');
    }
  };

  const handleDeleteCategory = (e: React.MouseEvent, cat: string) => {
    e.stopPropagation();
    e.preventDefault();
    if (window.confirm(`${t.delete} '${cat}'?`)) {
        onDeleteCategory(cat);
    }
  };

  const toggleFilterCategory = (cat: string) => {
    setFilterCategories(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const areAllSelected = filterCategories.length === expenseCategories.length && expenseCategories.length > 0;

  const toggleSelectAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (areAllSelected) {
        setFilterCategories([]);
    } else {
        setFilterCategories([...expenseCategories]);
    }
  };

  const handlePrepareShare = () => {
    const monthName = currentMonth.toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US', { month: 'long', year: 'numeric' });
    let text = `*Personal Expense Tracker Report - ${monthName}*\n\n`;
    
    // SECTION 1: DEPOSITS (Always at top)
    text += `*${t.deposits}*\n`;
    text += `------------------\n`;
    const sortedDeposits = depositsInMonth.slice().sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    if (sortedDeposits.length > 0) {
        sortedDeposits.forEach(d => {
            text += `${formatDateDisplay(d.date)}: ${Math.round(d.amount)} ${d.notes ? `(${d.notes})` : ''}\n`;
        });
    } else {
        text += `${t.noDeposits}\n`;
    }
    text += `------------------\n`;
    text += `*Total In: ${Math.round(totalMonthDeposits)}*\n\n`;

    // SECTION 2: EXPENSES
    text += `*${t.expenses}*\n`;
    if (filterCategories.length > 0) text += `(Filter: ${filterCategories.join(', ')})\n`;
    text += `------------------\n`;
    
    const sortedExpenses = displayedExpenses.slice().sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    if (sortedExpenses.length > 0) {
        sortedExpenses.forEach(e => {
            text += `${formatDateDisplay(e.date)}: ${e.items} - ${Math.round(e.amount)} ${e.notes ? `(${e.notes})` : ''}\n`;
        });
    } else {
        text += `${t.noExpenses}\n`;
    }
    text += `------------------\n`;
    text += `*Total Out: ${Math.round(totalFilteredExpenses)}*\n\n`;

    // SECTION 3: SUMMARY
    text += `*SUMMARY*\n`;
    text += `Cash In Hand: ${formatMoney(cashInHand)}`;

    setShareText(text);
    setShareModalOpen(true);
  };

  const copyShareText = async () => {
    try {
        await navigator.clipboard.writeText(shareText);
        alert(t.copied);
    } catch (err) {
        console.error(err);
    }
  };

  const shareViaApp = async () => {
    if (navigator.share) {
        try {
            await navigator.share({
                title: 'Personal Expense Tracker Report',
                text: shareText
            });
        } catch (err) {
            console.error(err);
        }
    }
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Cash In Hand Card */}
      <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-xl"></div>
        <div className="relative z-10">
            <div className="flex items-center justify-between mb-2">
                <span className="text-indigo-100 font-medium text-sm tracking-wide uppercase">{t.cashInHand}</span>
                <DollarSign className="h-5 w-5 text-indigo-300" />
            </div>
            <div className="text-4xl font-black mb-4">
                {formatMoney(cashInHand)}
            </div>
            <div className="flex gap-4">
                <div className="bg-indigo-900/50 rounded-lg p-2 flex-1">
                    <div className="text-[10px] text-indigo-300 uppercase">{t.in} (Total)</div>
                    <div className="font-bold">{formatMoney(deposits.reduce((s,d) => s + d.amount, 0))}</div>
                </div>
                <div className="bg-indigo-900/50 rounded-lg p-2 flex-1">
                    <div className="text-[10px] text-indigo-300 uppercase">{t.out} (Total)</div>
                    <div className="font-bold">{formatMoney(expenses.reduce((s,e) => s + e.amount, 0))}</div>
                </div>
            </div>
        </div>
      </div>

      {/* Month Navigation */}
      <div className="flex items-center justify-between bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
        <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500">
            <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="text-center">
            <div className="font-bold text-slate-800">
                {currentMonth.toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US', { month: 'long', year: 'numeric' })}
            </div>
            <div className="text-xs text-slate-500">
                {activeTab === 'expenses' ? `${t.totalCost}: ${formatMoney(totalMonthExpensesAll)}` : `${t.in}: ${formatMoney(totalMonthDeposits)}`}
            </div>
        </div>
        <button onClick={() => changeMonth(1)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500">
            <ChevronRight className="h-5 w-5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button 
          onClick={() => setActiveTab('expenses')}
          className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all border ${activeTab === 'expenses' ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}
        >
          {t.expenses}
        </button>
        <button 
          onClick={() => setActiveTab('deposits')}
          className={`flex-1 py-3 text-sm font-bold rounded-xl transition-all border ${activeTab === 'deposits' ? 'bg-green-600 text-white border-green-600 shadow-md' : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50'}`}
        >
          {t.deposits}
        </button>
      </div>

      {/* Multi-Select Filter Bar (Only for Expenses) */}
      {activeTab === 'expenses' && (
        <div className="relative" ref={filterRef}>
            <div className="flex gap-2 items-center bg-white p-2.5 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-50 transition-colors"
                 onClick={() => setShowFilterDropdown(!showFilterDropdown)}>
                <Filter className="h-4 w-4 text-indigo-600 ml-1" />
                <span className="flex-1 text-sm font-medium text-slate-700">
                    {filterCategories.length === 0 
                     ? t.filterByItem 
                     : `${filterCategories.length} ${t.selected}`}
                </span>
                {filterCategories.length > 0 && (
                    <button 
                        onClick={(e) => { e.stopPropagation(); setFilterCategories([]); }}
                        className="text-xs bg-slate-100 text-slate-500 px-2 py-1 rounded-full hover:bg-slate-200"
                    >
                        {t.clearSelection}
                    </button>
                )}
            </div>

            {/* Filter Dropdown */}
            {showFilterDropdown && (
                <div className="absolute z-30 top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-xl border border-slate-200 max-h-60 overflow-y-auto p-2">
                    {expenseCategories.length === 0 ? (
                        <div className="p-2 text-xs text-slate-400 text-center">No categories yet.</div>
                    ) : (
                      <>
                        {/* Select All Option */}
                        <div 
                            onClick={toggleSelectAll}
                            className="flex items-center p-2 hover:bg-slate-50 rounded-lg cursor-pointer border-b border-slate-100 mb-1"
                        >
                            <div className={`w-4 h-4 rounded border flex items-center justify-center mr-3 ${areAllSelected ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300'}`}>
                                {areAllSelected && <Check className="h-3 w-3 text-white" />}
                            </div>
                            <span className="text-sm font-bold text-slate-800">{t.selectAll}</span>
                        </div>

                        {expenseCategories.map(cat => (
                          <label key={cat} className="flex items-center p-2 hover:bg-slate-50 rounded-lg cursor-pointer">
                              <div className={`w-4 h-4 rounded border flex items-center justify-center mr-3 ${filterCategories.includes(cat) ? 'bg-indigo-600 border-indigo-600' : 'border-slate-300'}`}>
                                  {filterCategories.includes(cat) && <Check className="h-3 w-3 text-white" />}
                              </div>
                              <span className="text-sm text-slate-700">{cat}</span>
                              <input 
                                  type="checkbox" 
                                  className="hidden" 
                                  checked={filterCategories.includes(cat)} 
                                  onChange={() => toggleFilterCategory(cat)} 
                              />
                          </label>
                        ))}
                      </>
                    )}
                </div>
            )}
        </div>
      )}

      {/* List Content */}
      <div className="space-y-3 min-h-[200px]">
        <div className="flex justify-between items-center px-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {activeTab === 'expenses' && filterCategories.length > 0 ? `${t.totalFiltered}: ${formatMoney(totalFilteredExpenses)}` : ''}
            </span>
            <button onClick={handlePrepareShare} className="text-xs flex items-center gap-1 text-indigo-600 font-medium hover:bg-indigo-50 px-3 py-1 rounded-full transition-colors">
                <Share2 className="h-3 w-3" />
                {t.share}
            </button>
        </div>

        {activeTab === 'expenses' ? (
          displayedExpenses.length === 0 ? (
            <div className="text-center py-12 text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">{t.noExpenses}</div>
          ) : (
            displayedExpenses.slice().sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(expense => (
              <div key={expense.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex justify-between items-start animate-fade-in">
                <div className="flex gap-3">
                  <div className="bg-indigo-50 p-2.5 rounded-full h-10 w-10 flex items-center justify-center text-indigo-600 shrink-0">
                    <ShoppingBag className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 text-sm">{expense.items}</h4>
                    <div className="text-xs text-slate-500 mt-1">
                      {formatDateDisplay(expense.date)}
                      {expense.notes && <span className="block text-slate-400 italic">"{expense.notes}"</span>}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="font-bold text-slate-900">{formatMoney(expense.amount)}</span>
                  <button onClick={() => onDeleteExpense(expense.id)} className="text-slate-300 hover:text-red-500 transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          )
        ) : (
          displayedDeposits.length === 0 ? (
            <div className="text-center py-12 text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">{t.noDeposits}</div>
          ) : (
            displayedDeposits.slice().sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(deposit => (
              <div key={deposit.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex justify-between items-start animate-fade-in">
                <div className="flex gap-3">
                  <div className="bg-green-50 p-2.5 rounded-full h-10 w-10 flex items-center justify-center text-green-600 shrink-0">
                    <Receipt className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 text-sm">{t.in}</h4>
                    <div className="text-xs text-slate-500 mt-1">
                      {formatDateDisplay(deposit.date)} {deposit.notes ? `• ${deposit.notes}` : ''}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="font-bold text-green-600">+{formatMoney(deposit.amount)}</span>
                  <button onClick={() => onDeleteDeposit(deposit.id)} className="text-slate-300 hover:text-red-500 transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          )
        )}
        
        {/* Footer Sum for filtered view if list is long */}
        {activeTab === 'expenses' && displayedExpenses.length > 5 && (
            <div className="flex justify-end pt-2 border-t border-slate-200">
                <div className="text-right">
                    <div className="text-xs text-slate-400 uppercase font-bold">{t.totalFiltered}</div>
                    <div className="text-xl font-black text-slate-800">{formatMoney(totalFilteredExpenses)}</div>
                </div>
            </div>
        )}
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-24 right-4 z-20">
        <button 
          onClick={() => activeTab === 'deposits' ? setDepositModalOpen(true) : setExpenseModalOpen(true)}
          className={`${activeTab === 'deposits' ? 'bg-green-600 hover:bg-green-700' : 'bg-indigo-600 hover:bg-indigo-700'} text-white p-4 rounded-full shadow-lg shadow-indigo-200/50 transition-all active:scale-95 flex items-center justify-center`}
        >
          <Plus className="h-6 w-6" />
        </button>
      </div>

      {/* Deposit Modal */}
      <Modal isOpen={isDepositModalOpen} onClose={() => setDepositModalOpen(false)} title={t.addDeposit}>
        <form onSubmit={handleDepositSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t.amount}</label>
            <input 
              type="number"
              required
              min="0"
              step="0.01"
              value={depositForm.amount}
              onChange={(e) => setDepositForm({...depositForm, amount: e.target.value})}
              className={inputClass}
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t.date}</label>
            <input 
              type="date"
              required
              value={depositForm.date}
              onChange={(e) => setDepositForm({...depositForm, date: e.target.value})}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t.notes}</label>
            <input 
              type="text"
              value={depositForm.notes}
              onChange={(e) => setDepositForm({...depositForm, notes: e.target.value})}
              className={inputClass}
              placeholder="..."
            />
          </div>
          <Button type="submit" className="w-full bg-green-600 hover:bg-green-700">{t.saveDeposit}</Button>
        </form>
      </Modal>

      {/* Expense Modal */}
      <Modal isOpen={isExpenseModalOpen} onClose={() => setExpenseModalOpen(false)} title={t.addExpense}>
        <form onSubmit={handleExpenseSubmit} className="space-y-4">
          <div className="relative" ref={dropdownRef}>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t.itemsList}</label>
            <div className="flex gap-2">
              <input 
                type="text"
                required
                value={expenseForm.items}
                onChange={(e) => {
                    setExpenseForm({...expenseForm, items: e.target.value});
                    setShowItemDropdown(true);
                }}
                onFocus={() => setShowItemDropdown(true)}
                className={inputClass}
                placeholder={t.itemsPlaceholder}
              />
              {/* Add Item Button */}
              <button 
                type="button"
                onClick={handleAddNewCategory}
                className="bg-indigo-100 text-indigo-700 p-2.5 rounded-lg hover:bg-indigo-200 transition-colors"
                title={t.addItemToContext}
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
            
            {/* Advanced Dropdown List */}
            {showItemDropdown && (
                <div className="absolute z-50 w-full mt-1 bg-white rounded-lg shadow-xl border border-slate-200 max-h-48 overflow-y-auto">
                    {filteredDropdownCategories.length > 0 ? (
                        filteredDropdownCategories.map(cat => (
                            <div key={cat} className="flex items-center justify-between border-b border-slate-50 last:border-0 hover:bg-indigo-50 group">
                                {editingCategory === cat ? (
                                    <div className="flex flex-1 items-center p-1">
                                        <input 
                                            autoFocus
                                            className="flex-1 text-sm border border-indigo-300 rounded px-2 py-1 outline-none bg-white text-slate-900"
                                            value={editCategoryValue}
                                            onChange={(e) => setEditCategoryValue(e.target.value)}
                                            onClick={(e) => e.stopPropagation()}
                                        />
                                        <button 
                                          type="button"
                                          onClick={saveEditedCategory} 
                                          className="ml-2 text-green-600 hover:bg-green-100 p-1 rounded"
                                        >
                                            <Check className="h-4 w-4" />
                                        </button>
                                        <button 
                                          type="button"
                                          onClick={(e) => { e.stopPropagation(); setEditingCategory(null); }} 
                                          className="ml-1 text-slate-400 hover:bg-slate-100 p-1 rounded"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setExpenseForm({...expenseForm, items: cat});
                                                setShowItemDropdown(false);
                                            }}
                                            className="flex-1 text-left px-4 py-3 text-sm text-slate-700"
                                        >
                                            {cat}
                                        </button>
                                        <div className="flex items-center gap-1 pr-2">
                                            <button 
                                                type="button"
                                                onClick={(e) => startEditingCategory(e, cat)}
                                                className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-100 rounded transition-colors"
                                            >
                                                <Edit2 className="h-3 w-3" />
                                            </button>
                                            <button 
                                                type="button"
                                                onClick={(e) => handleDeleteCategory(e, cat)}
                                                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="p-2 text-xs text-slate-400 text-center">
                            No matching items. Click + to add.
                        </div>
                    )}
                </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t.totalCost}</label>
            <input 
              type="number"
              required
              min="0"
              step="0.01"
              value={expenseForm.amount}
              onChange={(e) => setExpenseForm({...expenseForm, amount: e.target.value})}
              className={inputClass}
              placeholder="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t.date}</label>
            <input 
              type="date"
              required
              value={expenseForm.date}
              onChange={(e) => setExpenseForm({...expenseForm, date: e.target.value})}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t.notes}</label>
            <input 
              type="text"
              value={expenseForm.notes}
              onChange={(e) => setExpenseForm({...expenseForm, notes: e.target.value})}
              className={inputClass}
              placeholder="..."
            />
          </div>
          <Button type="submit" className="w-full">{t.saveExpense}</Button>
        </form>
      </Modal>

      {/* Share Window/Modal */}
      <Modal isOpen={isShareModalOpen} onClose={() => setShareModalOpen(false)} title={t.share}>
        <div className="space-y-4">
            <textarea 
                readOnly
                className="w-full h-64 p-3 text-xs font-mono bg-slate-50 border border-slate-200 rounded-xl outline-none resize-none text-slate-700"
                value={shareText}
            />
            <div className="flex gap-3">
                <Button variant="secondary" className="flex-1 flex items-center justify-center gap-2" onClick={copyShareText}>
                    <Copy className="h-4 w-4" />
                    {t.copy}
                </Button>
                {navigator.share && (
                    <Button variant="primary" className="flex-1 flex items-center justify-center gap-2" onClick={shareViaApp}>
                        <Share2 className="h-4 w-4" />
                        {t.shareViaApp}
                    </Button>
                )}
            </div>
            <button onClick={() => setShareModalOpen(false)} className="w-full text-center text-sm text-slate-400 hover:text-slate-600 mt-2">
                {t.close}
            </button>
        </div>
      </Modal>
    </div>
  );
};