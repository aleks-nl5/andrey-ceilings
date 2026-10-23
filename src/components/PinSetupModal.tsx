import React, { useState } from 'react';
import { Shield, Check, X, AlertCircle } from 'lucide-react';
import { SecurityStorage } from '../utils/security';

interface PinSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const PinSetupModal: React.FC<PinSetupModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [step, setStep] = useState<'enter' | 'confirm'>('enter');
  const [pin, setPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const currentVal = step === 'enter' ? pin : confirmPin;

  const handleDigit = (digit: string) => {
    if (currentVal.length >= 4) return;
    const nextVal = currentVal + digit;
    setError(null);

    if (step === 'enter') {
      setPin(nextVal);
      if (nextVal.length === 4) {
        setTimeout(() => {
          setStep('confirm');
        }, 150);
      }
    } else {
      setConfirmPin(nextVal);
      if (nextVal.length === 4) {
        if (nextVal === pin) {
          SecurityStorage.setNewPin(nextVal);
          onSuccess();
          onClose();
        } else {
          setError('PIN-коди не співпадають. Спробуйте ще раз');
          setTimeout(() => {
            setConfirmPin('');
          }, 400);
        }
      }
    }
  };

  const handleDelete = () => {
    if (step === 'enter') {
      setPin((prev) => prev.slice(0, -1));
    } else {
      setConfirmPin((prev) => prev.slice(0, -1));
    }
    setError(null);
  };

  const handleReset = () => {
    setStep('enter');
    setPin('');
    setConfirmPin('');
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-[10000] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-sm p-5 space-y-4 shadow-2xl animate-fadeIn">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-cyan-100 dark:bg-cyan-950 text-cyan-600 dark:text-cyan-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {step === 'enter' ? 'Встановлення PIN-коду' : 'Підтвердження PIN'}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {step === 'enter' ? 'Придумайте 4-значний PIN' : 'Введіть PIN ще раз для перевірки'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dots */}
        <div className="flex items-center justify-center gap-3 py-2">
          {[0, 1, 2, 3].map((idx) => {
            const isFilled = currentVal.length > idx;
            return (
              <div
                key={idx}
                className={`w-3.5 h-3.5 rounded-full transition ${
                  isFilled
                    ? 'bg-cyan-600 dark:bg-cyan-400 scale-125'
                    : 'bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700'
                }`}
              />
            );
          })}
        </div>

        {error && (
          <div className="text-xs text-rose-500 font-semibold text-center flex items-center justify-center gap-1">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Small Keypad */}
        <div className="grid grid-cols-3 gap-2 pt-2">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
            <button
              key={digit}
              type="button"
              onClick={() => handleDigit(digit)}
              className="py-3 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-lg font-bold font-mono transition active:scale-95"
            >
              {digit}
            </button>
          ))}
          <button
            type="button"
            onClick={handleReset}
            className="py-3 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-400 hover:text-slate-700 text-xs font-semibold"
          >
            Спочатку
          </button>
          <button
            type="button"
            onClick={() => handleDigit('0')}
            className="py-3 rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-lg font-bold font-mono transition active:scale-95"
          >
            0
          </button>
          <button
            type="button"
            onClick={handleDelete}
            className="py-3 rounded-xl bg-slate-50 dark:bg-slate-950 text-slate-500 hover:text-slate-700 text-xs font-semibold"
          >
            Стерти
          </button>
        </div>
      </div>
    </div>
  );
};
