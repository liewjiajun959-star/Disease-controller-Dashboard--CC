'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import createGlobe from 'cobe';
import { useDashboard } from '@/context/DashboardContext';
import { useCluster } from '@/context/ClusterContext';
import { useCurrentDiseaseData } from '@/hooks/useCurrentDiseaseData';
import { DISEASE_CONFIGS } from '@/data/diseases';
import { getRiskColor, getRiskMarkerSize } from '@/utils/riskUtils';
import type { CountryOutbreak } from '@/types';
import RiskBadge from '@/components/ui/RiskBadge';
import { formatRelativeTime } from '@/utils/dateUtils';
import { useUsageLogger } from '@/hooks/useUsageLogger';

// Project lat/lng to canvas 2D coordinates given current phi rotation
function project(
  lat: number,
  lng: number,
  phi: number,
  theta: number,
  width: number,
  height: number
): { x: number; y: number; visible: boolean; depth: number } {
  const latRad = (lat * Math.PI) / 180;
  const lngRad = (lng * Math.PI) / 180;
  const radius = height * 0.42;

  const x3 = Math.cos(latRad) * Math.sin(lngRad + phi);
  const y3 = Math.sin(latRad);
  const z3 = Math.cos(latRad) * Math.cos(lngRad + phi);

  const cosT = Math.cos(theta);
  const sinT = Math.sin(theta);
  const yT = y3 * cosT - z3 * sinT;
  const zT = y3 * sinT + z3 * cosT;

  return {
    x: width / 2 + x3 * radius,
    y: height / 2 - yT * radius,
    visible: zT > -0.05,
    depth: zT,
  };
}

interface HoverInfo {
  country: CountryOutbreak;
  x: number;
  y: number;
}

export default function GlobeCore() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const phiRef = useRef(0);
  const thetaRef = useRef(0.3);
  const markerRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const userMarkerRef = useRef<HTMLDivElement | null>(null);

  // Use refs for frequently-changing values to avoid globe recreation
  const autoRotateRef = useRef(true);
  const selectedCodeRef = useRef<string | null>(null);
  const userMarkerCoordsRef = useRef<{ lat: number; lng: number } | null>(null);
  const targetPhiRef = useRef<number | null>(null);

  const { state, selectCountry, toggleRotation } = useDashboard();
  const { state: clusterState } = useCluster();
  const { log } = useUsageLogger();
  const data = useCurrentDiseaseData();
  const [hoverInfo, setHoverInfo] = useState<HoverInfo | null>(null);
  const [dimensions, setDimensions] = useState({ width: 500, height: 500 });

  // Keep a ref to current countries so updateMarkers/click handlers always use latest
  const countriesRef = useRef(data.countries);
  useEffect(() => {
    countriesRef.current = data.countries;
  }, [data.countries]);

  // Sync refs with latest state values (no re-render triggered)
  useEffect(() => {
    autoRotateRef.current = state.autoRotate;
  }, [state.autoRotate]);

  useEffect(() => {
    selectedCodeRef.current = state.selectedCountry?.code ?? null;
  }, [state.selectedCountry]);

  useEffect(() => {
    userMarkerCoordsRef.current = clusterState.userMarker;
  }, [clusterState.userMarker]);

  // Smooth rotation toward selected country
  useEffect(() => {
    if (!state.selectedCountry) return;
    const { lng } = state.selectedCountry.coordinates;
    const lngRad = (lng * Math.PI) / 180;
    targetPhiRef.current = -lngRad;
  }, [state.selectedCountry]);

  // Update marker DOM positions — called from onRender every frame
  const updateMarkers = useCallback(() => {
    const phi = phiRef.current;
    const theta = thetaRef.current;
    const { width, height } = dimensions;
    const selCode = selectedCodeRef.current;

    for (const country of countriesRef.current) {
      const el = markerRefs.current.get(country.code);
      if (!el) continue;

      const pos = project(country.coordinates.lat, country.coordinates.lng, phi, theta, width, height);
      if (pos.visible) {
        const isSelected = country.code === selCode;
        const baseOpacity = selCode === null || isSelected ? 1 : 0.3;
        el.style.display = 'block';
        el.style.left = `${pos.x}px`;
        el.style.top = `${pos.y}px`;
        el.style.opacity = String(baseOpacity * (0.4 + pos.depth * 0.6));
        el.style.transform = `translate(-50%, -50%) scale(${isSelected ? 1.5 : 1})`;
        el.style.zIndex = isSelected ? '10' : '5';
      } else {
        el.style.display = 'none';
      }
    }

    // User location marker
    const userCoords = userMarkerCoordsRef.current;
    if (userMarkerRef.current && userCoords) {
      const pos = project(userCoords.lat, userCoords.lng, phi, theta, width, height);
      if (pos.visible) {
        userMarkerRef.current.style.display = 'block';
        userMarkerRef.current.style.left = `${pos.x}px`;
        userMarkerRef.current.style.top = `${pos.y}px`;
      } else {
        userMarkerRef.current.style.display = 'none';
      }
    }
  }, [dimensions]);

  // Keep updateMarkers ref up-to-date without triggering globe recreation
  const updateMarkersRef = useRef(updateMarkers);
  useEffect(() => {
    updateMarkersRef.current = updateMarkers;
  }, [updateMarkers]);

  // Initialize globe — recreates when dimensions or disease changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const { width, height } = dimensions;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const diseaseConfig = DISEASE_CONFIGS[state.currentDisease];

    const markers = countriesRef.current.map((c) => ({
      location: [c.coordinates.lat, c.coordinates.lng] as [number, number],
      size: getRiskMarkerSize(c.totalCases) * 0.5,
    }));

    const globe = createGlobe(canvas, {
      devicePixelRatio: dpr,
      width: width * dpr,
      height: height * dpr,
      phi: phiRef.current,
      theta: thetaRef.current,
      dark: 1,
      diffuse: 1.1,
      mapSamples: 18000,
      mapBrightness: 5,
      baseColor: [0.05, 0.08, 0.2] as [number, number, number],
      markerColor: diseaseConfig.globeMarkerColor,
      glowColor: diseaseConfig.globeGlowColor,
      markers,
      onRender: (cobeState) => {
        // Smooth rotation toward target country
        if (targetPhiRef.current !== null) {
          const diff = targetPhiRef.current - phiRef.current;
          const normDiff = ((diff + Math.PI) % (2 * Math.PI)) - Math.PI;
          if (Math.abs(normDiff) > 0.003) {
            phiRef.current += normDiff * 0.06;
          } else {
            phiRef.current = targetPhiRef.current;
            targetPhiRef.current = null;
          }
        } else if (autoRotateRef.current) {
          phiRef.current += 0.003;
        }

        cobeState.phi = phiRef.current;
        updateMarkersRef.current();
      },
    });

    return () => {
      globe.destroy();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dimensions, state.currentDisease]);

  // Resize observer
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        const size = Math.min(width, height, 580);
        if (size > 100) setDimensions({ width: size, height: size });
      }
    });

    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  // Canvas click → nearest country
  const handleCanvasClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      let nearest: CountryOutbreak | null = null;
      let nearestDist = Infinity;

      for (const country of countriesRef.current) {
        const pos = project(
          country.coordinates.lat,
          country.coordinates.lng,
          phiRef.current,
          thetaRef.current,
          dimensions.width,
          dimensions.height
        );
        if (!pos.visible) continue;

        const dist = Math.hypot(clickX - pos.x, clickY - pos.y);
        if (dist < nearestDist && dist < 32) {
          nearestDist = dist;
          nearest = country;
        }
      }

      if (nearest) {
        selectCountry(nearest);
        log('country_selected', 'globe', 'success', {
          countryCode: nearest.code,
          riskLevel: nearest.riskLevel,
          source: 'globe_click',
        });
      }
    },
    [dimensions, selectCountry, log]
  );

  // Canvas hover → tooltip
  const handleCanvasMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;

      let nearest: CountryOutbreak | null = null;
      let nearestDist = Infinity;
      let nearestPos = { x: 0, y: 0 };

      for (const country of countriesRef.current) {
        const pos = project(
          country.coordinates.lat,
          country.coordinates.lng,
          phiRef.current,
          thetaRef.current,
          dimensions.width,
          dimensions.height
        );
        if (!pos.visible) continue;

        const dist = Math.hypot(mx - pos.x, my - pos.y);
        if (dist < nearestDist && dist < 42) {
          nearestDist = dist;
          nearest = country;
          nearestPos = { x: pos.x, y: pos.y };
        }
      }

      if (nearest) {
        setHoverInfo({ country: nearest, x: nearestPos.x, y: nearestPos.y });
      } else {
        setHoverInfo(null);
      }
    },
    [dimensions]
  );

  const canvasSize = Math.min(dimensions.width, dimensions.height);

  return (
    <div ref={containerRef} className="relative w-full flex-1 flex items-center justify-center globe-glow">
      <div className="relative" style={{ width: canvasSize, height: canvasSize }}>
        {/* Globe canvas */}
        <canvas
          ref={canvasRef}
          width={dimensions.width}
          height={dimensions.height}
          style={{ width: canvasSize, height: canvasSize, cursor: 'crosshair' }}
          onClick={handleCanvasClick}
          onMouseMove={handleCanvasMouseMove}
          onMouseLeave={() => setHoverInfo(null)}
        />

        {/* Overlay markers */}
        <div className="absolute inset-0 pointer-events-none">
          {data.countries.map((country) => {
            const color = getRiskColor(country.riskLevel);
            const isSelected = country.code === state.selectedCountry?.code;
            return (
              <div
                key={country.code}
                ref={(el) => {
                  if (el) markerRefs.current.set(country.code, el);
                  else markerRefs.current.delete(country.code);
                }}
                className="absolute"
                style={{ display: 'none', transition: 'opacity 0.2s, transform 0.2s' }}
              >
                <div
                  className="relative"
                  style={{ width: isSelected ? 14 : 10, height: isSelected ? 14 : 10 }}
                >
                  {/* Glow ring */}
                  <div
                    className="absolute inset-0 rounded-full"
                    style={{
                      backgroundColor: `${color}25`,
                      border: `1px solid ${color}70`,
                      boxShadow: isSelected ? `0 0 14px ${color}90` : `0 0 6px ${color}40`,
                    }}
                  />
                  {/* Core dot */}
                  <div
                    className="absolute rounded-full"
                    style={{ inset: '3px', backgroundColor: color, boxShadow: `0 0 4px ${color}` }}
                  />
                  {/* Pulse animation for selected */}
                  {isSelected && (
                    <div
                      className="absolute inset-0 rounded-full animate-ping"
                      style={{
                        backgroundColor: `${color}15`,
                        border: `1px solid ${color}50`,
                        animationDuration: '1.5s',
                      }}
                    />
                  )}
                </div>
              </div>
            );
          })}

          {/* User location marker */}
          {clusterState.userMarker && (
            <div
              ref={(el) => { userMarkerRef.current = el; }}
              className="absolute"
              style={{ display: 'none' }}
            >
              <div className="relative w-4 h-4">
                <div className="absolute inset-0 rounded-full bg-cyan-400/20 border border-cyan-400/60 animate-ping" style={{ animationDuration: '1s' }} />
                <div className="absolute inset-1 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
              </div>
            </div>
          )}
        </div>

        {/* Hover tooltip */}
        {hoverInfo && (
          <div
            className="absolute z-20 pointer-events-none"
            style={{
              left: hoverInfo.x + 16,
              top: hoverInfo.y - 20,
              transform: hoverInfo.x > canvasSize * 0.7 ? 'translateX(-100%) translateX(-32px)' : 'none',
            }}
          >
            <div className="glass-elevated rounded-lg p-2.5 border border-white/10 shadow-xl min-w-[160px]">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-sm">{hoverInfo.country.flagEmoji}</span>
                <span className="text-xs font-semibold text-slate-100">{hoverInfo.country.name}</span>
                <RiskBadge level={hoverInfo.country.riskLevel} />
              </div>
              <div className="space-y-0.5">
                <div className="flex justify-between gap-4">
                  <span className="text-[10px] text-slate-500">Cases</span>
                  <span className="text-[10px] font-mono text-slate-300 stat-number">{hoverInfo.country.totalCases.toLocaleString()}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-[10px] text-slate-500">Clusters</span>
                  <span className="text-[10px] font-mono text-slate-300">{hoverInfo.country.activeClusters} active</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-[10px] text-slate-500">Updated</span>
                  <span className="text-[10px] font-mono text-slate-400">{formatRelativeTime(hoverInfo.country.lastUpdated)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Globe controls */}
        <div className="absolute bottom-4 right-4 flex flex-col gap-1.5 z-10">
          <button
            onClick={() => toggleRotation()}
            className="w-7 h-7 rounded glass border border-white/10 flex items-center justify-center text-slate-400 hover:text-cyan-400 transition-colors text-xs"
            title={state.autoRotate ? 'Pause rotation' : 'Resume rotation'}
          >
            {state.autoRotate ? '⏸' : '▶'}
          </button>
        </div>

        {/* Status label */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 pointer-events-none">
          <div className="flex items-center gap-1.5 text-[9px] font-mono text-slate-600 uppercase tracking-widest">
            <span className="w-1 h-1 rounded-full bg-green-400 animate-pulse-slow" />
            SYSTEM STATUS: OPERATIONAL
          </div>
        </div>
      </div>
    </div>
  );
}
