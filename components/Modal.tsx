import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">
        <div className="fixed inset-0 bg-slate-900 bg-opacity-50 transition-opacity" onClick={onClose} />
        
        <div className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg w-full">
          <div className="flex items-center justify-between border-b px-4 py-3 bg-slate-50">
            <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
            <button
              onClick={onClose}
              className="rounded-full p-1 hover:bg-slate-200 transition-colors"
            >
              <X className="h-5 w-5 text-slate-500" />
            </button>
          </div>
          <div className="p-4 sm:p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};