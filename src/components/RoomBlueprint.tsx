import React from 'react';
import { RoomShape, RoomOptions, PlacedFixture } from '../types/database';
import { Point2D } from '../utils/calculator';
import { Locale, Translations, TRANSLATIONS } from '../i18n/translations';

interface RoomBlueprintProps {
  shape: RoomShape;
  length: number;
  width: number;
  height: number;
  sideA?: number;
  sideB?: number;
  sideC?: number;
  sideD?: number;
  sideE?: number;
  sideF?: number;
  customSides?: number[];
  customPoints?: Point2D[];
  diagonal1?: number;
  diagonal2?: number;
  area: number;
  perimeter: number;
  options: Partial<RoomOptions>;
  fixtures?: PlacedFixture[];
  canvasColorName?: string;
  className?: string;
  isPrint?: boolean;
  locale?: Locale;
  t?: Translations;
}

export const RoomBlueprint: React.FC<RoomBlueprintProps> = ({
  shape,
  length,
  width,
  height,
  sideA,
  sideB,
  sideC,
  sideD,
  sideE,
  sideF,
  customSides,
  customPoints,
  diagonal1,
  diagonal2,
  area,
  perimeter,
  options,
  fixtures,
  canvasColorName,
  className = '',
  isPrint = false,
  locale = 'uk',
  t: propT,
}) => {
  const t = propT || TRANSLATIONS[locale] || TRANSLATIONS.uk;
  const svgWidth = 420;
  const svgHeight = 280;
  const padding = 45;
  const innerW = svgWidth - padding * 2;
  const innerH = svgHeight - padding * 2;

  // Generate polygon points based on room shape
  let pointsStr = '';
  let polygonPoints: [number, number][] = [];
  let diagonalsToDraw: { x1: number; y1: number; x2: number; y2: number; label?: string }[] = [];
  let sideLabels: { x: number; y: number; text: string; align?: 'center' | 'left' | 'right' }[] = [];

  const l = Math.max(0.1, length || 4);
  const w = Math.max(0.1, width || 3);

  if (shape === 'rectangle' || shape === 'square') {
    const isSquare = shape === 'square';
    const effL = isSquare ? l : l;
    const effW = isSquare ? l : w;

    // Scale to fit inner box preserving aspect ratio
    const ratio = effL / effW;
    let boxW = innerW;
    let boxH = innerW / ratio;

    if (boxH > innerH) {
      boxH = innerH;
      boxW = innerH * ratio;
    }

    const startX = padding + (innerW - boxW) / 2;
    const startY = padding + (innerH - boxH) / 2;

    const pA: [number, number] = [startX, startY];
    const pB: [number, number] = [startX + boxW, startY];
    const pC: [number, number] = [startX + boxW, startY + boxH];
    const pD: [number, number] = [startX, startY + boxH];

    polygonPoints = [pA, pB, pC, pD];
    pointsStr = polygonPoints.map((p) => p.join(',')).join(' ');

    const calcDiag = Math.round(Math.hypot(effL, effW) * 100) / 100;
    const d1Val = diagonal1 ? diagonal1 : calcDiag;
    const d2Val = diagonal2 ? diagonal2 : calcDiag;

    diagonalsToDraw = [
      { x1: pA[0], y1: pA[1], x2: pC[0], y2: pC[1], label: `d1 = ${d1Val}м` },
      { x1: pB[0], y1: pB[1], x2: pD[0], y2: pD[1], label: `d2 = ${d2Val}м` },
    ];

    sideLabels = [
      { x: startX + boxW / 2, y: startY - 12, text: `A: ${effL} м` },
      { x: startX + boxW + 14, y: startY + boxH / 2 + 4, text: `B: ${effW} м`, align: 'left' },
      { x: startX + boxW / 2, y: startY + boxH + 20, text: `C: ${effL} м` },
      { x: startX - 14, y: startY + boxH / 2 + 4, text: `D: ${effW} м`, align: 'right' },
    ];
  } else if (shape === 'l_shaped') {
    // 6-sided L shape
    const a = sideA ?? l;
    const b = sideB ?? w;
    const c = sideC ?? (a * 0.55);
    const d = sideD ?? (b * 0.45);
    const e = sideE ?? Math.max(0.1, a - c);
    const f = sideF ?? Math.max(0.1, b - d);

    const scale = Math.min(innerW / a, innerH / b);
    const startX = padding + (innerW - a * scale) / 2;
    const startY = padding + (innerH - b * scale) / 2;

    const p1: [number, number] = [startX, startY];
    const p2: [number, number] = [startX + a * scale, startY];
    const p3: [number, number] = [startX + a * scale, startY + d * scale];
    const p4: [number, number] = [startX + (a - e) * scale, startY + d * scale];
    const p5: [number, number] = [startX + (a - e) * scale, startY + b * scale];
    const p6: [number, number] = [startX, startY + b * scale];

    polygonPoints = [p1, p2, p3, p4, p5, p6];
    pointsStr = polygonPoints.map((p) => p.join(',')).join(' ');

    diagonalsToDraw = [
      { x1: p1[0], y1: p1[1], x2: p4[0], y2: p4[1], label: diagonal1 ? `d1=${diagonal1}м` : undefined },
      { x1: p6[0], y1: p6[1], x2: p2[0], y2: p2[1], label: undefined },
    ];

    sideLabels = [
      { x: (p1[0] + p2[0]) / 2, y: p1[1] - 10, text: `A: ${a}м` },
      { x: p2[0] + 12, y: (p2[1] + p3[1]) / 2 + 4, text: `B: ${d}м`, align: 'left' },
      { x: (p3[0] + p4[0]) / 2, y: p3[1] + 14, text: `C: ${e}м` },
      { x: p4[0] + 10, y: (p4[1] + p5[1]) / 2 + 4, text: `D: ${f}м`, align: 'left' },
      { x: (p5[0] + p6[0]) / 2, y: p5[1] + 18, text: `E: ${c}м` },
      { x: p6[0] - 12, y: (p6[1] + p1[1]) / 2 + 4, text: `F: ${b}м`, align: 'right' },
    ];
  } else if (customPoints && customPoints.length >= 3) {
    // Exact polygon from saved meter coordinates (preserves exact shape and side lengths)
    const n = customPoints.length;
    const minX = Math.min(...customPoints.map((p) => p.x));
    const maxX = Math.max(...customPoints.map((p) => p.x));
    const minY = Math.min(...customPoints.map((p) => p.y));
    const maxY = Math.max(...customPoints.map((p) => p.y));
    const spanW = Math.max(0.5, maxX - minX);
    const spanH = Math.max(0.5, maxY - minY);
    const midX = (minX + maxX) / 2;
    const midY = (minY + maxY) / 2;
    const scale = Math.min(innerW / spanW, innerH / spanH) * 0.85;
    const cX = svgWidth / 2;
    const cY = svgHeight / 2;

    polygonPoints = customPoints.map((pt) => [
      Math.round((cX + (pt.x - midX) * scale) * 10) / 10,
      Math.round((cY + (pt.y - midY) * scale) * 10) / 10,
    ]);
    pointsStr = polygonPoints.map((p) => p.join(',')).join(' ');

    if (n === 4) {
      diagonalsToDraw = [
        { x1: polygonPoints[0][0], y1: polygonPoints[0][1], x2: polygonPoints[2][0], y2: polygonPoints[2][1], label: diagonal1 ? `d1=${diagonal1}м` : undefined },
        { x1: polygonPoints[1][0], y1: polygonPoints[1][1], x2: polygonPoints[3][0], y2: polygonPoints[3][1], label: diagonal2 ? `d2=${diagonal2}м` : undefined },
      ];
    }

    sideLabels = polygonPoints.map((p, idx) => {
      const next = polygonPoints[(idx + 1) % n];
      const midPx = (p[0] + next[0]) / 2;
      const midPy = (p[1] + next[1]) / 2;
      const startLetter = String.fromCharCode(65 + idx);
      const endLetter = String.fromCharCode(65 + ((idx + 1) % n));
      const curPt = customPoints[idx];
      const nextPt = customPoints[(idx + 1) % n];
      const distM = Math.round(Math.hypot(nextPt.x - curPt.x, nextPt.y - curPt.y) * 100) / 100;
      const angle = Math.atan2(next[1] - p[1], next[0] - p[0]);
      const normalX = -Math.sin(angle) * 16;
      const normalY = Math.cos(angle) * 16;

      return {
        x: midPx + normalX,
        y: midPy + normalY + 4,
        text: `${startLetter}-${endLetter}: ${distM}м`,
        align: 'center' as const,
      };
    });
  } else if (customSides && customSides.length >= 3) {
    // Dynamic multi-sided custom polygon from sides
    const n = customSides.length;
    const totalP = customSides.reduce((sum, s) => sum + s, 0) || 1;
    let currAngle = -Math.PI / 2;
    const angles: number[] = [];
    for (let i = 0; i < n; i++) {
      angles.push(currAngle);
      currAngle += (customSides[i] / totalP) * Math.PI * 2;
    }
    const cX = svgWidth / 2;
    const cY = svgHeight / 2;
    const maxR = Math.min(innerW / 2, innerH / 2) * 0.85;
    polygonPoints = angles.map((ang) => [
      Math.round((cX + maxR * Math.cos(ang)) * 10) / 10,
      Math.round((cY + maxR * Math.sin(ang)) * 10) / 10,
    ]);
    pointsStr = polygonPoints.map((p) => p.join(',')).join(' ');

    if (n === 4) {
      diagonalsToDraw = [
        { x1: polygonPoints[0][0], y1: polygonPoints[0][1], x2: polygonPoints[2][0], y2: polygonPoints[2][1], label: diagonal1 ? `d1=${diagonal1}м` : undefined },
        { x1: polygonPoints[1][0], y1: polygonPoints[1][1], x2: polygonPoints[3][0], y2: polygonPoints[3][1], label: diagonal2 ? `d2=${diagonal2}м` : undefined },
      ];
    }

    sideLabels = polygonPoints.map((p, idx) => {
      const next = polygonPoints[(idx + 1) % n];
      const midX = (p[0] + next[0]) / 2;
      const midY = (p[1] + next[1]) / 2;
      const startLetter = String.fromCharCode(65 + idx);
      const endLetter = String.fromCharCode(65 + ((idx + 1) % n));
      const lenM = customSides[idx];
      const angle = Math.atan2(next[1] - p[1], next[0] - p[0]);
      const normalX = -Math.sin(angle) * 16;
      const normalY = Math.cos(angle) * 16;

      return {
        x: midX + normalX,
        y: midY + normalY + 4,
        text: `${startLetter}-${endLetter}: ${lenM}м`,
        align: 'center' as const,
      };
    });
  } else {
    // Custom trapezoid / irregular room fallback
    const boxW = innerW * 0.9;
    const boxH = innerH * 0.85;
    const startX = padding + innerW * 0.05;
    const startY = padding + innerH * 0.08;

    const pA: [number, number] = [startX + 20, startY + 10];
    const pB: [number, number] = [startX + boxW, startY];
    const pC: [number, number] = [startX + boxW - 25, startY + boxH];
    const pD: [number, number] = [startX, startY + boxH - 10];

    polygonPoints = [pA, pB, pC, pD];
    pointsStr = polygonPoints.map((p) => p.join(',')).join(' ');

    const d1Val = diagonal1 || Math.round(Math.hypot(l, w) * 1.05 * 10) / 10;
    const d2Val = diagonal2 || Math.round(Math.hypot(l, w) * 0.95 * 10) / 10;

    diagonalsToDraw = [
      { x1: pA[0], y1: pA[1], x2: pC[0], y2: pC[1], label: `d1 = ${d1Val}м` },
      { x1: pB[0], y1: pB[1], x2: pD[0], y2: pD[1], label: `d2 = ${d2Val}м` },
    ];

    sideLabels = [
      { x: (pA[0] + pB[0]) / 2, y: startY - 8, text: `A: ${l} м` },
      { x: pB[0] + 12, y: (pB[1] + pC[1]) / 2 + 4, text: `B: ${w} м`, align: 'left' },
      { x: (pC[0] + pD[0]) / 2, y: startY + boxH + 18, text: `C: ${(sideC || l)} м` },
      { x: startX - 12, y: (pD[1] + pA[1]) / 2 + 4, text: `D: ${(sideD || w)} м`, align: 'right' },
    ];
  }

  // Calculate center of polygon for area badge and chandelier
  const centerX = polygonPoints.reduce((acc, p) => acc + p[0], 0) / (polygonPoints.length || 1);
  const centerY = polygonPoints.reduce((acc, p) => acc + p[1], 0) / (polygonPoints.length || 1);

  // Spotlights distribution
  const spotsCount = options.spotsGX53Count || 0;
  const spotsToDraw: [number, number][] = [];
  if (spotsCount > 0) {
    const count = Math.min(spotsCount, 24);
    if (count <= 12) {
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2;
        const rX = Math.min(65, innerW * 0.26);
        const rY = Math.min(50, innerH * 0.26);
        spotsToDraw.push([
          centerX + Math.cos(angle) * rX,
          centerY + Math.sin(angle) * rY,
        ]);
      }
    } else {
      const outerCount = Math.ceil(count * 0.65);
      const innerCount = count - outerCount;
      for (let i = 0; i < outerCount; i++) {
        const angle = (i / outerCount) * Math.PI * 2;
        const rX = Math.min(75, innerW * 0.32);
        const rY = Math.min(58, innerH * 0.32);
        spotsToDraw.push([
          centerX + Math.cos(angle) * rX,
          centerY + Math.sin(angle) * rY,
        ]);
      }
      for (let i = 0; i < innerCount; i++) {
        const angle = (i / innerCount) * Math.PI * 2 + Math.PI / innerCount;
        const rX = Math.min(42, innerW * 0.17);
        const rY = Math.min(32, innerH * 0.17);
        spotsToDraw.push([
          centerX + Math.cos(angle) * rX,
          centerY + Math.sin(angle) * rY,
        ]);
      }
    }
  }

  return (
    <div className={`${isPrint ? 'relative bg-white text-slate-900 w-full' : 'relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm p-3'} ${className}`}>
      {/* Blueprint Header (hidden in clean print mode to avoid duplication) */}
      {!isPrint && (
        <div className="flex flex-wrap items-center justify-between gap-2 mb-2 pb-2 border-b border-slate-200 dark:border-slate-800/80 text-xs">
          <div className="flex items-center gap-1.5 font-mono text-cyan-600 dark:text-cyan-400 font-semibold">
            <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
            СХЕМА ТА ДІАГОНАЛІ
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono">
              S: <strong className="text-slate-900 dark:text-white font-bold">{area}</strong> м²
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono">
              P: <strong className="text-slate-900 dark:text-white font-bold">{perimeter}</strong> м
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono">
              H: <strong className="text-slate-900 dark:text-white font-bold">{height || 2.7}</strong> м
            </span>
          </div>
        </div>
      )}

      {/* SVG Canvas */}
      <div className="w-full flex justify-center items-center select-none">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className={`w-full ${isPrint ? 'max-w-[500px]' : 'max-w-[480px] drop-shadow-sm'} h-auto`}
        >
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke={isPrint ? '#f1f5f9' : '#e2e8f0'} strokeWidth="0.8" className="dark:stroke-slate-800" />
            </pattern>
            <linearGradient id="polyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0284c7" stopOpacity={isPrint ? '0.12' : '0.22'} />
              <stop offset="100%" stopColor="#0369a1" stopOpacity={isPrint ? '0.06' : '0.10'} />
            </linearGradient>
            <filter id="shadowGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="3" floodColor="#38bdf8" floodOpacity="0.6" />
            </filter>
          </defs>

          {/* Technical blueprint grid background */}
          <rect width={svgWidth} height={svgHeight} fill={isPrint ? '#ffffff' : 'url(#grid)'} rx="8" />

          {/* Diagonals (Orange Dashed Lines) */}
          {diagonalsToDraw.map((d, idx) => (
            <g key={`diag-${idx}`}>
              <line
                x1={d.x1}
                y1={d.y1}
                x2={d.x2}
                y2={d.y2}
                stroke={isPrint ? '#000000' : '#f59e0b'}
                strokeWidth={isPrint ? '1.5' : '1.8'}
                strokeDasharray="5,4"
                opacity={isPrint ? '1' : '0.85'}
              />
              {d.label && (
                <text
                  x={(d.x1 + d.x2) / 2}
                  y={(d.y1 + d.y2) / 2 - 4}
                  fill={isPrint ? '#000000' : '#fbbf24'}
                  fontSize="10"
                  fontFamily="monospace"
                  fontWeight="700"
                  textAnchor="middle"
                  className="select-none"
                >
                  {d.label}
                </text>
              )}
            </g>
          ))}

          {/* Curtain Niche (Ніша штор / карниза) if selected */}
          {Boolean(options.curtainNicheMeters && options.curtainNicheMeters > 0 && polygonPoints.length >= 2) && (() => {
            const sideLetter = options.curtainNicheSide || 'A';
            const requestedIdx = sideLetter.charCodeAt(0) - 65;
            const sideIdx = (requestedIdx >= 0 && requestedIdx < polygonPoints.length) ? requestedIdx : 0;
            const effectiveLetter = String.fromCharCode(65 + sideIdx);

            const p0 = polygonPoints[sideIdx];
            const p1 = polygonPoints[(sideIdx + 1) % polygonPoints.length];
            const dx = p1[0] - p0[0];
            const dy = p1[1] - p0[1];
            const len = Math.hypot(dx, dy) || 1;
            const tx = dx / len;
            const ty = dy / len;

            // Inward normal using signed polygon area
            let signedArea = 0;
            for (let i = 0; i < polygonPoints.length; i++) {
              const cur = polygonPoints[i];
              const nxt = polygonPoints[(i + 1) % polygonPoints.length];
              signedArea += cur[0] * nxt[1] - nxt[0] * cur[1];
            }
            const isClockwise = signedArea >= 0;
            const normX = isClockwise ? -ty : ty;
            const normY = isClockwise ? tx : -tx;

            const inNormX = normX * 16;
            const inNormY = normY * 16;

            const margin = Math.min(15, len * 0.1);
            const x1 = p0[0] + tx * margin + inNormX;
            const y1 = p0[1] + ty * margin + inNormY;
            const x2 = p1[0] - tx * margin + inNormX;
            const y2 = p1[1] - ty * margin + inNormY;
            const midX = (x1 + x2) / 2;
            const midY = (y1 + y2) / 2;

            return (
              <g key="curtain-niche">
                {/* Dashed niche channel */}
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke={isPrint ? '#000000' : '#c084fc'}
                  strokeWidth={isPrint ? '2.5' : '3'}
                  strokeDasharray="6,3"
                />
                {/* Left bracket cap */}
                <line
                  x1={x1 - inNormX * 0.35}
                  y1={y1 - inNormY * 0.35}
                  x2={x1 + inNormX * 0.35}
                  y2={y1 + inNormY * 0.35}
                  stroke={isPrint ? '#000000' : '#c084fc'}
                  strokeWidth="2"
                />
                {/* Right bracket cap */}
                <line
                  x1={x2 - inNormX * 0.35}
                  y1={y2 - inNormY * 0.35}
                  x2={x2 + inNormX * 0.35}
                  y2={y2 + inNormY * 0.35}
                  stroke={isPrint ? '#000000' : '#c084fc'}
                  strokeWidth="2"
                />
                {/* Niche label badge */}
                <rect
                  x={midX - 54}
                  y={midY - 8}
                  width="108"
                  height="16"
                  rx="4"
                  fill={isPrint ? '#ffffff' : '#581c87'}
                  fillOpacity={isPrint ? '1' : '0.92'}
                  stroke={isPrint ? '#000000' : '#c084fc'}
                  strokeWidth="0.8"
                />
                <text
                  x={midX}
                  y={midY + 3.5}
                  fill={isPrint ? '#000000' : '#f3e8ff'}
                  fontSize="9"
                  fontWeight="bold"
                  textAnchor="middle"
                  fontFamily="sans-serif"
                >
                  {t.niche} {options.curtainNicheMeters}{t.unitM} ({effectiveLetter})
                </text>
              </g>
            );
          })()}

          {/* Light Lines if selected */}
          {options.lightLinesMeters && options.lightLinesMeters > 0 && (
            <line
              x1={centerX - 50}
              y1={centerY}
              x2={centerX + 50}
              y2={centerY}
              stroke={isPrint ? '#000000' : '#0284c7'}
              strokeWidth="4"
            />
          )}

          {/* Main Ceiling Polygon */}
          <polygon
            points={pointsStr}
            fill={isPrint ? '#ffffff' : 'url(#polyGrad)'}
            stroke={isPrint ? '#000000' : '#38bdf8'}
            strokeWidth={isPrint ? '2.5' : '3'}
            strokeLinejoin="round"
          />

          {/* Corner Vertices & Labels */}
          {polygonPoints.map((pt, idx) => {
            const letter = String.fromCharCode(65 + idx); // A, B, C, D...
            return (
              <g key={`vertex-${idx}`}>
                <circle cx={pt[0]} cy={pt[1]} r="5" fill={isPrint ? '#000000' : '#0284c7'} stroke={isPrint ? '#ffffff' : '#0f172a'} strokeWidth="2" />
                <circle cx={pt[0]} cy={pt[1]} r="10" fill="transparent" />
                <text
                  x={pt[0]}
                  y={pt[1] - 8}
                  fill={isPrint ? '#000000' : '#94a3b8'}
                  fontSize="11"
                  fontWeight="800"
                  textAnchor="middle"
                >
                  {letter}
                </text>
              </g>
            );
          })}

          {/* Side length labels */}
          {sideLabels.map((lbl, idx) => (
            <text
              key={`side-${idx}`}
              x={lbl.x}
              y={lbl.y}
              fill={isPrint ? '#000000' : '#e2e8f0'}
              fontSize="11"
              fontFamily="monospace"
              fontWeight="700"
              textAnchor={lbl.align === 'left' ? 'start' : lbl.align === 'right' ? 'end' : 'middle'}
            >
              {lbl.text}
            </text>
          ))}

          {/* Fixtures: Placed fixtures from editor if available, otherwise default layout */}
          {fixtures && fixtures.length > 0 ? (() => {
            const xs = polygonPoints.map((p) => p[0]);
            const ys = polygonPoints.map((p) => p[1]);
            const polyMinX = Math.min(...xs);
            const polyMaxX = Math.max(...xs);
            const polyMinY = Math.min(...ys);
            const polyMaxY = Math.max(...ys);
            const polyW = Math.max(1, polyMaxX - polyMinX);
            const polyH = Math.max(1, polyMaxY - polyMinY);

            return (
              <g key="placed-fixtures">
                {fixtures.map((f, i) => {
                  const fx = polyMinX + f.relX * polyW;
                  const fy = polyMinY + f.relY * polyH;

                  if (f.type === 'chandelier') {
                    return (
                      <g key={f.id || `pl-ch-${i}`} transform={`translate(${fx}, ${fy})`}>
                        <circle cx="0" cy="0" r="10" fill={isPrint ? '#000000' : '#f59e0b'} />
                        <circle cx="0" cy="0" r="4" fill="#ffffff" />
                        <line x1="-7" y1="-7" x2="7" y2="7" stroke={isPrint ? '#ffffff' : '#78350f'} strokeWidth="1.2" />
                        <line x1="-7" y1="7" x2="7" y2="-7" stroke={isPrint ? '#ffffff' : '#78350f'} strokeWidth="1.2" />
                        {fixtures.filter((item) => item.type === 'chandelier').length > 1 && (
                          <text x="0" y="18" fill={isPrint ? '#000000' : '#fbbf24'} fontSize="8" fontWeight="bold" textAnchor="middle">
                            {f.label?.replace('Люстра ', 'Л') || `Л${i + 1}`}
                          </text>
                        )}
                      </g>
                    );
                  }

                  if (f.type === 'spot') {
                    return (
                      <g key={f.id || `pl-sp-${i}`} transform={`translate(${fx}, ${fy})`}>
                        <circle cx="0" cy="0" r="4.5" fill={isPrint ? '#000000' : '#d97706'} />
                        <circle cx="0" cy="0" r="2" fill="#ffffff" />
                      </g>
                    );
                  }

                  if (f.type === 'pipe') {
                    return (
                      <g key={f.id || `pl-pp-${i}`} transform={`translate(${fx}, ${fy})`}>
                        <circle cx="0" cy="0" r="6" fill={isPrint ? '#000000' : '#ef4444'} stroke={isPrint ? '#ffffff' : '#7f1d1d'} strokeWidth="1" />
                        <circle cx="0" cy="0" r="2.5" fill="#ffffff" />
                        <text x="8" y="3.5" fill={isPrint ? '#000000' : '#f87171'} fontSize="8" fontWeight="bold">
                          {f.label || 'Труба'}
                        </text>
                      </g>
                    );
                  }

                  return null;
                })}
              </g>
            );
          })() : (
            <g key="default-fixtures">
              {/* Default Chandelier(s) / Main Light icons at center */}
              {options.chandeliersCount && options.chandeliersCount > 0 ? (() => {
                const count = Math.min(options.chandeliersCount, 4);
                const spacing = 28;
                const startX = centerX - ((count - 1) * spacing) / 2;
                return (
                  <g key="chandeliers">
                    {Array.from({ length: count }).map((_, i) => (
                      <g key={`ch-${i}`} transform={`translate(${startX + i * spacing}, ${centerY})`}>
                        <circle cx="0" cy="0" r="10" fill={isPrint ? '#000000' : '#f59e0b'} />
                        <circle cx="0" cy="0" r="4" fill="#ffffff" />
                        <line x1="-7" y1="-7" x2="7" y2="7" stroke={isPrint ? '#ffffff' : '#78350f'} strokeWidth="1.2" />
                        <line x1="-7" y1="7" x2="7" y2="-7" stroke={isPrint ? '#ffffff' : '#78350f'} strokeWidth="1.2" />
                        {count > 1 && (
                          <text x="0" y="18" fill={isPrint ? '#000000' : '#fbbf24'} fontSize="8" fontWeight="bold" textAnchor="middle">
                            Л{i + 1}
                          </text>
                        )}
                      </g>
                    ))}
                  </g>
                );
              })() : null}

              {/* Default Spotlight dots */}
              {spotsToDraw.map((spot, idx) => (
                <g key={`spot-${idx}`}>
                  <circle cx={spot[0]} cy={spot[1]} r="4" fill={isPrint ? '#000000' : '#d97706'} />
                  <circle cx={spot[0]} cy={spot[1]} r="2" fill="#ffffff" />
                </g>
              ))}

              {/* Default Pipe Pass indicator(s) */}
              {options.pipePassCount && options.pipePassCount > 0 && polygonPoints.length > 0 && (() => {
                const count = Math.min(options.pipePassCount, 6);
                return (
                  <g key="pipes">
                    {Array.from({ length: count }).map((_, i) => {
                      const cornerIdx = i % polygonPoints.length;
                      const pt = polygonPoints[cornerIdx];
                      const nextPt = polygonPoints[(cornerIdx + 1) % polygonPoints.length];
                      const angle = Math.atan2(nextPt[1] - pt[1], nextPt[0] - pt[0]);
                      const shift = 18 + Math.floor(i / polygonPoints.length) * 16;
                      const px = pt[0] + Math.cos(angle + Math.PI / 4) * shift;
                      const py = pt[1] + Math.sin(angle + Math.PI / 4) * shift;

                      return (
                        <g key={`pipe-${i}`} transform={`translate(${px}, ${py})`}>
                          <circle cx="0" cy="0" r="6" fill={isPrint ? '#000000' : '#ef4444'} stroke={isPrint ? '#ffffff' : '#7f1d1d'} strokeWidth="1" />
                          <circle cx="0" cy="0" r="2.5" fill="#ffffff" />
                          <text x="8" y="3.5" fill={isPrint ? '#000000' : '#f87171'} fontSize="8" fontWeight="bold">
                            {count === 1 ? 'Труба' : `Труба ${i + 1}`}
                          </text>
                        </g>
                      );
                    })}
                  </g>
                );
              })()}
            </g>
          )}
        </svg>
      </div>

      {/* Blueprint Legend / Footer - Synchronized with exact scheme graphics and colors */}
      <div className={`mt-2 pt-2 border-t ${isPrint ? 'border-gray-300 text-gray-800' : 'border-slate-800/80 text-slate-300'} flex flex-wrap items-center justify-between text-[11px] gap-2`}>
        <div className="flex flex-wrap items-center gap-x-3.5 gap-y-1.5">
          {/* 1. Diagonals */}
          <div className="flex items-center gap-1.5">
            <svg width="20" height="8" className="shrink-0 overflow-visible" aria-hidden="true">
              <line
                x1="0"
                y1="4"
                x2="20"
                y2="4"
                stroke={isPrint ? '#000000' : '#f59e0b'}
                strokeWidth={isPrint ? '2' : '2'}
                strokeDasharray="4,2"
              />
            </svg>
            <span className="font-medium">{t.legendDiagonals}</span>
          </div>

          {/* 2. Chandeliers */}
          {Boolean(options.chandeliersCount && options.chandeliersCount > 0) && (
            <div className="flex items-center gap-1.5">
              <svg width="15" height="15" viewBox="-8 -8 16 16" className="shrink-0 overflow-visible" aria-hidden="true">
                <circle cx="0" cy="0" r="7" fill={isPrint ? '#000000' : '#f59e0b'} />
                <circle cx="0" cy="0" r="2.8" fill="#ffffff" />
                <line x1="-5" y1="-5" x2="5" y2="5" stroke={isPrint ? '#ffffff' : '#78350f'} strokeWidth="1" />
                <line x1="-5" y1="5" x2="5" y2="-5" stroke={isPrint ? '#ffffff' : '#78350f'} strokeWidth="1" />
              </svg>
              <span>{t.legendChandeliers} ({options.chandeliersCount})</span>
            </div>
          )}

          {/* 3. Spotlights */}
          {Boolean(options.spotsGX53Count && options.spotsGX53Count > 0) && (
            <div className="flex items-center gap-1.5">
              <svg width="13" height="13" viewBox="-6 -6 12 12" className="shrink-0 overflow-visible" aria-hidden="true">
                <circle cx="0" cy="0" r="4.8" fill={isPrint ? '#000000' : '#d97706'} />
                <circle cx="0" cy="0" r="2" fill="#ffffff" />
              </svg>
              <span>{t.legendSpots} ({options.spotsGX53Count})</span>
            </div>
          )}

          {/* 4. Pipes */}
          {Boolean(options.pipePassCount && options.pipePassCount > 0) && (
            <div className="flex items-center gap-1.5">
              <svg width="14" height="14" viewBox="-7 -7 14 14" className="shrink-0 overflow-visible" aria-hidden="true">
                <circle cx="0" cy="0" r="5.5" fill={isPrint ? '#000000' : '#ef4444'} stroke={isPrint ? '#ffffff' : '#7f1d1d'} strokeWidth="0.8" />
                <circle cx="0" cy="0" r="2.2" fill="#ffffff" />
              </svg>
              <span>{t.legendPipes} ({options.pipePassCount})</span>
            </div>
          )}

          {/* 5. Curtain Niche */}
          {Boolean(options.curtainNicheMeters && options.curtainNicheMeters > 0) && (
            <div className="flex items-center gap-1.5">
              <svg width="22" height="10" viewBox="0 0 22 10" className="shrink-0 overflow-visible" aria-hidden="true">
                <line x1="2" y1="5" x2="20" y2="5" stroke={isPrint ? '#000000' : '#c084fc'} strokeWidth="2.2" strokeDasharray="3,2" />
                <line x1="2" y1="1" x2="2" y2="9" stroke={isPrint ? '#000000' : '#c084fc'} strokeWidth="1.5" />
                <line x1="20" y1="1" x2="20" y2="9" stroke={isPrint ? '#000000' : '#c084fc'} strokeWidth="1.5" />
              </svg>
              <span>
                {t.legendCurtainNiche} ({options.curtainNicheMeters} {t.unitM} · {t.wall} {options.curtainNicheSide || 'A'})
              </span>
            </div>
          )}

          {/* 6. Light lines */}
          {Boolean(options.lightLinesMeters && options.lightLinesMeters > 0) && (
            <div className="flex items-center gap-1.5">
              <svg width="20" height="8" className="shrink-0 overflow-visible" aria-hidden="true">
                <line x1="1" y1="4" x2="19" y2="4" stroke={isPrint ? '#000000' : '#0284c7'} strokeWidth="3.2" strokeLinecap="round" />
              </svg>
              <span>{t.legendLightLines} ({options.lightLinesMeters} {t.unitM})</span>
            </div>
          )}
        </div>

        <span className={`${isPrint ? 'text-gray-500' : 'text-slate-500'} font-mono text-[10px] shrink-0`}>
          {t.scaleAuto}
        </span>
      </div>
    </div>
  );
};
