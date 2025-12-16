import React, { useState, useEffect } from 'react';
import { Deposit, Expense, MealMap, ViewState, Language } from './types';
import { Meals } from './components/Meals';
import { Finances } from './components/Finances';
import { UtensilsCrossed, Wallet, Globe, WifiOff } from 'lucide-react';
import { translations } from './translations';

const App: React.FC = () => {
  // --- State Management ---
  // Default view changed to FINANCES
  const [view, setView] = useState<ViewState>(ViewState.FINANCES);
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved as Language) || 'en';
  });
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  
  const [deposits, setDeposits] = useState<Deposit[]>(() => {
    const saved = localStorage.getItem('deposits');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem('expenses');
    return saved ? JSON.parse(saved) : [];
  });

  // Default empty categories
  const [expenseCategories, setExpenseCategories] = useState<string[]>(() => {
    const saved = localStorage.getItem('expenseCategories');
    return saved ? JSON.parse(saved) : []; 
  });
  
  const [mealMap, setMealMap] = useState<MealMap>(() => {
    const saved = localStorage.getItem('mealMap');
    if (saved) {
      const parsed = JSON.parse(saved);
      const firstKey = Object.keys(parsed)[0];
      if (firstKey && parsed[firstKey] && typeof parsed[firstKey].breakfast === 'undefined') {
        return {}; 
      }
      return parsed;
    }
    return {};
  });

  // --- Persistence Effects ---
  useEffect(() => localStorage.setItem('language', language), [language]);
  useEffect(() => localStorage.setItem('deposits', JSON.stringify(deposits)), [deposits]);
  useEffect(() => localStorage.setItem('expenses', JSON.stringify(expenses)), [expenses]);
  useEffect(() => localStorage.setItem('mealMap', JSON.stringify(mealMap)), [mealMap]);
  useEffect(() => localStorage.setItem('expenseCategories', JSON.stringify(expenseCategories)), [expenseCategories]);

  // --- Offline Detection ---
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // --- Translations ---
  const t = translations[language];

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'bn' : 'en');
  };

  // --- Actions ---
  const addDeposit = (deposit: Omit<Deposit, 'id'>) => {
    const newDeposit = { ...deposit, id: crypto.randomUUID() };
    setDeposits([...deposits, newDeposit]);
  };
  
  const deleteDeposit = (id: string) => {
    setDeposits(deposits.filter(d => d.id !== id));
  };

  const addExpense = (expense: Omit<Expense, 'id'>) => {
    const newExpense = { ...expense, id: crypto.randomUUID() };
    setExpenses([...expenses, newExpense]);
  };
  
  const deleteExpense = (id: string) => {
    setExpenses(expenses.filter(e => e.id !== id));
  };

  const addExpenseCategory = (category: string) => {
    if (!expenseCategories.includes(category)) {
      setExpenseCategories([...expenseCategories, category]);
    }
  };

  const deleteExpenseCategory = (category: string) => {
    // Force a new array reference to ensure re-render
    setExpenseCategories(prev => prev.filter(c => c !== category));
  };

  const editExpenseCategory = (oldCategory: string, newCategory: string, updateHistory: boolean) => {
    setExpenseCategories(prev => prev.map(c => c === oldCategory ? newCategory : c));
    
    if (updateHistory) {
      setExpenses(prev => prev.map(e => e.items === oldCategory ? { ...e, items: newCategory } : e));
    }
  };

  const updateMeal = (date: string, type: keyof import('./types').MealEntry) => {
    setMealMap(prev => {
      const currentEntry = prev[date] || { breakfast: true, lunch: true, dinner: true };
      return {
        ...prev,
        [date]: {
          ...currentEntry,
          [type]: !currentEntry[type]
        }
      };
    });
  };

  // --- Navigation Item Component ---
  const NavItem = ({ target, icon: Icon, label }: any) => (
    <button
      onClick={() => setView(target)}
      className={`flex flex-col items-center justify-center w-full py-2 transition-colors ${
        view === target ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'
      }`}
    >
      <Icon className={`h-6 w-6 mb-1 ${view === target ? 'fill-current opacity-20' : ''}`} strokeWidth={view === target ? 2.5 : 2} />
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans max-w-md mx-auto relative shadow-2xl overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
        <div>
          <h1 className="text-xl font-black text-indigo-600 tracking-tight">Expense<span className="text-slate-800">Tracker</span></h1>
        </div>
        <div className="flex items-center gap-3">
           {isOffline && (
             <div className="flex items-center gap-1 bg-red-100 text-red-600 px-2 py-1 rounded-md text-[10px] font-bold">
               <WifiOff className="h-3 w-3" />
               {t.offlineMode}
             </div>
           )}
           <button 
            onClick={toggleLanguage} 
            className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-full text-xs font-bold transition-colors"
          >
            <Globe className="h-3 w-3" />
            {language === 'en' ? 'EN' : 'বাংলা'}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="p-4 min-h-[calc(100vh-140px)]">
        {view === ViewState.FINANCES && (
          <Finances 
            deposits={deposits}
            expenses={expenses}
            onAddDeposit={addDeposit}
            onAddExpense={addExpense}
            onDeleteDeposit={deleteDeposit}
            onDeleteExpense={deleteExpense}
            expenseCategories={expenseCategories}
            onAddCategory={addExpenseCategory}
            onDeleteCategory={deleteExpenseCategory}
            onEditCategory={editExpenseCategory}
            t={t}
            language={language}
          />
        )}
        {view === ViewState.MEALS && (
          <Meals 
            mealMap={mealMap} 
            updateMeal={updateMeal}
            t={t}
            language={language}
          />
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 pb-safe z-40 max-w-md mx-auto">
        <div className="flex justify-around items-center">
          {/* Swapped Order: Money first */}
          <NavItem target={ViewState.FINANCES} icon={Wallet} label={t.navMoney} />
          <NavItem target={ViewState.MEALS} icon={UtensilsCrossed} label={t.navMeals} />
        </div>
      </nav>
    </div>
  );
};

export default App;