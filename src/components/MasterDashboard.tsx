import React from 'react';
import { 
  Ruler, 
  Calculator, 
  Building2, 
  Settings, 
  Plus, 
  Calendar, 
  Clock, 
  MapPin, 
  Phone, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  FileText,
  Sparkles,
  ChevronRight,
  Layers
} from 'lucide-react';
import { ObjectProject, Client, RoomMeasurement } from '../types/database';
import { Translations, Locale } from '../i18n/translations';

interface MasterDashboardProps {
  objects: ObjectProject[];
  clients: Client[];
  measurements: RoomMeasurement[];
  currencySymbol?: string;
  t: Translations;
  locale: Locale;
  onNavigateTab: (tab: 'dashboard' | 'objects' | 'measurements' | 'calculator' | 'settings') => void;
  onStartNewMeasurement: (objectId?: string) => void;
  onSelectObject: (objectId: string) => void;
}

export const MasterDashboard: React.FC<MasterDashboardProps> = ({
  objects,
  clients,
  measurements,
  currencySymbol = '₴',
  t,
  locale,
  onNavigateTab,
  onStartNewMeasurement,
  onSelectObject,
}) => {
  // Today's date in YYYY-MM-DD
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);

  // Clients map by ID
  const clientsMap = new Map<string, Client>();
  clients.forEach((c) => clientsMap.set(c.id, c));

  // Find events for today and upcoming
  // Categorize objects by relevance to today
  interface ScheduledEvent {
    object: ObjectProject;
    client?: Client;
    type: 'today_measure' | 'today_install' | 'upcoming_measure' | 'upcoming_install';
    dateStr: string;
    diffDays: number;
  }

  const events: ScheduledEvent[] = [];

  objects.forEach((obj) => {
    const cl = clientsMap.get(obj.clientId);

    if (obj.measureDate && obj.status !== 'completed' && obj.status !== 'cancelled') {
      const objDate = new Date(obj.measureDate);
      const diffMs = objDate.getTime() - now.setHours(0, 0, 0, 0);
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

      if (obj.measureDate === todayStr) {
        events.push({ object: obj, client: cl, type: 'today_measure', dateStr: obj.measureDate, diffDays: 0 });
      } else if (diffDays > 0 && diffDays <= 14) {
        events.push({ object: obj, client: cl, type: 'upcoming_measure', dateStr: obj.measureDate, diffDays });
      }
    }

    if (obj.installDate && obj.status !== 'completed' && obj.status !== 'cancelled') {
      const instDate = new Date(obj.installDate);
      const diffMs = instDate.getTime() - now.setHours(0, 0, 0, 0);
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

      if (obj.installDate === todayStr) {
        events.push({ object: obj, client: cl, type: 'today_install', dateStr: obj.installDate, diffDays: 0 });
      } else if (diffDays > 0 && diffDays <= 14) {
        events.push({ object: obj, client: cl, type: 'upcoming_install', dateStr: obj.installDate, diffDays });
      }
    }
  });

  // Sort events: today first, then nearest day
  events.sort((a, b) => a.diffDays - b.diffDays);
  const primaryEvent = events[0];

  // Calculate quick stats
  const totalRooms = measurements.length;
  const totalArea = Math.round(measurements.reduce((acc, m) => acc + (m.area || 0), 0) * 10) / 10;
  const activeObjectsCount = objects.filter((o) => o.status !== 'completed' && o.status !== 'cancelled').length;

  return (
    <div className="space-y-6">
      {/* 1. DATE-BASED SMART REMINDER BANNER */}
      {primaryEvent ? (
        <div className={`p-4 sm:p-5 rounded-2xl border shadow-md transition ${
          primaryEvent.diffDays === 0
            ? 'bg-gradient-to-r from-amber-50 via-white to-orange-50/60 dark:from-amber-950/40 dark:via-slate-900 dark:to-slate-900 border-amber-300 dark:border-amber-800/80'
            : 'bg-gradient-to-r from-cyan-50 via-white to-blue-50/60 dark:from-cyan-950/40 dark:via-slate-900 dark:to-slate-900 border-cyan-200 dark:border-cyan-800/60'
        }`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1 ${
                  primaryEvent.diffDays === 0
                    ? 'bg-amber-500 text-white animate-pulse'
                    : 'bg-cyan-600 text-white'
                }`}>
                  <Clock className="w-3.5 h-3.5" />
                  <span>
                    {primaryEvent.diffDays === 0 
                      ? 'Сьогодні за розкладом' 
                      : primaryEvent.diffDays === 1 
                        ? 'Завтра' 
                        : `Через ${primaryEvent.diffDays} дн. (${primaryEvent.dateStr})`}
                  </span>
                </span>
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  {primaryEvent.type.includes('measure') ? 'Замір приміщення' : 'Монтаж натяжної стелі'}
                </span>
              </div>

              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <span>{primaryEvent.object.address}</span>
              </h2>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-700 dark:text-slate-300">
                {primaryEvent.client && (
                  <span className="font-medium text-slate-900 dark:text-slate-100">
                    Замовник: <strong>{primaryEvent.client.name}</strong>
                  </span>
                )}
                {primaryEvent.object.roomType && (
                  <span className="text-slate-500 dark:text-slate-400">
                    ({primaryEvent.object.roomType})
                  </span>
                )}
              </div>
            </div>

            {/* Quick Actions for this object */}
            <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200 dark:border-slate-800">
              {primaryEvent.client?.phone && (
                <a
                  href={`tel:${primaryEvent.client.phone.replace(/[^0-9+]/g, '')}`}
                  className="px-3.5 py-2 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-xs font-bold flex items-center gap-1.5 transition shadow-xs"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="hidden xs:inline">Подзвонити</span>
                </a>
              )}
              <button
                type="button"
                onClick={() => {
                  onSelectObject(primaryEvent.object.id);
                  onNavigateTab('objects');
                }}
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 active:scale-95 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-md shadow-cyan-900/30"
              >
                <span>Перейти до об'єкту</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Empty / Quiet State when no urgent objects */
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-50 via-white to-cyan-50/40 dark:from-slate-900 dark:to-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-100 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-400">
              <Calendar className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                На сьогодні термінових виїздів немає
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Створіть новий замір або перевірте список поточних замовлень
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onStartNewMeasurement()}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Замір</span>
          </button>
        </div>
      )}

      {/* 2. MASTER'S FOUR QUICK-ACTION TILES (2 per row on mobile) */}
      <div>
        <h3 className="text-xs uppercase font-extrabold tracking-wider text-slate-500 dark:text-slate-400 mb-2.5 px-1">
          Швидкі інструменти майстра
        </h3>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
          {/* Tile 1: New Measurement */}
          <button
            type="button"
            onClick={() => onStartNewMeasurement()}
            className="group p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-cyan-400 dark:hover:border-cyan-600 shadow-xs hover:shadow-md transition text-left flex flex-col justify-between min-h-[94px] sm:min-h-[110px] cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl bg-cyan-100 dark:bg-cyan-950/70 text-cyan-600 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Ruler className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2]" />
              </div>
              <span className="text-[10px] sm:text-[11px] font-bold px-1.5 py-0.5 rounded bg-cyan-50 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-400 border border-cyan-200 dark:border-cyan-800">
                + новий
              </span>
            </div>
            <div>
              <h4 className="text-xs sm:text-base font-extrabold text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors leading-tight">
                Швидкий замір
              </h4>
            </div>
          </button>

          {/* Tile 2: Calculator */}
          <button
            type="button"
            onClick={() => onNavigateTab('calculator')}
            className="group p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-cyan-400 dark:hover:border-cyan-600 shadow-xs hover:shadow-md transition text-left flex flex-col justify-between min-h-[94px] sm:min-h-[110px] cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl bg-blue-100 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Calculator className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2]" />
              </div>
            </div>
            <div>
              <h4 className="text-xs sm:text-base font-extrabold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-tight">
                Калькулятор
              </h4>
            </div>
          </button>

          {/* Tile 3: Objects & Clients */}
          <button
            type="button"
            onClick={() => onNavigateTab('objects')}
            className="group p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-cyan-400 dark:hover:border-cyan-600 shadow-xs hover:shadow-md transition text-left flex flex-col justify-between min-h-[94px] sm:min-h-[110px] cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl bg-amber-100 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Building2 className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2]" />
              </div>
              <span className="text-[10px] sm:text-[11px] font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {activeObjectsCount} акт.
              </span>
            </div>
            <div>
              <h4 className="text-xs sm:text-base font-extrabold text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors leading-tight">
                Об'єкти та клієнти
              </h4>
            </div>
          </button>

          {/* Tile 4: Settings */}
          <button
            type="button"
            onClick={() => onNavigateTab('settings')}
            className="group p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-cyan-400 dark:hover:border-cyan-600 shadow-xs hover:shadow-md transition text-left flex flex-col justify-between min-h-[94px] sm:min-h-[110px] cursor-pointer"
          >
            <div className="flex items-center justify-between">
              <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Settings className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.2]" />
              </div>
            </div>
            <div>
              <h4 className="text-xs sm:text-base font-extrabold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors leading-tight">
                Налаштування
              </h4>
            </div>
          </button>
        </div>
      </div>

      {/* 3. METRICS SUMMARY (3 in a single horizontal line) */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <div className="p-2 sm:p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center sm:items-center text-center sm:text-left gap-1.5 sm:gap-3 shadow-xs">
          <div className="p-1.5 sm:p-2.5 rounded-lg bg-cyan-50 dark:bg-cyan-950 text-cyan-600 dark:text-cyan-400 shrink-0">
            <Building2 className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0 w-full">
            <span className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 block truncate leading-tight">Об'єктів</span>
            <p className="text-sm sm:text-lg font-bold text-slate-900 dark:text-white font-mono leading-none mt-0.5 truncate">{activeObjectsCount}</p>
          </div>
        </div>

        <div className="p-2 sm:p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center sm:items-center text-center sm:text-left gap-1.5 sm:gap-3 shadow-xs">
          <div className="p-1.5 sm:p-2.5 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 shrink-0">
            <Layers className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0 w-full">
            <span className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 block truncate leading-tight">Кімнат</span>
            <p className="text-sm sm:text-lg font-bold text-slate-900 dark:text-white font-mono leading-none mt-0.5 truncate">{totalRooms}</p>
          </div>
        </div>

        <div className="p-2 sm:p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center sm:items-center text-center sm:text-left gap-1.5 sm:gap-3 shadow-xs">
          <div className="p-1.5 sm:p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 shrink-0">
            <Ruler className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0 w-full">
            <span className="text-[10px] sm:text-xs text-slate-500 dark:text-slate-400 block truncate leading-tight">Площа</span>
            <p className="text-sm sm:text-lg font-bold text-slate-900 dark:text-white font-mono leading-none mt-0.5 truncate">{totalArea} м²</p>
          </div>
        </div>
      </div>
    </div>
  );
};
