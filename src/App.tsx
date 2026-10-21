import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Ruler, 
  Calculator, 
  Settings, 
  Plus, 
  Smartphone,
  Printer,
  Sun,
  Moon,
  Monitor,
  LayoutDashboard
} from 'lucide-react';
import { 
  Client, 
  ObjectProject, 
  RoomMeasurement, 
  MasterPriceList, 
  MaterialType, 
  CeilingComplexity, 
  ProfileType, 
  RoomOptions,
  MasterProfile 
} from './types/database';
import { AppStorage } from './db/storage';
import { MasterDashboard } from './components/MasterDashboard';
import { ClientObjectManager } from './components/ClientObjectManager';
import { MeasurementEditor } from './components/MeasurementEditor';
import { CalculatorModule } from './components/CalculatorModule';
import { PriceListSettings } from './components/PriceListSettings';
import { PWAInstallBanner } from './components/PWAInstallBanner';
import { OfflineIndicator } from './components/OfflineIndicator';
import { NewMeasurementModal } from './components/NewMeasurementModal';
import { PrintEstimateModal } from './components/PrintEstimateModal';
import { usePWAInstall } from './hooks/usePWAInstall';
import { useTheme } from './hooks/useTheme';
import { Locale, TRANSLATIONS, getInitialLocale, saveLocale } from './i18n/translations';

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'objects' | 'measurements' | 'calculator' | 'settings'>('dashboard');
  
  // Theme state ('light' | 'dark' | 'system')
  const { theme, setTheme } = useTheme();

  // Multilingual state (Default: Ukraine / 'uk')
  const [locale, setLocale] = useState<Locale>(getInitialLocale());
  const t = TRANSLATIONS[locale] || TRANSLATIONS.uk;
  const currencySymbol = t.currency || '₴';

  // Data states
  const [clients, setClients] = useState<Client[]>([]);
  const [objects, setObjects] = useState<ObjectProject[]>([]);
  const [measurements, setMeasurements] = useState<RoomMeasurement[]>([]);
  const [priceList, setPriceList] = useState<MasterPriceList>(AppStorage.getPriceList());
  const [masterProfile, setMasterProfile] = useState<MasterProfile>(AppStorage.getMasterProfile());

  // Measurement editor modal/subscreen state
  const [isEditingMeasurement, setIsEditingMeasurement] = useState<boolean>(false);
  const [currentEditingMeasurement, setCurrentEditingMeasurement] = useState<Partial<RoomMeasurement> | null>(null);
  const [targetObjectId, setTargetObjectId] = useState<string>('');

  // New Measurement object selection/creation modal
  const [isNewMeasurementModalOpen, setIsNewMeasurementModalOpen] = useState<boolean>(false);

  // Standalone Print/PDF modal
  const [printMeasurement, setPrintMeasurement] = useState<RoomMeasurement | null>(null);

  const { isInstallable, install } = usePWAInstall();

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = () => {
    setClients(AppStorage.getClients());
    setObjects(AppStorage.getObjects());
    setMeasurements(AppStorage.getMeasurements());
    setPriceList(AppStorage.getPriceList());
    setMasterProfile(AppStorage.getMasterProfile());
  };

  const handleLanguageChange = (newLocale: Locale) => {
    setLocale(newLocale);
    saveLocale(newLocale);
  };

  // Client handlers
  const handleSaveClient = (client: Client) => {
    AppStorage.saveClient(client);
    refreshData();
  };

  const handleDeleteClient = (id: string) => {
    AppStorage.deleteClient(id);
    refreshData();
  };

  // Object handlers
  const handleSaveObject = (object: ObjectProject) => {
    AppStorage.saveObject(object);
    refreshData();
  };

  const handleDeleteObject = (id: string) => {
    AppStorage.deleteObject(id);
    refreshData();
  };

  // Measurement handlers
  const handleStartNewMeasurement = (objectId?: string) => {
    if (objectId) {
      setTargetObjectId(objectId);
      setCurrentEditingMeasurement(null);
      setIsEditingMeasurement(true);
      setActiveTab('measurements');
    } else {
      setIsNewMeasurementModalOpen(true);
    }
  };

  const handleCreateNewObjectAndMeasure = (data: {
    client: { name: string; phone: string; address?: string };
    object: { address: string; roomType: string; measureDate: string; notes?: string };
  }) => {
    const newClientId = `cli-${Date.now()}`;
    const newClient: Client = {
      id: newClientId,
      name: data.client.name,
      phone: data.client.phone,
      address: data.client.address || '',
      email: '',
      notes: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    AppStorage.saveClient(newClient);

    const newObjectId = `obj-${Date.now()}`;
    const newObject: ObjectProject = {
      id: newObjectId,
      clientId: newClientId,
      address: data.object.address,
      roomType: data.object.roomType,
      measureDate: data.object.measureDate,
      status: 'measurement',
      prepayment: 0,
      notes: data.object.notes || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    AppStorage.saveObject(newObject);

    refreshData();
    setTargetObjectId(newObjectId);
    setCurrentEditingMeasurement(null);
    setIsEditingMeasurement(true);
    setActiveTab('measurements');
  };

  const handleSelectObjectFromModal = (objId: string) => {
    setTargetObjectId(objId);
    setCurrentEditingMeasurement(null);
    setIsEditingMeasurement(true);
    setActiveTab('measurements');
  };

  const handleEditMeasurement = (meas: RoomMeasurement) => {
    setTargetObjectId(meas.objectId);
    setCurrentEditingMeasurement(meas);
    setIsEditingMeasurement(true);
    setActiveTab('measurements');
  };

  const handleSaveMeasurement = (measurement: RoomMeasurement) => {
    AppStorage.saveMeasurement(measurement);
    setIsEditingMeasurement(false);
    setCurrentEditingMeasurement(null);
    refreshData();
  };

  const handleDeleteMeasurement = (id: string) => {
    AppStorage.deleteMeasurement(id);
    refreshData();
  };

  // Price list handlers
  const handleSavePriceList = (newPriceList: MasterPriceList) => {
    AppStorage.savePriceList(newPriceList);
    setPriceList(newPriceList);
  };

  const handleSaveMasterProfile = (newProfile: MasterProfile) => {
    AppStorage.saveMasterProfile(newProfile);
    setMasterProfile(newProfile);
  };

  const handleResetData = () => {
    AppStorage.resetToDemoData();
    refreshData();
  };

  const handleSaveFromCalculator = (data: {
    objectId: string;
    roomName: string;
    area: number;
    perimeter: number;
    materialType: MaterialType;
    complexity: CeilingComplexity;
    profileType: ProfileType;
    options: RoomOptions;
  }) => {
    const newMeas: RoomMeasurement = {
      id: `meas-${Date.now()}`,
      objectId: data.objectId,
      name: data.roomName,
      shape: 'rectangle',
      length: Math.round(Math.sqrt(data.area * 1.3) * 10) / 10,
      width: Math.round((data.area / Math.sqrt(data.area * 1.3)) * 10) / 10,
      height: 2.7,
      area: data.area,
      perimeter: data.perimeter,
      cornersCount: 4,
      materialType: data.materialType,
      canvasBrand: 'MSD Premium',
      canvasColor: locale === 'en' ? 'White Matte (303)' : 'Білий матовий (303)',
      complexity: data.complexity,
      profileType: data.profileType,
      options: data.options,
      comments: locale === 'en' ? 'Added from quick calculator' : 'Додано з швидкого калькулятора',
      photos: [],
      costDetails: {
        canvasCost: 0,
        profileCost: 0,
        complexityCost: 0,
        optionsCost: 0,
        totalCost: 0,
      },
      updatedAt: new Date().toISOString(),
    };
    AppStorage.saveMeasurement(newMeas);
    refreshData();
  };

  const currentParentObject = objects.find((o) => o.id === targetObjectId);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white">
      {/* PWA In-App Install Banner */}
      <PWAInstallBanner />

      {/* Offline Status Badge */}
      <OfflineIndicator />

      {/* Top Application Bar */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur border-b border-slate-200 dark:border-slate-800/80 px-4 py-3 shadow-xs">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-base font-extrabold tracking-tight text-slate-900 dark:text-white leading-none">
                {locale === 'en' ? 'CEILING' : 'СТЕЛЯ'}<span className="text-cyan-600 dark:text-cyan-400">ПРО</span>
              </h1>
            </div>
            <p className="text-[10px] text-slate-600 dark:text-slate-400 mt-0.5 font-medium">{t.appSubtitle}</p>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2">
            {isInstallable && (
              <button
                type="button"
                onClick={install}
                className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-cyan-700 border border-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-cyan-400 dark:border-slate-700 text-xs font-semibold transition"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>{t.installApp}</span>
              </button>
            )}

            {/* Quick Theme Toggle */}
            <button
              type="button"
              onClick={() => {
                const nextTheme = theme === 'light' ? 'dark' : theme === 'dark' ? 'system' : 'light';
                setTheme(nextTheme);
              }}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-950 border border-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300 dark:hover:text-white dark:border-transparent transition flex items-center justify-center shadow-xs"
              title={`Тема: ${theme === 'light' ? t.themeLight : theme === 'dark' ? t.themeDark : t.themeSystem}`}
              aria-label="Перемикач теми"
            >
              {theme === 'light' ? (
                <Sun className="w-4 h-4 text-amber-500" />
              ) : theme === 'dark' ? (
                <Moon className="w-4 h-4 text-cyan-400" />
              ) : (
                <Monitor className="w-4 h-4 text-slate-500 dark:text-slate-300" />
              )}
            </button>

            <button
              type="button"
              onClick={() => handleStartNewMeasurement()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-md shadow-cyan-900/40 active:scale-95 transition"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden xs:inline">{t.newMeasurement}</span>
              <span className="xs:hidden">+Замір</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6">
        {activeTab === 'dashboard' && (
          <MasterDashboard
            objects={objects}
            clients={clients}
            measurements={measurements}
            currencySymbol={currencySymbol}
            t={t}
            locale={locale}
            onNavigateTab={(tab) => {
              setActiveTab(tab);
              if (tab !== 'measurements') {
                setIsEditingMeasurement(false);
              }
            }}
            onStartNewMeasurement={handleStartNewMeasurement}
            onSelectObject={(objId) => {
              setTargetObjectId(objId);
              setActiveTab('objects');
            }}
          />
        )}

        {activeTab === 'objects' && (
          <ClientObjectManager
            clients={clients}
            objects={objects}
            measurements={measurements}
            masterProfile={masterProfile}
            t={t}
            locale={locale}
            currencySymbol={currencySymbol}
            onSaveClient={handleSaveClient}
            onDeleteClient={handleDeleteClient}
            onSaveObject={handleSaveObject}
            onDeleteObject={handleDeleteObject}
            onSelectObjectForMeasurement={handleStartNewMeasurement}
            onEditMeasurement={handleEditMeasurement}
            onDeleteMeasurement={handleDeleteMeasurement}
            onOpenQuickCalculate={() => setActiveTab('calculator')}
          />
        )}

        {activeTab === 'measurements' && (
          <div>
            {isEditingMeasurement ? (
              <MeasurementEditor
                initialMeasurement={currentEditingMeasurement || undefined}
                objectId={targetObjectId || objects[0]?.id || ''}
                parentObject={currentParentObject}
                allObjects={objects}
                allClients={clients}
                priceList={priceList}
                t={t}
                locale={locale}
                currencySymbol={currencySymbol}
                onSave={handleSaveMeasurement}
                onCancel={() => {
                  setIsEditingMeasurement(false);
                  setCurrentEditingMeasurement(null);
                }}
              />
            ) : (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-900 border border-slate-800 p-4 rounded-2xl">
                  <div>
                    <h2 className="text-base font-bold text-white">{t.tabMeasurements}</h2>
                    <p className="text-xs text-slate-400">
                      Сенсорні креслення пальцем, діагоналі, площа, периметр, фотографії та чистий друк кошторису
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleStartNewMeasurement()}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md transition"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{t.newMeasurement}</span>
                  </button>
                </div>

                {measurements.length === 0 ? (
                  <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-10 text-center space-y-3">
                    <Ruler className="w-10 h-10 text-slate-600 mx-auto" />
                    <p className="text-sm font-semibold text-slate-300">Замірів поки немає</p>
                    <button
                      type="button"
                      onClick={() => handleStartNewMeasurement()}
                      className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-600 text-white text-xs font-bold"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{t.newMeasurement}</span>
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {measurements.map((meas) => {
                      const parentObj = objects.find((o) => o.id === meas.objectId);
                      return (
                        <div
                          key={meas.id}
                          className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl p-4 flex flex-col justify-between shadow-sm transition group"
                        >
                          <div>
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div>
                                <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition">
                                  {meas.name}
                                </h3>
                                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                  {parentObj?.address || 'Об’єкт'}
                                </div>
                              </div>
                              <span className="text-xs font-black font-mono text-cyan-700 dark:text-cyan-300">
                                {meas.costDetails?.totalCost?.toLocaleString('uk-UA')} {currencySymbol}
                              </span>
                            </div>

                            <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-200 dark:border-slate-800/80 my-2 text-center text-xs">
                              <div className="bg-slate-100 dark:bg-slate-950 p-1.5 rounded-lg border border-slate-200 dark:border-slate-800">
                                <span className="text-[10px] text-slate-500 dark:text-slate-400 block">{t.area}</span>
                                <strong className="font-mono text-slate-900 dark:text-white">{meas.area} м²</strong>
                              </div>
                              <div className="bg-slate-100 dark:bg-slate-950 p-1.5 rounded-lg border border-slate-200 dark:border-slate-800">
                                <span className="text-[10px] text-slate-500 dark:text-slate-400 block">{t.perimeter}</span>
                                <strong className="font-mono text-slate-900 dark:text-white">{meas.perimeter} м</strong>
                              </div>
                              <div className="bg-slate-100 dark:bg-slate-950 p-1.5 rounded-lg border border-slate-200 dark:border-slate-800">
                                <span className="text-[10px] text-slate-500 dark:text-slate-400 block">{t.height}</span>
                                <strong className="font-mono text-slate-900 dark:text-white">{meas.height} м</strong>
                              </div>
                            </div>

                            <div className="text-[11px] space-y-1 text-slate-700 dark:text-slate-300 mt-2">
                              <div>
                                <span className="text-slate-500 dark:text-slate-400">Полотно:</span> {meas.canvasBrand}
                              </div>
                              {meas.comments && (
                                <p className="text-[10px] text-slate-700 dark:text-slate-400 italic line-clamp-2 bg-slate-100 dark:bg-slate-950 p-2 rounded-lg border border-slate-200 dark:border-slate-800/60 mt-1">
                                  "{meas.comments}"
                                </p>
                              )}
                              {meas.photos && meas.photos.length > 0 && (
                                <div className="text-[10px] text-cyan-700 dark:text-cyan-400 font-semibold pt-1">
                                  📷 Фото: {meas.photos.length}
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center justify-between gap-1.5 mt-4 pt-3 border-t border-slate-800">
                            <button
                              type="button"
                              onClick={() => handleEditMeasurement(meas)}
                              className="flex-1 py-1.5 rounded-lg bg-cyan-600/90 hover:bg-cyan-600 text-white text-xs font-semibold transition"
                            >
                              Відкрити замір
                            </button>
                            <button
                              type="button"
                              onClick={() => setPrintMeasurement(meas)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 hover:text-white transition"
                              title="Друк / PDF"
                            >
                              <Printer className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm(`Видалити замір "${meas.name}"?`)) {
                                  handleDeleteMeasurement(meas.id);
                                }
                              }}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-950 text-slate-400 hover:text-red-400 transition"
                              title="Видалити"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'calculator' && (
          <CalculatorModule
            priceList={priceList}
            t={t}
            locale={locale}
            currencySymbol={currencySymbol}
            objects={objects}
            clients={clients}
            onSaveToProject={handleSaveFromCalculator}
          />
        )}

        {activeTab === 'settings' && (
          <PriceListSettings
            priceList={priceList}
            masterProfile={masterProfile}
            t={t}
            locale={locale}
            currencySymbol={currencySymbol}
            theme={theme}
            onChangeTheme={setTheme}
            onChangeLocale={handleLanguageChange}
            onSavePriceList={handleSavePriceList}
            onSaveMasterProfile={handleSaveMasterProfile}
            onResetData={handleResetData}
          />
        )}
      </main>

      {/* Bottom Navigation Bar */}
      <nav className="sticky bottom-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 px-2 py-2 shadow-sm">
        <div className="max-w-lg mx-auto grid grid-cols-5 gap-1">
          {[
            { id: 'dashboard', label: t.tabDashboard || 'Панель', icon: LayoutDashboard },
            { id: 'objects', label: t.tabObjects, icon: Building2 },
            { id: 'measurements', label: t.tabMeasurements, icon: Ruler },
            { id: 'calculator', label: t.tabCalculator, icon: Calculator },
            { id: 'settings', label: t.tabSettings, icon: Settings },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setActiveTab(item.id as any);
                  if (item.id !== 'measurements') {
                    setIsEditingMeasurement(false);
                  }
                }}
                className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition ${
                  isActive
                    ? 'text-cyan-700 dark:text-cyan-400 font-bold bg-cyan-100 dark:bg-cyan-950/50 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                <Icon className={`w-5 h-5 mb-1 ${isActive ? 'text-cyan-700 dark:text-cyan-400 scale-110' : 'text-slate-500 dark:text-slate-400'} transition`} />
                <span className="text-[10px] leading-none text-center truncate w-full">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* New Measurement Object Selection / Creation Modal */}
      {isNewMeasurementModalOpen && (
        <NewMeasurementModal
          isOpen={isNewMeasurementModalOpen}
          onClose={() => setIsNewMeasurementModalOpen(false)}
          objects={objects}
          clients={clients}
          onSelectObject={handleSelectObjectFromModal}
          onCreateNewObjectAndMeasure={handleCreateNewObjectAndMeasure}
          t={t}
          locale={locale}
        />
      )}

      {/* Standalone Print / PDF Modal */}
      {printMeasurement && (
        <PrintEstimateModal
          isOpen={!!printMeasurement}
          onClose={() => setPrintMeasurement(null)}
          measurement={printMeasurement}
          parentObject={objects.find((o) => o.id === printMeasurement.objectId)}
          client={clients.find((c) => c.id === objects.find((o) => o.id === printMeasurement.objectId)?.clientId)}
          masterProfile={masterProfile}
          priceList={priceList}
          currencySymbol={currencySymbol}
          t={t}
          locale={locale}
        />
      )}
    </div>
  );
}
