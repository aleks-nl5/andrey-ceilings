import React, { useState } from 'react';
import { 
  Calculator, 
  Sparkles, 
  Copy, 
  Check, 
  Printer, 
  Send, 
  Layers, 
  Lightbulb, 
  FileSpreadsheet,
  Ruler,
  SlidersHorizontal,
  Plus
} from 'lucide-react';
import { 
  MaterialType, 
  CeilingComplexity, 
  ProfileType, 
  MasterPriceList, 
  RoomOptions,
  ObjectProject,
  Client 
} from '../types/database';
import { 
  calculateCeilingCost, 
  getMaterialLabel, 
  getComplexityLabel, 
  getProfileLabel,
  generateClientOfferText 
} from '../utils/calculator';
import { NumericInput } from './NumericInput';
import { Translations, Locale } from '../i18n/translations';

interface CalculatorModuleProps {
  priceList: MasterPriceList;
  t: Translations;
  locale: Locale;
  currencySymbol: string;
  objects?: ObjectProject[];
  clients?: Client[];
  onSaveToProject?: (data: {
    objectId: string;
    roomName: string;
    area: number;
    perimeter: number;
    materialType: MaterialType | string;
    complexity: CeilingComplexity;
    profileType: ProfileType | string;
    options: RoomOptions;
    customOptions?: { id: string; name: string; unit: string; price: number; quantity: number }[];
  }) => void;
}

export const CalculatorModule: React.FC<CalculatorModuleProps> = ({
  priceList,
  t,
  locale,
  currencySymbol,
  objects = [],
  clients = [],
  onSaveToProject,
}) => {
  // Mode: 'by_dimensions' (length x width) vs 'by_area' (direct square meters)
  const [inputMode, setInputMode] = useState<'by_dimensions' | 'by_area'>('by_dimensions');

  // Dimension inputs
  const [length, setLength] = useState<number>(4.8);
  const [width, setWidth] = useState<number>(3.5);

  // Direct area input
  const [directArea, setDirectArea] = useState<number>(18.5);
  const [customPerimeter, setCustomPerimeter] = useState<boolean>(false);
  const [manualPerimeter, setManualPerimeter] = useState<number>(17.5);

  // Compute available canvases: standard without deletedStandardKeys + customItems
  const availableCanvases = [
    { id: 'pvc_matte', label: t.pvcMatte, price: priceList.canvasPrices.pvc_matte },
    { id: 'pvc_glossy', label: t.pvcGlossy, price: priceList.canvasPrices.pvc_glossy },
    { id: 'pvc_satin', label: t.pvcSatin, price: priceList.canvasPrices.pvc_satin },
    { id: 'fabric', label: t.fabric, price: priceList.canvasPrices.fabric },
    { id: 'fireproof_km2', label: t.fireproofKM2, price: priceList.canvasPrices.fireproof_km2 },
    { id: 'acoustic', label: t.acoustic, price: priceList.canvasPrices.acoustic },
  ]
    .filter((mat) => !(priceList.deletedStandardKeys || []).includes(mat.id))
    .concat(
      (priceList.customItems || [])
        .filter((i) => i.category === 'canvas')
        .map((i) => ({ id: i.id, label: i.name, price: i.price }))
    );

  // Compute available profiles: standard without deletedStandardKeys + customItems
  const availableProfiles = [
    { id: 'standard_alu', label: t.profileStandardAlu, price: priceList.profilePrices.standard_alu },
    { id: 'pvc', label: t.profilePVC, price: priceList.profilePrices.pvc },
    { id: 'shadow_kraab', label: t.profileShadow, price: priceList.profilePrices.shadow_kraab },
    { id: 'floating_led', label: t.profileFloating, price: priceList.profilePrices.floating_led },
    { id: 'slott_tracks', label: t.profileSlott, price: priceList.profilePrices.slott_tracks },
  ]
    .filter((prof) => !(priceList.deletedStandardKeys || []).includes(prof.id))
    .concat(
      (priceList.customItems || [])
        .filter((i) => i.category === 'profile')
        .map((i) => ({ id: i.id, label: i.name, price: i.price }))
    );
  
  const [materialType, setMaterialType] = useState<MaterialType | string>(
    availableCanvases[0]?.id || 'pvc_matte'
  );
  const [complexity, setComplexity] = useState<CeilingComplexity>('straight');
  const [profileType, setProfileType] = useState<ProfileType | string>(
    availableProfiles[0]?.id || 'standard_alu'
  );

  // Options
  const [lightLinesMeters, setLightLinesMeters] = useState<number>(0);
  const [shadowProfileMeters, setShadowProfileMeters] = useState<number>(0);
  const [floatingCeilingMeters, setFloatingCeilingMeters] = useState<number>(0);
  const [chandeliersCount, setChandeliersCount] = useState<number>(1);
  const [spotsGX53Count, setSpotsGX53Count] = useState<number>(4);
  const [pipePassCount, setPipePassCount] = useState<number>(1);
  const [curtainNicheMeters, setCurtainNicheMeters] = useState<number>(3.0);
  const [hardWallMeters, setHardWallMeters] = useState<number>(0);

  // Custom options and works quantities map
  const [customOptionsQuantities, setCustomOptionsQuantities] = useState<Record<string, number>>({});

  // Link to existing object
  const [selectedObjectId, setSelectedObjectId] = useState<string>(objects[0]?.id || '');
  const [roomNameInput, setRoomNameInput] = useState<string>(
    locale === 'en' ? 'Living Room' : locale === 'ru' ? 'Гостиная' : 'Вітальня'
  );
  const [copied, setCopied] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  // Effective area and perimeter calculation
  const effectiveArea = inputMode === 'by_dimensions'
    ? Math.round(length * width * 100) / 100
    : directArea;

  const effectivePerimeter = inputMode === 'by_dimensions'
    ? Math.round(2 * (length + width) * 10) / 10
    : customPerimeter
      ? manualPerimeter
      : Math.round(2 * (Math.sqrt(directArea * 1.3) + directArea / Math.sqrt(directArea * 1.3)) * 10) / 10;

  const currentOptions: RoomOptions = {
    lightLinesMeters,
    shadowProfileMeters,
    floatingCeilingMeters,
    chandeliersCount,
    spotsGX53Count,
    pipePassCount,
    curtainNicheMeters,
    extraCorners: 0,
    hardWallMeters,
  };

  const customOptionsList = (priceList.customItems || [])
    .filter((i) => i.category === 'work' || i.category === 'option')
    .map((i) => ({
      id: i.id,
      name: i.name,
      unit: i.unit,
      price: i.price,
      quantity: customOptionsQuantities[i.id] || 0,
    }));

  const cost = calculateCeilingCost({
    area: effectiveArea,
    perimeter: effectivePerimeter,
    materialType,
    complexity,
    profileType,
    options: currentOptions,
    customOptions: customOptionsList,
    priceList,
  });

  const selectedObject = objects.find((o) => o.id === selectedObjectId);
  const selectedClient = clients.find((c) => c.id === selectedObject?.clientId);

  const offerText = generateClientOfferText({
    clientName: selectedClient?.name || (locale === 'en' ? 'Client' : 'Клієнт'),
    address: selectedObject?.address || '',
    roomName: roomNameInput,
    area: effectiveArea,
    perimeter: effectivePerimeter,
    materialType,
    complexity,
    profileType,
    options: currentOptions,
    customOptions: customOptionsList,
    cost,
    installDate: selectedObject?.installDate,
    currencySymbol,
    lang: locale,
    priceList,
  });

  const handleCopyOffer = () => {
    navigator.clipboard.writeText(offerText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSaveToProject = () => {
    if (!onSaveToProject || !selectedObjectId) return;
    onSaveToProject({
      objectId: selectedObjectId,
      roomName: roomNameInput,
      area: effectiveArea,
      perimeter: effectivePerimeter,
      materialType,
      complexity,
      profileType,
      options: currentOptions,
      customOptions: customOptionsList.filter((co) => co.quantity > 0),
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-cyan-50/80 via-white to-blue-50/60 dark:from-slate-900 dark:via-slate-900 dark:to-cyan-950/40 p-5 rounded-2xl border border-cyan-200/80 dark:border-slate-800 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-cyan-600 dark:text-cyan-400 text-xs font-bold uppercase tracking-wider mb-1">
            <Calculator className="w-4 h-4" />
            <span>{t.tabCalculator}</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">{t.calculatorTitle}</h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">{t.calculatorSubtitle}</p>
        </div>

        <div className="w-full sm:w-auto bg-white dark:bg-slate-950 border border-cyan-300 dark:border-cyan-800/60 rounded-xl px-5 py-3 text-right shadow-sm">
          <span className="text-[11px] uppercase tracking-wider text-slate-500 dark:text-slate-400 block font-semibold">
            {t.totalCost}
          </span>
          <div className="text-3xl font-black font-mono text-cyan-700 dark:text-cyan-300">
            {cost.totalCost.toLocaleString('uk-UA')} <span className="text-lg">{currencySymbol}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Inputs */}
        <div className="lg:col-span-7 space-y-5">
          {/* 1. Dimensions / Area (Manual digit input) */}
          <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800/80 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                <Ruler className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                <span>{t.manualInputDigits}</span>
              </span>

              {/* Mode switch */}
              <div className="flex rounded-xl bg-slate-100 dark:bg-slate-950 p-1 border border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setInputMode('by_dimensions')}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${
                    inputMode === 'by_dimensions'
                      ? 'bg-cyan-600 text-white shadow'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                  }`}
                >
                  {t.calcByDimensions}
                </button>
                <button
                  type="button"
                  onClick={() => setInputMode('by_area')}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition ${
                    inputMode === 'by_area'
                      ? 'bg-cyan-600 text-white shadow'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                  }`}
                >
                  {t.calcByArea}
                </button>
              </div>
            </div>

            {inputMode === 'by_dimensions' ? (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <NumericInput
                    label={t.length}
                    value={length}
                    onChange={setLength}
                    unit="м"
                    min={0.5}
                    steppers={[-0.5, -0.1, 0.1, 0.5]}
                    numpadTitle={t.length}
                  />
                  <NumericInput
                    label={t.width}
                    value={width}
                    onChange={setWidth}
                    unit="м"
                    min={0.5}
                    steppers={[-0.5, -0.1, 0.1, 0.5]}
                    numpadTitle={t.width}
                  />
                </div>

                {/* Quick presets for common room sizes */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[11px] text-slate-500 mr-1">Типові кімнати:</span>
                  {[
                    { l: 3.0, w: 3.0, label: '3×3 (9м²)' },
                    { l: 4.0, w: 3.0, label: '4×3 (12м²)' },
                    { l: 4.5, w: 3.5, label: '4.5×3.5 (15.8м²)' },
                    { l: 5.0, w: 4.0, label: '5×4 (20м²)' },
                    { l: 6.0, w: 4.5, label: '6×4.5 (27м²)' },
                  ].map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setLength(preset.l);
                        setWidth(preset.w);
                      }}
                      className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200 font-mono transition dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 dark:border-transparent"
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                {/* Computed Area & Perimeter summary */}
                <div className="grid grid-cols-2 gap-2 pt-1 text-center">
                  <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block">{t.area}</span>
                    <strong className="text-base font-mono text-cyan-700 dark:text-cyan-400">{effectiveArea} м²</strong>
                  </div>
                  <div className="bg-slate-50 dark:bg-slate-950 p-2.5 rounded-xl border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block">{t.perimeter}</span>
                    <strong className="text-base font-mono text-cyan-700 dark:text-cyan-400">{effectivePerimeter} м.п.</strong>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <NumericInput
                    label={t.area}
                    value={directArea}
                    onChange={setDirectArea}
                    unit="м²"
                    min={0.5}
                    steppers={[-1, -0.5, 0.5, 1]}
                    numpadTitle={t.area}
                  />

                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-300 font-medium mb-1">
                      <span>{t.perimeter}</span>
                      <button
                        type="button"
                        onClick={() => setCustomPerimeter(!customPerimeter)}
                        className="text-[10px] text-cyan-400 hover:underline"
                      >
                        {customPerimeter ? 'Авто' : 'Вручну'}
                      </button>
                    </div>

                    {customPerimeter ? (
                      <NumericInput
                        value={manualPerimeter}
                        onChange={setManualPerimeter}
                        unit="м.п."
                        min={1}
                        steppers={[-1, -0.5, 0.5, 1]}
                        numpadTitle={t.perimeter}
                      />
                    ) : (
                      <div className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-base font-bold font-mono text-cyan-400 flex items-center justify-between">
                        <span>{effectivePerimeter}</span>
                        <span className="text-xs text-slate-400 font-normal">м.п. (розрах.)</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick area buttons */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[11px] text-slate-500 mr-1">Швидкий вибір:</span>
                  {[6, 10, 14, 18, 22, 28, 35].map((quickArea) => (
                    <button
                      key={quickArea}
                      type="button"
                      onClick={() => setDirectArea(quickArea)}
                      className={`text-xs px-2.5 py-1 rounded-lg transition font-mono ${
                        directArea === quickArea
                          ? 'bg-cyan-600 text-white font-bold'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {quickArea} м²
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 2. Material */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>{t.materialType}</span>
            </span>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {availableCanvases.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setMaterialType(item.id)}
                  className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                    materialType === item.id
                      ? 'border-cyan-500 bg-cyan-950/40 text-white ring-1 ring-cyan-500'
                      : 'border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <div className="text-xs font-bold">{item.label}</div>
                  <div className="text-[11px] font-mono text-cyan-400 mt-2 font-semibold">
                    {item.price} {currencySymbol}/м²
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 3. Complexity */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-amber-400" />
              <span>{t.complexity}</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {[
                { id: 'straight', label: t.complexityStraight, badge: 'Базова ціна' },
                { id: 'multilevel', label: t.complexityMultilevel, badge: `+${priceList.multilevelPerMeterCost} ${currencySymbol}/м` },
                { id: 'curved', label: t.complexityCurved, badge: `+${priceList.curvedPerMeterCost} ${currencySymbol}/м` },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setComplexity(item.id as CeilingComplexity)}
                  className={`p-3 rounded-xl border text-left transition ${
                    complexity === item.id
                      ? 'border-amber-500 bg-amber-950/40 text-amber-200 ring-1 ring-amber-500'
                      : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="text-xs font-bold text-slate-900 dark:text-white">{item.label}</div>
                  <div className="text-[10px] font-mono text-amber-600 dark:text-amber-400 mt-1 font-semibold">{item.badge}</div>
                </button>
              ))}
            </div>
          </div>

          {/* 4. Profile system */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300">
              {t.profileSystem}
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {availableProfiles.map((prof) => (
                <button
                  key={prof.id}
                  type="button"
                  onClick={() => setProfileType(prof.id)}
                  className={`p-2.5 rounded-xl border text-left text-xs transition ${
                    profileType === prof.id
                      ? 'border-cyan-500 bg-cyan-950/40 text-cyan-300 ring-1 ring-cyan-500'
                      : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="font-semibold text-slate-900 dark:text-white">{prof.label}</div>
                  <div className="text-[10px] font-mono text-cyan-400 mt-1">{prof.price} {currencySymbol}/м.п.</div>
                </button>
              ))}
            </div>
          </div>

          {/* 5. Options with NumericInputs */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
              <Lightbulb className="w-4 h-4 text-amber-400" />
              <span>{t.lightingAndOptions} — Ручне введення цифрами</span>
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {!(priceList.deletedStandardKeys || []).includes('lightLinePerMeter') && (
                <NumericInput
                  label={t.lightLines}
                  value={lightLinesMeters}
                  onChange={setLightLinesMeters}
                  unit="м"
                  min={0}
                  steppers={[-0.5, 0.5]}
                  helperText={`(${priceList.lightLinePerMeter} ${currencySymbol}/м)`}
                  numpadTitle={t.lightLines}
                />
              )}

              {!(priceList.deletedStandardKeys || []).includes('shadowProfilePerMeter') && (
                <NumericInput
                  label={t.shadowGap}
                  value={shadowProfileMeters}
                  onChange={setShadowProfileMeters}
                  unit="м"
                  min={0}
                  steppers={[-1, 1]}
                  helperText={`(${priceList.shadowProfilePerMeter} ${currencySymbol}/м)`}
                  numpadTitle={t.shadowGap}
                />
              )}

              {!(priceList.deletedStandardKeys || []).includes('floatingProfilePerMeter') && (
                <NumericInput
                  label={t.floatingProfile}
                  value={floatingCeilingMeters}
                  onChange={setFloatingCeilingMeters}
                  unit="м"
                  min={0}
                  steppers={[-1, 1]}
                  helperText={`(${priceList.floatingProfilePerMeter} ${currencySymbol}/м)`}
                  numpadTitle={t.floatingProfile}
                />
              )}

              {!(priceList.deletedStandardKeys || []).includes('chandelierInstallation') && (
                <NumericInput
                  label={t.chandelier}
                  value={chandeliersCount}
                  onChange={setChandeliersCount}
                  unit="шт"
                  min={0}
                  allowDecimals={false}
                  steppers={[-1, 1]}
                  helperText={`(${priceList.chandelierInstallation} ${currencySymbol}/шт)`}
                  numpadTitle={t.chandelier}
                />
              )}

              {!(priceList.deletedStandardKeys || []).includes('spotInstallation') && (
                <NumericInput
                  label={t.spotGX53}
                  value={spotsGX53Count}
                  onChange={setSpotsGX53Count}
                  unit="шт"
                  min={0}
                  allowDecimals={false}
                  steppers={[-1, 1]}
                  helperText={`(${priceList.spotInstallation} ${currencySymbol}/шт)`}
                  numpadTitle={t.spotGX53}
                />
              )}

              {!(priceList.deletedStandardKeys || []).includes('pipePass') && (
                <NumericInput
                  label={t.pipePass}
                  value={pipePassCount}
                  onChange={setPipePassCount}
                  unit="шт"
                  min={0}
                  allowDecimals={false}
                  steppers={[-1, 1]}
                  helperText={`(${priceList.pipePass} ${currencySymbol}/шт)`}
                  numpadTitle={t.pipePass}
                />
              )}

              {!(priceList.deletedStandardKeys || []).includes('curtainNichePerMeter') && (
                <NumericInput
                  label={t.curtainNiche}
                  value={curtainNicheMeters}
                  onChange={setCurtainNicheMeters}
                  unit="м"
                  min={0}
                  steppers={[-0.5, 0.5]}
                  helperText={`(${priceList.curtainNichePerMeter} ${currencySymbol}/м)`}
                  numpadTitle={t.curtainNiche}
                />
              )}

              {!(priceList.deletedStandardKeys || []).includes('hardWallPerMeter') && (
                <NumericInput
                  label={t.hardWall}
                  value={hardWallMeters}
                  onChange={setHardWallMeters}
                  unit="м"
                  min={0}
                  steppers={[-1, 1]}
                  helperText={`(${priceList.hardWallPerMeter} ${currencySymbol}/м)`}
                  numpadTitle={t.hardWall}
                />
              )}

              {/* Custom works and options */}
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
        </div>

        {/* Right Column: Breakdown & WhatsApp Template */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4 shadow-md">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
              <FileSpreadsheet className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              <span>{t.estimateBreakdown}</span>
            </h3>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-800/60">
                <span className="text-slate-600 dark:text-slate-400">
                  {t.canvasCost} ({effectiveArea} м²):
                </span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {cost.canvasCost.toLocaleString('uk-UA')} {currencySymbol}
                </span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-800/60">
                <span className="text-slate-600 dark:text-slate-400">
                  {t.profileCost} ({effectivePerimeter} м):
                </span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">
                  {cost.profileCost.toLocaleString('uk-UA')} {currencySymbol}
                </span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-800/60">
                <span className="text-slate-600 dark:text-slate-400">
                  {t.complexityCost}:
                </span>
                <span className="font-mono font-bold text-amber-700 dark:text-amber-300">
                  {cost.complexityCost > 0 ? `+${cost.complexityCost.toLocaleString('uk-UA')} ${currencySymbol}` : `0 ${currencySymbol}`}
                </span>
              </div>

              <div className="flex justify-between items-center py-1 border-b border-slate-100 dark:border-slate-800/60">
                <span className="text-slate-600 dark:text-slate-400">{t.optionsCost}:</span>
                <span className="font-mono font-bold text-cyan-700 dark:text-cyan-300">
                  +{cost.optionsCost.toLocaleString('uk-UA')} {currencySymbol}
                </span>
              </div>

              {customOptionsList.filter((co) => co.quantity > 0).map((co) => (
                <div key={co.id} className="flex justify-between items-center py-0.5 text-[11px] text-slate-500 dark:text-slate-400 pl-2">
                  <span>• {co.name} ({co.quantity} {co.unit}):</span>
                  <span className="font-mono font-medium text-slate-700 dark:text-slate-300">
                    +{(co.quantity * co.price).toLocaleString('uk-UA')} {currencySymbol}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 dark:text-slate-400">{t.totalCost}</span>
                <div className="text-2xl font-black font-mono text-cyan-700 dark:text-cyan-400">
                  {cost.totalCost.toLocaleString('uk-UA')} {currencySymbol}
                </div>
              </div>
              <div className="text-right text-[11px] text-slate-500 dark:text-slate-400">
                <div>~{Math.round(cost.totalCost / (effectiveArea || 1))} {currencySymbol} / м²</div>
                <div className="text-emerald-700 dark:text-emerald-400 font-bold">Разом під ключ</div>
              </div>
            </div>
          </div>

          {/* Client Offer WhatsApp */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Send className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Пропозиція для клієнта</span>
              </h3>
              <button
                type="button"
                onClick={handleCopyOffer}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition active:scale-95 shadow-sm"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? t.copied : t.copyOfferWhatsApp}</span>
              </button>
            </div>

            <div className="bg-slate-50 dark:bg-slate-950 rounded-xl p-3 border border-slate-200 dark:border-slate-800">
              <pre className="text-[11px] text-slate-700 dark:text-slate-300 whitespace-pre-wrap font-sans leading-relaxed">
                {offerText}
              </pre>
            </div>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold w-full sm:w-auto">
                Надіслати кошторис:
              </span>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(offerText)}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 dark:hover:bg-emerald-900 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold transition"
                title="Відправити у WhatsApp"
              >
                <span>WhatsApp</span>
              </a>
              <a
                href={`viber://forward?text=${encodeURIComponent(offerText)}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 dark:bg-purple-950/70 dark:text-purple-300 dark:hover:bg-purple-900 border border-purple-200 dark:border-purple-800 text-xs font-semibold transition"
                title="Відправити у Viber"
              >
                <span>Viber</span>
              </a>
              <a
                href={`https://t.me/share/url?url=&text=${encodeURIComponent(offerText)}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 dark:bg-sky-950/70 dark:text-sky-300 dark:hover:bg-sky-900 border border-sky-200 dark:border-sky-800 text-xs font-semibold transition"
                title="Відправити у Telegram"
              >
                <span>Telegram</span>
              </a>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-white dark:border-slate-700 text-xs font-semibold transition"
              >
                <Printer className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                <span>{t.printPdf}</span>
              </button>
            </div>
          </div>

          {objects.length > 0 && onSaveToProject && (
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 space-y-3 shadow-sm">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Прив’язати розрахунок до об’єкта</h3>
              
              <div className="space-y-2">
                <div>
                  <label className="text-[11px] text-slate-500 dark:text-slate-400">Оберіть об’єкт:</label>
                  <select
                    value={selectedObjectId}
                    onChange={(e) => setSelectedObjectId(e.target.value)}
                    className="w-full mt-1 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-600"
                  >
                    {objects.map((obj) => (
                      <option key={obj.id} value={obj.id}>
                        {obj.address} ({obj.roomType})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-slate-500 dark:text-slate-400">{t.roomTitle}:</label>
                  <input
                    type="text"
                    value={roomNameInput}
                    onChange={(e) => setRoomNameInput(e.target.value)}
                    className="w-full mt-1 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-600"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleSaveToProject}
                  className="w-full mt-2 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 active:scale-95 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2"
                >
                  {saveSuccess ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  <span>{saveSuccess ? 'Додано в об’єкт!' : t.saveToProject}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
