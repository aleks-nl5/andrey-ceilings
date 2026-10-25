import { CurrencyCode } from '../utils/regionSettings';

export type OrderStatus = 
  | 'measurement'   // Замір
  | 'calculation'   // Розрахунок / Кошторис
  | 'approved'      // Погоджено / Договір
  | 'in_progress'   // В роботі / Монтаж
  | 'completed'     // Здано
  | 'paid'          // Оплачено
  | 'cancelled';    // Скасовано

export type RoomShape = 'rectangle' | 'square' | 'l_shaped' | 'custom';

export type MaterialType = 
  | 'pvc_matte'     // ПВХ Матовый
  | 'pvc_glossy'    // ПВХ Глянцевый
  | 'pvc_satin'     // ПВХ Сатин
  | 'fabric'        // Тканевый (Descor / Clipso)
  | 'fireproof_km2' // Пожаробезопасный Teqtum KM2
  | 'acoustic';     // Акустический перфорированный

export type CeilingComplexity = 
  | 'straight'      // Прямой угол (стандарт)
  | 'multilevel'    // Многоуровневый (+переход уровня)
  | 'curved';       // Криволинейные элементы / радиусы

export type ProfileType = 
  | 'standard_alu'  // Алюминиевый гарпунный
  | 'pvc'           // ПВХ стеновой
  | 'shadow_kraab'  // Теневой EuroKRAAB / Lumfer
  | 'floating_led'  // Парящий с подсветкой
  | 'slott_tracks'; // Трековый профиль Слот

export interface MeasurementPhoto {
  id: string;
  dataUrl: string;
  caption?: string;
  timestamp: string;
}

export interface RoomOptions {
  lightLinesMeters: number;       // Световые линии, м
  shadowProfileMeters: number;    // Теневой профиль, м
  floatingCeilingMeters: number;  // Парящий профиль, м
  chandeliersCount: number;       // Установка люстры, шт
  spotsGX53Count: number;         // Точечные светильники, шт
  pipePassCount: number;          // Обводы труб отопления, шт
  curtainNicheMeters: number;     // Скрытый карниз / ниша ПК-5, м
  extraCorners: number;           // Дополнительные углы (> 4)
  hardWallMeters: number;         // Монтаж по плитке / керамограниту, м
}

export interface CostBreakdown {
  canvasCost: number;
  profileCost: number;
  complexityCost: number;
  optionsCost: number;
  totalCost: number;
}

export interface RoomMeasurement {
  id: string;
  objectId: string;
  name: string;                   // Гостиная, Спальня, Кухня и т.д.
  shape: RoomShape;               // прямоугольник, квадрат, L-образное, другое
  
  // Размеры
  length: number;                 // Длина, м
  width: number;                  // Ширина, м
  height: number;                 // Высота, м
  
  // Дополнительные размеры для L-образного и произвольного
  sideA?: number;
  sideB?: number;
  sideC?: number;
  sideD?: number;
  sideE?: number;
  sideF?: number;
  customSides?: number[];         // Довжини сторін для складної форми [A-B, B-C, C-D...]
  diagonal1?: number;             // Диагональ 1, м
  diagonal2?: number;             // Диагональ 2, м
  
  // Вычисленные геометрические параметры
  area: number;                   // Площадь, м²
  perimeter: number;              // Периметр, м.п.
  cornersCount: number;           // Количество углов
  
  // Технические параметры потолка
  materialType: MaterialType | string;     // ПВХ, ткань або власна назва/id
  canvasBrand: string;            // MSD Premium, Bauf, Descor
  canvasColor: string;            // Белый матовый, сатин, фактурный
  complexity: CeilingComplexity;  // прямой угол, многоуровневый, с криволинейными элементами
  profileType: ProfileType | string;       // стандартний або власний профіль
  
  options: RoomOptions;
  customOptions?: { id: string; name: string; unit: string; price: number; quantity: number }[];
  comments: string;               // Текстовые комментарии и примечания по замеру
  photos: MeasurementPhoto[];     // Фотографии объекта
  costDetails: CostBreakdown;
  docNumber?: string;             // Постійний номер кошторису (наприклад, "261022-АО-1941")
  priceSnapshot?: MasterPriceList;// Снепшот прайс-листа на момент збереження (для фіксації цін)
  currencyCode?: CurrencyCode;    // Зафіксована валюта заміру ('UAH' | 'USD' | 'EUR')
  currencySymbol?: string;        // Символ валюти заміру ('₴', '$', '€')
  updatedAt: string;
}

export interface Client {
  id: string;
  name: string;                   // ФИО клиента
  phone: string;                  // Телефон
  email?: string;                 // Email
  address: string;                // Адрес проживания / основной адрес
  notes?: string;                 // Дополнительные заметки
  createdAt: string;
  updatedAt?: string;
}

export interface ObjectProject {
  id: string;
  clientId: string;               // ID клиента
  address: string;                // Адрес объекта
  roomType: string;               // Тип помещения (Квартира, Дом/коттедж, Офис, Новостройка)
  measureDate: string;            // Дата замера
  installDate?: string;           // Дата установки
  status: OrderStatus;            // Статус заказа
  
  prepayment: number;             // Внесенный аванс (руб)
  discountPercent?: number;       // Скидка (%)
  docNumber?: string;             // Постійний номер кошторису для об'єкта
  currencyCode?: CurrencyCode;    // Зафіксована валюта об'єкта ('UAH' | 'USD' | 'EUR')
  currencySymbol?: string;        // Символ валюти об'єкта ('₴', '$', '€')
  notes?: string;                 // Примечания к объекту
  createdAt: string;
  updatedAt: string;
}

export interface MasterPriceList {
  // Базовая стоимость полотна за 1 м² с установкой
  canvasPrices: Record<MaterialType, number>;
  // Стоимость профиля за 1 м.п.
  profilePrices: Record<ProfileType, number>;
  // Доплаты за сложность
  complexityCoefficients: {
    straight: number;             // 1.0
    multilevel: number;           // надбавка за переход уровня или коэфф
    curved: number;               // надбавка за радиус/криволинейность
  };
  multilevelPerMeterCost: number; // Стоимость перехода уровня за 1 м.п.
  curvedPerMeterCost: number;     // Стоимость криволинейного участка за 1 м.п.
  
  // Дополнительные работы и опции
  lightLinePerMeter: number;      // Световая линия со светодиодом, руб/м
  shadowProfilePerMeter: number;  // Теневой профиль (EuroKRAAB), руб/м
  floatingProfilePerMeter: number;// Парящий профиль с LED, руб/м
  chandelierInstallation: number; // Установка люстры, руб/шт
  spotInstallation: number;       // Точечный светильник GX53 (стойка + проводка), руб/шт
  pipePass: number;               // Обвод трубы отопления, руб/шт
  curtainNichePerMeter: number;   // Ниша под карниз (ПК-5 / брус), руб/м
  extraCornerCost: number;        // Угол сверх 4-х, руб/шт
  hardWallPerMeter: number;       // Сверление керамогранита, руб/м
  customItems?: CustomPriceItem[]; // Пользовательские добавленные позиции
  deletedStandardKeys?: string[]; // Ключи удаленных/скрытых стандартных позиций
  currencyCode?: CurrencyCode;    // Валюта прайсу ('UAH' | 'USD' | 'EUR')
  currencySymbol?: string;        // Символ валюти ('₴', '$', '€')
}

export interface CustomPriceItem {
  id: string;
  category: 'canvas' | 'profile' | 'work' | 'option';
  name: string;
  unit: string; // 'м²', 'м.п.', 'шт', 'компл.'
  price: number;
}

export interface MasterProfile {
  companyName?: string;
  masterName?: string;
  phone?: string;
  email?: string;
  city?: string;
  address?: string;
  bankDetails?: string;    // Реквізити / IBAN для авансу
  warrantyNotes?: string;  // Гарантійні умови
  customNotes?: string;    // Додаткові примітки для договору
}
