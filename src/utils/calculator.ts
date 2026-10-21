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
};

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

  // Custom / irregular room
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
  const cornersCount = (params.customSides && params.customSides.length >= 4) 
    ? params.customSides.length 
    : 5;

  return { area, perimeter, cornersCount };
}

/**
 * Модуль калькулятора стоимости натяжного потолка
 */
export function calculateCeilingCost(params: {
  area: number;
  perimeter: number;
  materialType: MaterialType;
  complexity: CeilingComplexity;
  profileType?: ProfileType;
  options: Partial<RoomOptions>;
  priceList?: MasterPriceList;
}): CostBreakdown {
  const prices = params.priceList || DEFAULT_PRICE_LIST;
  const { area, perimeter, materialType, complexity, options } = params;
  const profileType = params.profileType || 'standard_alu';

  // 1. Полотно
  const baseCanvasRate = prices.canvasPrices[materialType] ?? prices.canvasPrices.pvc_matte;
  const canvasCost = Math.round(area * baseCanvasRate);

  // 2. Базовий профіль
  const profileRate = prices.profilePrices[profileType] ?? prices.profilePrices.standard_alu;
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

export function getMaterialLabel(material: MaterialType, lang: 'uk' | 'ru' | 'en' = 'uk'): string {
  if (lang === 'en') {
    switch (material) {
      case 'pvc_matte': return 'PVC Matte (MSD)';
      case 'pvc_glossy': return 'PVC Glossy';
      case 'pvc_satin': return 'PVC Satin';
      case 'fabric': return 'Seamless Fabric (Descor)';
      case 'fireproof_km2': return 'Fire-Safe Teqtum KM2';
      case 'acoustic': return 'Acoustic Perforated';
      default: return 'PVC';
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
      default: return 'ПВХ';
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
    default: return 'ПВХ';
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

export function getProfileLabel(profile: ProfileType, lang: 'uk' | 'ru' | 'en' = 'uk'): string {
  if (lang === 'en') {
    switch (profile) {
      case 'standard_alu': return 'Aluminium harpoon';
      case 'pvc': return 'PVC wall';
      case 'shadow_kraab': return 'Shadow gap EuroKRAAB';
      case 'floating_led': return 'Floating LED';
      case 'slott_tracks': return 'Slott tracks';
      default: return 'Standard';
    }
  }
  if (lang === 'ru') {
    switch (profile) {
      case 'standard_alu': return 'Алюминиевый гарпунный';
      case 'pvc': return 'ПВХ стеновой';
      case 'shadow_kraab': return 'Теневой EuroKRAAB';
      case 'floating_led': return 'Парящий с LED';
      case 'slott_tracks': return 'Слот / трековый';
      default: return 'Стандарт';
    }
  }
  switch (profile) {
    case 'standard_alu': return 'Алюмінієвий гарпунний';
    case 'pvc': return 'ПВХ стіновий';
    case 'shadow_kraab': return 'Тіньовий EuroKRAAB';
    case 'floating_led': return 'Парящий з LED';
    case 'slott_tracks': return 'Слот / трековий';
    default: return 'Стандартний';
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
  materialType: MaterialType;
  complexity: CeilingComplexity;
  profileType: ProfileType;
  options: Partial<RoomOptions>;
  cost: CostBreakdown;
  installDate?: string;
  currencySymbol?: string;
  lang?: 'uk' | 'ru' | 'en';
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
    lines.push(`✨ Полотно: ${getMaterialLabel(data.materialType, lang)}`);
    lines.push(`🔨 Профіль: ${getProfileLabel(data.profileType, lang)}`);
    lines.push(`📐 Складність: ${getComplexityLabel(data.complexity, lang)}`);

    const optLines: string[] = [];
    if (data.options.spotsGX53Count) optLines.push(`• Точкові світильники: ${data.options.spotsGX53Count} шт`);
    if (data.options.chandeliersCount) optLines.push(`• Люстри: ${data.options.chandeliersCount} шт`);
    if (data.options.lightLinesMeters) optLines.push(`• Світлові лінії: ${data.options.lightLinesMeters} м`);
    if (data.options.shadowProfileMeters) optLines.push(`• Тіньовий зазор: ${data.options.shadowProfileMeters} м`);
    if (data.options.curtainNicheMeters) optLines.push(`• Ніша під карниз: ${data.options.curtainNicheMeters} м`);
    if (data.options.pipePassCount) optLines.push(`• Обвід труб: ${data.options.pipePassCount} шт`);
    if (data.options.hardWallMeters) optLines.push(`• Керамограніт: ${data.options.hardWallMeters} м`);

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
