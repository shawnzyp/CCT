import { useState, useCallback } from 'react';

export const useBiometricAuth = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      const stored = sessionStorage.getItem('biometricAuth');
      return stored === 'true';
    } catch {
      return false;
    }
  });

  const authenticate = useCallback(() => {
    sessionStorage.setItem('biometricAuth', 'true');
    setIsAuthenticated(true);
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem('biometricAuth');
    setIsAuthenticated(false);
  }, []);

  return { isAuthenticated, authenticate, logout };
};