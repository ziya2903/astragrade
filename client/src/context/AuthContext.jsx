import React, { createContext, useContext, useState, useEffect } from 'react';
import { verifyOtp as apiVerifyOtp, adminLogin as apiAdminLogin } from '../services/api';
import { TRANSLATIONS } from '../services/translations';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('astragrade_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [activeCentre, setActiveCentre] = useState(() => {
    try {
      const saved = localStorage.getItem('astragrade_centre');
      return saved ? JSON.parse(saved) : { id: "NSK-01", name: "Nashik APMC Main Yard", code: "NSK-01" };
    } catch {
      return { id: "NSK-01", name: "Nashik APMC Main Yard", code: "NSK-01" };
    }
  });

  // Language state: 'en' | 'mr' | 'hi'
  const [lang, setLang] = useState(() => {
    try {
      return localStorage.getItem('astragrade_lang') || 'en';
    } catch {
      return 'en';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('astragrade_lang', lang);
    } catch (e) {}
  }, [lang]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('astragrade_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('astragrade_user');
    }
  }, [user]);

  useEffect(() => {
    if (activeCentre) {
      localStorage.setItem('astragrade_centre', JSON.stringify(activeCentre));
    }
  }, [activeCentre]);

  const loginWithPhone = async (phone, otp, centre, farmerName) => {
    const res = await apiVerifyOtp(phone, otp, centre?.id, farmerName);
    if (res.success) {
      const loggedUser = {
        ...res.user,
        farmerName: farmerName || `Grower (${phone.slice(-4)})`,
        phone,
        role: 'staff'
      };
      setUser(loggedUser);
      if (centre) setActiveCentre(centre);
      return { success: true };
    }
    return { success: false, message: res.message || 'Authentication failed' };
  };

  const loginWithAdmin = async (email, password) => {
    const res = await apiAdminLogin(email, password);
    if (res.success) {
      setUser(res.user);
      return { success: true };
    }
    return { success: false, message: res.message || 'Invalid credentials' };
  };

  const logout = () => {
    setUser(null);
  };

  const changeCentre = (centre) => {
    setActiveCentre(centre);
  };

  // Translations shortcut
  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  return (
    <AuthContext.Provider value={{
      user,
      activeCentre,
      changeCentre,
      loginWithPhone,
      loginWithAdmin,
      logout,
      isAuthenticated: !!user,
      isAdmin: user?.role === 'admin',
      lang,
      setLang,
      t
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
