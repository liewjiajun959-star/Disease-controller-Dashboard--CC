'use client';

import React, { createContext, useContext, useReducer, useCallback } from 'react';
import type { CountryOutbreak, PanelTab } from '@/types';

interface DashboardState {
  selectedCountry: CountryOutbreak | null;
  activeTab: PanelTab;
  autoRotate: boolean;
  highlightedCountryCode: string | null;
}

type DashboardAction =
  | { type: 'SELECT_COUNTRY'; payload: CountryOutbreak | null }
  | { type: 'SET_TAB'; payload: PanelTab }
  | { type: 'TOGGLE_ROTATION' }
  | { type: 'SET_HIGHLIGHTED'; payload: string | null };

const initialState: DashboardState = {
  selectedCountry: null,
  activeTab: 'news',
  autoRotate: true,
  highlightedCountryCode: null,
};

function dashboardReducer(state: DashboardState, action: DashboardAction): DashboardState {
  switch (action.type) {
    case 'SELECT_COUNTRY':
      return {
        ...state,
        selectedCountry: action.payload,
        highlightedCountryCode: action.payload?.code ?? null,
      };
    case 'SET_TAB':
      return { ...state, activeTab: action.payload };
    case 'TOGGLE_ROTATION':
      return { ...state, autoRotate: !state.autoRotate };
    case 'SET_HIGHLIGHTED':
      return { ...state, highlightedCountryCode: action.payload };
    default:
      return state;
  }
}

interface DashboardContextValue {
  state: DashboardState;
  selectCountry: (country: CountryOutbreak | null) => void;
  setActiveTab: (tab: PanelTab) => void;
  toggleRotation: () => void;
  setHighlighted: (code: string | null) => void;
}

const DashboardContext = createContext<DashboardContextValue | null>(null);

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(dashboardReducer, initialState);

  const selectCountry = useCallback((country: CountryOutbreak | null) => {
    dispatch({ type: 'SELECT_COUNTRY', payload: country });
  }, []);

  const setActiveTab = useCallback((tab: PanelTab) => {
    dispatch({ type: 'SET_TAB', payload: tab });
  }, []);

  const toggleRotation = useCallback(() => {
    dispatch({ type: 'TOGGLE_ROTATION' });
  }, []);

  const setHighlighted = useCallback((code: string | null) => {
    dispatch({ type: 'SET_HIGHLIGHTED', payload: code });
  }, []);

  return (
    <DashboardContext.Provider value={{ state, selectCountry, setActiveTab, toggleRotation, setHighlighted }}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard(): DashboardContextValue {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error('useDashboard must be used within DashboardProvider');
  return ctx;
}
