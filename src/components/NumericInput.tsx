import React, { useState, useEffect } from 'react';
import { Minus, Plus, Calculator, X, Check, Delete } from 'lucide-react';

interface NumericInputProps {
  label?: string;
  value: number;
  onChange: (val: number) => void;
  unit?: string;
  min?: number;
  max?: number;
  step?: number;
  steppers?: number[];
  allowDecimals?: boolean;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  helperText?: string;
  showNumpadTrigger?: boolean;
  numpadTitle?: string;
  disabled?: boolean;
}

export const NumericInput: React.FC<NumericInputProps> = ({
  label,
  value,
  onChange,
  unit = '',
  min = 0,
  max,
  steppers,
  allowDecimals = true,
  placeholder = '0',
  className = '',
  inputClassName = '',
  helperText,
  showNumpadTrigger = true,
  numpadTitle,
  disabled = false,
}) => {
  // Format initial number cleanly
  const formatVal = (v: number) => {
    if (isNaN(v) || v === null || v === undefined) return '';
    return v === 0 ? '0' : String(v);
  };

  const [rawText, setRawText] = useState<string>(formatVal(value));
  const [isFocused, setIsFocused] = useState<boolean>(false);
  const [isNumpadOpen, setIsNumpadOpen] = useState<boolean>(false);
  const [numpadBuffer, setNumpadBuffer] = useState<string>(formatVal(value));

  // Sync with external value changes when not actively typing
  useEffect(() => {
    if (!isFocused) {
      setRawText(formatVal(value));
    }
  }, [value, isFocused]);

  const parseAndClamp = (text: string): number => {
    const sanitized = text.replace(',', '.').trim();
    if (!sanitized) return min;
    let num = parseFloat(sanitized);
    if (isNaN(num)) return min;
    if (min !== undefined && num < min) num = min;
    if (max !== undefined && num > max) num = max;
    return allowDecimals ? Math.round(num * 100) / 100 : Math.round(num);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // Allow digits, single comma or dot, and empty string while typing
    const validPattern = allowDecimals ? /^[0-9]*[.,]?[0-9]*$/ : /^[0-9]*$/;
    if (val === '' || validPattern.test(val)) {
      setRawText(val);
      if (val !== '' && !val.endsWith('.') && !val.endsWith(',')) {
        const num = parseAndClamp(val);
        onChange(num);
      }
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    const num = parseAndClamp(rawText);
    setRawText(formatVal(num));
    onChange(num);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      (e.target as HTMLInputElement).blur();
    }
  };

  const handleStep = (delta: number) => {
    let next = Math.round((value + delta) * 100) / 100;
    if (min !== undefined && next < min) next = min;
    if (max !== undefined && next > max) next = max;
    setRawText(formatVal(next));
    onChange(next);
  };

  // Numpad handlers
  const openNumpad = () => {
    setNumpadBuffer(formatVal(value));
    setIsNumpadOpen(true);
  };

  const handleNumpadKey = (char: string) => {
    if (char === 'C') {
      setNumpadBuffer('');
      return;
    }
    if (char === 'DEL') {
      setNumpadBuffer((prev) => prev.slice(0, -1));
      return;
    }
    if (char === '.' || char === ',') {
      if (!allowDecimals) return;
      if (numpadBuffer.includes('.') || numpadBuffer.includes(',')) return;
      setNumpadBuffer((prev) => (prev === '' ? '0.' : prev + '.'));
      return;
    }
    // Digits
    setNumpadBuffer((prev) => (prev === '0' ? char : prev + char));
  };

  const handleNumpadStep = (delta: number) => {
    const cur = parseFloat(numpadBuffer.replace(',', '.')) || 0;
    const next = Math.max(min, Math.round((cur + delta) * 100) / 100);
    setNumpadBuffer(String(next));
  };

  const confirmNumpad = () => {
    const num = parseAndClamp(numpadBuffer);
    setRawText(formatVal(num));
    onChange(num);
    setIsNumpadOpen(false);
  };

  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <div className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-300 font-semibold">
          <span>{label}</span>
          {helperText && (
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">
              {helperText}
            </span>
          )}
        </div>
      )}

      <div className="flex items-center gap-1.5">
        {/* Main Input field with unit */}
        <div className="relative flex-1 flex items-center">
          <input
            type="text"
            inputMode={allowDecimals ? 'decimal' : 'numeric'}
            value={rawText}
            placeholder={placeholder}
            disabled={disabled}
            onChange={handleInputChange}
            onFocus={() => setIsFocused(true)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className={`w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 focus:border-cyan-600 dark:focus:border-cyan-500 rounded-xl px-3 py-2 text-base font-bold font-mono text-slate-900 dark:text-white focus:outline-none transition shadow-sm ${
              unit ? 'pr-9' : ''
            } ${inputClassName}`}
          />
          {unit && (
            <span className="absolute right-2.5 text-xs text-slate-500 dark:text-slate-400 font-mono font-bold pointer-events-none select-none">
              {unit}
            </span>
          )}
        </div>

        {/* Optional on-screen touch numpad trigger */}
        {showNumpadTrigger && !disabled && (
          <button
            type="button"
            title="Цифрова клавіатура"
            onClick={openNumpad}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 active:scale-95 text-cyan-700 dark:text-cyan-400 border border-slate-300 dark:border-slate-700/80 transition shrink-0 shadow-sm"
          >
            <Calculator className="w-4 h-4" />
          </button>
        )}

        {/* Quick Stepper Buttons if provided */}
        {steppers && steppers.length > 0 && !disabled && (
          <div className="flex items-center gap-1 shrink-0">
            {steppers.map((st) => (
              <button
                key={st}
                type="button"
                onClick={() => handleStep(st)}
                className="px-2 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 active:scale-95 text-slate-800 dark:text-slate-300 text-xs font-mono font-bold border border-slate-300 dark:border-slate-700/80 transition shadow-sm"
              >
                {st > 0 ? `+${st}` : st}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* On-screen Large Touch Numpad Modal */}
      {isNumpadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 w-full max-w-xs rounded-2xl p-4 shadow-2xl space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Calculator className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                <span>{numpadTitle || label || 'Введення числа'}</span>
              </span>
              <button
                type="button"
                onClick={() => setIsNumpadOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Display */}
            <div className="bg-slate-100 dark:bg-slate-950 border border-cyan-500/40 dark:border-cyan-800/60 rounded-xl p-3 text-right">
              <div className="text-2xl font-black font-mono text-cyan-700 dark:text-cyan-400 tracking-wider">
                {numpadBuffer || '0'} <span className="text-sm font-sans text-slate-500 dark:text-slate-400">{unit}</span>
              </div>
            </div>

            {/* Quick Step increments row */}
            <div className="grid grid-cols-4 gap-1.5">
              <button
                type="button"
                onClick={() => handleNumpadStep(-0.5)}
                className="py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-300 text-xs font-mono font-bold border border-slate-200 dark:border-transparent"
              >
                -0.5
              </button>
              <button
                type="button"
                onClick={() => handleNumpadStep(-0.1)}
                className="py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-300 text-xs font-mono font-bold border border-slate-200 dark:border-transparent"
              >
                -0.1
              </button>
              <button
                type="button"
                onClick={() => handleNumpadStep(0.1)}
                className="py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-cyan-700 dark:text-cyan-300 text-xs font-mono font-bold border border-slate-200 dark:border-transparent"
              >
                +0.1
              </button>
              <button
                type="button"
                onClick={() => handleNumpadStep(0.5)}
                className="py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-cyan-700 dark:text-cyan-300 text-xs font-mono font-bold border border-slate-200 dark:border-transparent"
              >
                +0.5
              </button>
            </div>

            {/* Keys Grid */}
            <div className="grid grid-cols-3 gap-2">
              {['7', '8', '9', '4', '5', '6', '1', '2', '3'].map((key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleNumpadKey(key)}
                  className="py-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 active:bg-cyan-100 dark:active:bg-cyan-900 active:scale-95 text-slate-900 dark:text-white font-mono font-bold text-lg shadow-sm border border-slate-200 dark:border-transparent transition"
                >
                  {key}
                </button>
              ))}

              <button
                type="button"
                onClick={() => handleNumpadKey('C')}
                className="py-3 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-slate-800/80 dark:hover:bg-red-950 text-red-600 dark:text-red-400 font-bold text-sm border border-red-200 dark:border-transparent transition"
              >
                Скинути
              </button>

              <button
                type="button"
                onClick={() => handleNumpadKey('0')}
                className="py-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 active:bg-cyan-100 dark:active:bg-cyan-900 active:scale-95 text-slate-900 dark:text-white font-mono font-bold text-lg shadow-sm border border-slate-200 dark:border-transparent transition"
              >
                0
              </button>

              {allowDecimals ? (
                <button
                  type="button"
                  onClick={() => handleNumpadKey('.')}
                  className="py-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 active:bg-cyan-100 dark:active:bg-cyan-900 active:scale-95 text-slate-900 dark:text-white font-mono font-bold text-lg shadow-sm border border-slate-200 dark:border-transparent transition"
                >
                  .
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleNumpadKey('DEL')}
                  className="py-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center border border-slate-200 dark:border-transparent transition"
                >
                  <Delete className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Backspace & Confirm Row */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              <button
                type="button"
                onClick={() => handleNumpadKey('DEL')}
                className="py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center border border-slate-200 dark:border-transparent transition"
                title="Видалити символ"
              >
                <Delete className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={confirmNumpad}
                className="col-span-2 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-sm shadow-md flex items-center justify-center gap-1.5 transition active:scale-95"
              >
                <Check className="w-4 h-4" />
                <span>Застосувати</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
