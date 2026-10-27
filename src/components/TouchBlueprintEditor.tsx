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
import { RoomShape, RoomOptions, PlacedFixture } from '../types/database';
import { Point2D, createDefaultCustomPoints } from '../utils/calculator';
import { Locale, Translations, TRANSLATIONS } from '../i18n/translations';

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
  relX: number; // 0..1 relative to room bounding box
  relY: number; // 0..1 relative to room bounding box
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
  customPoints?: Point2D[];
  diagonal1?: number;
  diagonal2?: number;
  options: Partial<RoomOptions>;
  initialFixtures?: PlacedFixture[];
  onFixturesChange?: (fixtures: PlacedFixture[]) => void;
  onOptionsChange?: (options: Partial<RoomOptions>) => void;
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
    customPoints?: Point2D[];
    diagonal1?: number;
    diagonal2?: number;
    area: number;
    perimeter: number;
    cornersCount?: number;
  }) => void;
  className?: string;
  locale?: Locale;
  t?: Translations;
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
  customPoints,
  diagonal1,
  diagonal2,
  options,
  initialFixtures,
  onFixturesChange,
  onOptionsChange,
  onDimensionsChange,
  className = '',
  locale = 'uk',
  t: propT,
}) => {
  const t = propT || TRANSLATIONS[locale] || TRANSLATIONS.uk;
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
  const lastEmittedRef = useRef<{
    shape?: string;
    length?: number;
    width?: number;
    sideA?: number;
    sideB?: number;
    sideC?: number;
    sideD?: number;
    sideE?: number;
    sideF?: number;
  }>({});
  const lastEmittedFixturesRef = useRef<string>('');

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
    } else if (shape === 'custom') {
      let ptsToUse: Point2D[] = [];
      if (customPoints && customPoints.length >= 3) {
        ptsToUse = customPoints;
      } else if (customSides && customSides.length >= 3) {
        ptsToUse = createDefaultCustomPoints(l, w, customSides.length);
      } else {
        ptsToUse = createDefaultCustomPoints(l, w, 4);
      }

      const xs = ptsToUse.map((p) => p.x);
      const ys = ptsToUse.map((p) => p.y);
      const minX = Math.min(...xs);
      const maxX = Math.max(...xs);
      const minY = Math.min(...ys);
      const maxY = Math.max(...ys);
      const wM = Math.max(0.2, maxX - minX);
      const hM = Math.max(0.2, maxY - minY);
      const midXM = (minX + maxX) / 2;
      const midYM = (minY + maxY) / 2;

      const ppmCustom = Math.min(availW / wM, availH / hM) * 0.82;
      setPixelsPerMeter(ppmCustom);

      const customVerts: TouchPoint[] = ptsToUse.map((p, i) => ({
        id: `v-${i}`,
        label: String.fromCharCode(65 + i),
        x: Math.round((centerX + (p.x - midXM) * ppmCustom) * 10) / 10,
        y: Math.round((centerY + (p.y - midYM) * ppmCustom) * 10) / 10,
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
  }, [shape, customSides, customPoints]);

  // Calculate bounding box of ceiling polygon
  const getRoomBounds = useCallback((pts: TouchPoint[]) => {
    if (!pts || pts.length === 0) {
      return {
        minX: padding,
        maxX: canvasWidth - padding,
        minY: padding,
        maxY: canvasHeight - padding,
        width: Math.max(1, canvasWidth - padding * 2),
        height: Math.max(1, canvasHeight - padding * 2),
      };
    }
    const xs = pts.map((p) => p.x);
    const ys = pts.map((p) => p.y);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);
    return {
      minX,
      maxX,
      minY,
      maxY,
      width: Math.max(1, maxX - minX),
      height: Math.max(1, maxY - minY),
    };
  }, [canvasWidth, canvasHeight, padding]);

  // Synchronize fixtures whenever options change or initialFixtures provided
  useEffect(() => {
    const bounds = getRoomBounds(vertices);
    const cX = bounds.minX + bounds.width / 2;
    const cY = bounds.minY + bounds.height / 2;
    const availW = bounds.width;
    const availH = bounds.height;

    const newFixtures: FixturePoint[] = [];
    const initialMap = new Map((initialFixtures || []).map((f) => [f.id, f]));

    // Chandeliers (1 to 6)
    const chanCount = Math.min(options.chandeliersCount || 0, 6);
    if (chanCount === 1) {
      const defX = cX;
      const defY = cY;
      newFixtures.push({
        id: 'fix-chan-1',
        type: 'chandelier',
        x: defX,
        y: defY,
        relX: (defX - bounds.minX) / bounds.width,
        relY: (defY - bounds.minY) / bounds.height,
        label: 'Люстра',
      });
    } else if (chanCount > 1) {
      for (let i = 0; i < chanCount; i++) {
        const offset = (i - (chanCount - 1) / 2) * Math.min(55, availW / (chanCount + 1));
        const defX = cX + offset;
        const defY = cY;
        newFixtures.push({
          id: `fix-chan-${i + 1}`,
          type: 'chandelier',
          x: defX,
          y: defY,
          relX: (defX - bounds.minX) / bounds.width,
          relY: (defY - bounds.minY) / bounds.height,
          label: `Люстра ${i + 1}`,
        });
      }
    }

    // Spots (GX53)
    const spotsCount = Math.min(options.spotsGX53Count || 0, 24);
    if (spotsCount > 0) {
      const radiusX = Math.min(availW * 0.32, 115);
      const radiusY = Math.min(availH * 0.32, 85);
      for (let i = 0; i < spotsCount; i++) {
        const angle = (i / spotsCount) * Math.PI * 2;
        const defX = Math.round(cX + Math.cos(angle) * radiusX);
        const defY = Math.round(cY + Math.sin(angle) * radiusY);
        newFixtures.push({
          id: `fix-spot-${i}`,
          type: 'spot',
          x: defX,
          y: defY,
          relX: (defX - bounds.minX) / bounds.width,
          relY: (defY - bounds.minY) / bounds.height,
          label: `Спот ${i + 1}`,
        });
      }
    }

    // Pipe passes
    const pipeCount = Math.min(options.pipePassCount || 0, 8);
    for (let i = 0; i < pipeCount; i++) {
      const cornerV = vertices[i % (vertices.length || 1)] || { x: bounds.minX + 25, y: bounds.minY + 25 };
      const offsetX = 22 + (i > 0 ? (i * 12) : 0);
      const offsetY = 22;
      const defX = cornerV.x + offsetX;
      const defY = cornerV.y + offsetY;
      newFixtures.push({
        id: `fix-pipe-${i + 1}`,
        type: 'pipe',
        x: defX,
        y: defY,
        relX: (defX - bounds.minX) / bounds.width,
        relY: (defY - bounds.minY) / bounds.height,
        label: pipeCount > 1 ? `Труба ${i + 1}` : 'Стояк',
      });
    }

    // Preserve positions of already dragged or previously saved fixtures
    setFixtures((prev) => {
      const prevMap = new Map(prev.map((f) => [f.id, f]));
      return newFixtures.map((nf) => {
        const existing = prevMap.get(nf.id);
        if (existing) {
          if (existing.relX !== undefined && existing.relY !== undefined) {
            const rx = existing.relX;
            const ry = existing.relY;
            return {
              ...nf,
              x: Math.round(bounds.minX + rx * bounds.width),
              y: Math.round(bounds.minY + ry * bounds.height),
              relX: rx,
              relY: ry,
            };
          }
          return { ...nf, x: existing.x, y: existing.y };
        }
        const saved = initialMap.get(nf.id);
        if (saved) {
          const rx = saved.relX ?? ((saved.x ?? nf.x) - bounds.minX) / bounds.width;
          const ry = saved.relY ?? ((saved.y ?? nf.y) - bounds.minY) / bounds.height;
          return {
            ...nf,
            x: Math.round(bounds.minX + rx * bounds.width),
            y: Math.round(bounds.minY + ry * bounds.height),
            relX: rx,
            relY: ry,
          };
        }
        return nf;
      });
    });
  }, [
    options.chandeliersCount,
    options.spotsGX53Count,
    options.pipePassCount,
    vertices,
    getRoomBounds,
  ]);

  // Synchronize initialFixtures if updated externally
  useEffect(() => {
    if (!initialFixtures || initialFixtures.length === 0) return;
    const incomingKey = JSON.stringify(
      initialFixtures.map((f) => ({ id: f.id, relX: f.relX, relY: f.relY }))
    );
    if (incomingKey === lastEmittedFixturesRef.current) return;
    lastEmittedFixturesRef.current = incomingKey;

    const bounds = getRoomBounds(vertices);
    const initialMap = new Map(initialFixtures.map((f) => [f.id, f]));

    setFixtures((prev) => {
      const prevIds = new Set(prev.map((f) => f.id));
      const updatedPrev = prev.map((f) => {
        const saved = initialMap.get(f.id);
        if (saved && saved.relX !== undefined && saved.relY !== undefined) {
          return {
            ...f,
            x: Math.round(bounds.minX + saved.relX * bounds.width),
            y: Math.round(bounds.minY + saved.relY * bounds.height),
            relX: saved.relX,
            relY: saved.relY,
          };
        }
        return f;
      });

      const missing = initialFixtures
        .filter((f) => !prevIds.has(f.id))
        .map((f) => ({
          id: f.id,
          type: f.type,
          x: Math.round(bounds.minX + f.relX * bounds.width),
          y: Math.round(bounds.minY + f.relY * bounds.height),
          relX: f.relX,
          relY: f.relY,
          label: f.label,
        }));

      return [...updatedPrev, ...missing];
    });
  }, [initialFixtures, vertices, getRoomBounds]);

  // Synchronize vertices from dimension props when NOT dragging and NOT self-emitted
  useEffect(() => {
    if (activeDragId) return;

    // Check if this update came from our own pointer drag
    const last = lastEmittedRef.current;
    if (last.shape === shape) {
      if (shape === 'rectangle' || shape === 'square') {
        const isSq = shape === 'square';
        const expectedW = isSq ? initialLength : initialWidth;
        const matchesL = last.length !== undefined && Math.abs(last.length - initialLength) < 0.05;
        const matchesW = last.width !== undefined && Math.abs(last.width - expectedW) < 0.05;
        if (matchesL && matchesW && vertices.length === 4) {
          return; // Skip sync, vertices are already in exact position!
        }
      } else if (shape === 'l_shaped') {
        const matchesA = sideA === undefined || (last.sideA !== undefined && Math.abs(last.sideA - sideA) < 0.05);
        const matchesB = sideB === undefined || (last.sideB !== undefined && Math.abs(last.sideB - sideB) < 0.05);
        const matchesC = sideC === undefined || (last.sideC !== undefined && Math.abs(last.sideC - sideC) < 0.05);
        const matchesD = sideD === undefined || (last.sideD !== undefined && Math.abs(last.sideD - sideD) < 0.05);
        const matchesE = sideE === undefined || (last.sideE !== undefined && Math.abs(last.sideE - sideE) < 0.05);
        const matchesF = sideF === undefined || (last.sideF !== undefined && Math.abs(last.sideF - sideF) < 0.05);
        if (matchesA && matchesB && matchesC && matchesD && matchesE && matchesF && vertices.length === 6) {
          return; // Skip sync, vertices are already in exact position!
        }
      } else if (shape === 'custom') {
        if (last.length !== undefined && Math.abs(last.length - (initialLength || 0)) < 0.05 && vertices.length >= 3) {
          return; // Skip sync on custom shape to prevent jump!
        }
      }
    }

    const availW = canvasWidth - padding * 2;
    const availH = canvasHeight - padding * 2;
    const centerX = canvasWidth / 2;
    const centerY = canvasHeight / 2;

    if (shape === 'rectangle' || shape === 'square') {
      const l = Math.max(0.2, initialLength || 4.5);
      const isSq = shape === 'square';
      const w = isSq ? l : Math.max(0.2, initialWidth || 3.2);

      const ppm = Math.min(availW / l, availH / w) * 0.85;
      setPixelsPerMeter(ppm);

      const boxW = l * ppm;
      const boxH = w * ppm;
      const startX = centerX - boxW / 2;
      const startY = centerY - boxH / 2;

      setVertices([
        { id: 'v-0', label: 'A', x: Math.round(startX * 10) / 10, y: Math.round(startY * 10) / 10 },
        { id: 'v-1', label: 'B', x: Math.round((startX + boxW) * 10) / 10, y: Math.round(startY * 10) / 10 },
        { id: 'v-2', label: 'C', x: Math.round((startX + boxW) * 10) / 10, y: Math.round((startY + boxH) * 10) / 10 },
        { id: 'v-3', label: 'D', x: Math.round(startX * 10) / 10, y: Math.round((startY + boxH) * 10) / 10 },
      ]);
    } else if (shape === 'l_shaped') {
      const a = Math.max(0.2, sideA ?? initialLength ?? 5);
      const b = Math.max(0.2, sideB ?? initialWidth ?? 4);
      const c = Math.max(0.1, sideC ?? (a * 0.5));
      const d = Math.max(0.1, sideD ?? (b * 0.45));
      const e = Math.max(0.1, sideE ?? (a - c));
      const f = Math.max(0.1, sideF ?? (b - d));

      const ppmL = Math.min(availW / a, availH / b) * 0.85;
      setPixelsPerMeter(ppmL);

      const startX = centerX - (a * ppmL) / 2;
      const startY = centerY - (b * ppmL) / 2;

      setVertices([
        { id: 'v-0', label: 'A', x: Math.round(startX * 10) / 10, y: Math.round(startY * 10) / 10 },
        { id: 'v-1', label: 'B', x: Math.round((startX + a * ppmL) * 10) / 10, y: Math.round(startY * 10) / 10 },
        { id: 'v-2', label: 'C', x: Math.round((startX + a * ppmL) * 10) / 10, y: Math.round((startY + d * ppmL) * 10) / 10 },
        { id: 'v-3', label: 'D', x: Math.round((startX + (a - e) * ppmL) * 10) / 10, y: Math.round((startY + d * ppmL) * 10) / 10 },
        { id: 'v-4', label: 'E', x: Math.round((startX + (a - e) * ppmL) * 10) / 10, y: Math.round((startY + b * ppmL) * 10) / 10 },
        { id: 'v-5', label: 'F', x: Math.round(startX * 10) / 10, y: Math.round((startY + b * ppmL) * 10) / 10 },
      ]);
    } else if (shape === 'custom') {
      if (customPoints && customPoints.length >= 3) {
        const xs = customPoints.map((p) => p.x);
        const ys = customPoints.map((p) => p.y);
        const minX = Math.min(...xs);
        const maxX = Math.max(...xs);
        const minY = Math.min(...ys);
        const maxY = Math.max(...ys);
        const wM = Math.max(0.2, maxX - minX);
        const hM = Math.max(0.2, maxY - minY);
        const midXM = (minX + maxX) / 2;
        const midYM = (minY + maxY) / 2;

        const ppmCustom = Math.min(availW / wM, availH / hM) * 0.82;
        setPixelsPerMeter(ppmCustom);

        const newVerts: TouchPoint[] = customPoints.map((p, i) => ({
          id: `v-${i}`,
          label: String.fromCharCode(65 + i),
          x: Math.round((centerX + (p.x - midXM) * ppmCustom) * 10) / 10,
          y: Math.round((centerY + (p.y - midYM) * ppmCustom) * 10) / 10,
        }));
        setVertices(newVerts);
      } else if (customSides && customSides.length >= 3) {
        initVertices();
      }
    }
  }, [
    shape,
    initialLength,
    initialWidth,
    sideA,
    sideB,
    sideC,
    sideD,
    sideE,
    sideF,
    customPoints,
    customSides,
    activeDragId,
    initVertices,
    vertices.length,
  ]);

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
      if (shape === 'rectangle' && vertices.length === 4) {
        // Orthogonal rectangle resizing
        const v0 = vertices[0];
        const v1 = vertices[1];
        const v2 = vertices[2];
        const v3 = vertices[3];

        let leftX = v0.x;
        let rightX = v1.x;
        let topY = v0.y;
        let bottomY = v2.y;

        const minSpan = 25; // minimum ~0.5m in pixels

        if (activeDragId === 'v-0') { // Top-Left
          leftX = Math.min(targetX, rightX - minSpan);
          topY = Math.min(targetY, bottomY - minSpan);
        } else if (activeDragId === 'v-1') { // Top-Right
          rightX = Math.max(targetX, leftX + minSpan);
          topY = Math.min(targetY, bottomY - minSpan);
        } else if (activeDragId === 'v-2') { // Bottom-Right
          rightX = Math.max(targetX, leftX + minSpan);
          bottomY = Math.max(targetY, topY + minSpan);
        } else if (activeDragId === 'v-3') { // Bottom-Left
          leftX = Math.min(targetX, rightX - minSpan);
          bottomY = Math.max(targetY, topY + minSpan);
        }

        const updatedVertices: TouchPoint[] = [
          { id: 'v-0', label: 'A', x: leftX, y: topY },
          { id: 'v-1', label: 'B', x: rightX, y: topY },
          { id: 'v-2', label: 'C', x: rightX, y: bottomY },
          { id: 'v-3', label: 'D', x: leftX, y: bottomY },
        ];
        setVertices(updatedVertices);

        const newL = Math.max(0.2, Math.round(((rightX - leftX) / pixelsPerMeter) * 100) / 100);
        const newW = Math.max(0.2, Math.round(((bottomY - topY) / pixelsPerMeter) * 100) / 100);
        const area = Math.round(newL * newW * 100) / 100;
        const perimeter = Math.round(2 * (newL + newW) * 100) / 100;
        const diag = Math.round(Math.hypot(newL, newW) * 100) / 100;

        lastEmittedRef.current = {
          shape: 'rectangle',
          length: newL,
          width: newW,
          sideA: newL,
          sideB: newW,
          sideC: newL,
          sideD: newW,
        };

        onDimensionsChange({
          length: newL,
          width: newW,
          sideA: newL,
          sideB: newW,
          sideC: newL,
          sideD: newW,
          diagonal1: diag,
          diagonal2: diag,
          area,
          perimeter,
          cornersCount: 4,
        });
        return;
      }

      if (shape === 'square' && vertices.length === 4) {
        // Orthogonal square resizing (1:1 ratio)
        const v0 = vertices[0];
        const v1 = vertices[1];
        const v2 = vertices[2];
        const v3 = vertices[3];

        let leftX = v0.x;
        let rightX = v1.x;
        let topY = v0.y;
        let bottomY = v2.y;

        const minSpan = 25;

        if (activeDragId === 'v-0') {
          const span = Math.max(minSpan, Math.max(v2.x - targetX, v2.y - targetY));
          leftX = v2.x - span;
          topY = v2.y - span;
          rightX = v2.x;
          bottomY = v2.y;
        } else if (activeDragId === 'v-1') {
          const span = Math.max(minSpan, Math.max(targetX - v3.x, v3.y - targetY));
          leftX = v3.x;
          rightX = v3.x + span;
          topY = v3.y - span;
          bottomY = v3.y;
        } else if (activeDragId === 'v-2') {
          const span = Math.max(minSpan, Math.max(targetX - v0.x, targetY - v0.y));
          leftX = v0.x;
          topY = v0.y;
          rightX = v0.x + span;
          bottomY = v0.y + span;
        } else if (activeDragId === 'v-3') {
          const span = Math.max(minSpan, Math.max(v1.x - targetX, targetY - v1.y));
          rightX = v1.x;
          topY = v1.y;
          leftX = v1.x - span;
          bottomY = v1.y + span;
        }

        const updatedVertices: TouchPoint[] = [
          { id: 'v-0', label: 'A', x: leftX, y: topY },
          { id: 'v-1', label: 'B', x: rightX, y: topY },
          { id: 'v-2', label: 'C', x: rightX, y: bottomY },
          { id: 'v-3', label: 'D', x: leftX, y: bottomY },
        ];
        setVertices(updatedVertices);

        const side = Math.max(0.2, Math.round(((rightX - leftX) / pixelsPerMeter) * 100) / 100);
        const area = Math.round(side * side * 100) / 100;
        const perimeter = Math.round(4 * side * 100) / 100;
        const diag = Math.round(side * Math.SQRT2 * 100) / 100;

        lastEmittedRef.current = {
          shape: 'square',
          length: side,
          width: side,
          sideA: side,
          sideB: side,
          sideC: side,
          sideD: side,
        };

        onDimensionsChange({
          length: side,
          width: side,
          sideA: side,
          sideB: side,
          sideC: side,
          sideD: side,
          diagonal1: diag,
          diagonal2: diag,
          area,
          perimeter,
          cornersCount: 4,
        });
        return;
      }

      if (shape === 'l_shaped' && vertices.length === 6) {
        // Orthogonal L-shape resizing
        let x0 = vertices[0].x; // left wall
        let x1 = vertices[1].x; // right outer wall
        let x2 = vertices[3].x; // step inner wall
        let y0 = vertices[0].y; // top wall
        let y1 = vertices[2].y; // step horizontal level
        let y2 = vertices[4].y; // bottom wall

        const minSpan = 20;

        if (activeDragId === 'v-0') {
          x0 = Math.min(targetX, x2 - minSpan);
          y0 = Math.min(targetY, y1 - minSpan);
        } else if (activeDragId === 'v-1') {
          x1 = Math.max(targetX, x2 + minSpan);
          y0 = Math.min(targetY, y1 - minSpan);
        } else if (activeDragId === 'v-2') {
          x1 = Math.max(targetX, x2 + minSpan);
          y1 = Math.max(y0 + minSpan, Math.min(targetY, y2 - minSpan));
        } else if (activeDragId === 'v-3') {
          x2 = Math.max(x0 + minSpan, Math.min(targetX, x1 - minSpan));
          y1 = Math.max(y0 + minSpan, Math.min(targetY, y2 - minSpan));
        } else if (activeDragId === 'v-4') {
          x2 = Math.max(x0 + minSpan, Math.min(targetX, x1 - minSpan));
          y2 = Math.max(targetY, y1 + minSpan);
        } else if (activeDragId === 'v-5') {
          x0 = Math.min(targetX, x2 - minSpan);
          y2 = Math.max(targetY, y1 + minSpan);
        }

        const updatedVertices: TouchPoint[] = [
          { id: 'v-0', label: 'A', x: x0, y: y0 },
          { id: 'v-1', label: 'B', x: x1, y: y0 },
          { id: 'v-2', label: 'C', x: x1, y: y1 },
          { id: 'v-3', label: 'D', x: x2, y: y1 },
          { id: 'v-4', label: 'E', x: x2, y: y2 },
          { id: 'v-5', label: 'F', x: x0, y: y2 },
        ];
        setVertices(updatedVertices);

        const a = Math.max(0.2, Math.round(((x1 - x0) / pixelsPerMeter) * 100) / 100);
        const b = Math.max(0.2, Math.round(((y2 - y0) / pixelsPerMeter) * 100) / 100);
        const d = Math.max(0.1, Math.round(((y1 - y0) / pixelsPerMeter) * 100) / 100);
        const e = Math.max(0.1, Math.round(((x1 - x2) / pixelsPerMeter) * 100) / 100);
        const c = Math.max(0.1, Math.round(((x2 - x0) / pixelsPerMeter) * 100) / 100);
        const f = Math.max(0.1, Math.round(((y2 - y1) / pixelsPerMeter) * 100) / 100);

        const rawArea = (a * b) - (e * f);
        const area = Math.max(0.1, Math.round(rawArea * 100) / 100);
        const perimeter = Math.round(2 * (a + b) * 100) / 100;
        const d1 = Math.round(Math.hypot(x2 - x0, y1 - y0) / pixelsPerMeter * 100) / 100;

        lastEmittedRef.current = {
          shape: 'l_shaped',
          length: a,
          width: b,
          sideA: a,
          sideB: b,
          sideC: c,
          sideD: d,
          sideE: e,
          sideF: f,
        };

        onDimensionsChange({
          length: a,
          width: b,
          sideA: a,
          sideB: b,
          sideC: c,
          sideD: d,
          sideE: e,
          sideF: f,
          diagonal1: d1,
          area,
          perimeter,
          cornersCount: 6,
        });
        return;
      }

      // Default / custom shape: arbitrary vertex movement
      const updatedVertices = vertices.map((v) =>
        v.id === activeDragId ? { ...v, x: targetX, y: targetY } : v
      );
      setVertices(updatedVertices);

      // Re-calculate geometry live
      const metrics = calculatePolygonMetrics(updatedVertices, pixelsPerMeter);
      const l = metrics.sides[0] || initialLength;
      const w = metrics.sides[1] || initialWidth;

      const cX = canvasWidth / 2;
      const cY = canvasHeight / 2;
      const meterPoints: Point2D[] = updatedVertices.map((v) => ({
        x: Math.round(((v.x - cX) / pixelsPerMeter) * 100) / 100,
        y: Math.round(((v.y - cY) / pixelsPerMeter) * 100) / 100,
      }));

      // Diagonals if 4 corners
      let d1 = diagonal1;
      let d2 = diagonal2;
      if (updatedVertices.length >= 4) {
        const d1Px = Math.hypot(updatedVertices[2].x - updatedVertices[0].x, updatedVertices[2].y - updatedVertices[0].y);
        const d2Px = Math.hypot(updatedVertices[3].x - updatedVertices[1].x, updatedVertices[3].y - updatedVertices[1].y);
        d1 = Math.round((d1Px / pixelsPerMeter) * 100) / 100;
        d2 = Math.round((d2Px / pixelsPerMeter) * 100) / 100;
      }

      lastEmittedRef.current = {
        shape: 'custom',
        length: l,
        width: w,
      };

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
        customPoints: meterPoints,
        diagonal1: d1,
        diagonal2: d2,
        area: metrics.area,
        perimeter: metrics.perimeter,
        cornersCount: updatedVertices.length,
      });
    } else if (dragType === 'fixture') {
      const bounds = getRoomBounds(vertices);
      setFixtures((prev) =>
        prev.map((f) => {
          if (f.id === activeDragId) {
            const rx = Math.round(((targetX - bounds.minX) / bounds.width) * 1000) / 1000;
            const ry = Math.round(((targetY - bounds.minY) / bounds.height) * 1000) / 1000;
            return { ...f, x: targetX, y: targetY, relX: rx, relY: ry };
          }
          return f;
        })
      );
    }
  };

  // Pointer drag end
  const handlePointerUp = (e: React.PointerEvent) => {
    if (activeDragId) {
      if (dragType === 'fixture') {
        const bounds = getRoomBounds(vertices);
        const updated = fixtures.map((f) => ({
          ...f,
          relX: Math.round(((f.x - bounds.minX) / bounds.width) * 1000) / 1000,
          relY: Math.round(((f.y - bounds.minY) / bounds.height) * 1000) / 1000,
        }));
        lastEmittedFixturesRef.current = JSON.stringify(
          updated.map((f) => ({ id: f.id, relX: f.relX, relY: f.relY }))
        );
        onFixturesChange?.(updated);
      }
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

    const cX = canvasWidth / 2;
    const cY = canvasHeight / 2;
    const meterPoints: Point2D[] = nextList.map((v) => ({
      x: Math.round(((v.x - cX) / pixelsPerMeter) * 100) / 100,
      y: Math.round(((v.y - cY) / pixelsPerMeter) * 100) / 100,
    }));

    const metrics = calculatePolygonMetrics(nextList, pixelsPerMeter);
    onDimensionsChange({
      length: metrics.sides[0] || initialLength,
      width: metrics.sides[1] || initialWidth,
      customSides: metrics.sides,
      customPoints: meterPoints,
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

    const cX = canvasWidth / 2;
    const cY = canvasHeight / 2;
    const meterPoints: Point2D[] = relabeled.map((v) => ({
      x: Math.round(((v.x - cX) / pixelsPerMeter) * 100) / 100,
      y: Math.round(((v.y - cY) / pixelsPerMeter) * 100) / 100,
    }));

    const metrics = calculatePolygonMetrics(relabeled, pixelsPerMeter);
    onDimensionsChange({
      length: metrics.sides[0] || initialLength,
      width: metrics.sides[1] || initialWidth,
      customSides: metrics.sides,
      customPoints: meterPoints,
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
            <span>{t.touchEditorTitle}</span>
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:inline">
            {t.touchEditorHint}
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
              title={t.zoomOut}
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleZoomReset}
              className="px-1.5 py-0.5 text-[10px] font-mono font-bold text-slate-700 dark:text-slate-200 hover:text-cyan-600 dark:hover:text-cyan-400"
              title={t.resetZoom}
            >
              {Math.round(zoomLevel * 100)}%
            </button>
            <button
              type="button"
              onClick={handleZoomIn}
              className="p-1 rounded text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition"
              title={t.zoomIn}
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
            title={t.gridSnap}
          >
            <Magnet className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">{t.gridSnap}</span>
          </button>

          <button
            type="button"
            onClick={handleAddCorner}
            disabled={vertices.length >= 10}
            className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 dark:border-transparent text-xs font-semibold transition flex items-center gap-1"
            title={t.addCorner}
          >
            <Plus className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
            <span className="hidden xs:inline">{t.addCorner}</span>
          </button>

          {selectedVertexId && vertices.length > 3 && (
            <button
              type="button"
              onClick={handleRemoveCorner}
              className="px-2 py-1 rounded-lg bg-red-100 text-red-800 hover:bg-red-200 border border-red-200 dark:bg-red-950 dark:text-red-300 dark:hover:bg-red-900 dark:border-transparent text-xs font-semibold transition flex items-center gap-1"
              title={t.removeCorner}
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{t.delete}</span>
            </button>
          )}

          <button
            type="button"
            onClick={initVertices}
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 border border-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-400 dark:hover:text-white dark:border-transparent transition"
            title={t.resetBlueprint}
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => setShowInstructions(!showInstructions)}
            className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-cyan-700 border border-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-400 dark:hover:text-cyan-400 dark:border-transparent transition"
            title={t.touchEditorInstructionTitle}
          >
            <HelpCircle className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Floating Instructions Banner */}
      {showInstructions && (
        <div className="mb-3 p-3 rounded-xl bg-cyan-50 dark:bg-cyan-950/70 border border-cyan-200 dark:border-cyan-800/80 text-xs text-cyan-900 dark:text-cyan-200 leading-relaxed flex items-start justify-between gap-2 animate-in fade-in">
          <div>
            <strong>{t.touchEditorInstructionTitle}</strong>
            <ul className="list-disc list-inside mt-1 space-y-0.5 text-slate-700 dark:text-slate-300 text-[11px]">
              <li>{t.touchEditorInstruction1}</li>
              <li>{t.touchEditorInstruction2}</li>
              <li>{t.touchEditorInstruction3}</li>
              <li>{t.touchEditorInstruction4}</li>
              <li>{t.touchEditorInstruction5}</li>
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

      {/* Curtain Niche Side Selector if niche is enabled */}
      {Boolean(options.curtainNicheMeters && options.curtainNicheMeters > 0 && vertices.length >= 2) && (
        <div className="mb-3 px-3 py-2 rounded-xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800/70 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-purple-900 dark:text-purple-200 font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-pulse" />
            <span>{t.curtainNicheBinding} ({options.curtainNicheMeters}{t.unitM}):</span>
          </div>
          <div className="flex items-center gap-1">
            {vertices.map((_, idx) => {
              const letter = String.fromCharCode(65 + idx);
              const isSelected = (options.curtainNicheSide || 'A') === letter;
              return (
                <button
                  key={`niche-side-${letter}`}
                  type="button"
                  onClick={() => onOptionsChange?.({ ...options, curtainNicheSide: letter })}
                  className={`px-2.5 py-0.5 rounded-md text-xs font-bold transition ${
                    isSelected
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-purple-100 dark:hover:bg-purple-900/40 border border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {t.wall} {letter}
                </button>
              );
            })}
          </div>
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

          {/* Curtain Niche (Ніша штор / карниза) if selected */}
          {Boolean(options.curtainNicheMeters && options.curtainNicheMeters > 0 && vertices.length >= 2) && (() => {
            const sideLetter = options.curtainNicheSide || 'A';
            const requestedIdx = sideLetter.charCodeAt(0) - 65;
            const sideIdx = (requestedIdx >= 0 && requestedIdx < vertices.length) ? requestedIdx : 0;
            const effectiveLetter = String.fromCharCode(65 + sideIdx);

            const v0 = vertices[sideIdx];
            const v1 = vertices[(sideIdx + 1) % vertices.length];
            const dx = v1.x - v0.x;
            const dy = v1.y - v0.y;
            const len = Math.hypot(dx, dy) || 1;
            const tx = dx / len;
            const ty = dy / len;

            // Inward normal using signed polygon area
            let signedArea = 0;
            for (let i = 0; i < vertices.length; i++) {
              const cur = vertices[i];
              const nxt = vertices[(i + 1) % vertices.length];
              signedArea += cur.x * nxt.y - nxt.x * cur.y;
            }
            const isClockwise = signedArea >= 0;
            const normX = isClockwise ? -ty : ty;
            const normY = isClockwise ? tx : -tx;

            const inNormX = normX * 16;
            const inNormY = normY * 16;

            const margin = Math.min(15, len * 0.1);
            const x1 = v0.x + tx * margin + inNormX;
            const y1 = v0.y + ty * margin + inNormY;
            const x2 = v1.x - tx * margin + inNormX;
            const y2 = v1.y - ty * margin + inNormY;
            const midX = (x1 + x2) / 2;
            const midY = (y1 + y2) / 2;

            return (
              <g 
                key="touch-curtain-niche" 
                onClick={(e) => {
                  e.stopPropagation();
                  const nextIdx = (sideIdx + 1) % vertices.length;
                  const nextLetter = String.fromCharCode(65 + nextIdx);
                  onOptionsChange?.({ ...options, curtainNicheSide: nextLetter });
                }}
                className="cursor-pointer group"
              >
                <title>Натисніть щоб перемістити нішу на іншу стіну (Стіна {effectiveLetter})</title>
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="#c084fc"
                  strokeWidth="3.5"
                  strokeDasharray="6,3"
                />
                <line
                  x1={x1 - inNormX * 0.4}
                  y1={y1 - inNormY * 0.4}
                  x2={x1 + inNormX * 0.4}
                  y2={y1 + inNormY * 0.4}
                  stroke="#c084fc"
                  strokeWidth="2.5"
                />
                <line
                  x1={x2 - inNormX * 0.4}
                  y1={y2 - inNormY * 0.4}
                  x2={x2 + inNormX * 0.4}
                  y2={y2 + inNormY * 0.4}
                  stroke="#c084fc"
                  strokeWidth="2.5"
                />
                <rect
                  x={midX - 58}
                  y={midY - 9}
                  width="116"
                  height="18"
                  rx="5"
                  fill="#581c87"
                  fillOpacity="0.95"
                  stroke="#c084fc"
                  strokeWidth="1"
                  className="transition group-hover:fill-purple-800"
                />
                <text
                  x={midX}
                  y={midY + 3.5}
                  fill="#f3e8ff"
                  fontSize="9.5"
                  fontWeight="bold"
                  textAnchor="middle"
                  fontFamily="sans-serif"
                >
                  {t.niche} {options.curtainNicheMeters}{t.unitM} ({t.wall} {effectiveLetter}) ↻
                </text>
              </g>
            );
          })()}

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
            {t.corners}: <strong className="text-slate-900 dark:text-white">{vertices.length}</strong> | S ={' '}
            <strong className="text-cyan-700 dark:text-cyan-400 font-mono">{currentMetrics.area} {t.unitM2}</strong>
          </span>
        </div>
        <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
          {snapToGrid ? t.snapToGridOn : t.freeMove}
        </span>
      </div>
    </div>
  );
};
