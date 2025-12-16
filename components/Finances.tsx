import React, { useState } from 'react';
import { Deposit, Expense, Member, Translation } from '../types';
import { Plus, Trash2, Calendar, User, ShoppingBag, Receipt } from 'lucide-react';
import { Button } from './Button';
import { Modal } from './Modal';

interface FinancesProps {
  deposits: Deposit[];
  expenses: Expense[];
  members: Member[];
  onAddDeposit: (deposit: Omit<Deposit, 'id'>) => void;
  onAddExpense: (expense: Omit<Expense, 'id'>) => void;
  onDeleteDeposit: (id: string) => void;
  onDeleteExpense: (id: string) => void;
  t: Translation;
}

export const Finances: React.FC<FinancesProps> = ({ 
  deposits, expenses, members, onAddDeposit, onAddExpense, onDeleteDeposit, onDeleteExpense, t
}) => {
  const [activeTab, setActiveTab] = useState<'deposits' | 'expenses'>('expenses');
  const [isDepositModalOpen, setDepositModalOpen] = useState(false);
  const [isExpenseModalOpen, setExpenseModalOpen] = useState(false);

  // Form States
  const [depositForm, setDepositForm] = useState({ memberId: '', amount: '', date: new Date().toISOString().split('T')[0] });
  const [expenseForm, setExpenseForm] = useState({ shopperName: '', items: '', amount: '', date: new Date().toISOString().split('T')[0] });

  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddDeposit({
      memberId: depositForm.memberId,
      amount: parseFloat(depositForm.amount),
      date: depositForm.date,
    });
    setDepositModalOpen(false);
    setDepositForm({ memberId: '', amount: '', date: new Date().toISOString().split('T')[0] });
  };

  const handleExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddExpense({
      shopperName: expenseForm.shopperName,
      items: expenseForm.items,
      amount: parseFloat(expenseForm.amount),
      date: expenseForm.date,
    });
    setExpenseModalOpen(false);
    setExpenseForm({ shopperName: '', items: '', amount: '', date: new Date().toISOString().split('T')[0] });
  };

  return (
    <div className="space-y-4 pb-20">
      {/* Tabs */}
      <div className="flex p-1 bg-slate-200 rounded-xl">
        <button 
          onClick={() => setActiveTab('expenses')}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'expenses' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
        >
          {t.expenses}
        </button>
        <button 
          onClick={() => setActiveTab('deposits')}
          className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${activeTab === 'deposits' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'}`}
        >
          {t.deposits}
        </button>
      </div>

      {/* Floating Action Button for the active tab */}
      <div className="fixed bottom-24 right-4 z-20">
        <button 
          onClick={() => activeTab === 'deposits' ? setDepositModalOpen(true) : setExpenseModalOpen(true)}
          className="bg-indigo-600 text-white p-4 rounded-full shadow-lg hover:bg-indigo-700 transition-transform active:scale-95 flex items-center justify-center"
        >
          <Plus className="h-6 w-6" />
        </button>
      </div>

      {/* List Content */}
      <div className="space-y-3">
        {activeTab === 'expenses' ? (
          expenses.length === 0 ? (
            <div className="text-center py-12 text-slate-400">{t.noExpenses}</div>
          ) : (
            expenses.slice().reverse().map(expense => (
              <div key={expense.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex justify-between items-start">
                <div className="flex gap-3">
                  <div className="bg-orange-100 p-2 rounded-full h-10 w-10 flex items-center justify-center text-orange-600 shrink-0">
                    <ShoppingBag className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-800 text-sm line-clamp-1">{expense.items}</h4>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                      <span>{expense.shopperName}</span>
                      <span>•</span>
                      <span>{expense.date}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className="font-bold text-slate-800">৳{expense.amount.toFixed(2)}</span>
                  <button onClick={() => onDeleteExpense(expense.id)} className="text-slate-400 hover:text-red-500">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          )
        ) : (
          deposits.length === 0 ? (
            <div className="text-center py-12 text-slate-400">{t.noDeposits}</div>
          ) : (
            deposits.slice().reverse().map(deposit => {
              const member = members.find(m => m.id === deposit.memberId);
              return (
                <div key={deposit.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex justify-between items-start">
                  <div className="flex gap-3">
                    <div className="bg-green-100 p-2 rounded-full h-10 w-10 flex items-center justify-center text-green-600 shrink-0">
                      <Receipt className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-800 text-sm">{member?.name || t.unknownMember}</h4>
                      <div className="text-xs text-slate-500 mt-1">
                        {deposit.date}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="font-bold text-green-600">+৳{deposit.amount.toFixed(2)}</span>
                    <button onClick={() => onDeleteDeposit(deposit.id)} className="text-slate-400 hover:text-red-500">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )
        )}
      </div>

      {/* Deposit Modal */}
      <Modal isOpen={isDepositModalOpen} onClose={() => setDepositModalOpen(false)} title={t.addDeposit}>
        <form onSubmit={handleDepositSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t.member}</label>
            <select 
              required
              value={depositForm.memberId}
              onChange={(e) => setDepositForm({...depositForm, memberId: e.target.value})}
              className="w-full rounded-lg border-slate-300 border p-2.5 text-sm focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="">{t.selectMember}</option>
              {members.map(m => (
                <option key={m.id} value={m.id}>{m.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t.amount}</label>
            <input 
              type="number"
              required
              min="0"
              step="0.01"
              value={depositForm.amount}
              onChange={(e) => setDepositForm({...depositForm, amount: e.target.value})}
              className="w-full rounded-lg border-slate-300 border p-2.5 text-sm focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t.date}</label>
            <input 
              type="date"
              required
              value={depositForm.date}
              onChange={(e) => setDepositForm({...depositForm, date: e.target.value})}
              className="w-full rounded-lg border-slate-300 border p-2.5 text-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <Button type="submit" className="w-full">{t.saveDeposit}</Button>
        </form>
      </Modal>

      {/* Expense Modal */}
      <Modal isOpen={isExpenseModalOpen} onClose={() => setExpenseModalOpen(false)} title={t.addExpense}>
        <form onSubmit={handleExpenseSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t.shopperName}</label>
            <input 
              type="text"
              required
              value={expenseForm.shopperName}
              onChange={(e) => setExpenseForm({...expenseForm, shopperName: e.target.value})}
              className="w-full rounded-lg border-slate-300 border p-2.5 text-sm focus:ring-indigo-500 focus:border-indigo-500"
              placeholder={t.whoBought}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t.itemsList}</label>
            <input 
              type="text"
              required
              value={expenseForm.items}
              onChange={(e) => setExpenseForm({...expenseForm, items: e.target.value})}
              className="w-full rounded-lg border-slate-300 border p-2.5 text-sm focus:ring-indigo-500 focus:border-indigo-500"
              placeholder={t.itemsPlaceholder}
            />
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
              className="w-full rounded-lg border-slate-300 border p-2.5 text-sm focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="0.00"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t.date}</label>
            <input 
              type="date"
              required
              value={expenseForm.date}
              onChange={(e) => setExpenseForm({...expenseForm, date: e.target.value})}
              className="w-full rounded-lg border-slate-300 border p-2.5 text-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <Button type="submit" className="w-full">{t.saveExpense}</Button>
        </form>
      </Modal>
    </div>
  );
};