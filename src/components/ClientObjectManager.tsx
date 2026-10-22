import React, { useState } from 'react';
import { 
  Building2, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar, 
  Plus, 
  Edit3, 
  Trash2, 
  Clock, 
  CheckCircle2, 
  DollarSign, 
  FileText, 
  Search, 
  Layers, 
  X,
  MessageCircle,
  ExternalLink,
  ShieldCheck,
  Navigation as NavigationIcon,
  Contact2,
  Download,
  Printer,
  ArrowLeft,
  ChevronRight
} from 'lucide-react';
import { 
  Client, 
  ObjectProject, 
  RoomMeasurement, 
  OrderStatus 
} from '../types/database';
import { exportClientToContacts, exportAllClientsToContacts } from '../utils/contacts';
import { getGoogleMapsUrl, getWazeUrl } from '../utils/navigation';
import { PrintEstimateModal } from './PrintEstimateModal';
import { Translations, Locale } from '../i18n/translations';

import { MasterProfile } from '../types/database';

interface ClientObjectManagerProps {
  clients: Client[];
  objects: ObjectProject[];
  measurements: RoomMeasurement[];
  t: Translations;
  locale: Locale;
  currencySymbol: string;
  selectedObjectId?: string | null;
  onSelectObjectId?: (id: string | null) => void;
  masterProfile?: MasterProfile;
  onSaveClient: (client: Client) => void;
  onDeleteClient: (id: string) => void;
  onSaveObject: (object: ObjectProject) => void;
  onDeleteObject: (id: string) => void;
  onSelectObjectForMeasurement: (objectId: string) => void;
  onEditMeasurement: (measurement: RoomMeasurement) => void;
  onDeleteMeasurement: (id: string) => void;
  onOpenQuickCalculate: () => void;
}

export const ClientObjectManager: React.FC<ClientObjectManagerProps> = ({
  clients,
  objects,
  measurements,
  t,
  locale,
  currencySymbol,
  selectedObjectId,
  onSelectObjectId,
  masterProfile,
  onSaveClient,
  onDeleteClient,
  onSaveObject,
  onDeleteObject,
  onSelectObjectForMeasurement,
  onEditMeasurement,
  onDeleteMeasurement,
}) => {
  const [activeTab, setActiveTab] = useState<'objects' | 'clients'>('objects');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Compact vs Detail view state
  const [internalSelectedObjId, setInternalSelectedObjId] = useState<string | null>(null);
  const activeSelectedObjectId = selectedObjectId !== undefined ? selectedObjectId : internalSelectedObjId;
  const handleSelectObject = (id: string | null) => {
    setInternalSelectedObjId(id);
    if (onSelectObjectId) onSelectObjectId(id);
  };

  // Modals state
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Partial<Client> | null>(null);

  const [isObjectModalOpen, setIsObjectModalOpen] = useState(false);
  const [editingObject, setEditingObject] = useState<Partial<ObjectProject> | null>(null);
  const [printMeasurement, setPrintMeasurement] = useState<RoomMeasurement | null>(null);
  const [printObjectModal, setPrintObjectModal] = useState<ObjectProject | null>(null);

  // Client form states
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientAddress, setClientAddress] = useState('');
  const [clientNotes, setClientNotes] = useState('');

  // Object form states
  const [objClientId, setObjClientId] = useState('');
  const [objAddress, setObjAddress] = useState('');
  const [objRoomType, setObjRoomType] = useState('Квартира');
  const [objMeasureDate, setObjMeasureDate] = useState(new Date().toISOString().split('T')[0]);
  const [objInstallDate, setObjInstallDate] = useState('');
  const [objStatus, setObjStatus] = useState<OrderStatus>('measurement');
  const [objPrepayment, setObjPrepayment] = useState<number>(0);
  const [objNotes, setObjNotes] = useState('');

  const statusConfig: Record<OrderStatus, { label: string; bg: string; text: string; icon: any }> = {
    measurement: { 
      label: t.statusMeasurement, 
      bg: 'bg-amber-100 dark:bg-amber-950/50 border-amber-300 dark:border-amber-800', 
      text: 'text-amber-800 dark:text-amber-400', 
      icon: Clock 
    },
    calculation: { 
      label: t.statusCalculation, 
      bg: 'bg-blue-100 dark:bg-blue-950/50 border-blue-300 dark:border-blue-800', 
      text: 'text-blue-800 dark:text-blue-400', 
      icon: FileText 
    },
    approved: { 
      label: t.statusApproved, 
      bg: 'bg-indigo-100 dark:bg-indigo-950/50 border-indigo-300 dark:border-indigo-800', 
      text: 'text-indigo-800 dark:text-indigo-400', 
      icon: CheckCircle2 
    },
    in_progress: { 
      label: t.statusInProgress, 
      bg: 'bg-cyan-100 dark:bg-cyan-950/50 border-cyan-300 dark:border-cyan-800', 
      text: 'text-cyan-800 dark:text-cyan-400', 
      icon: Building2 
    },
    completed: { 
      label: t.statusCompleted, 
      bg: 'bg-emerald-100 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-800', 
      text: 'text-emerald-800 dark:text-emerald-400', 
      icon: ShieldCheck 
    },
    paid: { 
      label: t.statusPaid, 
      bg: 'bg-green-100 dark:bg-green-950/50 border-green-300 dark:border-green-800', 
      text: 'text-green-800 dark:text-green-400', 
      icon: DollarSign 
    },
    cancelled: {
      label: t.statusCancelled,
      bg: 'bg-rose-100 dark:bg-rose-950/50 border-rose-300 dark:border-rose-800',
      text: 'text-rose-800 dark:text-rose-400',
      icon: X
    },
  };

  const openNewClientModal = () => {
    setEditingClient(null);
    setClientName('');
    setClientPhone('');
    setClientEmail('');
    setClientAddress('');
    setClientNotes('');
    setIsClientModalOpen(true);
  };

  const openEditClientModal = (c: Client) => {
    setEditingClient(c);
    setClientName(c.name);
    setClientPhone(c.phone);
    setClientEmail(c.email || '');
    setClientAddress(c.address);
    setClientNotes(c.notes || '');
    setIsClientModalOpen(true);
  };

  const handleSaveClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !clientPhone.trim()) return;

    const saved: Client = {
      id: editingClient?.id || `cli-${Date.now()}`,
      name: clientName.trim(),
      phone: clientPhone.trim(),
      email: clientEmail.trim() || undefined,
      address: clientAddress.trim(),
      notes: clientNotes.trim() || undefined,
      createdAt: editingClient?.createdAt || new Date().toISOString(),
    };

    onSaveClient(saved);
    setIsClientModalOpen(false);
  };

  const openNewObjectModal = (preselectedClientId?: string) => {
    setEditingObject(null);
    setObjClientId(preselectedClientId || clients[0]?.id || '');
    setObjAddress('');
    setObjRoomType('Квартира');
    setObjMeasureDate(new Date().toISOString().split('T')[0]);
    setObjInstallDate('');
    setObjStatus('measurement');
    setObjPrepayment(0);
    setObjNotes('');
    setIsObjectModalOpen(true);
  };

  const openEditObjectModal = (obj: ObjectProject) => {
    setEditingObject(obj);
    setObjClientId(obj.clientId);
    setObjAddress(obj.address);
    setObjRoomType(obj.roomType);
    setObjMeasureDate(obj.measureDate);
    setObjInstallDate(obj.installDate || '');
    setObjStatus(obj.status);
    setObjPrepayment(obj.prepayment || 0);
    setObjNotes(obj.notes || '');
    setIsObjectModalOpen(true);
  };

  const handleSaveObject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!objAddress.trim() || !objClientId) return;

    const saved: ObjectProject = {
      id: editingObject?.id || `obj-${Date.now()}`,
      clientId: objClientId,
      address: objAddress.trim(),
      roomType: objRoomType,
      measureDate: objMeasureDate,
      installDate: objInstallDate || undefined,
      status: objStatus,
      prepayment: Number(objPrepayment) || 0,
      notes: objNotes.trim() || undefined,
      createdAt: editingObject?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSaveObject(saved);
    setIsObjectModalOpen(false);
  };

  const filteredObjects = objects.filter((obj) => {
    const matchesStatus = statusFilter === 'all' || obj.status === statusFilter;
    const client = clients.find((c) => c.id === obj.clientId);
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      obj.address.toLowerCase().includes(searchLower) ||
      obj.roomType.toLowerCase().includes(searchLower) ||
      (client && client.name.toLowerCase().includes(searchLower)) ||
      (client && client.phone.includes(searchQuery));
    return matchesStatus && matchesSearch;
  });

  const filteredClients = clients.filter((c) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      !searchQuery ||
      c.name.toLowerCase().includes(searchLower) ||
      c.phone.includes(searchQuery) ||
      (c.email && c.email.toLowerCase().includes(searchLower)) ||
      c.address.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-5 pb-24">
      {/* Top Switcher & Action Buttons */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex rounded-xl bg-slate-100 dark:bg-slate-900 p-1 border border-slate-200 dark:border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab('objects')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 ${
              activeTab === 'objects'
                ? 'bg-cyan-600 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>{t.tabObjects} ({objects.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('clients')}
            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-2 ${
              activeTab === 'clients'
                ? 'bg-cyan-600 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Клієнти ({clients.length})</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'objects' ? (
            <button
              type="button"
              onClick={() => openNewObjectModal()}
              className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs shadow-md shadow-cyan-950 transition active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>{t.newObject}</span>
            </button>
          ) : (
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => exportAllClientsToContacts(clients, objects)}
                className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-cyan-300 font-semibold text-xs border border-slate-700 transition active:scale-95"
                title="Експорт усіх контактів в один файл .vcf для швидкого збереження в телефоні"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">{t.exportAllContacts}</span>
                <span className="xs:hidden">.vcf всі</span>
              </button>

              <button
                type="button"
                onClick={openNewClientModal}
                className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-semibold text-xs shadow-md shadow-cyan-950 transition active:scale-95"
              >
                <Plus className="w-4 h-4" />
                <span>{t.newClient}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t.search}
            className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-cyan-500 shadow-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-700 dark:hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {activeTab === 'objects' && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition shadow-sm ${
                statusFilter === 'all'
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                  : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:border-slate-800'
              }`}
            >
              {t.statusAll} ({objects.length})
            </button>
            {Object.entries(statusConfig).map(([stKey, cfg]) => {
              const count = objects.filter((o) => o.status === stKey).length;
              const isSelected = statusFilter === stKey;
              return (
                <button
                  key={stKey}
                  type="button"
                  onClick={() => setStatusFilter(stKey)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition flex items-center gap-1.5 shadow-sm ${
                    isSelected
                      ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                      : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:border-slate-800'
                  }`}
                >
                  <span>{cfg.label}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-semibold ${isSelected ? 'bg-white/25 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Objects Tab */}
      {activeTab === 'objects' && (
        <div className="space-y-4">
          {/* CASE 1: AN OBJECT IS SELECTED -> SHOW DETAILED VIEW */}
          {(() => {
            const activeObj = activeSelectedObjectId ? objects.find((o) => o.id === activeSelectedObjectId) : null;

            if (activeObj) {
              const client = clients.find((c) => c.id === activeObj.clientId);
              const objMeasurements = measurements.filter((m) => m.objectId === activeObj.id);
              const totalArea = Math.round(objMeasurements.reduce((acc, m) => acc + (m.area || 0), 0) * 100) / 100;
              const totalCost = objMeasurements.reduce((acc, m) => acc + (m.costDetails?.totalCost || 0), 0);
              const statusCfg = statusConfig[activeObj.status] || statusConfig.measurement;
              const StatusIcon = statusCfg.icon;

              const googleMapsLink = getGoogleMapsUrl(activeObj.address);
              const wazeLink = getWazeUrl(activeObj.address);

              return (
                <div className="space-y-4 animate-fadeIn">
                  {/* Top Bar with Back Button */}
                  <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
                    <button
                      type="button"
                      onClick={() => handleSelectObject(null)}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>← Всі об'єкти</span>
                    </button>

                    <div className="flex items-center gap-2">
                      {/* Status Dropdown */}
                      <select
                        value={activeObj.status}
                        onChange={(e) => {
                          onSaveObject({
                            ...activeObj,
                            status: e.target.value as OrderStatus,
                            updatedAt: new Date().toISOString(),
                          });
                        }}
                        className={`text-xs font-bold px-3 py-1.5 rounded-xl border outline-none cursor-pointer ${statusCfg.bg} ${statusCfg.text}`}
                      >
                        <option value="measurement">{t.statusMeasurement}</option>
                        <option value="approved">{t.statusApproved}</option>
                        <option value="in_progress">{t.statusInProgress}</option>
                        <option value="completed">{t.statusCompleted}</option>
                        <option value="cancelled">{t.statusCancelled}</option>
                      </select>

                      <button
                        type="button"
                        onClick={() => openEditObjectModal(activeObj)}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition"
                        title="Редагувати об’єкт"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          if (confirm('Видалити об’єкт та всі його заміри?')) {
                            onDeleteObject(activeObj.id);
                            handleSelectObject(null);
                          }
                        }}
                        className="p-2 rounded-xl bg-slate-100 hover:bg-red-100 text-slate-400 hover:text-red-600 dark:bg-slate-800 dark:hover:bg-red-950 dark:hover:text-red-400 transition"
                        title="Видалити об’єкт"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Main Object Header Card */}
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="text-xs font-bold px-2 py-0.5 rounded bg-cyan-100 dark:bg-cyan-950 text-cyan-800 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800">
                            {activeObj.roomType}
                          </span>
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            Замір: <strong>{activeObj.measureDate}</strong>
                          </span>
                          {activeObj.installDate && (
                            <span className="text-xs text-blue-600 dark:text-blue-400">
                              Монтаж: <strong>{activeObj.installDate}</strong>
                            </span>
                          )}
                        </div>

                        <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                          <MapPin className="w-5 h-5 text-cyan-600 dark:text-cyan-400 shrink-0" />
                          <span>{activeObj.address}</span>
                        </h2>

                        {/* Navigation links */}
                        <div className="flex items-center gap-2 mt-2">
                          <a
                            href={googleMapsLink}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/80 dark:hover:bg-blue-900 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300 text-xs font-semibold transition"
                          >
                            <NavigationIcon className="w-3.5 h-3.5" />
                            <span>Google Maps</span>
                          </a>
                          <a
                            href={wazeLink}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-50 hover:bg-cyan-100 dark:bg-cyan-950/80 dark:hover:bg-cyan-900 border border-cyan-200 dark:border-cyan-800 text-cyan-800 dark:text-cyan-300 text-xs font-semibold transition"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Waze</span>
                          </a>
                        </div>
                      </div>

                      {/* Client Info & Contacts */}
                      {client && (
                        <div className="sm:text-right p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800/80 text-xs space-y-1.5 min-w-[220px]">
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">
                            Замовник
                          </span>
                          <p className="font-bold text-slate-900 dark:text-white text-sm">
                            {client.name}
                          </p>
                          <div className="flex flex-wrap sm:justify-end gap-1.5 pt-1">
                            <a
                              href={`tel:${client.phone}`}
                              className="px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold flex items-center gap-1 hover:bg-emerald-200 transition text-[11px]"
                              title="Зателефонувати"
                            >
                              <Phone className="w-3 h-3" />
                              <span>{client.phone}</span>
                            </a>
                            <a
                              href={`https://wa.me/${client.phone.replace(/[^0-9]/g, '')}`}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 dark:hover:bg-emerald-900 border border-emerald-200 dark:border-emerald-800 font-semibold transition text-[11px]"
                              title="WhatsApp"
                            >
                              WhatsApp
                            </a>
                            <a
                              href={`viber://chat?number=%2B${client.phone.replace(/[^0-9]/g, '')}`}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2 py-1 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 dark:bg-purple-950/70 dark:text-purple-300 dark:hover:bg-purple-900 border border-purple-200 dark:border-purple-800 font-semibold transition text-[11px]"
                              title="Viber"
                            >
                              Viber
                            </a>
                            <a
                              href={`https://t.me/+${client.phone.replace(/[^0-9]/g, '')}`}
                              target="_blank"
                              rel="noreferrer"
                              className="px-2 py-1 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-700 dark:bg-sky-950/70 dark:text-sky-300 dark:hover:bg-sky-900 border border-sky-200 dark:border-sky-800 font-semibold transition text-[11px]"
                              title="Telegram"
                            >
                              Telegram
                            </a>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Financial Summary Strip */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950">
                        <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Кімнат / Замірів</span>
                        <p className="text-base font-bold text-slate-900 dark:text-white font-mono">{objMeasurements.length}</p>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950">
                        <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Загальна площа</span>
                        <p className="text-base font-bold text-slate-900 dark:text-white font-mono">{totalArea} м²</p>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950">
                        <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Сума кошторису</span>
                        <p className="text-base font-bold text-cyan-600 dark:text-cyan-400 font-mono">
                          {totalCost.toLocaleString('uk-UA')} {currencySymbol}
                        </p>
                      </div>
                      <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950">
                        <span className="text-slate-500 dark:text-slate-400 block text-[11px]">Залишок до сплати</span>
                        <p className="text-base font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                          {Math.max(0, totalCost - (activeObj.prepayment || 0)).toLocaleString('uk-UA')} {currencySymbol}
                        </p>
                      </div>
                    </div>

                    {/* Big Action Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                      <button
                        type="button"
                        onClick={() => setPrintObjectModal(activeObj)}
                        disabled={objMeasurements.length === 0}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:hover:bg-white dark:text-slate-900 font-bold text-xs transition shadow-sm disabled:opacity-50 cursor-pointer"
                      >
                        <Printer className="w-4 h-4 text-cyan-400 dark:text-cyan-600" />
                        <span>Друк зведеного кошторису (всі кімнати: {objMeasurements.length})</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onSelectObjectForMeasurement(activeObj.id)}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition shadow-sm"
                      >
                        <Plus className="w-4 h-4" />
                        <span>+ Додати приміщення</span>
                      </button>
                    </div>
                  </div>

                  {/* Rooms (Measurements) List for this object */}
                  <div className="space-y-3">
                    <h3 className="text-sm font-extrabold text-slate-900 dark:text-white px-1 flex items-center gap-2">
                      <Layers className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                      <span>Приміщення та заміри цього об'єкта ({objMeasurements.length})</span>
                    </h3>

                    {objMeasurements.length === 0 ? (
                      <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 text-center space-y-2">
                        <Layers className="w-8 h-8 text-slate-400 mx-auto" />
                        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          У цьому об’єкті ще немає замірів
                        </p>
                        <button
                          type="button"
                          onClick={() => onSelectObjectForMeasurement(activeObj.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-600 text-white text-xs font-bold"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Почати замір першої кімнати</span>
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {objMeasurements.map((meas, measIdx) => (
                          <div
                            key={meas.id}
                            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col justify-between shadow-xs hover:border-cyan-300 dark:hover:border-cyan-700 transition"
                          >
                            <div className="flex items-start justify-between gap-2">
                              <div>
                                <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                                  <span>{measIdx + 1}. {meas.name || 'Приміщення'}</span>
                                  {meas.photos && meas.photos.length > 0 && (
                                    <span className="px-1.5 py-0.2 rounded bg-cyan-50 dark:bg-cyan-950 text-cyan-700 dark:text-cyan-400 text-[10px] font-mono">
                                      📷 {meas.photos.length}
                                    </span>
                                  )}
                                </h4>
                                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                  S = <strong>{meas.area} м²</strong> · P = {meas.perimeter} м · {meas.cornersCount || 4} кутів
                                </div>
                                <div className="text-[11px] text-cyan-700 dark:text-cyan-400 mt-0.5">
                                  {meas.canvasBrand || 'Полотно'} ({meas.canvasColor || 'Білий'})
                                </div>
                              </div>

                              <div className="text-right">
                                <span className="text-sm font-extrabold font-mono text-cyan-600 dark:text-cyan-400">
                                  {meas.costDetails?.totalCost?.toLocaleString('uk-UA')} {currencySymbol}
                                </span>
                              </div>
                            </div>

                            {meas.comments && (
                              <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-2 bg-slate-50 dark:bg-slate-950 p-2 rounded-lg border border-slate-100 dark:border-slate-800 line-clamp-2">
                                💬 {meas.comments}
                              </p>
                            )}

                            <div className="flex items-center justify-end gap-1.5 mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800">
                              <button
                                type="button"
                                onClick={() => setPrintMeasurement(meas)}
                                className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold transition flex items-center gap-1"
                                title="Друк окремо цієї кімнати"
                              >
                                <Printer className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                                <span>Друк кімнати</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => onEditMeasurement(meas)}
                                className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition flex items-center gap-1"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                                <span>{t.edit}</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  if (confirm(`Видалити замір "${meas.name}"?`)) {
                                    onDeleteMeasurement(meas.id);
                                  }
                                }}
                                className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 transition"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            }

            /* CASE 2: NO OBJECT IS SELECTED -> COMPACT CARDS LIST */
            return (
              <div className="space-y-3">
                {filteredObjects.length === 0 ? (
                  <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-10 text-center space-y-3 shadow-xs">
                    <Building2 className="w-10 h-10 text-slate-400 mx-auto" />
                    <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Об’єкти не знайдені</p>
                    <button
                      type="button"
                      onClick={() => openNewObjectModal()}
                      className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-600 text-white text-xs font-bold"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{t.newObject}</span>
                    </button>
                  </div>
                ) : (
                  filteredObjects.map((obj) => {
                    const client = clients.find((c) => c.id === obj.clientId);
                    const objMeasurements = measurements.filter((m) => m.objectId === obj.id);
                    const totalArea = Math.round(objMeasurements.reduce((acc, m) => acc + (m.area || 0), 0) * 10) / 10;
                    const totalCost = objMeasurements.reduce((acc, m) => acc + (m.costDetails?.totalCost || 0), 0);
                    const statusCfg = statusConfig[obj.status] || statusConfig.measurement;
                    const StatusIcon = statusCfg.icon;

                    return (
                      <div
                        key={obj.id}
                        onClick={() => handleSelectObject(obj.id)}
                        className="group bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-cyan-400 dark:hover:border-cyan-600 rounded-2xl p-4 shadow-xs hover:shadow-md transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        {/* Left: Address & Client */}
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border flex items-center gap-1 ${statusCfg.bg} ${statusCfg.text}`}>
                              <StatusIcon className="w-3 h-3" />
                              <span>{statusCfg.label}</span>
                            </span>
                            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                              {obj.roomType}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              · Замір: {obj.measureDate}
                            </span>
                          </div>

                          <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition-colors">
                            <MapPin className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
                            <span>{obj.address}</span>
                          </h3>

                          {client && (
                            <p className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                              <User className="w-3 h-3 text-slate-400" />
                              <span>{client.name}</span>
                              <span className="text-slate-300 dark:text-slate-600">·</span>
                              <span className="text-cyan-700 dark:text-cyan-400 font-mono">{client.phone}</span>
                            </p>
                          )}
                        </div>

                        {/* Right: Metrics & Arrow CTA */}
                        <div className="flex items-center justify-between sm:justify-end gap-4 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                          <div className="text-left sm:text-right">
                            <div className="text-sm font-extrabold font-mono text-slate-900 dark:text-white">
                              {totalCost.toLocaleString('uk-UA')} {currencySymbol}
                            </div>
                            <div className="text-[11px] text-slate-500 font-mono">
                              {objMeasurements.length} кімн. · {totalArea} м²
                            </div>
                          </div>

                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectObject(obj.id);
                              }}
                              className="px-3 py-1.5 rounded-xl bg-slate-100 group-hover:bg-cyan-600 group-hover:text-white text-slate-700 dark:bg-slate-800 dark:text-slate-200 text-xs font-bold transition flex items-center gap-1"
                            >
                              <span>Деталі</span>
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            );
          })()}
        </div>
      )}

      {/* Clients Tab */}
      {activeTab === 'clients' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredClients.length === 0 ? (
            <div className="col-span-full bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 rounded-2xl p-10 text-center space-y-3 shadow-xs">
              <User className="w-10 h-10 text-slate-400 dark:text-slate-600 mx-auto" />
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Клієнти не знайдені</p>
              <button
                type="button"
                onClick={openNewClientModal}
                className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-md transition"
              >
                <Plus className="w-4 h-4" />
                <span>{t.newClient}</span>
              </button>
            </div>
          ) : (
            filteredClients.map((client) => {
              const clientObjects = objects.filter((o) => o.clientId === client.id);
              const cleanPhone = client.phone.replace(/[^0-9]/g, '');
              return (
                <div
                  key={client.id}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 flex flex-col justify-between shadow-xs hover:border-cyan-400 dark:hover:border-slate-700 transition"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-full bg-cyan-50 dark:bg-cyan-950 border border-cyan-200 dark:border-cyan-800 flex items-center justify-center text-cyan-700 dark:text-cyan-400 font-bold text-sm">
                          {client.name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white">{client.name}</h3>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400">
                            Об’єктів у роботі: {clientObjects.length}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => openEditClientModal(client)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition"
                          title={t.edit}
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Видалити клієнта "${client.name}"?`)) {
                              onDeleteClient(client.id);
                            }
                          }}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-red-50 dark:bg-slate-800 dark:hover:bg-red-950 text-slate-400 hover:text-red-500 transition"
                          title={t.delete}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2 text-xs text-slate-700 dark:text-slate-300 pt-1">
                      {/* Phone and Call / WhatsApp / Viber / Telegram */}
                      <div className="flex flex-wrap items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <a href={`tel:${client.phone}`} className="text-cyan-600 dark:text-cyan-400 hover:underline font-bold mr-1">
                          {client.phone}
                        </a>
                        <a
                          href={`https://wa.me/${cleanPhone}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] px-2 py-0.5 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 dark:hover:bg-emerald-900 border border-emerald-200 dark:border-emerald-800 font-medium transition"
                          title="WhatsApp"
                        >
                          WhatsApp
                        </a>
                        <a
                          href={`viber://chat?number=%2B${cleanPhone}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] px-2 py-0.5 rounded bg-purple-50 hover:bg-purple-100 text-purple-700 dark:bg-purple-950/70 dark:text-purple-300 dark:hover:bg-purple-900 border border-purple-200 dark:border-purple-800 font-medium transition"
                          title="Viber"
                        >
                          Viber
                        </a>
                        <a
                          href={`https://t.me/+${cleanPhone}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] px-2 py-0.5 rounded bg-sky-50 hover:bg-sky-100 text-sky-700 dark:bg-sky-950/70 dark:text-sky-300 dark:hover:bg-sky-900 border border-sky-200 dark:border-sky-800 font-medium transition"
                          title="Telegram"
                        >
                          Telegram
                        </a>
                      </div>

                      {/* Android Contacts Sync Button */}
                      <div className="pt-1">
                        <button
                          type="button"
                          onClick={() => exportClientToContacts(client, objects)}
                          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-slate-50 hover:bg-cyan-50 dark:bg-slate-950 dark:hover:bg-slate-900 border border-slate-200 hover:border-cyan-400 dark:border-slate-800 dark:hover:border-cyan-600 text-cyan-700 dark:text-cyan-300 text-xs font-semibold shadow-xs transition active:scale-98"
                        >
                          <Contact2 className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                          <span>{t.saveToPhoneContacts}</span>
                        </button>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 block text-center mt-1">
                          При вхідному дзвінку на Android відобразиться ім’я клієнта
                        </span>
                      </div>

                      {client.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="w-3.5 h-3.5 text-slate-400" />
                          <a href={`mailto:${client.email}`} className="text-slate-600 dark:text-slate-300 hover:underline">
                            {client.email}
                          </a>
                        </div>
                      )}

                      <div className="flex items-start gap-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                        <span className="text-slate-600 dark:text-slate-400">{client.address || 'Адреса не вказана'}</span>
                      </div>

                      {client.notes && (
                        <div className="text-[11px] text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-950 p-2 rounded-lg border border-slate-200 dark:border-slate-800 mt-1">
                          {client.notes}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => openNewObjectModal(client.id)}
                      className="text-xs text-cyan-600 dark:text-cyan-400 hover:text-cyan-500 flex items-center gap-1 font-semibold"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>{t.newObject}</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Modal: Client */}
      {isClientModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <User className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                <span>{editingClient ? t.edit : t.newClient}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsClientModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveClient} className="p-4 space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">ПІБ клієнта *</label>
                <input
                  type="text"
                  required
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Шевченко Олексій"
                  className="w-full mt-1 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Номер телефону *</label>
                <input
                  type="tel"
                  required
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder="+380 (67) 000-00-00"
                  className="w-full mt-1 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Email</label>
                <input
                  type="email"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  placeholder="client@gmail.com"
                  className="w-full mt-1 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Основна адреса</label>
                <input
                  type="text"
                  value={clientAddress}
                  onChange={(e) => setClientAddress(e.target.value)}
                  placeholder="м. Київ, вул. Хрещатик, 15"
                  className="w-full mt-1 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Примітки по клієнту</label>
                <textarea
                  rows={2}
                  value={clientNotes}
                  onChange={(e) => setClientNotes(e.target.value)}
                  placeholder="Звідки прийшов, побажання, особливості..."
                  className="w-full mt-1 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsClientModalOpen(false)}
                  className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-md transition"
                >
                  {t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Object */}
      {isObjectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                <span>{editingObject ? t.edit : t.newObject}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsObjectModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveObject} className="p-4 space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Клієнт (замовник) *</label>
                <select
                  required
                  value={objClientId}
                  onChange={(e) => setObjClientId(e.target.value)}
                  className="w-full mt-1 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                >
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.phone})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Адреса об’єкта монтажу *</label>
                <input
                  type="text"
                  required
                  value={objAddress}
                  onChange={(e) => setObjAddress(e.target.value)}
                  placeholder="м. Київ, ЖК 'Нова Хвиля', кв. 45"
                  className="w-full mt-1 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Тип приміщення</label>
                  <select
                    value={objRoomType}
                    onChange={(e) => setObjRoomType(e.target.value)}
                    className="w-full mt-1 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                  >
                    <option value="1-кімнатна квартира">1-кімнатна квартира</option>
                    <option value="2-кімнатна квартира">2-кімнатна квартира</option>
                    <option value="3-кімнатна квартира">3-кімнатна квартира</option>
                    <option value="Студія (новобудова)">Студія (новобудова)</option>
                    <option value="Приватний будинок / Котедж">Приватний будинок / Котедж</option>
                    <option value="Офіс / Комерційне">Офіс / Комерційне</option>
                    <option value="Вторинне житло">Вторинне житло</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Статус замовлення</label>
                  <select
                    value={objStatus}
                    onChange={(e) => setObjStatus(e.target.value as OrderStatus)}
                    className="w-full mt-1 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-medium"
                  >
                    <option value="measurement">{t.statusMeasurement}</option>
                    <option value="calculation">{t.statusCalculation}</option>
                    <option value="approved">{t.statusApproved}</option>
                    <option value="in_progress">{t.statusInProgress}</option>
                    <option value="completed">{t.statusCompleted}</option>
                    <option value="paid">{t.statusPaid}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Дата заміру</label>
                  <input
                    type="date"
                    required
                    value={objMeasureDate}
                    onChange={(e) => setObjMeasureDate(e.target.value)}
                    className="w-full mt-1 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Дата установки (план)</label>
                  <input
                    type="date"
                    value={objInstallDate}
                    onChange={(e) => setObjInstallDate(e.target.value)}
                    className="w-full mt-1 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Внесений аванс ({currencySymbol})</label>
                <input
                  type="number"
                  value={objPrepayment || ''}
                  onChange={(e) => setObjPrepayment(parseFloat(e.target.value) || 0)}
                  placeholder="0"
                  className="w-full mt-1 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Примітки до об’єкта (поверх, домофон, ліфт, доступ)
                </label>
                <textarea
                  rows={2}
                  value={objNotes}
                  onChange={(e) => setObjNotes(e.target.value)}
                  placeholder="5 поверх, ліфт працює, код домофону 45K..."
                  className="w-full mt-1 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsObjectModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold shadow-md transition"
                >
                  {t.save}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Clean A4 Print & PDF Preview Modal (Single room or whole object) */}
      {printMeasurement && (
        <PrintEstimateModal
          isOpen={!!printMeasurement}
          onClose={() => setPrintMeasurement(null)}
          measurement={printMeasurement}
          measurements={measurements.filter((m) => m.objectId === printMeasurement.objectId)}
          parentObject={objects.find((o) => o.id === printMeasurement.objectId)}
          client={clients.find((c) => c.id === objects.find((o) => o.id === printMeasurement.objectId)?.clientId)}
          masterProfile={masterProfile}
          currencySymbol={currencySymbol}
          t={t}
          locale={locale}
        />
      )}

      {printObjectModal && (
        <PrintEstimateModal
          isOpen={!!printObjectModal}
          onClose={() => setPrintObjectModal(null)}
          measurements={measurements.filter((m) => m.objectId === printObjectModal.id)}
          parentObject={printObjectModal}
          client={clients.find((c) => c.id === printObjectModal.clientId)}
          masterProfile={masterProfile}
          currencySymbol={currencySymbol}
          t={t}
          locale={locale}
        />
      )}
    </div>
  );
};
