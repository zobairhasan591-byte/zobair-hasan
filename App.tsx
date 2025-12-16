import React, { useState, useEffect, useMemo } from 'react';
import { Member, Deposit, Expense, MealMap, ViewState, Stats, MealEntry, Language } from './types';
import { Dashboard } from './components/Dashboard';
import { Meals } from './components/Meals';
import { Finances } from './components/Finances';
import { Members } from './components/Members';
import { SmartAssistant } from './components/SmartAssistant';
import { LayoutDashboard, UtensilsCrossed, Wallet, Users, Sparkles, Globe } from 'lucide-react';
import { translations } from './translations';

const App: React.FC = () => {
  // --- State Management ---
  const [view, setView] = useState<ViewState>(ViewState.DASHBOARD);
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved as Language) || 'en';
  });
  
  // Load initial state from local storage or defaults
  const [members, setMembers] = useState<Member[]>(() => {
    const saved = localStorage.getItem('members');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [deposits, setDeposits] = useState<Deposit[]>(() => {
    const saved = localStorage.getItem('deposits');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem('expenses');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [mealMap, setMealMap] = useState<MealMap>(() => {
    const saved = localStorage.getItem('mealMap');
    return saved ? JSON.parse(saved) : {};
  });

  // --- Persistence Effects ---
  useEffect(() => localStorage.setItem('language', language), [language]);
  useEffect(() => localStorage.setItem('members', JSON.stringify(members)), [members]);
  useEffect(() => localStorage.setItem('deposits', JSON.stringify(deposits)), [deposits]);
  useEffect(() => localStorage.setItem('expenses', JSON.stringify(expenses)), [expenses]);
  useEffect(() => localStorage.setItem('mealMap', JSON.stringify(mealMap)), [mealMap]);

  // --- Translations ---
  const t = translations[language];

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'bn' : 'en');
  };

  // --- Actions ---
  const addMember = (member: Omit<Member, 'id'>) => {
    const newMember = { ...member, id: crypto.randomUUID() };
    setMembers([...members, newMember]);
  };

  const deleteMember = (id: string) => {
    setMembers(prev => prev.filter(m => m.id !== id));
  };

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

  const updateMeal = (date: string, memberId: string, type: keyof MealEntry) => {
    setMealMap(prev => {
      const dateEntries = prev[date] || {};
      const memberEntry = dateEntries[memberId] || { breakfast: true, lunch: true, dinner: true };
      
      const newMemberEntry = { ...memberEntry, [type]: !memberEntry[type] };
      
      return {
        ...prev,
        [date]: {
          ...dateEntries,
          [memberId]: newMemberEntry
        }
      };
    });
  };

  // --- Calculations ---
  const stats = useMemo<Stats>(() => {
    const totalDeposits = deposits.reduce((sum, d) => sum + d.amount, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const cashInHand = totalDeposits - totalExpenses;

    let totalMealUnits = 0;
    
    // Calculate total meal units across all history
    Object.values(mealMap).forEach(dateEntry => {
      Object.values(dateEntry).forEach((entry: MealEntry) => {
        if (entry.breakfast) totalMealUnits += 0.5;
        if (entry.lunch) totalMealUnits += 1.0;
        if (entry.dinner) totalMealUnits += 1.0;
      });
    });
    
    const mealRate = totalMealUnits > 0 ? totalExpenses / totalMealUnits : 0;

    return {
      totalDeposits,
      totalExpenses,
      cashInHand,
      totalMealUnits,
      mealRate
    };
  }, [deposits, expenses, mealMap]);

  const calculateMemberBalance = (memberId: string): number => {
    // 1. Calculate Member's Total Units
    let memberUnits = 0;
    Object.values(mealMap).forEach(dateEntry => {
      const entry = dateEntry[memberId];
      if (entry) {
        if (entry.breakfast) memberUnits += 0.5;
        if (entry.lunch) memberUnits += 1.0;
        if (entry.dinner) memberUnits += 1.0;
      }
    });

    // 2. Calculate Cost
    const cost = memberUnits * stats.mealRate;

    // 3. Calculate Total Deposit by Member
    const memberDeposit = deposits
      .filter(d => d.memberId === memberId)
      .reduce((sum, d) => sum + d.amount, 0);

    // 4. Return Balance (Cost - Deposit)
    return cost - memberDeposit;
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
          <h1 className="text-xl font-black text-indigo-600 tracking-tight">Mess<span className="text-slate-800">Manager</span></h1>
        </div>
        <div className="flex items-center gap-3">
           <button 
            onClick={toggleLanguage} 
            className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-full text-xs font-bold transition-colors"
          >
            <Globe className="h-3 w-3" />
            {language === 'en' ? 'EN' : 'বাংলা'}
          </button>
          <div className="h-8 w-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-xs">
            MM
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="p-4 min-h-[calc(100vh-140px)]">
        {view === ViewState.DASHBOARD && (
          <Dashboard 
            stats={stats} 
            members={members} 
            calculateMemberBalance={calculateMemberBalance}
            t={t}
          />
        )}
        {view === ViewState.MEALS && (
          <Meals 
            members={members} 
            mealMap={mealMap} 
            updateMeal={updateMeal}
            t={t}
            language={language}
          />
        )}
        {view === ViewState.FINANCES && (
          <Finances 
            deposits={deposits}
            expenses={expenses}
            members={members}
            onAddDeposit={addDeposit}
            onAddExpense={addExpense}
            onDeleteDeposit={deleteDeposit}
            onDeleteExpense={deleteExpense}
            t={t}
          />
        )}
        {view === ViewState.MEMBERS && (
          <Members 
            members={members} 
            onAddMember={addMember} 
            onDeleteMember={deleteMember}
            t={t}
          />
        )}
        {view === ViewState.AI_ASSISTANT && (
          <SmartAssistant 
            members={members}
            onAddDeposit={addDeposit}
            onAddExpense={addExpense}
            t={t}
          />
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 pb-safe z-40 max-w-md mx-auto">
        <div className="flex justify-around items-center">
          <NavItem target={ViewState.DASHBOARD} icon={LayoutDashboard} label={t.navHome} />
          <NavItem target={ViewState.MEALS} icon={UtensilsCrossed} label={t.navMeals} />
          {/* Central AI Button */}
          <div className="relative -top-5">
            <button 
              onClick={() => setView(ViewState.AI_ASSISTANT)}
              className={`h-14 w-14 rounded-full flex items-center justify-center shadow-lg transition-transform ${
                view === ViewState.AI_ASSISTANT 
                ? 'bg-indigo-700 scale-110 ring-4 ring-indigo-100' 
                : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              <Sparkles className="h-6 w-6 text-white" />
            </button>
          </div>
          <NavItem target={ViewState.FINANCES} icon={Wallet} label={t.navMoney} />
          <NavItem target={ViewState.MEMBERS} icon={Users} label={t.navMembers} />
        </div>
      </nav>
    </div>
  );
};

export default App;