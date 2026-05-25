'use client';

import React, { createContext, useContext, useReducer, useCallback } from 'react';
import type { CountryOutbreak, PanelTab, DiseaseType, Cluster } from '@/types';
import { defaultDisease } from '@/data/diseases';

interface DashboardState {
  selectedCountry: CountryOutbreak | null;
  activeTab: PanelTab;
  autoRotate: boolean;
  highlightedCountryCode: string | null;
  currentDisease: DiseaseType;
  selectedRegion: string | null;
  selectedCluster: Cluster | null;
}

type DashboardAction =
  | { type: 'SELECT_COUNTRY'; payload: CountryOutbreak | null }
  | { type: 'SET_TAB'; payload: PanelTab }
  | { type: 'TOGGLE_ROTATION' }
  | { type: 'SET_HIGHLIGHTED'; payload: string | null }
  | { type: 'SET_DISEASE'; payload: DiseaseType }
  | { type: 'SELECT_REGION'; payload: string }
  | { type: 'SELECT_CLUSTER'; payload: Cluster }
  | { type: 'CLEAR_REGION_DRILL' };

const initialState: DashboardState = {
  selectedCountry: null,
  activeTab: 'news',
  autoRotate: true,
  highlightedCountryCode: null,
  currentDisease: defaultDisease,
  selectedRegion: null,
  selectedCluster: null,
};

function dashboardReducer(state: DashboardState, action: DashboardAction): DashboardState {
  switch (action.type) {
    case 'SELECT_COUNTRY':
      return {
        ...state,
        selectedCountry: action.payload,
        highlightedCountryCode: action.payload?.code ?? null,
        // Reset drill-down when selecting a new country
        selectedRegion: null,
        selectedCluster: null,
      };
    case 'SET_TAB':
      return { ...state, activeTab: action.payload };
    case 'TOGGLE_ROTATION':
      return { ...state, autoRotate: !state.autoRotate };
    case 'SET_HIGHLIGHTED':
      return { ...state, highlightedCountryCode: action.payload };
    case 'SET_DISEASE':
      // Switching disease resets all selection state
      return {
        ...state,
        currentDisease: action.payload,
        selectedCountry: null,
        highlightedCountryCode: null,
        selectedRegion: null,
        selectedCluster: null,
      };
    case 'SELECT_REGION':
      return {
        ...state,
        selectedRegion: action.payload,
        selectedCluster: null,
      };
    case 'SELECT_CLUSTER':
      return { ...state, selectedCluster: action.payload };
    case 'CLEAR_REGION_DRILL':
      return { ...state, selectedRegion: null, selectedCluster: null };
    default:
      return state;
  }
}

interface DashboardContextValue {
  state: DashboardState;
  dispatch: React.Dispatch<DashboardAction>;
  // Convenience helpers
  selectCountry: (country: CountryOutbreak | null) => void;
  setActiveTab: (tab: PanelTab) => void;
  toggleRotation: () => void;
  setHighlighted: (code: string | null) => void;
  setDisease: (disease: DiseaseType) => void;
  selectRegion: (region: string) => void;
  selectCluster: (cluster: Cluster) => void;
  clearRegionDrill: () => void;
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

  const setDisease = useCallback((disease: DiseaseType) => {
    dispatch({ type: 'SET_DISEASE', payload: disease });
  }, []);

  const selectRegion = useCallback((region: string) => {
    dispatch({ type: 'SELECT_REGION', payload: region });
  }, []);

  const selectCluster = useCallback((cluster: Cluster) => {
    dispatch({ type: 'SELECT_CLUSTER', payload: cluster });
  }, []);

  const clearRegionDrill = useCallback(() => {
    dispatch({ type: 'CLEAR_REGION_DRILL' });
  }, []);

  return (
    <DashboardContext.Provider
      value={{
        state,
        dispatch,
        selectCountry,
        setActiveTab,
        toggleRotation,
        setHighlighted,
        setDisease,
        selectRegion,
        selectCluster,
        clearRegionDrill,
      }}
    >
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard(): DashboardContextValue {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error('useDashboard must be used within DashboardProvider');
  return ctx;
}
