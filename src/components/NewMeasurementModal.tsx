import React, { useState } from 'react';
import { 
  Building2, 
  User, 
  Phone, 
  MapPin, 
  Plus, 
  X, 
  Check, 
  Calendar, 
  Search, 
  ChevronRight,
  ListFilter
} from 'lucide-react';
import { ObjectProject, Client } from '../types/database';
import { Translations, Locale } from '../i18n/translations';

interface NewMeasurementModalProps {
  isOpen: boolean;
  onClose: () => void;
  objects: ObjectProject[];
  clients: Client[];
  phoneCode?: string;
  onSelectObject: (objectId: string) => void;
  onCreateNewObjectAndMeasure: (data: {
    client: { name: string; phone: string; address?: string };
    object: { address: string; roomType: string; measureDate: string; notes?: string };
  }) => void;
  t: Translations;
  locale: Locale;
}

export const NewMeasurementModal: React.FC<NewMeasurementModalProps> = ({
  isOpen,
  onClose,
  objects,
  clients,
  phoneCode = '+380',
  onSelectObject,
  onCreateNewObjectAndMeasure,
  t,
}) => {
  const [activeMode, setActiveMode] = useState<'choose' | 'create'>(
    objects.length > 0 ? 'choose' : 'create'
  );

  // Choose existing via dropdown or list
  const [selectedObjId, setSelectedObjId] = useState<string>(objects[0]?.id || '');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Create new object
  const [clientSelectionMode, setClientSelectionMode] = useState<'existing' | 'new'>(
    clients.length > 0 ? 'existing' : 'new'
  );
  const [selectedExistingClientId, setSelectedExistingClientId] = useState<string>(clients[0]?.id || '');
  const [clientName, setClientName] = useState<string>('');
  const [clientPhone, setClientPhone] = useState<string>(phoneCode ? `${phoneCode} ` : '');

  React.useEffect(() => {
    if (isOpen && (clientSelectionMode === 'new' || clients.length === 0)) {
      if (!clientPhone || clientPhone.trim() === '') {
        setClientPhone(phoneCode ? `${phoneCode} ` : '');
      }
    }
  }, [isOpen, clientSelectionMode, phoneCode, clients.length]);
  const [objectAddress, setObjectAddress] = useState<string>('');
  const [roomType, setRoomType] = useState<string>('Квартира');
  const [measureDate, setMeasureDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  if (!isOpen) return null;

  const currentSelectedObject = objects.find((o) => o.id === selectedObjId);
  const currentSelectedClient = currentSelectedObject 
    ? clients.find((c) => c.id === currentSelectedObject.clientId)
    : undefined;

  const filteredObjects = objects.filter((obj) => {
    const client = clients.find((c) => c.id === obj.clientId);
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      obj.address.toLowerCase().includes(q) ||
      (client?.name && client.name.toLowerCase().includes(q)) ||
      (client?.phone && client.phone.includes(q))
    );
  });

  const handleConfirmExisting = () => {
    if (!selectedObjId) {
      setErrorMsg(t.selectObjectError);
      return;
    }
    onSelectObject(selectedObjId);
    onClose();
  };

  const handleCreateNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!objectAddress.trim()) {
      setErrorMsg(t.specifyAddressError);
      return;
    }

    let finalClientName = clientName.trim();
    let finalClientPhone = clientPhone.trim();

    if (clientSelectionMode === 'existing' && selectedExistingClientId) {
      const existingClient = clients.find((c) => c.id === selectedExistingClientId);
      if (existingClient) {
        finalClientName = existingClient.name;
        finalClientPhone = existingClient.phone;
      }
    }

    if (!finalClientName) {
      setErrorMsg(t.specifyClientError);
      return;
    }

    onCreateNewObjectAndMeasure({
      client: {
        name: finalClientName,
        phone: finalClientPhone,
        address: objectAddress.trim(),
      },
      object: {
        address: objectAddress.trim(),
        roomType,
        measureDate,
        notes: notes.trim(),
      },
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 w-full max-w-xl rounded-2xl p-5 sm:p-6 shadow-2xl space-y-4 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-cyan-100 dark:bg-cyan-950 border border-cyan-300 dark:border-cyan-800 text-cyan-700 dark:text-cyan-400 flex items-center justify-center">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white leading-tight">
                {t.newMeasurement}
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                {t.selectObjectFromListDesc}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex rounded-xl bg-slate-100 dark:bg-slate-950 p-1 border border-slate-200 dark:border-slate-800 shrink-0">
          <button
            type="button"
            onClick={() => {
              setActiveMode('choose');
              setErrorMsg('');
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${
              activeMode === 'choose'
                ? 'bg-cyan-600 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <ListFilter className="w-3.5 h-3.5" />
            <span>{t.chooseObject} ({objects.length})</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveMode('create');
              setErrorMsg('');
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${
              activeMode === 'create'
                ? 'bg-cyan-600 text-white shadow-md'
                : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{t.createNewObject}</span>
          </button>
        </div>

        {errorMsg && (
          <div className="p-2.5 rounded-xl bg-red-100 dark:bg-red-950/60 border border-red-300 dark:border-red-800 text-red-800 dark:text-red-300 text-xs shrink-0 font-medium">
            {errorMsg}
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {activeMode === 'choose' ? (
            <div className="space-y-4">
              {objects.length === 0 ? (
                <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-8 text-center space-y-3">
                  <Building2 className="w-10 h-10 text-slate-400 dark:text-slate-600 mx-auto" />
                  <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">У базі ще немає об’єктів</p>
                  <button
                    type="button"
                    onClick={() => setActiveMode('create')}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-cyan-600 text-white text-xs font-bold shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Створити перший об’єкт</span>
                  </button>
                </div>
              ) : (
                <>
                  {/* DROPDOWN SELECT LIST */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <ListFilter className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                        <span>Випадаючий список об’єктів:</span>
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">
                        Всього: {objects.length}
                      </span>
                    </label>

                    <select
                      value={selectedObjId}
                      onChange={(e) => {
                        setSelectedObjId(e.target.value);
                        setErrorMsg('');
                      }}
                      className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 focus:border-cyan-600 dark:focus:border-cyan-500 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white font-medium shadow-sm"
                    >
                      <option value="" disabled>-- Оберіть об'єкт зі списку --</option>
                      {objects.map((obj) => {
                        const cl = clients.find((c) => c.id === obj.clientId);
                        return (
                          <option key={obj.id} value={obj.id}>
                            📍 {obj.address} — 👤 {cl?.name || 'Клієнт'} {cl?.phone ? `(${cl.phone})` : ''} [{obj.roomType}]
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  {/* Highlight of Currently Selected Object */}
                  {currentSelectedObject && (
                    <div className="p-3.5 rounded-xl border border-cyan-400 dark:border-cyan-500/60 bg-cyan-50 dark:bg-cyan-950/30 space-y-2 shadow-sm">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="text-[10px] uppercase font-bold text-cyan-800 dark:text-cyan-400 tracking-wider">
                            Обраний об’єкт для заміру:
                          </div>
                          <div className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5 mt-0.5">
                            <MapPin className="w-4 h-4 text-cyan-600 dark:text-cyan-400 shrink-0" />
                            <span>{currentSelectedObject.address}</span>
                          </div>
                        </div>
                        <span className="text-[10px] bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
                          {currentSelectedObject.roomType}
                        </span>
                      </div>

                      <div className="text-xs text-slate-700 dark:text-slate-300 flex flex-wrap items-center gap-3 pt-1 border-t border-cyan-200 dark:border-cyan-900/40">
                        <span>Замовник: <strong className="text-slate-900 dark:text-white">{currentSelectedClient?.name || 'Клієнт'}</strong></span>
                        {currentSelectedClient?.phone && (
                          <span>Телефон: <strong className="font-mono text-cyan-700 dark:text-cyan-300">{currentSelectedClient.phone}</strong></span>
                        )}
                        {currentSelectedObject.measureDate && (
                          <span className="text-slate-500 dark:text-slate-400">Дата: {currentSelectedObject.measureDate}</span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Or search & pick from visual cards */}
                  <div className="space-y-2 pt-1">
                    <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 flex items-center justify-between">
                      <span>Або швидкий пошук по списку карток:</span>
                    </div>

                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Пошук за адресою, клієнтом чи телефоном..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-cyan-600 dark:focus:border-cyan-500 shadow-sm"
                      />
                    </div>

                    <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                      {filteredObjects.map((obj) => {
                        const client = clients.find((c) => c.id === obj.clientId);
                        const isSelected = selectedObjId === obj.id;
                        return (
                          <div
                            key={obj.id}
                            onClick={() => setSelectedObjId(obj.id)}
                            className={`p-2.5 rounded-xl border text-left cursor-pointer transition flex items-center justify-between gap-3 ${
                              isSelected
                                ? 'border-cyan-500 bg-cyan-50 text-slate-900 shadow-sm ring-1 ring-cyan-500 dark:bg-cyan-950/40 dark:text-white'
                                : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-800 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/60 dark:hover:border-slate-700 dark:text-slate-300 shadow-sm'
                            }`}
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5">
                                <MapPin className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 shrink-0" />
                                <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                  {obj.address}
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5 flex flex-wrap items-center gap-2">
                                <span>{client?.name || 'Клієнт'}</span>
                                {client?.phone && <span>• {client.phone}</span>}
                                <span className="text-[10px] bg-slate-100 px-1.5 py-0.2 rounded text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
                                  {obj.roomType}
                                </span>
                              </div>
                            </div>

                            <div className="shrink-0">
                              <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition ${
                                isSelected 
                                  ? 'border-cyan-500 bg-cyan-600 text-white' 
                                  : 'border-slate-300 bg-slate-100 text-transparent dark:border-slate-700 dark:bg-slate-900'
                              }`}>
                                {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            /* CREATE NEW OBJECT FORM */
            <form id="new-obj-form" onSubmit={handleCreateNew} className="space-y-3.5">
              {/* Client Selection (Choose Existing or Add New) */}
              {clients.length > 0 && (
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Клієнт (замовник):
                  </label>
                  <div className="flex gap-2 mb-2">
                    <button
                      type="button"
                      onClick={() => setClientSelectionMode('existing')}
                      className={`flex-1 py-1.5 text-xs rounded-lg border font-medium transition ${
                        clientSelectionMode === 'existing'
                          ? 'border-cyan-500 bg-cyan-100 text-cyan-900 font-bold dark:bg-cyan-950/60 dark:text-white dark:border-cyan-500'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400'
                      }`}
                    >
                      З бази ({clients.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setClientSelectionMode('new')}
                      className={`flex-1 py-1.5 text-xs rounded-lg border font-medium transition ${
                        clientSelectionMode === 'new'
                          ? 'border-cyan-500 bg-cyan-100 text-cyan-900 font-bold dark:bg-cyan-950/60 dark:text-white dark:border-cyan-500'
                          : 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400'
                      }`}
                    >
                      + Новий клієнт
                    </button>
                  </div>

                  {clientSelectionMode === 'existing' && (
                    <select
                      value={selectedExistingClientId}
                      onChange={(e) => setSelectedExistingClientId(e.target.value)}
                      className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-600 shadow-sm"
                    >
                      {clients.map((c) => (
                        <option key={c.id} value={c.id}>
                          👤 {c.name} {c.phone ? `(${c.phone})` : ''}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}

              {/* New client fields if in 'new' mode or no clients exist */}
              {(clientSelectionMode === 'new' || clients.length === 0) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      П.І.Б. клієнта <span className="text-red-500">*</span>:
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                      <input
                        type="text"
                        required={clientSelectionMode === 'new'}
                        placeholder="Олександр Петренко"
                        value={clientName}
                        onChange={(e) => setClientName(e.target.value)}
                        className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-600 shadow-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Телефон клієнта:
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                      <input
                        type="tel"
                        placeholder={phoneCode ? `${phoneCode} ...` : '+380 (97) 123-45-67'}
                        value={clientPhone}
                        onChange={(e) => setClientPhone(e.target.value)}
                        className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-600 shadow-sm"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Адреса об’єкта монтажу <span className="text-red-500">*</span>:
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 absolute left-3 top-2.5 text-cyan-600 dark:text-cyan-400" />
                  <input
                    type="text"
                    required
                    placeholder="м. Київ, вул. Шевченка 12, кв. 45"
                    value={objectAddress}
                    onChange={(e) => setObjectAddress(e.target.value)}
                    className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-600 shadow-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Тип приміщення:
                  </label>
                  <select
                    value={roomType}
                    onChange={(e) => setRoomType(e.target.value)}
                    className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-600 shadow-sm"
                  >
                    <option value="Квартира">Квартира</option>
                    <option value="Приватний будинок / котедж">Приватний будинок / котедж</option>
                    <option value="Новобудова (після будівельників)">Новобудова (після будівельників)</option>
                    <option value="Офіс / Комерція">Офіс / Комерція</option>
                    <option value="Вторинне житло">Вторинне житло</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Дата заміру:
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="date"
                      value={measureDate}
                      onChange={(e) => setMeasureDate(e.target.value)}
                      className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-600 shadow-sm"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Примітки щодо об’єкта (поверх, домофон, ліфт):
                </label>
                <input
                  type="text"
                  placeholder="3 поверх, код 42К, є вантажний ліфт"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-cyan-600 shadow-sm"
                />
              </div>
            </form>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold border border-slate-300 dark:border-transparent transition"
          >
            {t.cancel}
          </button>

          {activeMode === 'choose' ? (
            <button
              type="button"
              disabled={objects.length === 0}
              onClick={handleConfirmExisting}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold text-xs shadow-md transition active:scale-95"
            >
              <span>Розпочати замір</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="submit"
              form="new-obj-form"
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs shadow-md transition active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span>Створити об’єкт та почати замір</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
