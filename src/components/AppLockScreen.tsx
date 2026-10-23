import React, { useState, useEffect } from 'react';
import { Shield, Fingerprint, Delete, Lock, Unlock, AlertCircle } from 'lucide-react';
import { SecurityStorage, authenticateWithBiometrics, isBiometricsAvailable } from '../utils/security';

interface AppLockScreenProps {
  onUnlock: () => void;
  companyName?: string;
}

export const AppLockScreen: React.FC<AppLockScreenProps> = ({
  onUnlock,
  companyName = 'СтеляПро',
}) => {
  const [pin, setPin] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [isBiometricSupported, setIsBiometricSupported] = useState<boolean>(false);
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);

  const settings = SecurityStorage.getSettings();

  useEffect(() => {
    isBiometricsAvailable().then((available) => {
      setIsBiometricSupported(available);
      // Auto-trigger biometric prompt if enabled
      if (available && settings.biometricsEnabled) {
        handleBiometricAuth();
      }
    });
  }, []);

  const handleDigit = (digit: string) => {
    if (pin.length >= 4) return;
    const nextPin = pin + digit;
    setPin(nextPin);
    setError(null);

    if (nextPin.length === 4) {
      if (SecurityStorage.verifyPin(nextPin)) {
        onUnlock();
      } else {
        setError('Невірний PIN-код');
        setTimeout(() => {
          setPin('');
        }, 400);
      }
    }
  };

  const handleDelete = () => {
    setPin((prev) => prev.slice(0, -1));
    setError(null);
  };

  const handleBiometricAuth = async () => {
    if (isAuthenticating) return;
    setIsAuthenticating(true);
    setError(null);
    try {
      const success = await authenticateWithBiometrics();
      if (success) {
        onUnlock();
      } else {
        setError('Біометрія не розпізнана. Введіть PIN');
      }
    } catch {
      setError('Помилка біометрії. Введіть PIN');
    } finally {
      setIsAuthenticating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-slate-950 flex flex-col items-center justify-between p-6 select-none font-sans">
      {/* Top Header */}
      <div className="pt-8 text-center space-y-3">
        <div className="w-16 h-16 rounded-3xl bg-cyan-950/80 border border-cyan-800/80 flex items-center justify-center mx-auto text-cyan-400 shadow-xl shadow-cyan-950/50">
          <Shield className="w-8 h-8 stroke-[2.2]" />
        </div>
        <div>
          <h2 className="text-xl font-black text-white tracking-tight">{companyName}</h2>
          <p className="text-xs text-slate-400 mt-0.5">Додаток захищено PIN-кодом</p>
        </div>
      </div>

      {/* PIN Dots Indicator */}
      <div className="space-y-4 text-center my-auto">
        <div className="flex items-center justify-center gap-4">
          {[0, 1, 2, 3].map((index) => {
            const isFilled = pin.length > index;
            return (
              <div
                key={index}
                className={`w-4 h-4 rounded-full transition-all duration-200 ${
                  isFilled
                    ? 'bg-cyan-500 scale-125 shadow-md shadow-cyan-500/50'
                    : 'bg-slate-800 border border-slate-700'
                } ${error ? 'bg-red-500 animate-shake' : ''}`}
              />
            );
          })}
        </div>

        {error && (
          <div className="text-xs font-semibold text-rose-400 flex items-center justify-center gap-1.5 animate-fadeIn">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Keypad */}
      <div className="w-full max-w-xs space-y-3 pb-6">
        <div className="grid grid-cols-3 gap-3">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
            <button
              key={num}
              type="button"
              onClick={() => handleDigit(num)}
              className="h-16 rounded-2xl bg-slate-900/90 active:bg-cyan-900/40 border border-slate-800 active:border-cyan-600 text-white text-2xl font-bold font-mono transition-all active:scale-95 flex items-center justify-center shadow-sm"
            >
              {num}
            </button>
          ))}

          {/* Biometrics button (bottom left) */}
          {settings.biometricsEnabled && isBiometricSupported ? (
            <button
              type="button"
              onClick={handleBiometricAuth}
              disabled={isAuthenticating}
              className="h-16 rounded-2xl bg-slate-900/70 active:bg-cyan-900/40 border border-slate-800 text-cyan-400 hover:text-cyan-300 transition-all active:scale-95 flex flex-col items-center justify-center gap-0.5"
              title="Біометрія (Face ID / Відбиток)"
            >
              <Fingerprint className="w-6 h-6" />
              <span className="text-[9px] font-semibold text-slate-400">Біометрія</span>
            </button>
          ) : (
            <div />
          )}

          {/* Zero */}
          <button
            type="button"
            onClick={() => handleDigit('0')}
            className="h-16 rounded-2xl bg-slate-900/90 active:bg-cyan-900/40 border border-slate-800 active:border-cyan-600 text-white text-2xl font-bold font-mono transition-all active:scale-95 flex items-center justify-center shadow-sm"
          >
            0
          </button>

          {/* Backspace */}
          <button
            type="button"
            onClick={handleDelete}
            className="h-16 rounded-2xl bg-slate-900/70 active:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-all active:scale-95 flex items-center justify-center"
            title="Стерти"
          >
            <Delete className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};
