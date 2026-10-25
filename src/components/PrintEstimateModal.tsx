import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { 
  Printer, 
  X, 
  Download, 
  FileText
} from 'lucide-react';
import { RoomMeasurement, ObjectProject, Client, MasterProfile, MasterPriceList } from '../types/database';
import { RoomBlueprint } from './RoomBlueprint';
import { 
  getMaterialLabel, 
  getProfileLabel,
  DEFAULT_PRICE_LIST 
} from '../utils/calculator';
import { AppStorage } from '../db/storage';
import { Translations, Locale } from '../i18n/translations';

import { getMasterInitials, generateEstimateDocNumber } from '../utils/documentNumber';
export { getMasterInitials, generateEstimateDocNumber };

interface PrintEstimateModalProps {
  isOpen: boolean;
  onClose: () => void;
  measurement?: RoomMeasurement | null;
  measurements?: RoomMeasurement[];
  parentObject?: ObjectProject;
  client?: Client;
  masterProfile?: MasterProfile;
  priceList?: MasterPriceList;
  currencySymbol?: string;
  t: Translations;
  locale: Locale;
}

export const PrintEstimateModal: React.FC<PrintEstimateModalProps> = ({
  isOpen,
  onClose,
  measurement,
  measurements = [],
  parentObject,
  client,
  masterProfile: propProfile,
  priceList: propPriceList,
  currencySymbol = '₴',
  t,
  locale,
}) => {
  const profile = propProfile || AppStorage.getMasterProfile();
  const prices = propPriceList || AppStorage.getPriceList() || DEFAULT_PRICE_LIST;

  // If a single room was passed, use it, or default to all rooms
  const allRooms = measurements.length > 0 
    ? measurements 
    : (measurement ? [measurement] : []);

  const [printScope, setPrintScope] = useState<'all' | 'single'>(
    measurement && measurements.length === 0 ? 'single' : 'all'
  );
  const [selectedSingleId, setSelectedSingleId] = useState<string>(
    measurement?.id || allRooms[0]?.id || ''
  );

  // Persistent document number for the estimate:
  // If the single measurement or parentObject has an existing docNumber, use it permanently!
  // If not yet assigned, generate once, persist it, and keep it permanently for all future openings.
  const [documentNumber, setDocumentNumber] = useState<string>(() => {
    if (measurement?.docNumber) return measurement.docNumber;
    if (parentObject?.docNumber) return parentObject.docNumber;
    const existing = (measurements || []).find((m) => m.docNumber);
    if (existing?.docNumber) return existing.docNumber;
    return generateEstimateDocNumber(
      measurement?.updatedAt ? new Date(measurement.updatedAt) : new Date(),
      profile?.masterName,
      profile?.companyName
    );
  });

  // Locked document currency:
  // Strictly preserves currency from saved measurement/priceSnapshot/object,
  // preventing global Settings changes from modifying historical PDF currency!
  const docCurrencySymbol = useMemo(() => {
    if (printScope === 'single') {
      const single = allRooms.find((r) => r.id === selectedSingleId) || measurement || allRooms[0];
      if (single?.priceSnapshot?.currencySymbol) return single.priceSnapshot.currencySymbol;
      if (single?.currencySymbol) return single.currencySymbol;
    }
    const roomWithCur = allRooms.find((r) => r.priceSnapshot?.currencySymbol || r.currencySymbol);
    if (roomWithCur?.priceSnapshot?.currencySymbol) return roomWithCur.priceSnapshot.currencySymbol;
    if (roomWithCur?.currencySymbol) return roomWithCur.currencySymbol;
    if (parentObject?.currencySymbol) return parentObject.currencySymbol;
    if (prices.currencySymbol) return prices.currencySymbol;
    return currencySymbol || '₴';
  }, [printScope, selectedSingleId, allRooms, measurement, parentObject, prices.currencySymbol, currencySymbol]);

  useEffect(() => {
    if (!isOpen) return;

    if (printScope === 'single') {
      const targetRoom = allRooms.find((r) => r.id === selectedSingleId) || measurement || allRooms[0];
      if (targetRoom) {
        if (targetRoom.docNumber) {
          setDocumentNumber(targetRoom.docNumber);
        } else {
          const generated = generateEstimateDocNumber(
            targetRoom.updatedAt ? new Date(targetRoom.updatedAt) : new Date(),
            profile?.masterName,
            profile?.companyName
          );
          targetRoom.docNumber = generated;
          if (!targetRoom.currencySymbol) targetRoom.currencySymbol = docCurrencySymbol;
          if (targetRoom.priceSnapshot && !targetRoom.priceSnapshot.currencySymbol) {
            targetRoom.priceSnapshot.currencySymbol = docCurrencySymbol;
          }
          AppStorage.saveMeasurement(targetRoom);
          setDocumentNumber(generated);
        }
      }
    } else {
      // all rooms / whole object
      if (parentObject?.docNumber) {
        setDocumentNumber(parentObject.docNumber);
      } else {
        const firstRoomDoc = allRooms.find((r) => r.docNumber)?.docNumber;
        const generated = firstRoomDoc || generateEstimateDocNumber(
          parentObject?.updatedAt ? new Date(parentObject.updatedAt) : new Date(),
          profile?.masterName,
          profile?.companyName
        );
        if (parentObject) {
          parentObject.docNumber = generated;
          if (!parentObject.currencySymbol) parentObject.currencySymbol = docCurrencySymbol;
          AppStorage.saveObject(parentObject);
        }
        setDocumentNumber(generated);
      }
    }
  }, [isOpen, printScope, selectedSingleId, profile?.masterName, profile?.companyName, docCurrencySymbol]);

  if (!isOpen) return null;

  const targetRooms = printScope === 'single'
    ? allRooms.filter((r) => r.id === selectedSingleId)
    : allRooms;

  // Calculate totals across target rooms
  const totalArea = Math.round(targetRooms.reduce((acc, r) => acc + (r.area || 0), 0) * 100) / 100;
  const totalPerimeter = Math.round(targetRooms.reduce((acc, r) => acc + (r.perimeter || 0), 0) * 100) / 100;
  const totalBaseCost = targetRooms.reduce((acc, r) => acc + (r.costDetails?.totalCost || 0), 0);
  const discountPercent = parentObject?.discountPercent || 0;
  const discountAmount = Math.round((totalBaseCost * discountPercent) / 100);
  const finalTotal = totalBaseCost - discountAmount;
  const prepayment = parentObject?.prepayment || 0;
  const balanceDue = Math.max(0, finalTotal - prepayment);

  const getStatusLabel = (status?: string) => {
    switch (status) {
      case 'measurement': return t.statusMeasurement;
      case 'calculation': return t.statusCalculation;
      case 'approved': return t.statusApproved;
      case 'in_progress': return t.statusInProgress;
      case 'completed': return t.statusCompleted;
      case 'paid': return t.statusPaid;
      case 'cancelled': return t.statusCancelled;
      default: return status || '';
    }
  };

  const handlePrint = () => {
    const originalTitle = document.title;
    document.title = `Кошторис_${documentNumber}`;
    document.documentElement.classList.add('is-printing-estimate');
    window.print();
    setTimeout(() => {
      document.documentElement.classList.remove('is-printing-estimate');
      document.title = originalTitle;
    }, 1500);
  };

  const handleDownloadHtml = () => {
    const sheetEl = document.getElementById('print-sheet');
    if (!sheetEl) return;

    const fileName = `Кошторис_${documentNumber}.html`;

    const htmlContent = `<!DOCTYPE html>
<html lang="uk">
<head>
  <meta charset="UTF-8">
  <title>${fileName.replace('.html', '')}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600;700&display=swap" rel="stylesheet">
  <style>
    @page { size: A4 portrait; margin: 10mm; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif; background: #fff; color: #0f172a; padding: 20px; font-size: 11px; line-height: 1.4; max-width: 210mm; margin: 0 auto; }
    table { width: 100%; border-collapse: collapse; margin-top: 6px; margin-bottom: 12px; }
    th { background: #f8fafc; font-weight: 700; text-align: left; padding: 6px 8px; border: 1px solid #cbd5e1; font-size: 10px; text-transform: uppercase; letter-spacing: 0.05em; color: #475569; }
    td { padding: 6px 8px; border: 1px solid #e2e8f0; font-size: 11px; }
    .page-break-avoid { break-inside: avoid; page-break-inside: avoid; }
    @media print {
      body { padding: 0; }
      .no-print { display: none !important; }
    }
  </style>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-white text-slate-900 p-6 font-sans">
  <div class="no-print mb-4 flex justify-between items-center bg-slate-100 p-3 rounded-lg border border-slate-300">
    <span class="font-bold text-xs text-slate-700">📄 Специфікація та кошторис (готовий до збереження в PDF)</span>
    <button onclick="window.print()" style="background:#0284c7;color:#fff;border:none;padding:6px 16px;border-radius:6px;font-weight:bold;cursor:pointer;font-size:12px;">
      🖨️ Зберегти як PDF / Роздрукувати
    </button>
  </div>
  ${sheetEl.innerHTML}
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Check if master profile has any non-empty fields
  const hasMasterInfo = Boolean(
    profile?.companyName?.trim() ||
    profile?.masterName?.trim() ||
    profile?.phone?.trim() ||
    profile?.city?.trim() ||
    profile?.email?.trim()
  );

  return createPortal(
    <div id="print-modal-portal" className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-sm animate-fadeIn overflow-y-auto">
      {/* Modal dialog wrapper */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-4xl max-h-[94vh] rounded-2xl flex flex-col shadow-2xl overflow-hidden my-auto">
        
        {/* Modal Top Bar (Screen only, hidden on print) */}
        <div className="no-print px-4 sm:px-6 py-3.5 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-50 dark:bg-slate-950/80 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-600 text-white shadow-xs">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                  Друк кошторису (PDF)
                </h2>
                <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800">
                  № {documentNumber}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {parentObject?.address || client?.name || 'Документ замовлення'}
              </p>
            </div>
          </div>

          {/* Scope switch if multiple rooms */}
          {allRooms.length > 1 && (
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-200 dark:bg-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setPrintScope('all')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                  printScope === 'all'
                    ? 'bg-white text-slate-900 dark:bg-slate-950 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Всі кімнати ({allRooms.length})
              </button>
              <button
                type="button"
                onClick={() => setPrintScope('single')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition ${
                  printScope === 'single'
                    ? 'bg-white text-slate-900 dark:bg-slate-950 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
              >
                Окреме приміщення
              </button>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 active:scale-95 text-white font-bold text-xs shadow-md shadow-cyan-900/30 transition cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Роздрукувати / PDF</span>
            </button>
            <button
              type="button"
              onClick={handleDownloadHtml}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 font-semibold text-xs border border-slate-200 dark:border-slate-700 transition"
              title="Завантажити копію HTML"
            >
              <Download className="w-3.5 h-3.5" />
              <span>HTML</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Room selector dropdown if single mode */}
        {printScope === 'single' && allRooms.length > 1 && (
          <div className="no-print px-6 py-2 bg-slate-100/70 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3 text-xs">
            <span className="font-semibold text-slate-600 dark:text-slate-400">Оберіть кімнату:</span>
            <select
              value={selectedSingleId}
              onChange={(e) => setSelectedSingleId(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-medium text-xs focus:ring-2 focus:ring-cyan-500 outline-none"
            >
              {allRooms.map((r, idx) => (
                <option key={r.id} value={r.id}>
                  {idx + 1}. {r.name || 'Приміщення'} ({r.area} м² — {r.costDetails?.totalCost || 0} {currencySymbol})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Printable Document Sheet Preview */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-slate-200 dark:bg-slate-950/70">
          <div
            id="print-sheet"
            className="bg-white text-black rounded shadow-lg border border-gray-300 mx-auto p-6 sm:p-8 max-w-[210mm] font-sans text-xs print:p-0 print:border-none print:shadow-none"
          >
            {/* 1. DOCUMENT HEADER (PLAIN TEXT, NO BOXES) */}
            <div className="border-b-2 border-black pb-4 mb-4">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                {/* Left: Master / Company info (Only non-empty fields) */}
                <div className="space-y-1">
                  {hasMasterInfo ? (
                    <>
                      {profile?.companyName?.trim() && (
                        <h1 className="text-lg font-extrabold text-black uppercase tracking-tight">
                          {profile.companyName}
                        </h1>
                      )}
                      {profile?.masterName?.trim() && (
                        <p className="text-xs font-semibold text-gray-800">
                          Майстер: {profile.masterName}
                        </p>
                      )}
                      {profile?.phone?.trim() && (
                        <p className="text-xs text-black">
                          Тел: <strong>{profile.phone}</strong>
                        </p>
                      )}
                      {profile?.city?.trim() && (
                        <p className="text-xs text-gray-600">
                          {profile.city}
                        </p>
                      )}
                      {profile?.email?.trim() && (
                        <p className="text-xs text-gray-600">
                          {profile.email}
                        </p>
                      )}
                    </>
                  ) : (
                    <div>
                      <h1 className="text-lg font-extrabold text-black uppercase tracking-tight">
                        СтеляПро
                      </h1>
                      <p className="text-xs text-gray-600">
                        Монтаж та розрахунок натяжних стель
                      </p>
                    </div>
                  )}
                </div>

                {/* Right: Document Title & Meta (Plain text without block boxes) */}
                <div className="text-left sm:text-right space-y-1">
                  <h2 className="text-base font-extrabold text-black uppercase tracking-wider leading-tight">
                    Кошторис-Договір
                  </h2>
                  <p className="text-xs text-black mt-1">
                    Документ: <strong>№ {documentNumber}</strong>
                  </p>
                  <p className="text-xs text-black">
                    Дата: <strong>{new Date().toLocaleDateString(locale === 'en' ? 'en-US' : 'uk-UA')}</strong>
                  </p>
                  {parentObject?.status && (
                    <p className="text-[11px] text-gray-600 uppercase tracking-wider font-mono">
                      Статус: {getStatusLabel(parentObject.status)}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* 2. CLIENT & OBJECT INFO (PLAIN STRUCTURED TEXT WITHOUT BOX CARDS) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-4 mb-4 border-b border-gray-300 text-xs">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-gray-600 block">
                  Замовник:
                </span>
                <p className="font-bold text-black text-sm">
                  {client?.name || 'Клієнт не вказаний'}
                </p>
                {client?.phone?.trim() && (
                  <p className="text-black">
                    Телефон: <strong>{client.phone}</strong>
                  </p>
                )}
                {client?.address?.trim() && (
                  <p className="text-black">
                    Адреса: {client.address}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-gray-600 block">
                  Об'єкт монтажу:
                </span>
                <p className="font-bold text-black text-sm">
                  {parentObject?.address || 'Адреса за місцем'}
                </p>
                {parentObject?.roomType?.trim() && (
                  <p className="text-black">
                    Тип об'єкта: <strong>{parentObject.roomType}</strong>
                  </p>
                )}
                <div className="flex flex-wrap gap-x-4 text-black text-[11px]">
                  {parentObject?.measureDate && (
                    <span>Замір: <strong>{parentObject.measureDate}</strong></span>
                  )}
                  {parentObject?.installDate && (
                    <span>Монтаж: <strong>{parentObject.installDate}</strong></span>
                  )}
                </div>
                {parentObject?.notes?.trim() && (
                  <p className="text-[11px] text-gray-600 italic mt-0.5">
                    Примітки: {parentObject.notes}
                  </p>
                )}
              </div>
            </div>

            {/* 3. MEASUREMENTS & ROOMS BREAKDOWN */}
            <div className="space-y-6">
              {targetRooms.map((room, roomIdx) => {
                const opt = room.options || {
                  lightLinesMeters: 0,
                  shadowProfileMeters: 0,
                  floatingCeilingMeters: 0,
                  chandeliersCount: 0,
                  spotsGX53Count: 0,
                  pipePassCount: 0,
                  curtainNicheMeters: 0,
                  extraCorners: 0,
                  hardWallMeters: 0,
                };
                const cost = room.costDetails || {
                  canvasCost: 0,
                  profileCost: 0,
                  complexityCost: 0,
                  optionsCost: 0,
                  totalCost: 0,
                };
                const roomPrices = room.priceSnapshot || prices;
                const roomCurrency = roomPrices.currencySymbol || room.currencySymbol || docCurrencySymbol;

                const customCanvasItem = (roomPrices.customItems || []).find((i) => i.id === room.materialType);
                const canvasRate = customCanvasItem 
                  ? customCanvasItem.price 
                  : (roomPrices.canvasPrices[room.materialType as keyof typeof roomPrices.canvasPrices] || DEFAULT_PRICE_LIST.canvasPrices.pvc_matte);
                const canvasTotal = cost.canvasCost || Math.round(room.area * canvasRate);

                const customProfileItem = (roomPrices.customItems || []).find((i) => i.id === room.profileType);
                const profileRate = customProfileItem 
                  ? customProfileItem.price 
                  : (roomPrices.profilePrices[room.profileType as keyof typeof roomPrices.profilePrices] || DEFAULT_PRICE_LIST.profilePrices.standard_alu);
                const profileTotal = cost.profileCost || Math.round(room.perimeter * profileRate);

                const extraCorners = Math.max(0, (room.cornersCount || 4) - 4);
                const extraCornersCost = extraCorners * roomPrices.extraCornerCost;

                const chandelierCost = (opt.chandeliersCount || 0) * roomPrices.chandelierInstallation;
                const spotsCost = (opt.spotsGX53Count || 0) * roomPrices.spotInstallation;
                const lightLinesCost = (opt.lightLinesMeters || 0) * roomPrices.lightLinePerMeter;
                const pipesCost = (opt.pipePassCount || 0) * roomPrices.pipePass;
                const curtainNicheCost = (opt.curtainNicheMeters || 0) * roomPrices.curtainNichePerMeter;
                const hardWallCost = (opt.hardWallMeters || 0) * roomPrices.hardWallPerMeter;

                let rowNum = 1;

                return (
                  <div key={room.id} className="border border-gray-300 rounded p-4 break-inside-avoid page-break-avoid bg-white">
                    {/* Room Header (Clean black & white) */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-black pb-2 mb-3">
                      <div>
                        <h3 className="font-extrabold text-sm text-black">
                          {roomIdx + 1}. {room.name || 'Приміщення'}
                        </h3>
                        <p className="text-[11px] text-gray-600">
                          {getMaterialLabel(room.materialType, locale, roomPrices)} {room.canvasBrand ? `(${room.canvasBrand})` : ''} · {getProfileLabel(room.profileType, locale, roomPrices)}
                        </p>
                      </div>
                      <div className="text-xs font-mono font-bold text-black">
                        <span>S = {room.area} м²</span>
                        <span className="mx-1.5">·</span>
                        <span>P = {room.perimeter} м.п.</span>
                        <span className="mx-1.5">·</span>
                        <span>Кутів: {room.cornersCount || 4}</span>
                      </div>
                    </div>

                    {/* Vector Blueprint Scheme (Full height, no clipping, monochrome) */}
                    <div className="mb-4 bg-white border border-gray-300 rounded p-2 flex flex-col items-center justify-center">
                      <div className="w-full max-w-[440px] min-h-[280px] flex items-center justify-center">
                        <RoomBlueprint
                          shape={room.shape}
                          length={room.length}
                          width={room.width}
                          height={room.height}
                          sideA={room.sideA}
                          sideB={room.sideB}
                          sideC={room.sideC}
                          sideD={room.sideD}
                          sideE={room.sideE}
                          sideF={room.sideF}
                          diagonal1={room.diagonal1}
                          diagonal2={room.diagonal2}
                          customSides={room.customSides}
                          area={room.area}
                          perimeter={room.perimeter}
                          options={room.options}
                          canvasColorName={room.canvasColor}
                          isPrint={true}
                        />
                      </div>
                      <span className="text-[10px] text-gray-500 font-mono mt-1">
                        Схема розкрою та діагоналей стелі
                      </span>
                    </div>

                    {/* Cost Calculation Table (Pure B&W) */}
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse text-left text-xs">
                        <thead>
                          <tr className="bg-gray-100 border-y border-black text-black">
                            <th className="py-1.5 px-2 font-bold w-8 text-center">№</th>
                            <th className="py-1.5 px-2 font-bold">Найменування робіт та матеріалів</th>
                            <th className="py-1.5 px-2 font-bold text-center w-16">Кількість</th>
                            <th className="py-1.5 px-2 font-bold text-center w-14">Од. вим.</th>
                            <th className="py-1.5 px-2 font-bold text-right w-20">Ціна, {roomCurrency}</th>
                            <th className="py-1.5 px-2 font-bold text-right w-24">Сума, {roomCurrency}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 text-black">
                          {/* 1. Canvas */}
                          <tr>
                            <td className="py-1 px-2 text-center text-gray-500">{rowNum++}</td>
                            <td className="py-1 px-2">
                              Полотно натяжної стелі ({getMaterialLabel(room.materialType, locale, roomPrices)}{room.canvasColor ? `, ${room.canvasColor}` : ''})
                            </td>
                            <td className="py-1 px-2 text-center font-mono">{room.area}</td>
                            <td className="py-1 px-2 text-center">м²</td>
                            <td className="py-1 px-2 text-right font-mono">{canvasRate}</td>
                            <td className="py-1 px-2 text-right font-mono font-semibold">{canvasTotal}</td>
                          </tr>

                          {/* 2. Profile */}
                          <tr>
                            <td className="py-1 px-2 text-center text-gray-500">{rowNum++}</td>
                            <td className="py-1 px-2">
                              Профіль кріплення та монтаж ({getProfileLabel(room.profileType, locale, roomPrices)})
                            </td>
                            <td className="py-1 px-2 text-center font-mono">{room.perimeter}</td>
                            <td className="py-1 px-2 text-center">м.п.</td>
                            <td className="py-1 px-2 text-right font-mono">{profileRate}</td>
                            <td className="py-1 px-2 text-right font-mono font-semibold">{profileTotal}</td>
                          </tr>

                          {/* 3. Corners if > 4 */}
                          {extraCorners > 0 && (
                            <tr>
                              <td className="py-1 px-2 text-center text-gray-500">{rowNum++}</td>
                              <td className="py-1 px-2">Обробка додаткових кутів (понад 4 шт)</td>
                              <td className="py-1 px-2 text-center font-mono">{extraCorners}</td>
                              <td className="py-1 px-2 text-center">шт</td>
                              <td className="py-1 px-2 text-right font-mono">{roomPrices.extraCornerCost}</td>
                              <td className="py-1 px-2 text-right font-mono font-semibold">{extraCornersCost}</td>
                            </tr>
                          )}

                          {/* 4. Chandelier */}
                          {Boolean(opt.chandeliersCount && opt.chandeliersCount > 0) && (
                            <tr>
                              <td className="py-1 px-2 text-center text-gray-500">{rowNum++}</td>
                              <td className="py-1 px-2">Монтаж люстри (закладна + гак/планка)</td>
                              <td className="py-1 px-2 text-center font-mono">{opt.chandeliersCount}</td>
                              <td className="py-1 px-2 text-center">шт</td>
                              <td className="py-1 px-2 text-right font-mono">{roomPrices.chandelierInstallation}</td>
                              <td className="py-1 px-2 text-right font-mono font-semibold">{chandelierCost}</td>
                            </tr>
                          )}

                          {/* 5. Spots */}
                          {Boolean(opt.spotsGX53Count && opt.spotsGX53Count > 0) && (
                            <tr>
                              <td className="py-1 px-2 text-center text-gray-500">{rowNum++}</td>
                              <td className="py-1 px-2">Монтаж точкового світильника (стійка, розводка)</td>
                              <td className="py-1 px-2 text-center font-mono">{opt.spotsGX53Count}</td>
                              <td className="py-1 px-2 text-center">шт</td>
                              <td className="py-1 px-2 text-right font-mono">{roomPrices.spotInstallation}</td>
                              <td className="py-1 px-2 text-right font-mono font-semibold">{spotsCost}</td>
                            </tr>
                          )}

                          {/* 6. Light lines */}
                          {Boolean(opt.lightLinesMeters && opt.lightLinesMeters > 0) && (
                            <tr>
                              <td className="py-1 px-2 text-center text-gray-500">{rowNum++}</td>
                              <td className="py-1 px-2">Світлова лінія зі світлодіодною стрічкою</td>
                              <td className="py-1 px-2 text-center font-mono">{opt.lightLinesMeters}</td>
                              <td className="py-1 px-2 text-center">м.п.</td>
                              <td className="py-1 px-2 text-right font-mono">{roomPrices.lightLinePerMeter}</td>
                              <td className="py-1 px-2 text-right font-mono font-semibold">{lightLinesCost}</td>
                            </tr>
                          )}

                          {/* 7. Pipes */}
                          {Boolean(opt.pipePassCount && opt.pipePassCount > 0) && (
                            <tr>
                              <td className="py-1 px-2 text-center text-gray-500">{rowNum++}</td>
                              <td className="py-1 px-2">Обвід труби опалення (термокільце)</td>
                              <td className="py-1 px-2 text-center font-mono">{opt.pipePassCount}</td>
                              <td className="py-1 px-2 text-center">шт</td>
                              <td className="py-1 px-2 text-right font-mono">{roomPrices.pipePass}</td>
                              <td className="py-1 px-2 text-right font-mono font-semibold">{pipesCost}</td>
                            </tr>
                          )}

                          {/* 8. Curtain niche */}
                          {Boolean(opt.curtainNicheMeters && opt.curtainNicheMeters > 0) && (
                            <tr>
                              <td className="py-1 px-2 text-center text-gray-500">{rowNum++}</td>
                              <td className="py-1 px-2">Ніша під карниз для штор</td>
                              <td className="py-1 px-2 text-center font-mono">{opt.curtainNicheMeters}</td>
                              <td className="py-1 px-2 text-center">м.п.</td>
                              <td className="py-1 px-2 text-right font-mono">{roomPrices.curtainNichePerMeter}</td>
                              <td className="py-1 px-2 text-right font-mono font-semibold">{curtainNicheCost}</td>
                            </tr>
                          )}

                          {/* 9. Hard wall */}
                          {Boolean(opt.hardWallMeters && opt.hardWallMeters > 0) && (
                            <tr>
                              <td className="py-1 px-2 text-center text-gray-500">{rowNum++}</td>
                              <td className="py-1 px-2">Свердління керамограніту/плитки</td>
                              <td className="py-1 px-2 text-center font-mono">{opt.hardWallMeters}</td>
                              <td className="py-1 px-2 text-center">м.п.</td>
                              <td className="py-1 px-2 text-right font-mono">{roomPrices.hardWallPerMeter}</td>
                              <td className="py-1 px-2 text-right font-mono font-semibold">{hardWallCost}</td>
                            </tr>
                          )}

                          {/* 10. Custom Works and Options */}
                          {(room.customOptions || []).filter((co) => co.quantity > 0).map((co) => (
                            <tr key={co.id}>
                              <td className="py-1 px-2 text-center text-gray-500">{rowNum++}</td>
                              <td className="py-1 px-2">{co.name}</td>
                              <td className="py-1 px-2 text-center font-mono">{co.quantity}</td>
                              <td className="py-1 px-2 text-center">{co.unit || 'шт'}</td>
                              <td className="py-1 px-2 text-right font-mono">{co.price}</td>
                              <td className="py-1 px-2 text-right font-mono font-semibold">{Math.round(co.quantity * co.price)}</td>
                            </tr>
                          ))}

                          {/* Subtotal row */}
                          <tr className="bg-gray-50 font-bold border-t-2 border-black">
                            <td colSpan={5} className="py-2 px-2 text-right text-black">
                              Разом по приміщенню «{room.name || 'Приміщення'}»:
                            </td>
                            <td className="py-2 px-2 text-right font-mono text-sm text-black">
                              {cost.totalCost || 0} {roomCurrency}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* 4. GRAND TOTAL SUMMARY TABLE (Pure B&W) */}
            <div className="mt-6 border-2 border-black rounded p-4 bg-white break-inside-avoid page-break-avoid">
              <h3 className="font-extrabold text-sm text-black uppercase tracking-wider mb-3 pb-2 border-b border-black flex justify-between items-center">
                <span>Підсумок замовлення {targetRooms.length > 1 ? `(всіх кімнат: ${targetRooms.length})` : ''}</span>
                <span className="font-mono text-xs font-normal lowercase text-gray-600">
                  S загальна = {totalArea} м² | P загальний = {totalPerimeter} м.п.
                </span>
              </h3>

              <div className="space-y-1.5 text-xs text-black">
                <div className="flex justify-between py-1 border-b border-gray-200">
                  <span className="text-gray-700">Сума за матеріали та монтажні роботи:</span>
                  <span className="font-mono font-bold text-black">{totalBaseCost} {docCurrencySymbol}</span>
                </div>

                {discountPercent > 0 && (
                  <div className="flex justify-between py-1 border-b border-gray-200 text-black">
                    <span>Знижка ({discountPercent}%):</span>
                    <span className="font-mono font-bold">- {discountAmount} {docCurrencySymbol}</span>
                  </div>
                )}

                <div className="flex justify-between py-1 border-b border-gray-200">
                  <span className="text-gray-700">Загальна вартість договору:</span>
                  <span className="font-mono font-bold text-black">{finalTotal} {docCurrencySymbol}</span>
                </div>

                {prepayment > 0 && (
                  <div className="flex justify-between py-1 border-b border-gray-200 text-black">
                    <span>Внесена попередня оплата (аванс):</span>
                    <span className="font-mono font-bold">{prepayment} {docCurrencySymbol}</span>
                  </div>
                )}

                <div className="flex justify-between items-center pt-2 text-sm font-extrabold text-black">
                  <span className="uppercase tracking-wide">До сплати після встановлення:</span>
                  <span className="font-mono text-base font-extrabold text-black underline underline-offset-4">
                    {balanceDue} {docCurrencySymbol}
                  </span>
                </div>
              </div>

              {/* Bank / Prepayment Details (Only if filled by master) */}
              {profile?.bankDetails?.trim() && (
                <div className="mt-4 p-2.5 rounded bg-white border border-gray-300 text-xs text-black">
                  <strong className="block text-black text-[11px] uppercase tracking-wider mb-0.5">
                    Реквізити для оплати / внесення авансу:
                  </strong>
                  <p className="font-mono text-[11px] whitespace-pre-wrap">{profile.bankDetails}</p>
                </div>
              )}

              {/* Warranty & Custom Terms (Only if filled by master) */}
              {profile?.warrantyNotes?.trim() && (
                <div className="mt-2 text-[11px] text-gray-700 italic">
                  <strong>Гарантія: </strong>
                  {profile.warrantyNotes}
                </div>
              )}
            </div>

            {/* 5. SIGNATURE FOOTER */}
            <div className="mt-8 pt-4 border-t border-black grid grid-cols-2 gap-8 text-xs break-inside-avoid page-break-avoid text-black">
              <div>
                <p className="font-bold text-black mb-6">Замовник:</p>
                <div className="border-b border-black w-full mb-1" />
                <p className="text-[10px] text-gray-600">
                  {client?.name ? `(підпис) / ${client.name}` : '(підпис замовника)'}
                </p>
              </div>

              <div>
                <p className="font-bold text-black mb-6">Виконавець:</p>
                <div className="border-b border-black w-full mb-1" />
                <p className="text-[10px] text-gray-600">
                  {profile?.masterName?.trim() 
                    ? `(підпис) / ${profile.masterName}`
                    : (profile?.companyName?.trim() ? `(підпис) / ${profile.companyName}` : '(підпис майстра)')}
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
