import React, { createContext, useContext, useState, useEffect } from 'react';
import { TRANSLATIONS } from '../services/translations';

const AuthContext = createContext(null);

export const MANDI_CENTRES = [
  { id: "NSK-01", name: "Nashik APMC Main Yard", code: "NSK-01", state: "Maharashtra" },
  { id: "LSG-03", name: "Lasalgaon Procurement Hub", code: "LSG-03", state: "Maharashtra" },
  { id: "PMP-02", name: "Pimpalgaon Baswant Centre", code: "PMP-02", state: "Maharashtra" },
  { id: "YLA-01", name: "Yeola Sub-Centre", code: "YLA-01", state: "Maharashtra" }
];

export function AuthProvider({ children }) {
  // Mandi Gate Inspector is logged in by default — NO LOGIN BARRIER!
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('astragrade_inspector');
      return saved ? JSON.parse(saved) : {
        name: "Inspector S. D. Deshmukh",
        role: "staff",
        badge: "GATE-01",
        phone: "9822012345"
      };
    } catch {
      return {
        name: "Inspector S. D. Deshmukh",
        role: "staff",
        badge: "GATE-01",
        phone: "9822012345"
      };
    }
  });

  const [activeCentre, setActiveCentre] = useState(() => {
    try {
      const saved = localStorage.getItem('astragrade_centre');
      return saved ? JSON.parse(saved) : MANDI_CENTRES[0];
    } catch {
      return MANDI_CENTRES[0];
    }
  });

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
      localStorage.setItem('astragrade_inspector', JSON.stringify(user));
    }
  }, [user]);

  useEffect(() => {
    if (activeCentre) {
      localStorage.setItem('astragrade_centre', JSON.stringify(activeCentre));
    }
  }, [activeCentre]);

  const updateInspectorName = (name) => {
    setUser(prev => ({ ...prev, name: name || "Gate Inspector" }));
  };

  const changeCentre = (centre) => {
    setActiveCentre(centre);
  };

  const t = TRANSLATIONS[lang] || TRANSLATIONS.en;

  return (
    <AuthContext.Provider value={{
      user,
      activeCentre,
      changeCentre,
      updateInspectorName,
      lang,
      setLang,
      t,
      centresList: MANDI_CENTRES
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
