import React from 'react';
import { Member, Stats, Translation } from '../types';
import { TrendingUp, TrendingDown, DollarSign, Utensils } from 'lucide-react';

interface DashboardProps {
  stats: Stats;
  members: Member[];
  calculateMemberBalance: (memberId: string) => number;
  t: Translation;
}

export const Dashboard: React.FC<DashboardProps> = ({ stats, members, calculateMemberBalance, t }) => {
  return (
    <div className="space-y-6 pb-20">
      <div className="grid grid-cols-2 gap-4">
        {/* Cash In Hand */}
        <div className="col-span-2 sm:col-span-1 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl p-5 text-white shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-indigo-100 font-medium">{t.cashInHand}</span>
            <DollarSign className="h-5 w-5 text-indigo-200" />
          </div>
          <div className="text-3xl font-bold">
            ৳{stats.cashInHand.toFixed(2)}
          </div>
          <div className="mt-2 text-xs text-indigo-200 flex justify-between">
            <span>{t.in}: ৳{stats.totalDeposits}</span>
            <span>{t.out}: ৳{stats.totalExpenses}</span>
          </div>
        </div>

        {/* Meal Rate */}
        <div className="col-span-2 sm:col-span-1 bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-500 font-medium">{t.mealRate}</span>
            <Utensils className="h-5 w-5 text-indigo-500" />
          </div>
          <div className="text-3xl font-bold text-slate-800">
            ৳{stats.mealRate.toFixed(2)}
          </div>
          <div className="mt-2 text-xs text-slate-400">
            {t.perUnitCost} {stats.totalMealUnits} {t.totalMeals}
          </div>
        </div>
      </div>

      {/* Member Status List */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-semibold text-slate-800">{t.memberStatus}</h3>
          <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded-full">{members.length} {t.members}</span>
        </div>
        <div className="divide-y divide-slate-100">
          {members.length === 0 ? (
            <div className="p-6 text-center text-slate-400 text-sm">
              {t.noMembersYet}
            </div>
          ) : (
            members.map(member => {
              const balance = calculateMemberBalance(member.id);
              const isDue = balance > 0;
              const isSurplus = balance < 0;
              
              return (
                <div key={member.id} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                  <div>
                    <div className="font-medium text-slate-900">{member.name}</div>
                    <div className="text-xs text-slate-500">{t.room} {member.roomNo}</div>
                  </div>
                  <div className={`text-right ${isDue ? 'text-red-600' : isSurplus ? 'text-green-600' : 'text-slate-500'}`}>
                    <div className="font-bold flex items-center justify-end gap-1">
                      {isDue && <TrendingDown className="h-3 w-3" />}
                      {isSurplus && <TrendingUp className="h-3 w-3" />}
                      ৳{Math.abs(balance).toFixed(2)}
                    </div>
                    <div className="text-[10px] font-medium uppercase tracking-wider">
                      {isDue ? t.due : isSurplus ? t.surplus : t.settled}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};