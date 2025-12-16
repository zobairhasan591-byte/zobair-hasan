import React, { useState } from 'react';
import { parsePromptWithGemini } from '../services/geminiService';
import { Member, Deposit, Expense, Translation } from '../types';
import { Sparkles, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from './Button';

interface SmartAssistantProps {
  members: Member[];
  onAddDeposit: (deposit: Omit<Deposit, 'id'>) => void;
  onAddExpense: (expense: Omit<Expense, 'id'>) => void;
  t: Translation;
}

export const SmartAssistant: React.FC<SmartAssistantProps> = ({ members, onAddDeposit, onAddExpense, t }) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!input.trim()) return;
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const parsedData = await parsePromptWithGemini(input, members);
      if (parsedData) {
        setResult(parsedData);
      } else {
        setError(t.aiError);
      }
    } catch (err) {
      setError(t.aiConnectError);
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = () => {
    if (!result) return;

    if (result.actionType === 'DEPOSIT') {
      onAddDeposit({
        memberId: result.memberId,
        amount: result.amount,
        date: result.date,
      });
    } else if (result.actionType === 'EXPENSE') {
      onAddExpense({
        shopperName: result.shopperName,
        items: result.items,
        amount: result.amount,
        date: result.date,
      });
    }

    // Reset
    setInput('');
    setResult(null);
  };

  return (
    <div className="space-y-6 pb-20">
      <div className="bg-gradient-to-r from-violet-600 to-indigo-600 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-5 w-5 text-yellow-300" />
          <h2 className="text-lg font-bold">{t.magicAssistant}</h2>
        </div>
        <p className="text-indigo-100 text-sm mb-4">
          {t.aiDescription}
        </p>
        
        <div className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded-xl p-3 text-white placeholder-indigo-200 focus:outline-none focus:ring-2 focus:ring-white/50 text-sm min-h-[100px]"
            placeholder={t.aiPlaceholder}
          />
          <button 
            onClick={handleAnalyze}
            disabled={isLoading || !input.trim()}
            className="absolute bottom-3 right-3 p-2 bg-white text-indigo-600 rounded-lg hover:bg-indigo-50 disabled:opacity-50 transition-colors"
          >
            {isLoading ? (
               <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
               <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
               <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
             </svg>
            ) : (
              <Send className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3 border border-red-100">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {result && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm animate-fade-in">
          <div className="flex items-center gap-2 mb-4 text-green-600 font-medium">
            <CheckCircle className="h-5 w-5" />
            <span>{t.understood}</span>
          </div>

          <div className="space-y-3 mb-6">
            <div className="flex justify-between text-sm border-b border-slate-50 pb-2">
              <span className="text-slate-500">{t.type}</span>
              <span className="font-semibold text-slate-800">{result.actionType === 'DEPOSIT' ? t.deposits : t.expenses}</span>
            </div>
            <div className="flex justify-between text-sm border-b border-slate-50 pb-2">
              <span className="text-slate-500">{t.amount}</span>
              <span className="font-bold text-slate-800">৳{result.amount}</span>
            </div>
            <div className="flex justify-between text-sm border-b border-slate-50 pb-2">
              <span className="text-slate-500">{t.date}</span>
              <span className="text-slate-800">{result.date}</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-lg text-sm text-slate-600 italic">
              "{result.summary}"
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="secondary" className="flex-1" onClick={() => setResult(null)}>{t.cancel}</Button>
            <Button variant="primary" className="flex-1" onClick={handleConfirm}>{t.confirmSave}</Button>
          </div>
        </div>
      )}

      {/* Usage Tips */}
      <div className="px-4">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">{t.tryAsking}</h3>
        <div className="space-y-2">
          {[t.tip1, t.tip2, t.tip3].map((tip, i) => (
            <button 
              key={i} 
              onClick={() => setInput(tip)}
              className="block w-full text-left text-sm bg-white p-3 rounded-xl border border-slate-100 text-slate-600 hover:border-indigo-200 hover:text-indigo-600 transition-colors"
            >
              "{tip}"
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};