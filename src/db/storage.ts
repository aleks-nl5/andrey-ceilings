import { 
  Client, 
  ObjectProject, 
  RoomMeasurement, 
  MasterPriceList,
  MasterProfile
} from '../types/database';
import { DEFAULT_PRICE_LIST } from '../utils/calculator';

import { CurrencyCode, getCurrencySymbol } from '../utils/regionSettings';

const STORAGE_KEYS = {
  CLIENTS: 'potolok_pro_clients_v2_ua',
  OBJECTS: 'potolok_pro_objects_v2_ua',
  MEASUREMENTS: 'potolok_pro_measurements_v2_ua',
  PRICE_LIST: 'potolok_pro_pricelist_v2_ua',
  MASTER_PROFILE: 'potolok_pro_master_profile_v2_ua',
  REGION_CODE: 'potolok_pro_region_code_v1',
  CURRENCY_CODE: 'potolok_pro_currency_code_v1',
  QUICK_COMMENT_TAGS: 'potolok_pro_quick_comment_tags_v1',
};

export const DEFAULT_QUICK_TAGS = [
  'Керамограніт на стінах (алмазне свердління)',
  'Прихована проводка під стелею',
  'Перепад плит перекриття',
  'Стояк опалення впритул до стіни',
  'Слабка штукатурка (потрібен брус)',
  'Висока стеля >3.0м',
  'Вентканал / витяжка у стелі',
  'Прихована ніша під штори (ПК-5)',
];

// Initial realistic demo seed data for Ukraine region
const SEED_CLIENTS: Client[] = [
  {
    id: 'cli-1',
    name: 'Олексій Шевченко',
    phone: '+380 (67) 450-22-31',
    email: 'oleksiy.shevchenko@gmail.com',
    address: 'м. Київ, вул. Хрещатик, буд. 15, кв. 42',
    notes: 'Капітальний ремонт. Клієнт просить тіньовий профіль EuroKRAAB та приховану нішу для штор у вітальні.',
    createdAt: '2026-10-12T10:00:00Z',
  },
  {
    id: 'cli-2',
    name: 'Олена Бондаренко',
    phone: '+380 (50) 789-01-44',
    email: 'olena.bond@ukr.net',
    address: 'м. Львів, ЖК "Велика Британія", корп. 2, кв. 88',
    notes: 'Новобудова, моноліт. У ванній кімнаті великоформатний керамограніт під стелю (алмазне свердління).',
    createdAt: '2026-10-14T14:30:00Z',
  },
  {
    id: 'cli-3',
    name: 'Дмитро Ковальчук',
    phone: '+380 (63) 555-12-89',
    email: 'dima.koval@gmail.com',
    address: 'м. Одеса, Фонтанська дорога, 34',
    notes: 'Котедж, висота стелі 3.10м. Бажає безшовні тканинні полотна Descor у спальнях.',
    createdAt: '2026-10-16T09:15:00Z',
  },
];

const SEED_OBJECTS: ObjectProject[] = [
  {
    id: 'obj-1',
    clientId: 'cli-1',
    address: 'м. Київ, вул. Хрещатик, буд. 15, кв. 42',
    roomType: '3-кімнатна квартира',
    measureDate: '2026-10-15',
    installDate: '2026-10-22',
    status: 'approved',
    prepayment: 12000,
    notes: 'Код під’їзду 42K, 5 поверх, ліфт працює. Бригада з 2 майстрів. Перфоратори з пилососом!',
    createdAt: '2026-10-12T10:30:00Z',
    updatedAt: '2026-10-15T12:00:00Z',
  },
  {
    id: 'obj-2',
    clientId: 'cli-2',
    address: 'м. Львів, ЖК "Велика Британія", корп. 2, кв. 88',
    roomType: 'Студія (новобудова)',
    measureDate: '2026-10-17',
    installDate: '2026-10-25',
    status: 'in_progress',
    prepayment: 7500,
    notes: 'Стіни з керамограніту в санвузлі. Світлові лінії 4м у зоні кухні.',
    createdAt: '2026-10-14T15:00:00Z',
    updatedAt: '2026-10-17T17:00:00Z',
  },
  {
    id: 'obj-3',
    clientId: 'cli-3',
    address: 'м. Одеса, Фонтанська дорога, 34',
    roomType: 'Котедж (2 поверхи)',
    measureDate: '2026-10-19',
    installDate: '2026-10-28',
    status: 'measurement',
    prepayment: 0,
    notes: 'Висота стелі 3.10м. Потрібна висока драбина на 7-8 сходинок.',
    createdAt: '2026-10-16T10:00:00Z',
    updatedAt: '2026-10-16T10:00:00Z',
  },
];

const SEED_MEASUREMENTS: RoomMeasurement[] = [
  {
    id: 'meas-1',
    objectId: 'obj-1',
    name: 'Вітальня з еркером',
    shape: 'rectangle',
    length: 5.4,
    width: 3.8,
    height: 2.75,
    diagonal1: 6.6,
    diagonal2: 6.6,
    area: 20.52,
    perimeter: 18.4,
    cornersCount: 4,
    materialType: 'pvc_matte',
    canvasBrand: 'MSD Premium',
    canvasColor: 'Білий матовий (303)',
    complexity: 'straight',
    profileType: 'shadow_kraab',
    options: {
      lightLinesMeters: 4.5,
      shadowProfileMeters: 18.4,
      floatingCeilingMeters: 0,
      chandeliersCount: 1,
      spotsGX53Count: 6,
      pipePassCount: 1,
      curtainNicheMeters: 3.8,
      extraCorners: 0,
      hardWallMeters: 0,
    },
    comments: 'Прихована проводка по лівій стіні 15см від плити! Ніша ПК-5 під штору по всій ширині вікна 3.8м.',
    photos: [],
    costDetails: {
      canvasCost: 5951,
      profileCost: 6992,
      complexityCost: 0,
      optionsCost: 7355,
      totalCost: 20298,
    },
    updatedAt: '2026-10-15T12:00:00Z',
  },
  {
    id: 'meas-2',
    objectId: 'obj-1',
    name: 'Кухня',
    shape: 'l_shaped',
    length: 4.2,
    width: 3.5,
    height: 2.75,
    sideA: 4.2,
    sideB: 3.5,
    sideC: 2.2,
    sideD: 1.8,
    sideE: 2.0,
    sideF: 1.7,
    diagonal1: 5.4,
    area: 11.3,
    perimeter: 15.4,
    cornersCount: 6,
    materialType: 'pvc_satin',
    canvasBrand: 'MSD Evolution',
    canvasColor: 'Білий сатин',
    complexity: 'straight',
    profileType: 'standard_alu',
    options: {
      lightLinesMeters: 0,
      shadowProfileMeters: 0,
      floatingCeilingMeters: 0,
      chandeliersCount: 0,
      spotsGX53Count: 8,
      pipePassCount: 2,
      curtainNicheMeters: 0,
      extraCorners: 2,
      hardWallMeters: 2.5,
    },
    comments: 'Вентканал у кутку. Газова труба опущена на 18см від перекриття.',
    photos: [],
    costDetails: {
      canvasCost: 3503,
      profileCost: 2002,
      complexityCost: 0,
      optionsCost: 2850,
      totalCost: 8355,
    },
    updatedAt: '2026-10-15T12:30:00Z',
  },
];

export class AppStorage {
  static getClients(): Client[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CLIENTS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(SEED_CLIENTS));
        return SEED_CLIENTS;
      }
      return JSON.parse(data);
    } catch {
      return SEED_CLIENTS;
    }
  }

  static saveClient(client: Client): void {
    const clients = this.getClients();
    const idx = clients.findIndex((c) => c.id === client.id);
    if (idx >= 0) {
      clients[idx] = client;
    } else {
      clients.unshift(client);
    }
    localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
  }

  static deleteClient(id: string): void {
    const clients = this.getClients().filter((c) => c.id !== id);
    localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients));

    const objects = this.getObjects().filter((o) => o.clientId === id);
    objects.forEach((o) => this.deleteObject(o.id));
  }

  static getObjects(): ObjectProject[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.OBJECTS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.OBJECTS, JSON.stringify(SEED_OBJECTS));
        return SEED_OBJECTS;
      }
      return JSON.parse(data);
    } catch {
      return SEED_OBJECTS;
    }
  }

  static saveObject(object: ObjectProject): void {
    const objects = this.getObjects();
    const idx = objects.findIndex((o) => o.id === object.id);
    if (idx >= 0) {
      objects[idx] = { ...object, updatedAt: new Date().toISOString() };
    } else {
      objects.unshift({ ...object, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    }
    localStorage.setItem(STORAGE_KEYS.OBJECTS, JSON.stringify(objects));
  }

  static deleteObject(id: string): void {
    const objects = this.getObjects().filter((o) => o.id !== id);
    localStorage.setItem(STORAGE_KEYS.OBJECTS, JSON.stringify(objects));

    const measurements = this.getMeasurements().filter((m) => m.objectId !== id);
    localStorage.setItem(STORAGE_KEYS.MEASUREMENTS, JSON.stringify(measurements));
  }

  static getMeasurements(): RoomMeasurement[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MEASUREMENTS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.MEASUREMENTS, JSON.stringify(SEED_MEASUREMENTS));
        return SEED_MEASUREMENTS;
      }
      return JSON.parse(data);
    } catch {
      return SEED_MEASUREMENTS;
    }
  }

  static getMeasurementsForObject(objectId: string): RoomMeasurement[] {
    return this.getMeasurements().filter((m) => m.objectId === objectId);
  }

  static saveMeasurement(measurement: RoomMeasurement): void {
    const measurements = this.getMeasurements();
    const idx = measurements.findIndex((m) => m.id === measurement.id);
    if (idx >= 0) {
      measurements[idx] = { ...measurement, updatedAt: new Date().toISOString() };
    } else {
      measurements.unshift({ ...measurement, updatedAt: new Date().toISOString() });
    }
    localStorage.setItem(STORAGE_KEYS.MEASUREMENTS, JSON.stringify(measurements));
  }

  static deleteMeasurement(id: string): void {
    const measurements = this.getMeasurements().filter((m) => m.id !== id);
    localStorage.setItem(STORAGE_KEYS.MEASUREMENTS, JSON.stringify(measurements));
  }

  static getPriceList(): MasterPriceList {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PRICE_LIST);
      const currCode = this.getCurrencyCode();
      const currSym = getCurrencySymbol(currCode);
      if (!data) {
        const defaultWithCurr: MasterPriceList = {
          ...DEFAULT_PRICE_LIST,
          currencyCode: currCode,
          currencySymbol: currSym,
        };
        localStorage.setItem(STORAGE_KEYS.PRICE_LIST, JSON.stringify(defaultWithCurr));
        return defaultWithCurr;
      }
      const parsed = JSON.parse(data);
      return {
        ...DEFAULT_PRICE_LIST,
        currencyCode: parsed.currencyCode || currCode,
        currencySymbol: parsed.currencySymbol || (parsed.currencyCode ? getCurrencySymbol(parsed.currencyCode) : currSym),
        ...parsed,
      };
    } catch {
      return DEFAULT_PRICE_LIST;
    }
  }

  static savePriceList(priceList: MasterPriceList): void {
    localStorage.setItem(STORAGE_KEYS.PRICE_LIST, JSON.stringify(priceList));
  }

  static getMasterProfile(): MasterProfile {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MASTER_PROFILE);
      if (!data) {
        const defaultProfile: MasterProfile = {
          companyName: 'СтеляПро Монтаж',
          masterName: 'Майстер Сергій',
          phone: '+380 (67) 123-45-67',
          city: 'м. Київ та область',
          warrantyNotes: 'Гарантія на полотна 10 років. Гарантія на монтаж 3 роки.',
        };
        localStorage.setItem(STORAGE_KEYS.MASTER_PROFILE, JSON.stringify(defaultProfile));
        return defaultProfile;
      }
      return JSON.parse(data);
    } catch {
      return {};
    }
  }

  static saveMasterProfile(profile: MasterProfile): void {
    localStorage.setItem(STORAGE_KEYS.MASTER_PROFILE, JSON.stringify(profile));
  }

  static getRegionCode(): string {
    return localStorage.getItem(STORAGE_KEYS.REGION_CODE) || 'UA';
  }

  static saveRegionCode(code: string): void {
    localStorage.setItem(STORAGE_KEYS.REGION_CODE, code);
  }

  static getCurrencyCode(): CurrencyCode {
    const code = localStorage.getItem(STORAGE_KEYS.CURRENCY_CODE);
    if (code === 'USD' || code === 'EUR' || code === 'UAH') {
      return code;
    }
    return 'UAH';
  }

  static saveCurrencyCode(code: CurrencyCode): void {
    localStorage.setItem(STORAGE_KEYS.CURRENCY_CODE, code);
  }

  static getQuickCommentTags(): string[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.QUICK_COMMENT_TAGS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.QUICK_COMMENT_TAGS, JSON.stringify(DEFAULT_QUICK_TAGS));
        return DEFAULT_QUICK_TAGS;
      }
      const parsed = JSON.parse(data);
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_QUICK_TAGS;
    } catch {
      return DEFAULT_QUICK_TAGS;
    }
  }

  static saveQuickCommentTags(tags: string[]): void {
    localStorage.setItem(STORAGE_KEYS.QUICK_COMMENT_TAGS, JSON.stringify(tags));
  }

  static addQuickCommentTag(tag: string): string[] {
    const clean = tag.trim();
    if (!clean) return this.getQuickCommentTags();
    const current = this.getQuickCommentTags();
    if (current.includes(clean)) return current;
    const updated = [...current, clean];
    this.saveQuickCommentTags(updated);
    return updated;
  }

  static deleteQuickCommentTag(tag: string): string[] {
    const current = this.getQuickCommentTags();
    const updated = current.filter((t) => t !== tag);
    this.saveQuickCommentTags(updated);
    return updated;
  }

  static resetQuickCommentTags(): string[] {
    this.saveQuickCommentTags(DEFAULT_QUICK_TAGS);
    return DEFAULT_QUICK_TAGS;
  }

  static exportFullBackup(): string {
    const backup = {
      version: '2.0-ua',
      exportedAt: new Date().toISOString(),
      clients: this.getClients(),
      objects: this.getObjects(),
      measurements: this.getMeasurements(),
      priceList: this.getPriceList(),
      masterProfile: this.getMasterProfile(),
      regionCode: this.getRegionCode(),
      currencyCode: this.getCurrencyCode(),
      quickCommentTags: this.getQuickCommentTags(),
    };
    return JSON.stringify(backup, null, 2);
  }

  static importFullBackup(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      if (Array.isArray(parsed.clients)) {
        localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(parsed.clients));
      }
      if (Array.isArray(parsed.objects)) {
        localStorage.setItem(STORAGE_KEYS.OBJECTS, JSON.stringify(parsed.objects));
      }
      if (Array.isArray(parsed.measurements)) {
        localStorage.setItem(STORAGE_KEYS.MEASUREMENTS, JSON.stringify(parsed.measurements));
      }
      if (parsed.priceList) {
        localStorage.setItem(STORAGE_KEYS.PRICE_LIST, JSON.stringify(parsed.priceList));
      }
      if (parsed.masterProfile) {
        localStorage.setItem(STORAGE_KEYS.MASTER_PROFILE, JSON.stringify(parsed.masterProfile));
      }
      if (parsed.regionCode && typeof parsed.regionCode === 'string') {
        this.saveRegionCode(parsed.regionCode);
      }
      if (parsed.currencyCode && (parsed.currencyCode === 'USD' || parsed.currencyCode === 'EUR' || parsed.currencyCode === 'UAH')) {
        this.saveCurrencyCode(parsed.currencyCode);
      }
      if (Array.isArray(parsed.quickCommentTags)) {
        this.saveQuickCommentTags(parsed.quickCommentTags);
      }
      return true;
    } catch (e) {
      console.error('Import error:', e);
      return false;
    }
  }

  static resetToDemoData(): void {
    localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(SEED_CLIENTS));
    localStorage.setItem(STORAGE_KEYS.OBJECTS, JSON.stringify(SEED_OBJECTS));
    localStorage.setItem(STORAGE_KEYS.MEASUREMENTS, JSON.stringify(SEED_MEASUREMENTS));
    localStorage.setItem(STORAGE_KEYS.PRICE_LIST, JSON.stringify(DEFAULT_PRICE_LIST));
    localStorage.setItem(STORAGE_KEYS.QUICK_COMMENT_TAGS, JSON.stringify(DEFAULT_QUICK_TAGS));
  }
}
