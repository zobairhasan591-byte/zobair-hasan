import React, { useState, useMemo } from 'react';
import { MealMap, MealEntry, Translation, Language } from '../types';
import { ChevronLeft, ChevronRight, Coffee, Sun, Moon } from 'lucide-react';

interface MealsProps {
  mealMap: MealMap;
  updateMeal: (date: string, type: keyof MealEntry) => void;
  t: Translation;
  language: Language;
}

export const Meals: React.FC<MealsProps> = ({ mealMap, updateMeal, t, language }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Helper: Format as YYYY-MM-DD for storage keys
  const formatStorageDate = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  // Helper: Format for Display dd/mm/yyyy
  const formatDisplayDate = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${d}/${m}/${y}`;
  };

  const dateStr = formatStorageDate(selectedDate);

  // Month Navigation
  const changeMonth = (offset: number) => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + offset);
    setCurrentMonth(newMonth);
  };

  const getMealStatus = (date: string): MealEntry => {
    return mealMap[date] || { breakfast: true, lunch: true, dinner: true };
  };

  const calculateDailyScore = (date: string) => {
    const status = getMealStatus(date);
    let score = 0;
    if (status.breakfast) score += 1.0; 
    if (status.lunch) score += 1.0;
    if (status.dinner) score += 1.0;
    return score;
  };

  // Calendar Generation
  const generateCalendarDays = () => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startingDayOfWeek = firstDay.getDay(); 
    const daysInMonth = lastDay.getDate();

    const days = [];
    for (let i = 0; i < startingDayOfWeek; i++) days.push(null);
    for (let i = 1; i <= daysInMonth; i++) days.push(new Date(year, month, i));
    return days;
  };

  const days = generateCalendarDays();
  const weekDays = language === 'en' ? ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'] : ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহঃ', 'শুক্র', 'শনি'];

  // Monthly Stats Calculation
  const monthlyStats = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const lastDay = new Date(year, month + 1, 0).getDate();
    
    let b = 0, l = 0, d = 0;
    
    for(let i = 1; i <= lastDay; i++) {
        const dStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
        const entry = mealMap[dStr]; 
        const effectiveEntry = entry || { breakfast: true, lunch: true, dinner: true };
        
        if (effectiveEntry.breakfast) b++;
        if (effectiveEntry.lunch) l++;
        if (effectiveEntry.dinner) d++;
    }
    return { b, l, d, total: b + l + d };
  }, [currentMonth, mealMap]);


  const MealToggle = ({ active, onClick, icon: Icon, label, colorClass }: any) => (
    <button
      onClick={onClick}
      className={`
        flex-1 flex flex-col items-center justify-center p-4 rounded-xl transition-all border
        ${active 
          ? `bg-${colorClass}-100 text-${colorClass}-700 border-${colorClass}-300 ring-2 ring-${colorClass}-200` 
          : 'bg-white text-slate-400 border-slate-200 hover:bg-slate-50'
        }
      `}
    >
      <Icon className={`h-8 w-8 mb-2 ${active ? 'fill-current' : ''}`} />
      <span className="text-xs font-bold uppercase tracking-wider">{label}</span>
      <div className={`mt-2 w-3 h-3 rounded-full ${active ? `bg-${colorClass}-500` : 'bg-slate-300'}`}></div>
    </button>
  );

  const currentStatus = getMealStatus(dateStr);

  return (
    <div className="space-y-6 pb-20">
      {/* Calendar Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/50">
          <button onClick={() => changeMonth(-1)} className="p-1 hover:bg-slate-200 rounded-full text-slate-500">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h2 className="font-bold text-slate-800">
            {currentMonth.toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US', { month: 'long', year: 'numeric' })}
          </h2>
          <button onClick={() => changeMonth(1)} className="p-1 hover:bg-slate-200 rounded-full text-slate-500">
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        <div className="p-3">
          <div className="grid grid-cols-7 mb-2">
            {weekDays.map((d, i) => (
              <div key={i} className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {d}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, idx) => {
              if (!day) return <div key={`empty-${idx}`} className="aspect-square" />;
              
              const dStr = formatStorageDate(day);
              const isSelected = dStr === dateStr;
              const isToday = dStr === formatStorageDate(new Date());
              const dailyTotal = calculateDailyScore(dStr);

              return (
                <button
                  key={dStr}
                  onClick={() => setSelectedDate(day)}
                  className={`
                    aspect-square rounded-lg flex flex-col items-center justify-center relative transition-all
                    ${isSelected 
                      ? 'bg-indigo-600 text-white shadow-md ring-2 ring-indigo-200' 
                      : isToday 
                        ? 'bg-indigo-50 text-indigo-700 font-semibold border border-indigo-100'
                        : 'bg-white hover:bg-slate-50 text-slate-700'
                    }
                  `}
                >
                  <span className={`text-[10px] font-medium leading-none mb-1 ${isSelected ? 'text-indigo-200' : 'text-slate-400'}`}>
                    {dailyTotal}
                  </span>
                  <span className="text-sm font-bold leading-none">
                    {day.getDate()}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Daily Selection */}
      <div>
        <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-3 ml-1">
            {t.totalDailyMeals} {formatDisplayDate(selectedDate)}
        </h3>
        <div className="flex gap-3">
            <MealToggle 
            active={currentStatus.breakfast} 
            onClick={() => updateMeal(dateStr, 'breakfast')}
            icon={Coffee}
            label={t.bkfst}
            colorClass="orange"
            />
            <MealToggle 
            active={currentStatus.lunch} 
            onClick={() => updateMeal(dateStr, 'lunch')}
            icon={Sun}
            label={t.lunch}
            colorClass="amber"
            />
            <MealToggle 
            active={currentStatus.dinner} 
            onClick={() => updateMeal(dateStr, 'dinner')}
            icon={Moon}
            label={t.dinner}
            colorClass="indigo"
            />
        </div>
      </div>

      {/* Monthly Stats */}
      <div className="bg-slate-900 rounded-2xl p-5 text-white shadow-lg">
         <h3 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-4 border-b border-slate-700 pb-2">
            {t.monthlyStats} ({currentMonth.toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US', { month: 'long' })})
         </h3>
         <div className="grid grid-cols-2 gap-4">
             <div className="bg-white/10 rounded-xl p-3">
                 <div className="text-xs text-slate-300 mb-1">{t.totalBkfst}</div>
                 <div className="text-xl font-bold text-orange-300">{monthlyStats.b}</div>
             </div>
             <div className="bg-white/10 rounded-xl p-3">
                 <div className="text-xs text-slate-300 mb-1">{t.totalLunch}</div>
                 <div className="text-xl font-bold text-amber-300">{monthlyStats.l}</div>
             </div>
             <div className="bg-white/10 rounded-xl p-3">
                 <div className="text-xs text-slate-300 mb-1">{t.totalDinner}</div>
                 <div className="text-xl font-bold text-indigo-300">{monthlyStats.d}</div>
             </div>
             <div className="bg-indigo-600 rounded-xl p-3">
                 <div className="text-xs text-indigo-200 mb-1">{t.totalUnits}</div>
                 <div className="text-xl font-bold text-white">{monthlyStats.total}</div>
             </div>
         </div>
      </div>

    </div>
  );
};