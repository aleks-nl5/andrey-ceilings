import React, { useState } from 'react';
import { 
  Ruler, 
  Layers, 
  Sparkles, 
  FileText, 
  Calculator, 
  Save, 
  ChevronLeft, 
  Check, 
  Lightbulb, 
  Grid, 
  Square, 
  Maximize2, 
  Move, 
  MapPin, 
  Navigation as NavigationIcon, 
  ExternalLink,
  SlidersHorizontal,
  Hash,
  Printer,
  RotateCw,
  Lock
} from 'lucide-react';
import { 
  RoomMeasurement, 
  RoomShape, 
  MaterialType, 
  CeilingComplexity, 
  ProfileType, 
  MasterPriceList,
  MasterProfile,
  ObjectProject,
  Client
} from '../types/database';
import { 
  calculateRoomGeometry, 
  calculateCeilingCost, 
  getMaterialLabel, 
  getComplexityLabel, 
  getProfileLabel 
} from '../utils/calculator';
import { generateEstimateDocNumber } from '../utils/documentNumber';
import { TouchBlueprintEditor } from './TouchBlueprintEditor';
import { RoomBlueprint } from './RoomBlueprint';
import { PhotoUploader } from './PhotoUploader';
import { NumericInput } from './NumericInput';
import { PrintEstimateModal } from './PrintEstimateModal';
import { getGoogleMapsUrl, getWazeUrl } from '../utils/navigation';
import { Translations, Locale } from '../i18n/translations';

interface MeasurementEditorProps {
  initialMeasurement?: Partial<RoomMeasurement>;
  objectId: string;
  parentObject?: ObjectProject;
  allObjects?: ObjectProject[];
  allClients?: Client[];
  priceList: MasterPriceList;
  masterProfile?: MasterProfile;
  t: Translations;
  locale: Locale;
  currencySymbol: string;
  onSave: (measurement: RoomMeasurement) => void;
  onCancel: () => void;
}

const ROOM_NAME_PRESETS_UK = [
  'Вітальня', 
  'Спальня', 
  'Кухня', 
  'Передпокій', 
  'Санвузол', 
  'Ванна', 
  'Дитяча', 
  'Коридор', 
  'Кабінет', 
  'Балкон'
];

const QUICK_COMMENT_TAGS_UK = [
  'Керамограніт на стінах (алмазне свердління)',
  'Прихована проводка під стелею',
  'Перепад плит перекриття',
  'Стояк опалення впритул до стіни',
  'Слабка штукатурка (потрібен брус)',
  'Висока стеля >3.0м',
  'Вентканал / витяжка у стелі',
  'Прихована ніша під штори (ПК-5)',
];

export const MeasurementEditor: React.FC<MeasurementEditorProps> = ({
  initialMeasurement,
  objectId,
  parentObject,
  allObjects = [],
  allClients = [],
  priceList,
  masterProfile,
  t,
  locale,
  currencySymbol,
  onSave,
  onCancel,
}) => {
  const [currentObjectId, setCurrentObjectId] = useState<string>(objectId);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState<boolean>(false);
  const activeObject = allObjects.find((o) => o.id === currentObjectId) || parentObject;
  const activeClient = allClients.find((c) => c.id === activeObject?.clientId);

  // Active price list: uses initialMeasurement.priceSnapshot if present, otherwise current priceList
  const [activePriceList, setActivePriceList] = useState<MasterPriceList>(() => {
    return initialMeasurement?.priceSnapshot || priceList;
  });
  const [isPriceRecalculated, setIsPriceRecalculated] = useState<boolean>(false);

  const handleRecalculatePrices = () => {
    setActivePriceList(priceList);
    setIsPriceRecalculated(true);
  };

  const [name, setName] = useState(
    initialMeasurement?.name || (locale === 'en' ? 'Living Room' : locale === 'ru' ? 'Гостиная' : 'Вітальня')
  );
  const [shape, setShape] = useState<RoomShape>(initialMeasurement?.shape || 'rectangle');

  // Dimensions
  const [length, setLength] = useState<number>(initialMeasurement?.length || 4.5);
  const [width, setWidth] = useState<number>(initialMeasurement?.width || 3.2);
  const [height, setHeight] = useState<number>(initialMeasurement?.height || 2.7);

  // L-Shape sides
  const [sideA, setSideA] = useState<number>(initialMeasurement?.sideA || 5.0);
  const [sideB, setSideB] = useState<number>(initialMeasurement?.sideB || 4.0);
  const [sideC, setSideC] = useState<number>(initialMeasurement?.sideC || 2.5);
  const [sideD, setSideD] = useState<number>(initialMeasurement?.sideD || 2.0);
  const [sideE, setSideE] = useState<number>(initialMeasurement?.sideE || 2.5);
  const [sideF, setSideF] = useState<number>(initialMeasurement?.sideF || 2.0);

  // Diagonals
  const [diagonal1, setDiagonal1] = useState<number>(initialMeasurement?.diagonal1 || 0);
  const [diagonal2, setDiagonal2] = useState<number>(initialMeasurement?.diagonal2 || 0);

  // Manual direct override for Area and Perimeter
  const [isManualAreaPerimeter, setIsManualAreaPerimeter] = useState<boolean>(false);
  const [manualArea, setManualArea] = useState<number>(initialMeasurement?.area || 14.4);
  const [manualPerimeter, setManualPerimeter] = useState<number>(initialMeasurement?.perimeter || 15.4);
  const [manualCorners, setManualCorners] = useState<number>(initialMeasurement?.cornersCount || 4);

  // Touch editor mode toggle
  const [isTouchEditMode, setIsTouchEditMode] = useState<boolean>(true);

  // Compute available canvases: standard without deletedStandardKeys + customItems from activePriceList
  const availableCanvases = [
    { id: 'pvc_matte', label: t.pvcMatte },
    { id: 'pvc_glossy', label: t.pvcGlossy },
    { id: 'pvc_satin', label: t.pvcSatin },
    { id: 'fabric', label: t.fabric },
    { id: 'fireproof_km2', label: t.fireproofKM2 },
    { id: 'acoustic', label: t.acoustic },
  ]
    .filter((mat) => !(activePriceList.deletedStandardKeys || []).includes(mat.id))
    .concat(
      (activePriceList.customItems || [])
        .filter((i) => i.category === 'canvas')
        .map((i) => ({ id: i.id, label: i.name }))
    );

  // Compute available profiles: standard without deletedStandardKeys + customItems from activePriceList
  const availableProfiles = [
    { id: 'standard_alu', label: t.profileStandardAlu },
    { id: 'pvc', label: t.profilePVC },
    { id: 'shadow_kraab', label: t.profileShadow },
    { id: 'floating_led', label: t.profileFloating },
    { id: 'slott_tracks', label: t.profileSlott },
  ]
    .filter((prof) => !(activePriceList.deletedStandardKeys || []).includes(prof.id))
    .concat(
      (activePriceList.customItems || [])
        .filter((i) => i.category === 'profile')
        .map((i) => ({ id: i.id, label: i.name }))
    );

  // Ceiling parameters
  const [materialType, setMaterialType] = useState<MaterialType | string>(
    initialMeasurement?.materialType || availableCanvases[0]?.id || 'pvc_matte'
  );
  const [canvasBrand, setCanvasBrand] = useState(initialMeasurement?.canvasBrand || 'MSD Premium');
  const [canvasColor, setCanvasColor] = useState(initialMeasurement?.canvasColor || 'Білий матовий (303)');
  const [complexity, setComplexity] = useState<CeilingComplexity>(initialMeasurement?.complexity || 'straight');
  const [profileType, setProfileType] = useState<ProfileType | string>(
    initialMeasurement?.profileType || availableProfiles[0]?.id || 'standard_alu'
  );

  // Options
  const [options, setOptions] = useState(initialMeasurement?.options || {
    lightLinesMeters: 0,
    shadowProfileMeters: 0,
    floatingCeilingMeters: 0,
    chandeliersCount: 1,
    spotsGX53Count: 4,
    pipePassCount: 1,
    curtainNicheMeters: 0,
    extraCorners: 0,
    hardWallMeters: 0,
  });

  // Custom options
  const [customOptionsQuantities, setCustomOptionsQuantities] = useState<Record<string, number>>(() => {
    const map: Record<string, number> = {};
    (initialMeasurement?.customOptions || []).forEach((co) => {
      map[co.id] = co.quantity;
    });
    return map;
  });

  const customOptionsList = (activePriceList.customItems || [])
    .filter((i) => i.category === 'work' || i.category === 'option')
    .map((i) => ({
      id: i.id,
      name: i.name,
      unit: i.unit,
      price: i.price,
      quantity: customOptionsQuantities[i.id] || 0,
    }));

  const [comments, setComments] = useState(initialMeasurement?.comments || '');
  const [photos, setPhotos] = useState(initialMeasurement?.photos || []);

  // Geometry calculation from shape and dimensions
  const computedGeometry = calculateRoomGeometry({
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
    diagonal1: diagonal1 > 0 ? diagonal1 : undefined,
    diagonal2: diagonal2 > 0 ? diagonal2 : undefined,
  });

  // Effective geometry (using manual override if enabled)
  const effectiveArea = isManualAreaPerimeter ? manualArea : computedGeometry.area;
  const effectivePerimeter = isManualAreaPerimeter ? manualPerimeter : computedGeometry.perimeter;
  const effectiveCorners = isManualAreaPerimeter ? manualCorners : computedGeometry.cornersCount;

  // Cost calculation using active price list (price snapshot)
  const costDetails = calculateCeilingCost({
    area: effectiveArea,
    perimeter: effectivePerimeter,
    materialType,
    complexity,
    profileType,
    options,
    customOptions: customOptionsList,
    priceList: activePriceList,
  });

  const handleAddCommentTag = (tag: string) => {
    if (comments.includes(tag)) return;
    setComments((prev) => (prev ? `${prev}. ${tag}` : tag));
  };

  // Callback when user drags corners on the TouchBlueprintEditor
  const handleTouchDimensionsChange = (params: {
    length: number;
    width: number;
    sideA?: number;
    sideB?: number;
    sideC?: number;
    sideD?: number;
    sideE?: number;
    sideF?: number;
    diagonal1?: number;
    diagonal2?: number;
    area: number;
    perimeter: number;
  }) => {
    if (params.length) setLength(params.length);
    if (params.width) setWidth(params.width);
    if (params.sideA !== undefined) setSideA(params.sideA);
    if (params.sideB !== undefined) setSideB(params.sideB);
    if (params.sideC !== undefined) setSideC(params.sideC);
    if (params.sideD !== undefined) setSideD(params.sideD);
    if (params.sideE !== undefined) setSideE(params.sideE);
    if (params.sideF !== undefined) setSideF(params.sideF);
    if (params.diagonal1 !== undefined) setDiagonal1(params.diagonal1);
    if (params.diagonal2 !== undefined) setDiagonal2(params.diagonal2);
    if (isManualAreaPerimeter) {
      setManualArea(params.area);
      setManualPerimeter(params.perimeter);
    }
  };

  const handleSave = () => {
    const measurement: RoomMeasurement = {
      id: initialMeasurement?.id || `meas-${Date.now()}`,
      objectId: currentObjectId,
      name,
      shape,
      length,
      width,
      height,
      sideA: shape === 'l_shaped' ? sideA : undefined,
      sideB: shape === 'l_shaped' ? sideB : undefined,
      sideC: shape === 'l_shaped' ? sideC : undefined,
      sideD: shape === 'l_shaped' ? sideD : undefined,
      sideE: shape === 'l_shaped' ? sideE : undefined,
      sideF: shape === 'l_shaped' ? sideF : undefined,
      diagonal1: diagonal1 > 0 ? diagonal1 : undefined,
      diagonal2: diagonal2 > 0 ? diagonal2 : undefined,
      area: effectiveArea,
      perimeter: effectivePerimeter,
      cornersCount: effectiveCorners,
      materialType,
      canvasBrand,
      canvasColor,
      complexity,
      profileType,
      options,
      customOptions: customOptionsList.filter((co) => co.quantity > 0),
      comments,
      photos,
      costDetails,
      docNumber: initialMeasurement?.docNumber || generateEstimateDocNumber(
        new Date(),
        masterProfile?.masterName,
        masterProfile?.companyName
      ),
      priceSnapshot: activePriceList,
      updatedAt: new Date().toISOString(),
    };

    onSave(measurement);
  };

  return (
    <div className="space-y-6 pb-24 max-w-4xl mx-auto">
      {/* Top action header */}
      <div className="sticky top-14 z-30 bg-white/95 dark:bg-slate-950/95 backdrop-blur border-b border-slate-200 dark:border-slate-800 p-3 -mx-4 sm:-mx-6 px-4 sm:px-6 flex items-center justify-between gap-3 shadow-md">
        <button
          type="button"
          onClick={onCancel}
          className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>{t.back}</span>
        </button>

        <div className="text-center">
          <h2 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
            {initialMeasurement?.id ? t.edit : t.newMeasurement}
          </h2>
          <span className="text-xs text-cyan-600 dark:text-cyan-400 font-mono font-semibold">
            {effectiveArea} м² • {costDetails.totalCost.toLocaleString('uk-UA')} {currencySymbol}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsPrintModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold border border-slate-300 dark:border-slate-700 transition active:scale-95"
            title="Друк / PDF"
          >
            <Printer className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <span className="hidden sm:inline">Друк / PDF</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 active:scale-95 text-white font-semibold text-sm shadow-lg shadow-cyan-900/40 transition"
          >
            <Save className="w-4 h-4" />
            <span>{t.save}</span>
          </button>
        </div>
      </div>

      {/* Object Address Bar with Direct Navigation and Selector */}
      <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <MapPin className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
          {allObjects.length > 1 ? (
            <div className="flex-1">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block mb-0.5">Об’єкт заміру:</span>
              <select
                value={currentObjectId}
                onChange={(e) => setCurrentObjectId(e.target.value)}
                className="bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-900 dark:text-white font-semibold focus:outline-none focus:border-cyan-500 w-full"
              >
                {allObjects.map((obj) => (
                  <option key={obj.id} value={obj.id}>
                    {obj.address} ({obj.roomType})
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <span className="text-xs font-semibold text-slate-900 dark:text-white">{activeObject?.address || 'Об’єкт'}</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 ml-1.5">({activeObject?.roomType || 'Приміщення'})</span>
            </div>
          )}
        </div>

        {activeObject && (
          <div className="flex items-center gap-2 shrink-0">
            <a
              href={getGoogleMapsUrl(activeObject.address)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold border border-blue-200 dark:bg-blue-950 dark:hover:bg-blue-900 dark:text-blue-300 dark:border-blue-800 transition"
            >
              <NavigationIcon className="w-3.5 h-3.5" />
              <span>Google Maps</span>
            </a>
            <a
              href={getWazeUrl(activeObject.address)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-50 hover:bg-cyan-100 text-cyan-700 text-xs font-semibold border border-cyan-200 dark:bg-cyan-950 dark:hover:bg-cyan-900 dark:text-cyan-300 dark:border-cyan-800 transition"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Waze</span>
            </a>
          </div>
        )}
      </div>

      {/* Room Name Presets */}
      <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3 shadow-sm">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {t.roomTitle}
        </label>
        <div className="flex flex-wrap gap-2">
          {ROOM_NAME_PRESETS_UK.map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => setName(preset)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                name === preset
                  ? 'bg-cyan-600 text-white shadow-md'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:border-transparent'
              }`}
            >
              {preset}
            </button>
          ))}
        </div>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Введіть назву (наприклад: Спальня мансарда)"
          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
        />
      </div>

      {/* Room Shape Selector */}
      <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3 shadow-sm">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {t.roomShape}
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {[
            { id: 'rectangle', label: t.shapeRectangle, icon: Grid },
            { id: 'square', label: t.shapeSquare, icon: Square },
            { id: 'l_shaped', label: t.shapeLShaped, icon: Layers },
            { id: 'custom', label: t.shapeCustom, icon: Maximize2 },
          ].map((item) => {
            const Icon = item.icon;
            const isSelected = shape === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setShape(item.id as RoomShape)}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-medium transition gap-1.5 ${
                  isSelected
                    ? 'border-cyan-500 bg-cyan-50 text-cyan-800 shadow-md ring-2 ring-cyan-500 dark:bg-cyan-950/40 dark:text-cyan-300'
                    : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-950 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-400 dark:hover:border-slate-700 dark:hover:text-slate-200 shadow-sm'
                }`}
              >
                <Icon className={`w-5 h-5 ${isSelected ? 'text-cyan-600 dark:text-cyan-400' : 'text-slate-400 dark:text-slate-500'}`} />
                <span className="font-semibold">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Blueprint Visualizer: Touch Editor vs Static with Toggle */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Move className="w-4 h-4 text-cyan-400" />
              <span>Редагування креслення пальцями</span>
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsTouchEditMode(!isTouchEditMode)}
            className="text-xs text-cyan-400 hover:underline font-semibold"
          >
            {isTouchEditMode ? 'Класичний вид' : 'Сенсорне редагування (Touch)'}
          </button>
        </div>

        {isTouchEditMode ? (
          <TouchBlueprintEditor
            shape={shape}
            initialLength={length}
            initialWidth={width}
            initialHeight={height}
            sideA={sideA}
            sideB={sideB}
            sideC={sideC}
            sideD={sideD}
            sideE={sideE}
            sideF={sideF}
            diagonal1={diagonal1}
            diagonal2={diagonal2}
            options={options}
            onDimensionsChange={handleTouchDimensionsChange}
          />
        ) : (
          <RoomBlueprint
            shape={shape}
            length={length}
            width={width}
            height={height}
            sideA={sideA}
            sideB={sideB}
            sideC={sideC}
            sideD={sideD}
            sideE={sideE}
            sideF={sideF}
            diagonal1={diagonal1}
            diagonal2={diagonal2}
            area={effectiveArea}
            perimeter={effectivePerimeter}
            options={options}
            canvasColorName={canvasColor}
          />
        )}
      </div>

      {/* Manual Dimensions Input Section (Цифрами вручну) */}
      <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800/80 pb-3">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
              <Ruler className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              <span>{t.dimensionsTitle} — Ручне введення цифрами</span>
            </label>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Вводьте точні цифри з лазерного дальноміра або використовуйте кнопки швидкого кроку (±0.1м / ±0.5м)
            </p>
          </div>

          {/* Toggle between calculated area/perimeter and direct manual override */}
          <button
            type="button"
            onClick={() => {
              if (!isManualAreaPerimeter) {
                setManualArea(computedGeometry.area);
                setManualPerimeter(computedGeometry.perimeter);
                setManualCorners(computedGeometry.cornersCount);
              }
              setIsManualAreaPerimeter(!isManualAreaPerimeter);
            }}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition border ${
              isManualAreaPerimeter
                ? 'bg-amber-50 border-amber-400 text-amber-800 dark:bg-amber-950/60 dark:border-amber-600 dark:text-amber-300'
                : 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:text-white'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>
              {isManualAreaPerimeter ? 'Ручний оверрайд площі (увімкнено)' : 'Задати площу та периметр напряму'}
            </span>
          </button>
        </div>

        {/* Manual Area & Perimeter override card if active */}
        {isManualAreaPerimeter && (
          <div className="bg-amber-950/20 border border-amber-800/40 rounded-xl p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <Hash className="w-4 h-4" />
                <span>Пряме введення площі та периметра (оверрайд геометрії)</span>
              </span>
              <span className="text-[10px] text-amber-400/80">Для нестандартних або складних форм</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <NumericInput
                label="Площа стелі (ручна)"
                value={manualArea}
                onChange={setManualArea}
                unit="м²"
                min={0.1}
                steppers={[-1, -0.1, 0.1, 1]}
                numpadTitle="Площа стелі"
              />
              <NumericInput
                label="Периметр стелі (ручний)"
                value={manualPerimeter}
                onChange={setManualPerimeter}
                unit="м.п."
                min={0.5}
                steppers={[-1, -0.5, 0.5, 1]}
                numpadTitle="Периметр стелі"
              />
              <NumericInput
                label="Кількість кутів"
                value={manualCorners}
                onChange={setManualCorners}
                unit="шт"
                min={3}
                allowDecimals={false}
                steppers={[-1, 1]}
                numpadTitle="Кількість кутів"
              />
            </div>
          </div>
        )}

        {/* Shape-specific Dimensions Inputs */}
        {shape === 'square' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <NumericInput
              label="Сторона квадрата"
              value={length}
              onChange={(val) => {
                setLength(val);
                setWidth(val);
              }}
              unit="м"
              min={0.1}
              steppers={[-0.5, -0.1, 0.1, 0.5]}
              numpadTitle="Сторона квадрата"
            />
            <NumericInput
              label={t.height}
              value={height}
              onChange={setHeight}
              unit="м"
              min={1.5}
              steppers={[-0.1, 0.1]}
              numpadTitle={t.height}
            />
          </div>
        ) : shape === 'l_shaped' ? (
          <div className="space-y-3">
            <span className="text-xs text-slate-400 block font-medium">Сторони L-подібного приміщення:</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <NumericInput
                label="Сторона A (Довжина)"
                value={sideA}
                onChange={setSideA}
                unit="м"
                min={0.1}
                steppers={[-0.5, -0.1, 0.1, 0.5]}
              />
              <NumericInput
                label="Сторона B (Ширина)"
                value={sideB}
                onChange={setSideB}
                unit="м"
                min={0.1}
                steppers={[-0.5, -0.1, 0.1, 0.5]}
              />
              <NumericInput
                label="Сторона C (Виступ 1)"
                value={sideC}
                onChange={setSideC}
                unit="м"
                min={0.1}
                steppers={[-0.5, -0.1, 0.1, 0.5]}
              />
              <NumericInput
                label="Сторона D (Виступ 2)"
                value={sideD}
                onChange={setSideD}
                unit="м"
                min={0.1}
                steppers={[-0.5, -0.1, 0.1, 0.5]}
              />
              <NumericInput
                label="Сторона E (Захід 1)"
                value={sideE}
                onChange={setSideE}
                unit="м"
                min={0.1}
                steppers={[-0.5, -0.1, 0.1, 0.5]}
              />
              <NumericInput
                label="Сторона F (Захід 2)"
                value={sideF}
                onChange={setSideF}
                unit="м"
                min={0.1}
                steppers={[-0.5, -0.1, 0.1, 0.5]}
              />
            </div>
            <div className="max-w-xs">
              <NumericInput
                label={t.height}
                value={height}
                onChange={setHeight}
                unit="м"
                min={1.5}
                steppers={[-0.1, 0.1]}
              />
            </div>
          </div>
        ) : shape === 'custom' ? (
          <div className="space-y-3">
            <span className="text-xs text-slate-400 block font-medium">Габаритні розміри та діагоналі:</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <NumericInput
                label="Габаритна довжина"
                value={length}
                onChange={setLength}
                unit="м"
                min={0.1}
                steppers={[-0.5, -0.1, 0.1, 0.5]}
              />
              <NumericInput
                label="Габаритна ширина"
                value={width}
                onChange={setWidth}
                unit="м"
                min={0.1}
                steppers={[-0.5, -0.1, 0.1, 0.5]}
              />
              <NumericInput
                label={t.height}
                value={height}
                onChange={setHeight}
                unit="м"
                min={1.5}
                steppers={[-0.1, 0.1]}
              />
            </div>
          </div>
        ) : (
          /* Rectangle (Default) */
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <NumericInput
              label={t.length}
              value={length}
              onChange={setLength}
              unit="м"
              min={0.1}
              steppers={[-0.5, -0.1, 0.1, 0.5]}
              numpadTitle={t.length}
            />
            <NumericInput
              label={t.width}
              value={width}
              onChange={setWidth}
              unit="м"
              min={0.1}
              steppers={[-0.5, -0.1, 0.1, 0.5]}
              numpadTitle={t.width}
            />
            <NumericInput
              label={t.height}
              value={height}
              onChange={setHeight}
              unit="м"
              min={1.5}
              steppers={[-0.1, 0.1]}
              numpadTitle={t.height}
            />
          </div>
        )}

        {/* Diagonals section for checking right angles */}
        <div className="border-t border-slate-800/80 pt-3">
          <span className="text-xs text-slate-400 block mb-2 font-medium">Діагоналі для контролю геометрії:</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <NumericInput
              label={`${t.diagonal1} (d1)`}
              value={diagonal1}
              onChange={setDiagonal1}
              unit="м"
              min={0}
              placeholder="Розраховується авто"
              steppers={[-0.1, 0.1]}
              numpadTitle={t.diagonal1}
            />
            <NumericInput
              label={`${t.diagonal2} (d2)`}
              value={diagonal2}
              onChange={setDiagonal2}
              unit="м"
              min={0}
              placeholder="Розраховується авто"
              steppers={[-0.1, 0.1]}
              numpadTitle={t.diagonal2}
            />
          </div>
        </div>

        {/* Summary geometric figures */}
        <div className="grid grid-cols-4 gap-2 pt-2 text-center text-xs">
          <div className="bg-slate-50 dark:bg-slate-950 p-2 rounded-xl border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block">{t.area}</span>
            <strong className="text-sm font-mono text-cyan-600 dark:text-cyan-400">{effectiveArea} м²</strong>
          </div>
          <div className="bg-slate-50 dark:bg-slate-950 p-2 rounded-xl border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block">{t.perimeter}</span>
            <strong className="text-sm font-mono text-cyan-600 dark:text-cyan-400">{effectivePerimeter} м</strong>
          </div>
          <div className="bg-slate-50 dark:bg-slate-950 p-2 rounded-xl border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block">{t.corners}</span>
            <strong className="text-sm font-mono text-slate-900 dark:text-white">{effectiveCorners}</strong>
          </div>
          <div className="bg-slate-50 dark:bg-slate-950 p-2 rounded-xl border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block">{t.height}</span>
            <strong className="text-sm font-mono text-slate-900 dark:text-white">{height} м</strong>
          </div>
        </div>
      </div>

      {/* Material & Complexity */}
      <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-4 shadow-sm">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-400 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
          <span>{t.materialType} та {t.complexity}</span>
        </label>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {availableCanvases.map((mat) => (
            <button
              key={mat.id}
              type="button"
              onClick={() => setMaterialType(mat.id)}
              className={`p-2.5 rounded-xl border text-left transition ${
                materialType === mat.id
                  ? 'border-cyan-500 bg-cyan-50 text-cyan-900 shadow-sm ring-1 ring-cyan-500 dark:bg-cyan-950/40 dark:text-white'
                  : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <span className="text-xs font-semibold block">{mat.label}</span>
            </button>
          ))}
        </div>

        <div>
          <span className="text-xs text-slate-600 dark:text-slate-400 block mb-2 font-medium">{t.complexity}:</span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {[
              { id: 'straight', label: t.complexityStraight },
              { id: 'multilevel', label: t.complexityMultilevel },
              { id: 'curved', label: t.complexityCurved },
            ].map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setComplexity(c.id as CeilingComplexity)}
                className={`p-2.5 rounded-xl border text-left transition ${
                  complexity === c.id
                    ? 'border-amber-500 bg-amber-50 text-amber-900 ring-1 ring-amber-500 dark:bg-amber-950/40 dark:text-amber-200'
                    : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400 dark:hover:border-slate-700'
                }`}
              >
                <span className="text-xs font-bold block">{c.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <span className="text-xs text-slate-600 dark:text-slate-400 block mb-2 font-medium">{t.profileSystem}:</span>
          <select
            value={profileType}
            onChange={(e) => setProfileType(e.target.value)}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
          >
            {availableProfiles.map((prof) => (
              <option key={prof.id} value={prof.id}>
                {prof.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Options & Lighting with NumericInputs */}
      <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3 shadow-sm">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-400 flex items-center gap-1.5">
          <Lightbulb className="w-4 h-4 text-amber-500 dark:text-amber-400" />
          <span>{t.lightingAndOptions} — Ручне введення цифрами</span>
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {!(priceList.deletedStandardKeys || []).includes('lightLinePerMeter') && (
            <NumericInput
              label={t.lightLines}
              value={options.lightLinesMeters}
              onChange={(val) => setOptions((prev) => ({ ...prev, lightLinesMeters: val }))}
              unit="м"
              min={0}
              steppers={[-0.5, 0.5]}
              numpadTitle={t.lightLines}
            />
          )}

          {!(priceList.deletedStandardKeys || []).includes('shadowProfilePerMeter') && (
            <NumericInput
              label={t.shadowGap}
              value={options.shadowProfileMeters}
              onChange={(val) => setOptions((prev) => ({ ...prev, shadowProfileMeters: val }))}
              unit="м"
              min={0}
              steppers={[-1, 1]}
              numpadTitle={t.shadowGap}
            />
          )}

          {!(priceList.deletedStandardKeys || []).includes('floatingProfilePerMeter') && (
            <NumericInput
              label={t.floatingProfile}
              value={options.floatingCeilingMeters}
              onChange={(val) => setOptions((prev) => ({ ...prev, floatingCeilingMeters: val }))}
              unit="м"
              min={0}
              steppers={[-1, 1]}
              numpadTitle={t.floatingProfile}
            />
          )}

          {!(priceList.deletedStandardKeys || []).includes('chandelierInstallation') && (
            <NumericInput
              label={t.chandelier}
              value={options.chandeliersCount}
              onChange={(val) => setOptions((prev) => ({ ...prev, chandeliersCount: val }))}
              unit="шт"
              min={0}
              allowDecimals={false}
              steppers={[-1, 1]}
              numpadTitle={t.chandelier}
            />
          )}

          {!(priceList.deletedStandardKeys || []).includes('spotInstallation') && (
            <NumericInput
              label={t.spotGX53}
              value={options.spotsGX53Count}
              onChange={(val) => setOptions((prev) => ({ ...prev, spotsGX53Count: val }))}
              unit="шт"
              min={0}
              allowDecimals={false}
              steppers={[-1, 1]}
              numpadTitle={t.spotGX53}
            />
          )}

          {!(priceList.deletedStandardKeys || []).includes('pipePass') && (
            <NumericInput
              label={t.pipePass}
              value={options.pipePassCount}
              onChange={(val) => setOptions((prev) => ({ ...prev, pipePassCount: val }))}
              unit="шт"
              min={0}
              allowDecimals={false}
              steppers={[-1, 1]}
              numpadTitle={t.pipePass}
            />
          )}

          {!(priceList.deletedStandardKeys || []).includes('curtainNichePerMeter') && (
            <NumericInput
              label={t.curtainNiche}
              value={options.curtainNicheMeters}
              onChange={(val) => setOptions((prev) => ({ ...prev, curtainNicheMeters: val }))}
              unit="м"
              min={0}
              steppers={[-0.5, 0.5]}
              numpadTitle={t.curtainNiche}
            />
          )}

          {!(priceList.deletedStandardKeys || []).includes('hardWallPerMeter') && (
            <NumericInput
              label={t.hardWall}
              value={options.hardWallMeters}
              onChange={(val) => setOptions((prev) => ({ ...prev, hardWallMeters: val }))}
              unit="м"
              min={0}
              steppers={[-1, 1]}
              numpadTitle={t.hardWall}
            />
          )}

          {/* Custom works & options */}
          {customOptionsList.map((customOpt) => (
            <NumericInput
              key={customOpt.id}
              label={customOpt.name}
              value={customOpt.quantity}
              onChange={(val) => setCustomOptionsQuantities((prev) => ({ ...prev, [customOpt.id]: val }))}
              unit={customOpt.unit || 'шт'}
              min={0}
              steppers={customOpt.unit === 'м' || customOpt.unit === 'м²' || customOpt.unit === 'м.п.' ? [-0.5, 0.5] : [-1, 1]}
              helperText={`(${customOpt.price} ${currencySymbol}/${customOpt.unit || 'шт'})`}
              numpadTitle={customOpt.name}
            />
          ))}
        </div>
      </div>

      {/* Comments with quick tags */}
      <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 space-y-3 shadow-sm">
        <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-400 flex items-center gap-1.5">
          <FileText className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
          <span>{t.commentsTitle}</span>
        </label>

        <div className="flex flex-wrap gap-1.5">
          {QUICK_COMMENT_TAGS_UK.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => handleAddCommentTag(tag)}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 dark:border-slate-700 transition"
            >
              + {tag}
            </button>
          ))}
        </div>

        <textarea
          rows={3}
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          placeholder={t.commentsPlaceholder}
          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl p-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-cyan-500"
        />
      </div>

      {/* Photos */}
      <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
        <PhotoUploader photos={photos} onChange={setPhotos} title={t.photosTitle} />
      </div>

      {/* Cost Summary Card */}
      <div className="bg-gradient-to-br from-cyan-50/80 via-white to-blue-50/60 border border-cyan-200 text-slate-900 dark:from-slate-900 dark:via-slate-900 dark:to-cyan-950/30 dark:border-cyan-800/40 dark:text-white rounded-2xl p-5 space-y-3 shadow-lg">
        <div className="flex items-center justify-between border-b border-cyan-100 dark:border-slate-800 pb-3">
          <span className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <Calculator className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <span>{t.totalCost}</span>
          </span>
          <span className="text-2xl font-black font-mono text-cyan-700 dark:text-cyan-300">
            {costDetails.totalCost.toLocaleString('uk-UA')} {currencySymbol}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs text-slate-700 dark:text-slate-300">
          <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800/40">
            <span className="text-slate-500 dark:text-slate-400">{t.canvasCost}:</span>
            <span className="font-mono font-bold text-slate-900 dark:text-white">{costDetails.canvasCost.toLocaleString('uk-UA')} {currencySymbol}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800/40">
            <span className="text-slate-500 dark:text-slate-400">{t.profileCost}:</span>
            <span className="font-mono font-bold text-slate-900 dark:text-white">{costDetails.profileCost.toLocaleString('uk-UA')} {currencySymbol}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800/40">
            <span className="text-slate-500 dark:text-slate-400">{t.complexityCost}:</span>
            <span className="font-mono font-bold text-amber-700 dark:text-amber-300">{costDetails.complexityCost.toLocaleString('uk-UA')} {currencySymbol}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-200 dark:border-slate-800/40">
            <span className="text-slate-500 dark:text-slate-400">{t.optionsCost}:</span>
            <span className="font-mono font-bold text-cyan-700 dark:text-cyan-300">{costDetails.optionsCost.toLocaleString('uk-UA')} {currencySymbol}</span>
          </div>
        </div>

        {customOptionsList.filter((co) => co.quantity > 0).length > 0 && (
          <div className="pt-2 border-t border-cyan-100 dark:border-slate-800 space-y-1">
            <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Власні роботи та опції:</span>
            {customOptionsList.filter((co) => co.quantity > 0).map((co) => (
              <div key={co.id} className="flex justify-between text-xs text-slate-600 dark:text-slate-300">
                <span>• {co.name} ({co.quantity} {co.unit}):</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  +{(co.quantity * co.price).toLocaleString('uk-UA')} {currencySymbol}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Price list snapshot info and explicit recalculation button */}
        {initialMeasurement?.id && (
          <div className="pt-2 border-t border-cyan-100 dark:border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 text-xs">
              <div className="flex items-center gap-2">
                <span className={`p-1.5 rounded-lg shrink-0 ${isPriceRecalculated ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'}`}>
                  {isPriceRecalculated ? <Check className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                </span>
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200 block">
                    {isPriceRecalculated 
                      ? 'Застосовано актуальний прайс-лист' 
                      : 'Ціни зафіксовано на момент збереження'}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400">
                    {isPriceRecalculated 
                      ? 'Вартість перераховано за новими тарифами з налаштувань' 
                      : 'Зміна цін у налаштуваннях не змінює вартість цього заміру'}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleRecalculatePrices}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1.5 shrink-0 ${
                  isPriceRecalculated
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-white hover:bg-cyan-50 dark:bg-slate-900 dark:hover:bg-slate-800 text-cyan-700 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-700 shadow-xs'
                }`}
              >
                <RotateCw className={`w-3.5 h-3.5 ${isPriceRecalculated ? '' : 'text-cyan-600 dark:text-cyan-400'}`} />
                <span>{isPriceRecalculated ? 'Оновлено до нового прайсу' : 'Перерахувати за актуальним прайсом'}</span>
              </button>
            </div>
          </div>
        )}

        <div className="flex gap-2 mt-2">
          <button
            type="button"
            onClick={() => setIsPrintModalOpen(true)}
            className="flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 active:scale-98 text-slate-800 font-bold text-sm border border-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 dark:border-slate-700 transition flex items-center justify-center gap-2"
          >
            <Printer className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
            <span>{t.printPdf}</span>
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="flex-1 py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 active:scale-98 text-white font-bold text-sm shadow-lg shadow-cyan-900/30 transition flex items-center justify-center gap-2"
          >
            <Check className="w-5 h-5" />
            <span>{t.save}</span>
          </button>
        </div>
      </div>

      {/* Clean A4 Print & PDF Preview Modal */}
      {isPrintModalOpen && (
        <PrintEstimateModal
          isOpen={isPrintModalOpen}
          onClose={() => setIsPrintModalOpen(false)}
          measurement={{
            id: initialMeasurement?.id || 'new',
            objectId: currentObjectId,
            name,
            shape,
            length,
            width,
            height,
            sideA: shape === 'l_shaped' ? sideA : undefined,
            sideB: shape === 'l_shaped' ? sideB : undefined,
            sideC: shape === 'l_shaped' ? sideC : undefined,
            sideD: shape === 'l_shaped' ? sideD : undefined,
            sideE: shape === 'l_shaped' ? sideE : undefined,
            sideF: shape === 'l_shaped' ? sideF : undefined,
            diagonal1: diagonal1 > 0 ? diagonal1 : undefined,
            diagonal2: diagonal2 > 0 ? diagonal2 : undefined,
            area: effectiveArea,
            perimeter: effectivePerimeter,
            cornersCount: effectiveCorners,
            materialType,
            canvasBrand,
            canvasColor,
            complexity,
            profileType,
            options,
            customOptions: customOptionsList.filter((co) => co.quantity > 0),
            comments,
            photos,
            costDetails,
            docNumber: initialMeasurement?.docNumber,
            priceSnapshot: activePriceList,
            updatedAt: new Date().toISOString(),
          }}
          parentObject={activeObject}
          client={activeClient}
          masterProfile={masterProfile}
          priceList={activePriceList}
          currencySymbol={currencySymbol}
          t={t}
          locale={locale}
        />
      )}
    </div>
  );
};
