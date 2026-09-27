import React, { createContext, useContext, useState, useEffect } from 'react';
import { TRANSLATIONS } from '../services/translations';

const AuthContext = createContext(null);

export const DEFAULT_MANDI = {
  id: "BKR-JH-01",
  name: "Bokaro Krishi Mandi",
  code: "BKR-JH-01",
  district: "Bokaro",
  state: "Jharkhand"
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('astragrade_inspector');
      return saved ? JSON.parse(saved) : {
        name: "Mandi Officer",
        role: "staff",
        badge: "GATE-01"
      };
    } catch {
      return {
        name: "Mandi Officer",
        role: "staff",
        badge: "GATE-01"
      };
    }
  });

  const [activeCentre, setActiveCentre] = useState(() => {
    try {
      const saved = localStorage.getItem('astragrade_centre');
      return saved ? JSON.parse(saved) : DEFAULT_MANDI;
    } catch {
      return DEFAULT_MANDI;
    }
  });

  // Languages supported: 'en' | 'hi'
  const [lang, setLang] = useState(() => {
    try {
      const saved = localStorage.getItem('astragrade_lang');
      return (saved === 'hi' || saved === 'en') ? saved : 'en';
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
      localStorage.setItem('astragrade_inspector', JSON.stringify(user));
    }
  }, [user]);

  useEffect(() => {
    if (activeCentre) {
      localStorage.setItem('astragrade_centre', JSON.stringify(activeCentre));
    }
  }, [activeCentre]);

  const updateInspectorName = (name) => {
    setUser(prev => ({ ...prev, name: name || "Mandi Officer" }));
  };

  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  return (
    <AuthContext.Provider value={{
      user,
      activeCentre,
      updateInspectorName,
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
