import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, type = 'danger' }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4">
      {/* Backdrop with intense blur */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-md animate-in fade-in duration-300"
        onClick={onClose}
      ></div>

      {/* Modal Card */}
      <div className="relative w-full max-w-md bg-[var(--color-bg-light)]/90 border border-[var(--color-primary-muted)]/30 rounded-3xl p-8 galaxy-card shadow-[0_0_50px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-200">
        
        {/* Glow Effect Top */}
        <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-1 blur-md ${
          type === 'danger' ? 'bg-pink-500' : 'bg-[var(--color-primary-bright)]'
        }`}></div>

        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-500 hover:text-[var(--color-text-dark)] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center">
          {/* Icon Circle */}
          <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-6 ${
            type === 'danger' ? 'bg-pink-500/10 border border-pink-500/20 shadow-[0_0_20px_rgba(236,72,153,0.2)]' : 'bg-blue-500/10 border border-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.2)]'
          }`}>
            <AlertTriangle className={`w-8 h-8 ${type === 'danger' ? 'text-pink-500' : 'text-blue-400'}`} />
          </div>

          <h3 className="text-2xl font-black text-[var(--color-text-dark)] mb-2 uppercase tracking-tight">{title}</h3>
          <p className="text-gray-600 leading-relaxed mb-8">{message}</p>

          <div className="flex gap-4 w-full">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 rounded-xl border border-[var(--color-primary-muted)]/30 text-gray-700 font-bold hover:bg-[var(--color-primary-muted)]/5 transition-all"
            >
              Hủy bỏ
            </button>
            <button
              onClick={() => { onConfirm(); onClose(); }}
              className={`flex-1 px-6 py-3 rounded-xl font-black text-[var(--color-text-dark)] shadow-lg transition-all hover:scale-105 active:scale-95 ${
                type === 'danger' 
                ? 'bg-gradient-to-r from-pink-600 to-rose-600 shadow-pink-500/20' 
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 shadow-blue-500/20'
              }`}
            >
              Xác nhận
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
