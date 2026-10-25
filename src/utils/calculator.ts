import { 
  MaterialType, 
  ProfileType, 
  CeilingComplexity, 
  RoomOptions, 
  CostBreakdown, 
  MasterPriceList, 
  RoomShape 
} from '../types/database';

// Default price list calibrated for Ukraine (UAH / ₴)
export const DEFAULT_PRICE_LIST: MasterPriceList = {
  canvasPrices: {
    pvc_matte: 290,       // ПВХ матовий (MSD Premium) - 290 ₴/м²
    pvc_glossy: 310,      // ПВХ глянцевий - 310 ₴/м²
    pvc_satin: 310,       // ПВХ сатиновий - 310 ₴/м²
    fabric: 890,          // Тканинний безшовний Descor - 890 ₴/м²
    fireproof_km2: 480,   // Негорючий Teqtum KM2 - 480 ₴/м²
    acoustic: 980,        // Акустичний перфорований - 980 ₴/м²
  },
  profilePrices: {
    standard_alu: 130,    // Алюмінієвий гарпунний - 130 ₴/м.п.
    pvc: 90,              // ПВХ стіновий профіль - 90 ₴/м.п.
    shadow_kraab: 380,    // Тіньовий EuroKRAAB - 380 ₴/м.п.
    floating_led: 420,    // Парящий з розсіювачем - 420 ₴/м.п.
    slott_tracks: 550,    // Слот / трековий - 550 ₴/м.п.
  },
  complexityCoefficients: {
    straight: 1.0,
    multilevel: 1.25,
    curved: 1.20,
  },
  multilevelPerMeterCost: 650, // Конструкція переходу рівня - 650 ₴/м
  curvedPerMeterCost: 350,     // Криволінійний різ / гнуття - 350 ₴/м
  lightLinePerMeter: 850,      // Світлові лінії (профіль + стрічка 24V + монтаж) - 850 ₴/м
  shadowProfilePerMeter: 380,  // Тіньовий зазор - 380 ₴/м
  floatingProfilePerMeter: 420,// Парящий профіль з підсвіткою - 420 ₴/м
  chandelierInstallation: 350, // Встановлення люстри (гак / планка) - 350 ₴
  spotInstallation: 220,       // Точковий світильник GX53 (стійка, кільце, розводка) - 220 ₴
  pipePass: 180,               // Обвід труби опалення - 180 ₴
  curtainNichePerMeter: 450,   // Ніша під карниз (ПК-5 або брус) - 450 ₴/м
  extraCornerCost: 90,         // Додатковий кут понад 4 - 90 ₴
  hardWallPerMeter: 220,       // Свердління керамограніту - 220 ₴/м
  currencyCode: 'UAH',
  currencySymbol: '₴',
};

export interface Point2D {
  x: number;
  y: number;
}

export function createDefaultCustomPoints(length: number, width: number, sidesCount: number = 4): Point2D[] {
  const l = Math.max(1, length || 4.2);
  const w = Math.max(1, width || 3.5);
  if (sidesCount === 4) {
    return [
      { x: Math.round((-l / 2) * 100) / 100, y: Math.round((-w / 2) * 100) / 100 },
      { x: Math.round((l / 2) * 100) / 100, y: Math.round((-w / 2) * 100) / 100 },
      { x: Math.round((l / 2 - 0.2) * 100) / 100, y: Math.round((w / 2) * 100) / 100 },
      { x: Math.round((-l / 2) * 100) / 100, y: Math.round((w / 2 - 0.1) * 100) / 100 },
    ];
  }
  const totalP = (l + w) * 2;
  const avgR = totalP / (2 * Math.PI);
  let currAngle = -Math.PI / 2;
  const pts: Point2D[] = [];
  for (let i = 0; i < sidesCount; i++) {
    pts.push({
      x: Math.round(avgR * Math.cos(currAngle) * 100) / 100,
      y: Math.round(avgR * Math.sin(currAngle) * 100) / 100,
    });
    currAngle += (Math.PI * 2) / sidesCount;
  }
  return pts;
}

export function calculateSidesFromPoints(points: Point2D[]): number[] {
  if (!points || points.length < 2) return [];
  const n = points.length;
  return points.map((p, idx) => {
    const next = points[(idx + 1) % n];
    return Math.round(Math.hypot(next.x - p.x, next.y - p.y) * 100) / 100;
  });
}

export function calculateMetricsFromPoints(points: Point2D[]): {
  area: number;
  perimeter: number;
  sides: number[];
  cornersCount: number;
} {
  if (!points || points.length < 3) {
    return { area: 0, perimeter: 0, sides: [], cornersCount: 0 };
  }
  const n = points.length;
  const sides = calculateSidesFromPoints(points);
  const perimeter = Math.round(sides.reduce((acc, s) => acc + s, 0) * 100) / 100;

  // Shoelace formula in meters
  let areaSum = 0;
  for (let i = 0; i < n; i++) {
    const cur = points[i];
    const next = points[(i + 1) % n];
    areaSum += cur.x * next.y - next.x * cur.y;
  }
  const area = Math.round((Math.abs(areaSum) / 2) * 100) / 100;

  return {
    area: Math.max(0.1, area),
    perimeter,
    sides,
    cornersCount: n,
  };
}

export function adjustPolygonSide(
  points: Point2D[],
  sideIndex: number,
  newLength: number
): { points: Point2D[]; sides: number[]; area: number; perimeter: number } {
  if (!points || points.length < 3) {
    return { points, sides: [], area: 0, perimeter: 0 };
  }
  const n = points.length;
  const safeIdx = ((sideIndex % n) + n) % n;
  const targetLen = Math.max(0.1, newLength);

  const newPoints = points.map((p) => ({ ...p }));
  const pFrom = newPoints[safeIdx];
  const nextIdx = (safeIdx + 1) % n;
  const pTo = newPoints[nextIdx];

  const dx = pTo.x - pFrom.x;
  const dy = pTo.y - pFrom.y;
  const currentDist = Math.hypot(dx, dy);

  let ux = 1;
  let uy = 0;
  if (currentDist > 0.001) {
    ux = dx / currentDist;
    uy = dy / currentDist;
  }

  // Move vertex nextIdx along the ray from pFrom so its distance becomes targetLen
  newPoints[nextIdx] = {
    x: Math.round((pFrom.x + ux * targetLen) * 100) / 100,
    y: Math.round((pFrom.y + uy * targetLen) * 100) / 100,
  };

  const metrics = calculateMetricsFromPoints(newPoints);
  return {
    points: newPoints,
    sides: metrics.sides,
    area: metrics.area,
    perimeter: metrics.perimeter,
  };
}

export function addPolygonVertex(points: Point2D[]): {
  points: Point2D[];
  sides: number[];
  area: number;
  perimeter: number;
} {
  if (!points || points.length < 3) {
    return { points, sides: [], area: 0, perimeter: 0 };
  }
  const n = points.length;
  const last = points[n - 1];
  const first = points[0];

  const midX = (last.x + first.x) / 2;
  const midY = (last.y + first.y) / 2;
  const dx = first.x - last.x;
  const dy = first.y - last.y;
  const dist = Math.hypot(dx, dy) || 1;

  // Normal vector outward
  const normalX = (-dy / dist) * 0.6;
  const normalY = (dx / dist) * 0.6;

  const newPt: Point2D = {
    x: Math.round((midX + normalX) * 100) / 100,
    y: Math.round((midY + normalY) * 100) / 100,
  };

  const newPoints = [...points, newPt];
  const metrics = calculateMetricsFromPoints(newPoints);
  return {
    points: newPoints,
    sides: metrics.sides,
    area: metrics.area,
    perimeter: metrics.perimeter,
  };
}

export function removePolygonVertex(
  points: Point2D[],
  indexToRemove: number
): { points: Point2D[]; sides: number[]; area: number; perimeter: number } {
  if (!points || points.length <= 3) {
    const metrics = calculateMetricsFromPoints(points);
    return { points, sides: metrics.sides, area: metrics.area, perimeter: metrics.perimeter };
  }
  const newPoints = points.filter((_, idx) => idx !== indexToRemove);
  const metrics = calculateMetricsFromPoints(newPoints);
  return {
    points: newPoints,
    sides: metrics.sides,
    area: metrics.area,
    perimeter: metrics.perimeter,
  };
}

/**
 * Расчет геометрии помещения (Площадь, Периметр, Количество углов)
 */
export function calculateRoomGeometry(params: {
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
  diagonal1?: number;
  diagonal2?: number;
  customSides?: number[];
  customPoints?: Point2D[];
  customDiagonals?: number[];
}): { area: number; perimeter: number; cornersCount: number } {
  const { shape, length, width, sideA, sideB, sideC, sideD, sideE, sideF } = params;

  if (shape === 'square') {
    const s = Math.max(0.1, length || width || 3);
    const area = Math.round(s * s * 100) / 100;
    const perimeter = Math.round(s * 4 * 100) / 100;
    return { area, perimeter, cornersCount: 4 };
  }

  if (shape === 'rectangle') {
    const l = Math.max(0.1, length || 4);
    const w = Math.max(0.1, width || 3);
    const area = Math.round(l * w * 100) / 100;
    const perimeter = Math.round(2 * (l + w) * 100) / 100;
    return { area, perimeter, cornersCount: 4 };
  }

  if (shape === 'l_shaped') {
    const a = sideA ?? length ?? 5;
    const b = sideB ?? width ?? 4;
    const c = sideC ?? (a * 0.5);
    const d = sideD ?? (b * 0.5);
    const e = sideE ?? Math.max(0.1, a - c);
    const f = sideF ?? Math.max(0.1, b - d);

    const totalRect = a * b;
    const cutOut = Math.max(0, e * f);
    const rawArea = Math.max(1, totalRect - cutOut);
    const area = Math.round(rawArea * 100) / 100;
    const perimeter = Math.round((a + b + c + d + e + f) * 100) / 100;

    return { area, perimeter, cornersCount: 6 };
  }

  // Custom / irregular room with explicit points in meters
  if (params.customPoints && params.customPoints.length >= 3) {
    const metrics = calculateMetricsFromPoints(params.customPoints);
    return {
      area: metrics.area,
      perimeter: metrics.perimeter,
      cornersCount: metrics.cornersCount,
    };
  }

  // Custom / irregular room
  if (params.customSides && params.customSides.length >= 3) {
    const sides = params.customSides;
    const n = sides.length;
    const perimeter = Math.round(sides.reduce((sum, s) => sum + Math.max(0.05, s), 0) * 100) / 100;
    
    // Calculate area: if 4 sides with diagonal
    let area = 0;
    if (n === 4 && params.diagonal1 && params.diagonal1 > 0) {
      const a = sides[0], b = sides[1], c = sides[2], d = sides[3], diag = params.diagonal1;
      const s1 = (a + b + diag) / 2;
      const area1 = Math.sqrt(Math.max(0, s1 * (s1 - a) * (s1 - b) * (s1 - diag)));
      const s2 = (c + d + diag) / 2;
      const area2 = Math.sqrt(Math.max(0, s2 * (s2 - c) * (s2 - d) * (s2 - diag)));
      if (!isNaN(area1) && !isNaN(area2) && area1 + area2 > 0) {
        area = Math.round((area1 + area2) * 100) / 100;
      }
    }
    
    // If area not set via diagonal: Shoelace formula on reconstructed polygon
    if (area <= 0) {
      const totalP = perimeter || 1;
      let currAngle = 0;
      const angles = sides.map((s) => {
        const a = currAngle;
        currAngle += (s / totalP) * Math.PI * 2;
        return a;
      });
      const avgR = totalP / (2 * Math.PI);
      const pts = angles.map((ang) => [avgR * Math.cos(ang), avgR * Math.sin(ang)]);
      let areaSum = 0;
      for (let i = 0; i < n; i++) {
        const cur = pts[i];
        const next = pts[(i + 1) % n];
        areaSum += cur[0] * next[1] - next[0] * cur[1];
      }
      area = Math.round((Math.abs(areaSum) / 2) * 100) / 100;
    }

    return {
      area: Math.max(0.5, area),
      perimeter,
      cornersCount: n,
    };
  }

  const l = Math.max(0.1, length || 4);
  const w = Math.max(0.1, width || 3);
  const a = sideA ?? l;
  const b = sideB ?? w;
  const c = sideC ?? l;
  const d = sideD ?? w;

  let customArea = l * w;
  if (params.diagonal1 && params.diagonal1 > 0) {
    const diag = params.diagonal1;
    const s1 = (a + b + diag) / 2;
    const area1 = Math.sqrt(Math.max(0, s1 * (s1 - a) * (s1 - b) * (s1 - diag)));
    const s2 = (c + d + diag) / 2;
    const area2 = Math.sqrt(Math.max(0, s2 * (s2 - c) * (s2 - d) * (s2 - diag)));
    if (!isNaN(area1) && !isNaN(area2) && area1 + area2 > 0) {
      customArea = area1 + area2;
    }
  }

  const perimeter = Math.round((a + b + c + d) * 100) / 100;
  const area = Math.round(customArea * 100) / 100;
  const cornersCount = 4;

  return { area, perimeter, cornersCount };
}

/**
 * Модуль калькулятора вартості натяжної стелі
 */
export function calculateCeilingCost(params: {
  area: number;
  perimeter: number;
  materialType: MaterialType | string;
  complexity: CeilingComplexity;
  profileType?: ProfileType | string;
  options: Partial<RoomOptions>;
  customOptions?: { id: string; name: string; unit: string; price: number; quantity: number }[];
  priceList?: MasterPriceList;
}): CostBreakdown {
  const prices = params.priceList || DEFAULT_PRICE_LIST;
  const { area, perimeter, materialType, complexity, options, customOptions } = params;
  const profileType = params.profileType || 'standard_alu';

  // 1. Полотно (перевірка на власне полотно або стандартне)
  let baseCanvasRate: number;
  const customCanvas = prices.customItems?.find(
    (i) => i.category === 'canvas' && (i.id === materialType || i.name === materialType)
  );

  if (customCanvas) {
    baseCanvasRate = customCanvas.price;
  } else {
    baseCanvasRate = (prices.canvasPrices as any)[materialType] ?? prices.canvasPrices.pvc_matte;
  }
  const canvasCost = Math.round(area * baseCanvasRate);

  // 2. Базовий профіль (перевірка на власний профіль або стандартний)
  let profileRate: number;
  const customProfile = prices.customItems?.find(
    (i) => i.category === 'profile' && (i.id === profileType || i.name === profileType)
  );

  if (customProfile) {
    profileRate = customProfile.price;
  } else {
    profileRate = (prices.profilePrices as any)[profileType] ?? prices.profilePrices.standard_alu;
  }
  const profileCost = Math.round(perimeter * profileRate);

  // 3. Складність
  let complexityCost = 0;
  if (complexity === 'multilevel') {
    const levelTransition = Math.max(2, Math.round(perimeter * 0.35 * 10) / 10);
    complexityCost = Math.round(levelTransition * prices.multilevelPerMeterCost);
  } else if (complexity === 'curved') {
    const curvedLength = Math.max(2, Math.round(perimeter * 0.25 * 10) / 10);
    complexityCost = Math.round(curvedLength * prices.curvedPerMeterCost);
  }

  // 4. Опції
  let optionsCost = 0;

  if (options.lightLinesMeters && options.lightLinesMeters > 0) {
    optionsCost += options.lightLinesMeters * prices.lightLinePerMeter;
  }

  if (options.shadowProfileMeters && options.shadowProfileMeters > 0 && profileType !== 'shadow_kraab') {
    optionsCost += options.shadowProfileMeters * prices.shadowProfilePerMeter;
  }

  if (options.floatingCeilingMeters && options.floatingCeilingMeters > 0 && profileType !== 'floating_led') {
    optionsCost += options.floatingCeilingMeters * prices.floatingProfilePerMeter;
  }

  if (options.chandeliersCount && options.chandeliersCount > 0) {
    optionsCost += options.chandeliersCount * prices.chandelierInstallation;
  }

  if (options.spotsGX53Count && options.spotsGX53Count > 0) {
    optionsCost += options.spotsGX53Count * prices.spotInstallation;
  }

  if (options.pipePassCount && options.pipePassCount > 0) {
    optionsCost += options.pipePassCount * prices.pipePass;
  }

  if (options.curtainNicheMeters && options.curtainNicheMeters > 0) {
    optionsCost += options.curtainNicheMeters * prices.curtainNichePerMeter;
  }

  if (options.extraCorners && options.extraCorners > 0) {
    optionsCost += options.extraCorners * prices.extraCornerCost;
  }

  if (options.hardWallMeters && options.hardWallMeters > 0) {
    optionsCost += options.hardWallMeters * prices.hardWallPerMeter;
  }

  // Власні додані роботи та опції
  if (customOptions && customOptions.length > 0) {
    customOptions.forEach((opt) => {
      if (opt.price && opt.quantity) {
        optionsCost += opt.price * opt.quantity;
      }
    });
  }

  optionsCost = Math.round(optionsCost);
  const totalCost = canvasCost + profileCost + complexityCost + optionsCost;

  return {
    canvasCost,
    profileCost,
    complexityCost,
    optionsCost,
    totalCost,
  };
}

export function getMaterialLabel(material: MaterialType | string, lang: 'uk' | 'ru' | 'en' = 'uk', priceList?: MasterPriceList): string {
  // Check if it's a custom canvas
  if (priceList?.customItems) {
    const custom = priceList.customItems.find((i) => i.category === 'canvas' && (i.id === material || i.name === material));
    if (custom) return custom.name;
  }

  if (lang === 'en') {
    switch (material) {
      case 'pvc_matte': return 'PVC Matte (MSD)';
      case 'pvc_glossy': return 'PVC Glossy';
      case 'pvc_satin': return 'PVC Satin';
      case 'fabric': return 'Seamless Fabric (Descor)';
      case 'fireproof_km2': return 'Fire-Safe Teqtum KM2';
      case 'acoustic': return 'Acoustic Perforated';
      default: return String(material);
    }
  }

  if (lang === 'ru') {
    switch (material) {
      case 'pvc_matte': return 'ПВХ Матовый (MSD)';
      case 'pvc_glossy': return 'ПВХ Глянцевый';
      case 'pvc_satin': return 'ПВХ Сатиновый';
      case 'fabric': return 'Тканевый бесшовный (Descor)';
      case 'fireproof_km2': return 'Негорючий Teqtum KM2';
      case 'acoustic': return 'Акустический перфорированный';
      default: return String(material);
    }
  }

  // Ukrainian (default)
  switch (material) {
    case 'pvc_matte': return 'ПВХ Матовий (MSD Premium)';
    case 'pvc_glossy': return 'ПВХ Глянцевий';
    case 'pvc_satin': return 'ПВХ Сатиновий';
    case 'fabric': return 'Тканинний безшовний (Descor)';
    case 'fireproof_km2': return 'Негорючий Teqtum KM2';
    case 'acoustic': return 'Акустичний перфорований';
    default: return String(material);
  }
}

export function getComplexityLabel(complexity: CeilingComplexity, lang: 'uk' | 'ru' | 'en' = 'uk'): string {
  if (lang === 'en') {
    switch (complexity) {
      case 'straight': return 'Straight corners (standard)';
      case 'multilevel': return 'Multi-level step';
      case 'curved': return 'Curved / radial';
      default: return 'Standard';
    }
  }
  if (lang === 'ru') {
    switch (complexity) {
      case 'straight': return 'Прямой угол (стандарт)';
      case 'multilevel': return 'Многоуровневый с переходом';
      case 'curved': return 'С криволинейными элементами';
      default: return 'Стандарт';
    }
  }
  switch (complexity) {
    case 'straight': return 'Прямий кут (стандартний)';
    case 'multilevel': return 'Багаторівневий з переходом';
    case 'curved': return 'З криволінійними елементами';
    default: return 'Стандарт';
  }
}

export function getProfileLabel(profile: ProfileType | string, lang: 'uk' | 'ru' | 'en' = 'uk', priceList?: MasterPriceList): string {
  // Check if it's a custom profile
  if (priceList?.customItems) {
    const custom = priceList.customItems.find((i) => i.category === 'profile' && (i.id === profile || i.name === profile));
    if (custom) return custom.name;
  }

  if (lang === 'en') {
    switch (profile) {
      case 'standard_alu': return 'Aluminium harpoon';
      case 'pvc': return 'PVC wall';
      case 'shadow_kraab': return 'Shadow gap EuroKRAAB';
      case 'floating_led': return 'Floating LED';
      case 'slott_tracks': return 'Slott tracks';
      default: return String(profile);
    }
  }
  if (lang === 'ru') {
    switch (profile) {
      case 'standard_alu': return 'Алюминиевый гарпунный';
      case 'pvc': return 'ПВХ стеновой';
      case 'shadow_kraab': return 'Теневой EuroKRAAB';
      case 'floating_led': return 'Парящий с LED';
      case 'slott_tracks': return 'Слот / трековый';
      default: return String(profile);
    }
  }
  switch (profile) {
    case 'standard_alu': return 'Алюмінієвий гарпунний';
    case 'pvc': return 'ПВХ стіновий';
    case 'shadow_kraab': return 'Тіньовий EuroKRAAB';
    case 'floating_led': return 'Парящий з LED';
    case 'slott_tracks': return 'Слот / трековий';
    default: return String(profile);
  }
}

/**
 * Генерация коммерческого предложения для клиента
 */
export function generateClientOfferText(data: {
  clientName: string;
  address: string;
  roomName: string;
  area: number;
  perimeter: number;
  materialType: MaterialType | string;
  complexity: CeilingComplexity;
  profileType: ProfileType | string;
  options: Partial<RoomOptions>;
  customOptions?: { id: string; name: string; unit: string; price: number; quantity: number }[];
  cost: CostBreakdown;
  installDate?: string;
  currencySymbol?: string;
  lang?: 'uk' | 'ru' | 'en';
  priceList?: MasterPriceList;
}): string {
  const cur = data.currencySymbol || '₴';
  const lang = data.lang || 'uk';
  const lines: string[] = [];

  if (lang === 'uk') {
    lines.push(`Вітаю, ${data.clientName || 'шановний клієнте'}!`);
    lines.push(`📋 Попередній розрахунок натяжної стелі:`);
    if (data.address) lines.push(`📍 Об’єкт: ${data.address}`);
    lines.push(`🚪 Приміщення: ${data.roomName}`);
    lines.push(`📐 Площа: ${data.area} м² | Периметр: ${data.perimeter} м.п.`);
    lines.push(`✨ Полотно: ${getMaterialLabel(data.materialType, lang, data.priceList)}`);
    lines.push(`🔨 Профіль: ${getProfileLabel(data.profileType, lang, data.priceList)}`);
    lines.push(`📐 Складність: ${getComplexityLabel(data.complexity, lang)}`);

    const optLines: string[] = [];
    if (data.options.spotsGX53Count) optLines.push(`• Точкові світильники: ${data.options.spotsGX53Count} шт`);
    if (data.options.chandeliersCount) optLines.push(`• Люстри: ${data.options.chandeliersCount} шт`);
    if (data.options.lightLinesMeters) optLines.push(`• Світлові лінії: ${data.options.lightLinesMeters} м`);
    if (data.options.shadowProfileMeters) optLines.push(`• Тіньовий зазор: ${data.options.shadowProfileMeters} м`);
    if (data.options.curtainNicheMeters) optLines.push(`• Ніша під карниз: ${data.options.curtainNicheMeters} м`);
    if (data.options.pipePassCount) optLines.push(`• Обвід труб: ${data.options.pipePassCount} шт`);
    if (data.options.hardWallMeters) optLines.push(`• Керамограніт: ${data.options.hardWallMeters} м`);

    if (data.customOptions && data.customOptions.length > 0) {
      data.customOptions.forEach((co) => {
        if (co.quantity > 0) {
          optLines.push(`• ${co.name}: ${co.quantity} ${co.unit}`);
        }
      });
    }

    if (optLines.length > 0) {
      lines.push(`\nДодаткові опції:`);
      lines.push(...optLines);
    }

    lines.push(`\n💰 РАЗОМ ПІД КЛЮЧ: ${data.cost.totalCost.toLocaleString('uk-UA')} ${cur}`);
    if (data.installDate) lines.push(`📅 Планова дата монтажу: ${data.installDate}`);
    lines.push(`\nУ вартість входить полотно, профіль, комплектуючі та якісний монтаж.`);
    lines.push(`Гарантія на полотно 10 років, на монтажні роботи 2 роки.`);
  } else if (lang === 'en') {
    lines.push(`Hello, ${data.clientName || 'valued client'}!`);
    lines.push(`📋 Stretch ceiling price quotation:`);
    if (data.address) lines.push(`📍 Site: ${data.address}`);
    lines.push(`🚪 Room: ${data.roomName}`);
    lines.push(`📐 Area: ${data.area} m² | Perimeter: ${data.perimeter} m`);
    lines.push(`✨ Canvas: ${getMaterialLabel(data.materialType, lang)}`);
    lines.push(`🔨 Profile: ${getProfileLabel(data.profileType, lang)}`);
    lines.push(`📐 Complexity: ${getComplexityLabel(data.complexity, lang)}`);

    const optLines: string[] = [];
    if (data.options.spotsGX53Count) optLines.push(`• Spotlights: ${data.options.spotsGX53Count} pcs`);
    if (data.options.chandeliersCount) optLines.push(`• Chandeliers: ${data.options.chandeliersCount} pcs`);
    if (data.options.lightLinesMeters) optLines.push(`• Light lines: ${data.options.lightLinesMeters} m`);
    if (data.options.shadowProfileMeters) optLines.push(`• Shadow profile: ${data.options.shadowProfileMeters} m`);
    if (data.options.curtainNicheMeters) optLines.push(`• Curtain niche: ${data.options.curtainNicheMeters} m`);
    if (data.options.pipePassCount) optLines.push(`• Pipe bypass: ${data.options.pipePassCount} pcs`);

    if (optLines.length > 0) {
      lines.push(`\nIncluded options:`);
      lines.push(...optLines);
    }

    lines.push(`\n💰 TURNKEY TOTAL: ${data.cost.totalCost.toLocaleString('en-US')} ${cur}`);
    if (data.installDate) lines.push(`📅 Estimated install date: ${data.installDate}`);
  } else {
    // Russian
    lines.push(`Здравствуйте, ${data.clientName || 'уважаемый клиент'}!`);
    lines.push(`📋 Предварительный расчет натяжного потолка:`);
    if (data.address) lines.push(`📍 Объект: ${data.address}`);
    lines.push(`🚪 Помещение: ${data.roomName}`);
    lines.push(`📐 Площадь: ${data.area} м² | Периметр: ${data.perimeter} м.п.`);
    lines.push(`✨ Полотно: ${getMaterialLabel(data.materialType, lang)}`);
    lines.push(`🔨 Профиль: ${getProfileLabel(data.profileType, lang)}`);
    lines.push(`📐 Сложность: ${getComplexityLabel(data.complexity, lang)}`);

    const optLines: string[] = [];
    if (data.options.spotsGX53Count) optLines.push(`• Споты / светильники: ${data.options.spotsGX53Count} шт`);
    if (data.options.chandeliersCount) optLines.push(`• Люстры: ${data.options.chandeliersCount} шт`);
    if (data.options.lightLinesMeters) optLines.push(`• Световые линии: ${data.options.lightLinesMeters} м`);
    if (data.options.shadowProfileMeters) optLines.push(`• Теневой зазор: ${data.options.shadowProfileMeters} м`);
    if (data.options.curtainNicheMeters) optLines.push(`• Ниша под карниз: ${data.options.curtainNicheMeters} м`);
    if (data.options.pipePassCount) optLines.push(`• Обвод труб: ${data.options.pipePassCount} шт`);
    if (data.options.hardWallMeters) optLines.push(`• Керамогранит: ${data.options.hardWallMeters} м`);

    if (optLines.length > 0) {
      lines.push(`\nДополнительные опции:`);
      lines.push(...optLines);
    }

    lines.push(`\n💰 ИТОГО ПОД КЛЮЧ: ${data.cost.totalCost.toLocaleString('ru-RU')} ${cur}`);
    if (data.installDate) lines.push(`📅 Плановая дата монтажа: ${data.installDate}`);
  }

  return lines.join('\n');
}
