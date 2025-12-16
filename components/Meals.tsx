import React, { useState } from 'react';
import { Member, MealMap, MealEntry, Translation, Language } from '../types';
import { ChevronLeft, ChevronRight, Check, X, Coffee, Sun, Moon } from 'lucide-react';
import { Button } from './Button';

interface MealsProps {
  members: Member[];
  mealMap: MealMap;
  updateMeal: (date: string, memberId: string, type: keyof MealEntry) => void;
  t: Translation;
  language: Language;
}

export const Meals: React.FC<MealsProps> = ({ members, mealMap, updateMeal, t, language }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const formatDate = (date: Date) => date.toISOString().split('T')[0];
  const dateStr = formatDate(selectedDate);

  const changeDate = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
  };

  const getMealStatus = (memberId: string): MealEntry => {
    return mealMap[dateStr]?.[memberId] || { breakfast: true, lunch: true, dinner: true };
  };

  const toggleMeal = (memberId: string, type: keyof MealEntry) => {
    updateMeal(dateStr, memberId, type);
  };

  const MealToggle = ({ active, onClick, icon: Icon, label, colorClass }: any) => (
    <button
      onClick={onClick}
      className={`
        flex-1 flex flex-col items-center justify-center p-2 rounded-lg transition-all
        ${active 
          ? `bg-${colorClass}-100 text-${colorClass}-700 border-${colorClass}-200 shadow-sm border` 
          : 'bg-slate-50 text-slate-400 border border-transparent hover:bg-slate-100'
        }
      `}
    >
      <Icon className={`h-5 w-5 mb-1 ${active ? 'fill-current' : ''}`} />
      <span className="text-[10px] font-bold uppercase">{label}</span>
    </button>
  );

  return (
    <div className="space-y-4 pb-20">
      {/* Date Header */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b border-slate-200 -mx-4 px-4 py-3 flex items-center justify-between shadow-sm">
        <button onClick={() => changeDate(-1)} className="p-2 hover:bg-slate-100 rounded-full text-slate-600">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div className="text-center">
          <h2 className="font-bold text-slate-800 text-lg">
            {selectedDate.toLocaleDateString(language === 'bn' ? 'bn-BD' : 'en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </h2>
          <p className="text-xs text-slate-500 font-medium">{t.dailyMealTracker}</p>
        </div>
        <button onClick={() => changeDate(1)} className="p-2 hover:bg-slate-100 rounded-full text-slate-600">
          <ChevronRight className="h-5 w-5" />
        </button>
      </div>
      
      {/* Members List */}
      <div className="space-y-3">
        {members.length === 0 ? (
          <div className="text-center py-10 text-slate-400">
            {t.noMembersTrack}
          </div>
        ) : (
          members.map(member => {
            const status = getMealStatus(member.id);
            return (
              <div key={member.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className="font-medium text-slate-800">{member.name}</span>
                    <span className="text-xs text-slate-500 ml-2">{t.room} {member.roomNo}</span>
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <MealToggle 
                    active={status.breakfast} 
                    onClick={() => toggleMeal(member.id, 'breakfast')}
                    icon={Coffee}
                    label={t.bkfst}
                    colorClass="orange"
                  />
                  <MealToggle 
                    active={status.lunch} 
                    onClick={() => toggleMeal(member.id, 'lunch')}
                    icon={Sun}
                    label={t.lunch}
                    colorClass="amber"
                  />
                  <MealToggle 
                    active={status.dinner} 
                    onClick={() => toggleMeal(member.id, 'dinner')}
                    icon={Moon}
                    label={t.dinner}
                    colorClass="indigo"
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};