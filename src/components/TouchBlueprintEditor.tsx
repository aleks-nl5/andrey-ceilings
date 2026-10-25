import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Move, 
  RotateCcw, 
  Magnet, 
  Plus, 
  Trash2, 
  Lightbulb, 
  Ruler, 
  HelpCircle,
  Check,
  ZoomIn,
  ZoomOut
} from 'lucide-react';
import { RoomShape, RoomOptions } from '../types/database';

export interface TouchPoint {
  id: string;
  label: string;
  x: number; // canvas units
  y: number; // canvas units
}

export interface FixturePoint {
  id: string;
  type: 'chandelier' | 'spot' | 'pipe';
  x: number;
  y: number;
  label?: string;
}

interface TouchBlueprintEditorProps {
  shape: RoomShape;
  initialLength: number;
  initialWidth: number;
  initialHeight: number;
  sideA?: number;
  sideB?: number;
  sideC?: number;
  sideD?: number;
  sideE?: number;
  sideF?: number;
  customSides?: number[];
  diagonal1?: number;
  diagonal2?: number;
  options: Partial<RoomOptions>;
  onDimensionsChange: (params: {
    length: number;
    width: number;
    sideA?: number;
    sideB?: number;
    sideC?: number;
    sideD?: number;
    sideE?: number;
    sideF?: number;
    customSides?: number[];
    diagonal1?: number;
    diagonal2?: number;
    area: number;
    perimeter: number;
    cornersCount?: number;
  }) => void;
  className?: string;
}

export const TouchBlueprintEditor: React.FC<TouchBlueprintEditorProps> = ({
  shape,
  initialLength,
  initialWidth,
  initialHeight,
  sideA,
  sideB,
  sideC,
  sideD,
  sideE,
  sideF,
  customSides,
  diagonal1,
  diagonal2,
  options,
  onDimensionsChange,
  className = '',
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const canvasWidth = 460;
  const canvasHeight = 340;
  const padding = 50;

  // Snap to grid setting
  const [snapToGrid, setSnapToGrid] = useState<boolean>(true);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [dragType, setDragType] = useState<'vertex' | 'fixture' | null>(null);
  const [selectedVertexId, setSelectedVertexId] = useState<string | null>(null);
  const [showInstructions, setShowInstructions] = useState<boolean>(false);

  // Manual Zoom controls: 0.6x to 2.5x
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);

  // Vertices points
  const [vertices, setVertices] = useState<TouchPoint[]>([]);
  // Fixtures (lights/pipes) that can also be dragged with fingers
  const [fixtures, setFixtures] = useState<FixturePoint[]>([]);

  // Base Scale: pixels per meter (fixed per shape to prevent jumpy re-renders)
  const [pixelsPerMeter, setPixelsPerMeter] = useState<number>(50);

  const lastShapeRef = useRef<string>('');

  // Initialize vertices based on shape and initial dimensions (only on shape change or manual reset)
  const initVertices = useCallback(() => {
    const l = Math.max(0.5, initialLength || 4.5);
    const w = Math.max(0.5, initialWidth || 3.2);

    const availW = canvasWidth - padding * 2;
    const availH = canvasHeight - padding * 2;

    const ppm = Math.min(availW / l, availH / w) * 0.85;
    setPixelsPerMeter(ppm);

    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;

    if (shape === 'rectangle' || shape === 'square') {
      const isSq = shape === 'square';
      const actualW = isSq ? l : w;
      const boxW = l * ppm;
      const boxH = actualW * ppm;
      const startX = centerX - boxW / 2;
      const startY = centerY - boxH / 2;

      setVertices([
        { id: 'v-0', label: 'A', x: startX, y: startY },
        { id: 'v-1', label: 'B', x: startX + boxW, y: startY },
        { id: 'v-2', label: 'C', x: startX + boxW, y: startY + boxH },
        { id: 'v-3', label: 'D', x: startX, y: startY + boxH },
      ]);
    } else if (shape === 'l_shaped') {
      const a = sideA ?? l;
      const b = sideB ?? w;
      const c = sideC ?? (a * 0.5);
      const d = sideD ?? (b * 0.45);
      const e = sideE ?? (a - c);
      const f = sideF ?? (b - d);

      const ppmL = Math.min(availW / a, availH / b) * 0.85;
      setPixelsPerMeter(ppmL);

      const startX = centerX - (a * ppmL) / 2;
      const startY = centerY - (b * ppmL) / 2;

      setVertices([
        { id: 'v-0', label: 'A', x: startX, y: startY },
        { id: 'v-1', label: 'B', x: startX + a * ppmL, y: startY },
        { id: 'v-2', label: 'C', x: startX + a * ppmL, y: startY + d * ppmL },
        { id: 'v-3', label: 'D', x: startX + (a - e) * ppmL, y: startY + d * ppmL },
        { id: 'v-4', label: 'E', x: startX + (a - e) * ppmL, y: startY + b * ppmL },
        { id: 'v-5', label: 'F', x: startX, y: startY + b * ppmL },
      ]);
    } else if (customSides && customSides.length >= 3) {
      const n = customSides.length;
      const totalP = customSides.reduce((sum, s) => sum + s, 0) || 1;
      let currAngle = -Math.PI / 2;
      const angles: number[] = [];
      for (let i = 0; i < n; i++) {
        angles.push(currAngle);
        currAngle += (customSides[i] / totalP) * Math.PI * 2;
      }
      const maxR = Math.min(availW / 2, availH / 2) * 0.85;
      const customVerts: TouchPoint[] = angles.map((ang, i) => ({
        id: `v-${i}`,
        label: String.fromCharCode(65 + i),
        x: Math.round((centerX + maxR * Math.cos(ang)) * 10) / 10,
        y: Math.round((centerY + maxR * Math.sin(ang)) * 10) / 10,
      }));
      setVertices(customVerts);
    } else {
      // Custom trapezoid / multi-corner
      const boxW = l * ppm;
      const boxH = w * ppm;
      const startX = centerX - boxW / 2;
      const startY = centerY - boxH / 2;

      setVertices([
        { id: 'v-0', label: 'A', x: startX + 20, y: startY + 10 },
        { id: 'v-1', label: 'B', x: startX + boxW, y: startY },
        { id: 'v-2', label: 'C', x: startX + boxW - 25, y: startY + boxH },
        { id: 'v-3', label: 'D', x: startX, y: startY + boxH - 15 },
      ]);
    }

    // Initialize draggable light fixtures
    const newFixtures: FixturePoint[] = [];
    if (options.chandeliersCount && options.chandeliersCount > 0) {
      newFixtures.push({
        id: 'fix-chan-1',
        type: 'chandelier',
        x: centerX,
        y: centerY,
        label: 'Люстра',
      });
    }

    const spotsCount = Math.min(options.spotsGX53Count || 0, 8);
    for (let i = 0; i < spotsCount; i++) {
      const angle = (i / spotsCount) * Math.PI * 2;
      newFixtures.push({
        id: `fix-spot-${i}`,
        type: 'spot',
        x: centerX + Math.cos(angle) * (availW * 0.28),
        y: centerY + Math.sin(angle) * (availH * 0.28),
        label: `Спот ${i + 1}`,
      });
    }

    if (options.pipePassCount && options.pipePassCount > 0) {
      newFixtures.push({
        id: 'fix-pipe-1',
        type: 'pipe',
        x: centerX - availW * 0.35,
        y: centerY - availH * 0.35,
        label: 'Стояк',
      });
    }

    setFixtures(newFixtures);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shape, customSides]);

  // Only re-initialize when shape changes or initial mount, NOT on every dragged dimension change!
  useEffect(() => {
    if (lastShapeRef.current !== shape) {
      lastShapeRef.current = shape;
      initVertices();
    }
  }, [shape, initVertices]);

  // Synchronize when customSides count changes from parent (adding or removing sides)
  useEffect(() => {
    if (shape === 'custom' && customSides && customSides.length >= 3) {
      if (customSides.length !== vertices.length && !activeDragId) {
        initVertices();
      }
    }
  }, [shape, customSides, vertices.length, activeDragId, initVertices]);

  // Zoom handlers
  const handleZoomIn = () => setZoomLevel((prev) => Math.min(2.5, Math.round((prev + 0.15) * 100) / 100));
  const handleZoomOut = () => setZoomLevel((prev) => Math.max(0.6, Math.round((prev - 0.15) * 100) / 100));
  const handleZoomReset = () => setZoomLevel(1.0);

  // Shoelace formula for polygon area
  const calculatePolygonMetrics = (pts: TouchPoint[], ppm: number) => {
    if (pts.length < 3) return { area: 0, perimeter: 0, sides: [] };

    let areaSum = 0;
    let perimeterSum = 0;
    const sides: number[] = [];

    for (let i = 0; i < pts.length; i++) {
      const cur = pts[i];
      const next = pts[(i + 1) % pts.length];

      areaSum += cur.x * next.y - next.x * cur.y;

      const distPx = Math.hypot(next.x - cur.x, next.y - cur.y);
      const distM = Math.round((distPx / ppm) * 100) / 100;
      perimeterSum += distM;
      sides.push(distM);
    }

    const rawArea = Math.abs(areaSum) / 2 / (ppm * ppm);
    const area = Math.round(rawArea * 100) / 100;
    const perimeter = Math.round(perimeterSum * 100) / 100;

    return { area, perimeter, sides };
  };

  // Convert client/touch coordinates to SVG viewBox units
  const getSvgCoordinates = (clientX: number, clientY: number): { x: number; y: number } | null => {
    if (!svgRef.current) return null;
    const svg = svgRef.current;
    const pt = svg.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    const screenCTM = svg.getScreenCTM();
    if (!screenCTM) return null;
    const transformed = pt.matrixTransform(screenCTM.inverse());
    return { x: transformed.x, y: transformed.y };
  };

  // Pointer drag start
  const handlePointerDown = (
    e: React.PointerEvent,
    id: string,
    type: 'vertex' | 'fixture'
  ) => {
    e.stopPropagation();
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);

    setActiveDragId(id);
    setDragType(type);
    if (type === 'vertex') {
      setSelectedVertexId(id);
    }
  };

  // Pointer drag move (runs fluidly on finger drag on Android/iPad screens)
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!activeDragId || !dragType) return;
    e.preventDefault();

    const coords = getSvgCoordinates(e.clientX, e.clientY);
    if (!coords) return;

    let targetX = Math.max(padding / 2, Math.min(canvasWidth - padding / 2, coords.x));
    let targetY = Math.max(padding / 2, Math.min(canvasHeight - padding / 2, coords.y));

    // Snap to grid (10px grid ~ 0.1-0.2m)
    if (snapToGrid) {
      const gridSize = 10;
      targetX = Math.round(targetX / gridSize) * gridSize;
      targetY = Math.round(targetY / gridSize) * gridSize;
    }

    if (dragType === 'vertex') {
      const updatedVertices = vertices.map((v) =>
        v.id === activeDragId ? { ...v, x: targetX, y: targetY } : v
      );
      setVertices(updatedVertices);

      // Re-calculate geometry live
      const metrics = calculatePolygonMetrics(updatedVertices, pixelsPerMeter);
      const l = metrics.sides[0] || initialLength;
      const w = metrics.sides[1] || initialWidth;

      // Diagonals if 4 corners
      let d1 = diagonal1;
      let d2 = diagonal2;
      if (updatedVertices.length >= 4) {
        const d1Px = Math.hypot(updatedVertices[2].x - updatedVertices[0].x, updatedVertices[2].y - updatedVertices[0].y);
        const d2Px = Math.hypot(updatedVertices[3].x - updatedVertices[1].x, updatedVertices[3].y - updatedVertices[1].y);
        d1 = Math.round((d1Px / pixelsPerMeter) * 100) / 100;
        d2 = Math.round((d2Px / pixelsPerMeter) * 100) / 100;
      }

      onDimensionsChange({
        length: l,
        width: w,
        sideA: metrics.sides[0],
        sideB: metrics.sides[1],
        sideC: metrics.sides[2],
        sideD: metrics.sides[3],
        sideE: metrics.sides[4],
        sideF: metrics.sides[5],
        customSides: metrics.sides,
        diagonal1: d1,
        diagonal2: d2,
        area: metrics.area,
        perimeter: metrics.perimeter,
        cornersCount: updatedVertices.length,
      });
    } else if (dragType === 'fixture') {
      setFixtures((prev) =>
        prev.map((f) => (f.id === activeDragId ? { ...f, x: targetX, y: targetY } : f))
      );
    }
  };

  // Pointer drag end
  const handlePointerUp = (e: React.PointerEvent) => {
    if (activeDragId) {
      try {
        (e.target as HTMLElement).releasePointerCapture(e.pointerId);
      } catch {
        // ignore
      }
      setActiveDragId(null);
      setDragType(null);
    }
  };

  // Add corner (vertex) into polygon
  const handleAddCorner = () => {
    if (vertices.length >= 12) return;
    const lastV = vertices[vertices.length - 1];
    const firstV = vertices[0];
    const midX = (lastV.x + firstV.x) / 2 + 20;
    const midY = (lastV.y + firstV.y) / 2 + 20;

    const newLabel = String.fromCharCode(65 + vertices.length);
    const newVertex: TouchPoint = {
      id: `v-${Date.now()}`,
      label: newLabel,
      x: midX,
      y: midY,
    };

    const nextList = [...vertices, newVertex];
    setVertices(nextList);

    const metrics = calculatePolygonMetrics(nextList, pixelsPerMeter);
    onDimensionsChange({
      length: metrics.sides[0] || initialLength,
      width: metrics.sides[1] || initialWidth,
      customSides: metrics.sides,
      area: metrics.area,
      perimeter: metrics.perimeter,
      cornersCount: nextList.length,
    });
  };

  // Remove selected corner
  const handleRemoveCorner = () => {
    if (vertices.length <= 3 || !selectedVertexId) return;
    const nextList = vertices.filter((v) => v.id !== selectedVertexId);
    // Relabel
    const relabeled = nextList.map((v, idx) => ({
      ...v,
      label: String.fromCharCode(65 + idx),
    }));
    setVertices(relabeled);
    setSelectedVertexId(null);

    const metrics = calculatePolygonMetrics(relabeled, pixelsPerMeter);
    onDimensionsChange({
      length: metrics.sides[0] || initialLength,
      width: metrics.sides[1] || initialWidth,
      customSides: metrics.sides,
      area: metrics.area,
      perimeter: metrics.perimeter,
      cornersCount: relabeled.length,
    });
  };

  // Computed metrics
  const currentMetrics = calculatePolygonMetrics(vertices, pixelsPerMeter);
  const polygonPointsStr = vertices.map((v) => `${v.x},${v.y}`).join(' ');

  // Center of ceiling
  const centerX = vertices.reduce((acc, v) => acc + v.x, 0) / (vertices.length || 1);
  const centerY = vertices.reduce((acc, v) => acc + v.y, 0) / (vertices.length || 1);

  // Side labels with lengths in meters
  const sideSegments = vertices.map((v, idx) => {
    const next = vertices[(idx + 1) % vertices.length];
    const midX = (v.x + next.x) / 2;
    const midY = (v.y + next.y) / 2;
    const distPx = Math.hypot(next.x - v.x, next.y - v.y);
    const distM = Math.round((distPx / pixelsPerMeter) * 100) / 100;
    const angle = Math.atan2(next.y - v.y, next.x - v.x);
    // Normal vector pointing outward
    const normalX = -Math.sin(angle) * 15;
    const normalY = Math.cos(angle) * 15;

    return {
      midX: midX + normalX,
      midY: midY + normalY,
      lengthM: distM,
      label: `${v.label}-${next.label}: ${distM}м`,
    };
  });

  return (
    <div
      ref={containerRef}
      className={`relative select-none bg-white dark:bg-slate-900 border border-slate-200 dark:border-cyan-800/50 rounded-2xl p-4 shadow-sm overflow-hidden ${className}`}
    >
      {/* Interactive Touch Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-2.5 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-50 dark:bg-cyan-950/80 border border-cyan-200 dark:border-cyan-800 text-cyan-800 dark:text-cyan-300 font-mono text-xs font-bold">
            <Move className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
            <span>Сенсорне креслення (Touch Drag)</span>
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:inline">
            Тягніть кути та світильники пальцем
          </span>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1.5">
          {/* Manual Zoom Controls */}
          <div className="flex items-center rounded-lg bg-slate-100 dark:bg-slate-800 p-0.5 border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={handleZoomOut}
              className="p-1 rounded text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition"
              title="Зменшити масштаб (-)"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleZoomReset}
              className="px-1.5 py-0.5 text-[10px] font-mono font-bold text-slate-700 dark:text-slate-200 hover:text-cyan-600 dark:hover:text-cyan-400"
              title="Скинути масштаб (100%)"
            >
              {Math.round(zoomLevel * 100)}%
            </button>
            <button
              type="button"
              onClick={handleZoomIn}
              className="p-1 rounded text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition"
              title="Збільшити масштаб (+)"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => setSnapToGrid(!snapToGrid)}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1 shadow-xs ${
              snapToGrid
                ? 'bg-cyan-600 text-white'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:text-white dark:border-transparent'
            }`}
            title="Прив'язка до сітки"
          >
            <Magnet className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Сітка</span>
          </button>

          <button
            type="button"
            onClick={handleAddCorner}
            disabled={vertices.length >= 10}
            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 dark:border-transparent text-xs font-semibold transition flex items-center gap-1"
            title="Додати додатковий кут у контур"
          >
            <Plus className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
            <span className="hidden xs:inline">+Кут</span>
          </button>

          {selectedVertexId && vertices.length > 3 && (
            <button
              type="button"
              onClick={handleRemoveCorner}
              className="px-2 py-1 rounded-lg bg-red-100 text-red-800 hover:bg-red-200 border border-red-200 dark:bg-red-950 dark:text-red-300 dark:hover:bg-red-900 dark:border-transparent text-xs font-semibold transition flex items-center gap-1"
              title="Видалити обраний кут"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Видалити</span>
            </button>
          )}

          <button
            type="button"
            onClick={initVertices}
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border border-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-400 dark:hover:text-white dark:border-transparent transition"
            title="Скинути до вихідних розмірів"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => setShowInstructions(!showInstructions)}
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-cyan-700 border border-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-400 dark:hover:text-cyan-400 dark:border-transparent transition"
            title="Інструкція"
          >
            <HelpCircle className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Floating Instructions Banner */}
      {showInstructions && (
        <div className="mb-3 p-3 rounded-xl bg-cyan-50 dark:bg-cyan-950/70 border border-cyan-200 dark:border-cyan-800/80 text-xs text-cyan-900 dark:text-cyan-200 leading-relaxed flex items-start justify-between gap-2 animate-in fade-in">
          <div>
            <strong>Як редагувати креслення пальцем на смартфоні/планшеті:</strong>
            <ul className="list-disc list-inside mt-1 space-y-0.5 text-slate-700 dark:text-slate-300 text-[11px]">
              <li>Доторкніться до синього кружка кута (A, B, C...) і тягніть у будь-який бік без стрибків.</li>
              <li>Кнопками + та - у верхньому меню регулюйте масштаб відображення для точного підгону.</li>
              <li>Розміри стін, діагоналі та площа перераховуються миттєво в реальному часі.</li>
              <li>Значки люстри та спотів теж можна переміщати пальцем у потрібне місце кімнати.</li>
              <li>Кнопка «+Кут» дозволяє побудувати 5-кутні та багатокутні кімнати.</li>
            </ul>
          </div>
          <button
            type="button"
            onClick={() => setShowInstructions(false)}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Touch-active SVG Canvas */}
      {(() => {
        const vbW = canvasWidth / zoomLevel;
        const vbH = canvasHeight / zoomLevel;
        const vbX = (canvasWidth - vbW) / 2;
        const vbY = (canvasHeight - vbH) / 2;

        return (
          <div className="relative w-full flex justify-center items-center touch-none overflow-hidden rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <svg
              ref={svgRef}
              viewBox={`${vbX} ${vbY} ${vbW} ${vbH}`}
              className="w-full max-w-[500px] h-auto select-none cursor-crosshair"
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerCancel={handlePointerUp}
            >
          <defs>
            <pattern id="touchGrid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e2e8f0" strokeWidth="0.8" className="dark:stroke-slate-800" />
            </pattern>
            <linearGradient id="touchPolyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0284c7" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#0369a1" stopOpacity="0.14" />
            </linearGradient>
            <filter id="touchGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#38bdf8" floodOpacity="0.8" />
            </filter>
            <filter id="amberGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#f59e0b" floodOpacity="0.8" />
            </filter>
          </defs>

          {/* Background grid */}
          <rect width={canvasWidth} height={canvasHeight} fill="url(#touchGrid)" />

          {/* Diagonals if 4 corners */}
          {vertices.length === 4 && (
            <g>
              <line
                x1={vertices[0].x}
                y1={vertices[0].y}
                x2={vertices[2].x}
                y2={vertices[2].y}
                stroke="#f59e0b"
                strokeWidth="1.8"
                strokeDasharray="5,4"
                opacity="0.85"
              />
              <line
                x1={vertices[1].x}
                y1={vertices[1].y}
                x2={vertices[3].x}
                y2={vertices[3].y}
                stroke="#f59e0b"
                strokeWidth="1.8"
                strokeDasharray="5,4"
                opacity="0.85"
              />
            </g>
          )}

          {/* Ceiling Polygon */}
          <polygon
            points={polygonPointsStr}
            fill="url(#touchPolyGrad)"
            stroke="#38bdf8"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />

          {/* Live Side Length Labels */}
          {sideSegments.map((seg, idx) => (
            <g key={`side-${idx}`} className="pointer-events-none">
              <rect
                x={seg.midX - 28}
                y={seg.midY - 9}
                width="56"
                height="18"
                rx="4"
                fill="#0f172a"
                fillOpacity="0.9"
                stroke="#334155"
                strokeWidth="0.8"
              />
              <text
                x={seg.midX}
                y={seg.midY + 3.5}
                fill="#38bdf8"
                fontSize="10"
                fontFamily="monospace"
                fontWeight="bold"
                textAnchor="middle"
              >
                {seg.lengthM}м
              </text>
            </g>
          ))}

          {/* Center Info Badge (Area & Perimeter) */}
          <g transform={`translate(${centerX - 50}, ${centerY - 22})`} className="pointer-events-none">
            <rect width="100" height="42" rx="8" fill="#020617" fillOpacity="0.92" stroke="#0284c7" strokeWidth="1.2" />
            <text x="50" y="16" fill="#f8fafc" fontSize="13" fontWeight="bold" textAnchor="middle" fontFamily="monospace">
              {currentMetrics.area} м²
            </text>
            <text x="50" y="32" fill="#94a3b8" fontSize="10" textAnchor="middle" fontFamily="monospace">
              P = {currentMetrics.perimeter} м
            </text>
          </g>

          {/* Draggable Fixtures (Chandeliers, Spots, Pipes) */}
          {fixtures.map((fix) => {
            const isDraggingThis = activeDragId === fix.id;
            return (
              <g
                key={fix.id}
                transform={`translate(${fix.x}, ${fix.y})`}
                onPointerDown={(e) => handlePointerDown(e, fix.id, 'fixture')}
                className="cursor-grab active:cursor-grabbing"
              >
                {/* Touch hitbox circle */}
                <circle cx="0" cy="0" r="22" fill="transparent" />

                {fix.type === 'chandelier' && (
                  <g filter="url(#amberGlow)">
                    <circle cx="0" cy="0" r="14" fill="#f59e0b" stroke="#ffffff" strokeWidth="2.5" />
                    <circle cx="0" cy="0" r="5" fill="#ffffff" />
                  </g>
                )}

                {fix.type === 'spot' && (
                  <g>
                    <circle cx="0" cy="0" r="8" fill="#eab308" stroke="#ffffff" strokeWidth="1.5" />
                    <circle cx="0" cy="0" r="3" fill="#ffffff" />
                  </g>
                )}

                {fix.type === 'pipe' && (
                  <g>
                    <circle cx="0" cy="0" r="9" fill="#ef4444" stroke="#ffffff" strokeWidth="1.5" />
                    <text x="0" y="3" fill="#ffffff" fontSize="8" fontWeight="bold" textAnchor="middle">Т</text>
                  </g>
                )}

                {isDraggingThis && (
                  <text x="0" y="-18" fill="#fbbf24" fontSize="10" fontWeight="bold" textAnchor="middle">
                    {fix.label}
                  </text>
                )}
              </g>
            );
          })}

          {/* Draggable Corner Nodes (Vertices A, B, C...) */}
          {vertices.map((v) => {
            const isSelected = selectedVertexId === v.id;
            const isDragging = activeDragId === v.id;

            return (
              <g
                key={v.id}
                onPointerDown={(e) => handlePointerDown(e, v.id, 'vertex')}
                className="cursor-pointer touch-none"
              >
                {/* Generous touch target for fingers (48px radius invisible area) */}
                <circle cx={v.x} cy={v.y} r="26" fill="transparent" />

                {/* Animated pulsating halo when dragging */}
                {isDragging && (
                  <circle cx={v.x} cy={v.y} r="20" fill="#38bdf8" fillOpacity="0.3" filter="url(#touchGlow)" />
                )}

                {/* Main node circle */}
                <circle
                  cx={v.x}
                  cy={v.y}
                  r={isSelected ? '10' : '8'}
                  fill={isSelected ? '#38bdf8' : '#0284c7'}
                  stroke="#ffffff"
                  strokeWidth="2.5"
                  filter="url(#touchGlow)"
                />

                {/* Letter tag (A, B, C...) */}
                <g transform={`translate(${v.x}, ${v.y - 14})`} className="pointer-events-none">
                  <rect x="-10" y="-10" width="20" height="14" rx="3" fill="#0f172a" fillOpacity="0.85" />
                  <text
                    x="0"
                    y="0"
                    fill="#38bdf8"
                    fontSize="10"
                    fontWeight="bold"
                    textAnchor="middle"
                  >
                    {v.label}
                  </text>
                </g>
              </g>
            );
          })}
            </svg>
          </div>
        );
      })()}

      {/* Footer Info & Touch Hint */}
      <div className="mt-3 flex flex-wrap items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-500" />
          <span className="text-slate-700 dark:text-slate-300 font-medium">
            Кутів: <strong className="text-slate-900 dark:text-white">{vertices.length}</strong> | S ={' '}
            <strong className="text-cyan-700 dark:text-cyan-400 font-mono">{currentMetrics.area} м²</strong>
          </span>
        </div>
        <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
          {snapToGrid ? "Прив'язка до сітки: УВІМК" : 'Вільне переміщення'}
        </span>
      </div>
    </div>
  );
};
