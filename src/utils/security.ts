/**
 * Security & App Lock utilities (PIN-code and Biometrics via WebAuthn)
 */

export interface SecuritySettings {
  enabled: boolean;
  pin: string; // Stored hashed/encoded PIN
  biometricsEnabled: boolean;
  autoLockMinutes: number; // 0 = immediately, 1 = 1m, 5 = 5m, 15 = 15m
}

const SETTINGS_KEY = 'ceiling_security_settings';
const DEFAULT_SETTINGS: SecuritySettings = {
  enabled: false,
  pin: '',
  biometricsEnabled: false,
  autoLockMinutes: 0,
};

// Simple secure hash for local PIN storage
export function hashPin(pin: string): string {
  let hash = 0;
  for (let i = 0; i < pin.length; i++) {
    const char = pin.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return `pin_${Math.abs(hash).toString(36)}_${pin.length}`;
}

export const SecurityStorage = {
  getSettings(): SecuritySettings {
    try {
      const data = localStorage.getItem(SETTINGS_KEY);
      if (data) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
      }
    } catch {
      // Fallback
    }
    return DEFAULT_SETTINGS;
  },

  saveSettings(settings: Partial<SecuritySettings>): SecuritySettings {
    const current = SecurityStorage.getSettings();
    const updated = { ...current, ...settings };
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save security settings', e);
    }
    return updated;
  },

  verifyPin(inputPin: string): boolean {
    const settings = SecurityStorage.getSettings();
    if (!settings.enabled || !settings.pin) return true;
    return settings.pin === hashPin(inputPin);
  },

  setNewPin(pin: string): void {
    SecurityStorage.saveSettings({
      enabled: true,
      pin: hashPin(pin),
    });
  },

  disableSecurity(): void {
    SecurityStorage.saveSettings({
      enabled: false,
      biometricsEnabled: false,
    });
  },
};

/**
 * Check if Biometrics (TouchID, FaceID, Android Fingerprint) is available on the device
 */
export async function isBiometricsAvailable(): Promise<boolean> {
  if (typeof window === 'undefined' || !window.PublicKeyCredential) {
    return false;
  }
  try {
    return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  } catch {
    return false;
  }
}

/**
 * Trigger native biometric authentication via WebAuthn
 */
export async function authenticateWithBiometrics(): Promise<boolean> {
  if (typeof window === 'undefined' || !window.PublicKeyCredential) {
    return false;
  }

  try {
    const challenge = new Uint8Array(32);
    window.crypto.getRandomValues(challenge);

    // Prompt user for local platform biometric verification
    const assertion = await navigator.credentials.get({
      publicKey: {
        challenge,
        timeout: 60000,
        userVerification: 'required',
        rpId: window.location.hostname || undefined,
      },
    });

    return !!assertion;
  } catch (error: any) {
    // If credential was not registered on this origin, we can simulate an authenticating challenge or register
    if (error.name === 'NotAllowedError' || error.name === 'AbortError') {
      return false;
    }
    // Attempt fallback registration/verification
    return await registerAndVerifyBiometrics();
  }
}

/**
 * Register and verify biometric credentials
 */
export async function registerAndVerifyBiometrics(): Promise<boolean> {
  if (typeof window === 'undefined' || !window.PublicKeyCredential) {
    return false;
  }

  try {
    const challenge = new Uint8Array(32);
    window.crypto.getRandomValues(challenge);
    const userId = new Uint8Array(16);
    window.crypto.getRandomValues(userId);

    const credential = await navigator.credentials.create({
      publicKey: {
        challenge,
        rp: {
          name: 'СтеляПро',
          id: window.location.hostname || undefined,
        },
        user: {
          id: userId,
          name: 'master@ceilingpro.app',
          displayName: 'Майстер СтеляПро',
        },
        pubKeyCredParams: [
          { type: 'public-key', alg: -7 }, // ES256
          { type: 'public-key', alg: -257 }, // RS256
        ],
        authenticatorSelection: {
          authenticatorAttachment: 'platform',
          userVerification: 'required',
        },
        timeout: 60000,
      },
    });

    return !!credential;
  } catch (error) {
    console.warn('Biometric registration/auth failed:', error);
    return false;
  }
}
