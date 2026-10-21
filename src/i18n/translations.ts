export type Locale = 'uk' | 'ru' | 'en';

export interface Translations {
  appName: string;
  appSubtitle: string;
  installApp: string;
  installGuideTitle: string;
  installGuideDesc: string;
  installAndroidHint: string;
  offlineMode: string;
  
  // Navigation tabs
  tabDashboard: string;
  tabObjects: string;
  tabMeasurements: string;
  tabCalculator: string;
  tabSettings: string;

  // Statuses
  statusMeasurement: string;
  statusCalculation: string;
  statusApproved: string;
  statusInProgress: string;
  statusCompleted: string;
  statusPaid: string;
  statusCancelled: string;
  statusAll: string;

  // Common actions
  newMeasurement: string;
  newObject: string;
  newClient: string;
  save: string;
  cancel: string;
  delete: string;
  edit: string;
  search: string;
  back: string;
  close: string;
  copied: string;
  printPdf: string;
  call: string;
  whatsApp: string;
  saveToPhoneContacts: string;
  exportAllContacts: string;
  openGoogleMaps: string;
  openWaze: string;
  openNavigator: string;

  // Measurements & Blueprint
  roomTitle: string;
  roomShape: string;
  shapeRectangle: string;
  shapeSquare: string;
  shapeLShaped: string;
  shapeCustom: string;
  dimensionsTitle: string;
  length: string;
  width: string;
  height: string;
  sideA: string;
  sideB: string;
  sideC: string;
  sideD: string;
  sideE: string;
  sideF: string;
  diagonal1: string;
  diagonal2: string;
  area: string;
  perimeter: string;
  corners: string;
  touchEditorTitle: string;
  touchEditorHint: string;
  gridSnap: string;
  addCorner: string;
  removeCorner: string;
  resetBlueprint: string;
  
  // Ceiling specs & Materials
  materialType: string;
  pvcMatte: string;
  pvcGlossy: string;
  pvcSatin: string;
  fabric: string;
  fireproofKM2: string;
  acoustic: string;
  
  // Complexity
  complexity: string;
  complexityStraight: string;
  complexityMultilevel: string;
  complexityCurved: string;
  
  // Profile
  profileSystem: string;
  profileStandardAlu: string;
  profilePVC: string;
  profileShadow: string;
  profileFloating: string;
  profileSlott: string;
  
  // Options
  lightingAndOptions: string;
  lightLines: string;
  shadowGap: string;
  floatingProfile: string;
  chandelier: string;
  spotGX53: string;
  pipePass: string;
  curtainNiche: string;
  hardWall: string;
  
  // Comments and Photos
  commentsTitle: string;
  commentsPlaceholder: string;
  photosTitle: string;
  addPhoto: string;
  photoUploadHint: string;
  
  // Estimate / Calculator
  calculatorTitle: string;
  calculatorSubtitle: string;
  totalCost: string;
  estimateBreakdown: string;
  canvasCost: string;
  profileCost: string;
  complexityCost: string;
  optionsCost: string;
  saveToProject: string;
  copyOfferWhatsApp: string;
  offerTemplateHeader: string;
  
  // Settings
  priceListTitle: string;
  priceListSubtitle: string;
  savePriceList: string;
  backupTitle: string;
  exportBackup: string;
  exportBackupDesc: string;
  importBackup: string;
  importBackupDesc: string;
  resetDemoData: string;
  dangerZone: string;
  resetToDefaults: string;
  languageSelect: string;
  regionSelect: string;
  currency: string;
  manualInputDigits: string;
  calcByDimensions: string;
  calcByArea: string;
  manualOverrideAreaPerimeter: string;
  numpad: string;
  theme: string;
  themeLight: string;
  themeDark: string;
  themeSystem: string;
}

export const TRANSLATIONS: Record<Locale, Translations> = {
  uk: {
    appName: 'СтеляПро',
    appSubtitle: 'Майстер натяжних стель',
    installApp: 'Встановити на телефон',
    installGuideTitle: 'Встановлення на смартфон / планшет',
    installGuideDesc: 'Додайте додаток на головний екран для швидкої роботи без інтернету.',
    installAndroidHint: 'Встановіть СтеляПро на Android для роботи на замірах офлайн',
    offlineMode: 'Офлайн-режим — дані надійно зберігаються на пристрої',

    tabDashboard: 'Панель',
    tabObjects: 'Об’єкти',
    tabMeasurements: 'Заміри',
    tabCalculator: 'Калькулятор',
    tabSettings: 'Налаштування',

    statusMeasurement: 'Замір',
    statusCalculation: 'Розрахунок',
    statusApproved: 'Погоджено',
    statusInProgress: 'В монтажі',
    statusCompleted: 'Здано',
    statusPaid: 'Оплачено',
    statusCancelled: 'Скасовано',
    statusAll: 'Всі',

    newMeasurement: 'Новий замір',
    newObject: 'Новий об’єкт',
    newClient: 'Новий клієнт',
    save: 'Зберегти',
    cancel: 'Скасувати',
    delete: 'Видалити',
    edit: 'Редагувати',
    search: 'Пошук адреси, клієнта, телефону...',
    back: 'Назад',
    close: 'Закрити',
    copied: 'Скопійовано!',
    printPdf: 'Друк / PDF',
    call: 'Подзвонити',
    whatsApp: 'WhatsApp / Viber',
    saveToPhoneContacts: 'У контакти телефону (.vcf)',
    exportAllContacts: 'Експорт контактів (.vcf)',
    openGoogleMaps: 'Google Карты',
    openWaze: 'Waze',
    openNavigator: 'Навігатор',

    roomTitle: 'Назва приміщення',
    roomShape: 'Форма приміщення',
    shapeRectangle: 'Прямокутник',
    shapeSquare: 'Квадрат',
    shapeLShaped: 'L-подібне',
    shapeCustom: 'Складна форма',
    dimensionsTitle: 'Розміри приміщення (в метрах)',
    length: 'Довжина (A)',
    width: 'Ширина (B)',
    height: 'Висота стелі (H)',
    sideA: 'Сторона A',
    sideB: 'Сторона B',
    sideC: 'Сторона C',
    sideD: 'Сторона D',
    sideE: 'Сторона E',
    sideF: 'Сторона F',
    diagonal1: 'Діагональ d1',
    diagonal2: 'Діагональ d2',
    area: 'Площа',
    perimeter: 'Периметр',
    corners: 'Кутів',
    touchEditorTitle: 'Сенсорне креслення (рухайте пальцем)',
    touchEditorHint: 'Тягніть кути та світильники пальцем по екрану',
    gridSnap: 'Сітка',
    addCorner: '+Кут',
    removeCorner: 'Видалити кут',
    resetBlueprint: 'Скинути',

    materialType: 'Тип матеріалу полотна',
    pvcMatte: 'ПВХ Матовий (MSD Premium)',
    pvcGlossy: 'ПВХ Глянцевий',
    pvcSatin: 'ПВХ Сатиновий',
    fabric: 'Тканинний безшовний (Descor)',
    fireproofKM2: 'Негорючий Teqtum KM2',
    acoustic: 'Акустичний перфорований',

    complexity: 'Складність стелі',
    complexityStraight: 'Прямий кут (стандарт)',
    complexityMultilevel: 'Багаторівневий з переходом',
    complexityCurved: 'З криволінійними елементами',

    profileSystem: 'Система профілю',
    profileStandardAlu: 'Алюмінієвий гарпунний (стандарт)',
    profilePVC: 'ПВХ стіновий профіль',
    profileShadow: 'Тіньовий зазор EuroKRAAB / Lumfer',
    profileFloating: 'Парящий профіль з LED',
    profileSlott: 'Слот / трековий шинопровід',

    lightingAndOptions: 'Освітлення та додаткові опції',
    lightLines: 'Світлові лінії',
    shadowGap: 'Тіньовий профіль (EuroKRAAB)',
    floatingProfile: 'Паряща стеля з LED',
    chandelier: 'Монтаж люстри',
    spotGX53: 'Точкові світильники (GX53 / споти)',
    pipePass: 'Обвід труб опалення',
    curtainNiche: 'Прихований карниз (ПК-5 ніша)',
    hardWall: 'Свердління керамограніту',

    commentsTitle: 'Текстові коментарі та примітки щодо заміру',
    commentsPlaceholder: 'Особливості стін, прихована проводка, висота перекриття, побажання замовника...',
    photosTitle: 'Фотографії об’єкта та заміру',
    addPhoto: 'Додати фото',
    photoUploadHint: 'Натисніть, щоб зробити фото з камери або вибрати з галереї',

    calculatorTitle: 'Калькулятор вартості натяжної стелі',
    calculatorSubtitle: 'Миттєвий розрахунок матеріалів, профілів та монтажних робіт',
    totalCost: 'Разом під ключ',
    estimateBreakdown: 'Деталізація кошторису',
    canvasCost: 'Полотно',
    profileCost: 'Профіль',
    complexityCost: 'Складність монтажу',
    optionsCost: 'Освітлення та опції',
    saveToProject: 'Зберегти як кімнату об’єкта',
    copyOfferWhatsApp: 'Копіювати для клієнта',
    offerTemplateHeader: 'Попередній розрахунок натяжної стелі',

    priceListTitle: 'Налаштування',
    priceListSubtitle: 'Налаштування розцінок на полотна, профілі, послуги та даних компанії',
    savePriceList: 'Зберегти налаштування',
    backupTitle: 'Резервна копія та безпека даних',
    exportBackup: 'Експорт бази (Завантажити JSON)',
    exportBackupDesc: 'Зберегти всі об’єкти, клієнтів та налаштування у файл .json',
    importBackup: 'Імпорт бази (Завантажити JSON)',
    importBackupDesc: 'Відновити базу даних із раніше збереженого файлу .json',
    resetDemoData: 'Скинути до демо-даних',
    dangerZone: 'Скидання даних',
    resetToDefaults: 'Скинути всі дані до початкових',
    languageSelect: 'Мова додатку',
    regionSelect: 'Регіон за замовчуванням',
    currency: '₴',
    manualInputDigits: 'Ручне введення цифрами',
    calcByDimensions: 'За розмірами (Довжина × Ширина)',
    calcByArea: 'За площею (м²)',
    manualOverrideAreaPerimeter: 'Ввести площу та периметр вручну',
    numpad: 'Цифрова клавіатура',
    theme: 'Тема застосунку',
    themeLight: 'Світла',
    themeDark: 'Темна',
    themeSystem: 'Системна',
  },
  ru: {
    appName: 'ПотолокПро',
    appSubtitle: 'Мастер натяжных потолков',
    installApp: 'Установить на телефон',
    installGuideTitle: 'Установка на смартфон / планшет',
    installGuideDesc: 'Добавьте приложение на главный экран для быстрой работы без интернета.',
    installAndroidHint: 'Установите ПотолокПро на Android для работы на замерах офлайн',
    offlineMode: 'Офлайн-режим — данные сохраняются локально',

    tabDashboard: 'Панель',
    tabObjects: 'Объекты',
    tabMeasurements: 'Замеры',
    tabCalculator: 'Калькулятор',
    tabSettings: 'Настройки',

    statusMeasurement: 'Замер',
    statusCalculation: 'Расчет',
    statusApproved: 'Согласован',
    statusInProgress: 'В монтаже',
    statusCompleted: 'Сдан',
    statusPaid: 'Оплачен',
    statusCancelled: 'Отменен',
    statusAll: 'Все',

    newMeasurement: 'Новый замер',
    newObject: 'Новый объект',
    newClient: 'Новый клиент',
    save: 'Сохранить',
    cancel: 'Отмена',
    delete: 'Удалить',
    edit: 'Редактировать',
    search: 'Поиск адреса, клиента, телефона...',
    back: 'Назад',
    close: 'Закрыть',
    copied: 'Скопировано!',
    printPdf: 'Печать / PDF',
    call: 'Позвонить',
    whatsApp: 'WhatsApp / Telegram',
    saveToPhoneContacts: 'В контакты телефона (.vcf)',
    exportAllContacts: 'Экспорт контактов (.vcf)',
    openGoogleMaps: 'Google Карты',
    openWaze: 'Waze',
    openNavigator: 'Навигатор',

    roomTitle: 'Название помещения',
    roomShape: 'Форма помещения',
    shapeRectangle: 'Прямоугольник',
    shapeSquare: 'Квадрат',
    shapeLShaped: 'L-образное',
    shapeCustom: 'Сложная форма',
    dimensionsTitle: 'Размеры помещения (в метрах)',
    length: 'Длина (A)',
    width: 'Ширина (B)',
    height: 'Высота потолка (H)',
    sideA: 'Сторона A',
    sideB: 'Сторона B',
    sideC: 'Сторона C',
    sideD: 'Сторона D',
    sideE: 'Сторона E',
    sideF: 'Сторона F',
    diagonal1: 'Диагональ d1',
    diagonal2: 'Диагональ d2',
    area: 'Площадь',
    perimeter: 'Периметр',
    corners: 'Углов',
    touchEditorTitle: 'Сенсорный чертеж (двигайте пальцем)',
    touchEditorHint: 'Тяните углы и светильники пальцем по экрану',
    gridSnap: 'Сетка',
    addCorner: '+Угол',
    removeCorner: 'Удалить угол',
    resetBlueprint: 'Сбросить',

    materialType: 'Тип материала полотна',
    pvcMatte: 'ПВХ Матовый (MSD Premium)',
    pvcGlossy: 'ПВХ Глянцевый',
    pvcSatin: 'ПВХ Сатиновый',
    fabric: 'Тканевый бесшовный (Descor)',
    fireproofKM2: 'Негорючий Teqtum KM2',
    acoustic: 'Акустический перфорированный',

    complexity: 'Сложность потолка',
    complexityStraight: 'Прямой угол (стандарт)',
    complexityMultilevel: 'Многоуровневый с переходом',
    complexityCurved: 'С криволинейными элементами',

    profileSystem: 'Система профиля',
    profileStandardAlu: 'Алюминиевый гарпунный (стандарт)',
    profilePVC: 'ПВХ стеновой профиль',
    profileShadow: 'Теневой зазор EuroKRAAB / Lumfer',
    profileFloating: 'Парящий профиль с LED',
    profileSlott: 'Слот / трековый профиль',

    lightingAndOptions: 'Освещение и дополнительные опции',
    lightLines: 'Световые линии',
    shadowGap: 'Теневой профиль (EuroKRAAB)',
    floatingProfile: 'Парящий потолок с LED',
    chandelier: 'Установка люстры',
    spotGX53: 'Точечные светильники (GX53 / споты)',
    pipePass: 'Обвод труб отопления',
    curtainNiche: 'Скрытый карниз (ПК-5 ниша)',
    hardWall: 'Сверление керамогранита',

    commentsTitle: 'Текстовые комментарии и примечания по замеру',
    commentsPlaceholder: 'Особенности стен, скрытая проводка, перепад высот, пожелания клиента...',
    photosTitle: 'Фотографии объекта и замера',
    addPhoto: 'Добавить фото',
    photoUploadHint: 'Нажмите, чтобы сделать фото с камеры или выбрать из галереи',

    calculatorTitle: 'Калькулятор стоимости натяжного потолка',
    calculatorSubtitle: 'Мгновенный расчет материалов, профилей и монтажных работ',
    totalCost: 'Итого под ключ',
    estimateBreakdown: 'Детализация сметы',
    canvasCost: 'Полотно',
    profileCost: 'Профиль',
    complexityCost: 'Сложность монтажа',
    optionsCost: 'Освещение и опции',
    saveToProject: 'Сохранить как комнату объекта',
    copyOfferWhatsApp: 'Копировать для клиента',
    offerTemplateHeader: 'Предварительный расчет натяжного потолка',

    priceListTitle: 'Настройки',
    priceListSubtitle: 'Настройка расценок на полотна, профили, услуги и данных компании',
    savePriceList: 'Сохранить настройки',
    backupTitle: 'Резервная копия и безопасность данных',
    exportBackup: 'Экспорт базы (Скачать JSON)',
    exportBackupDesc: 'Сохранить все объекты, клиентов и настройки в файл .json',
    importBackup: 'Импорт базы (Загрузить JSON)',
    importBackupDesc: 'Восстановить базу данных из ранее сохраненного файла .json',
    resetDemoData: 'Сбросить к демо-данным',
    dangerZone: 'Сброс данных',
    resetToDefaults: 'Сбросить все данные к начальным',
    languageSelect: 'Язык приложения',
    regionSelect: 'Регион по умолчанию',
    currency: '₴',
    manualInputDigits: 'Ручной ввод цифрами',
    calcByDimensions: 'По размерам (Длина × Ширина)',
    calcByArea: 'По площади (м²)',
    manualOverrideAreaPerimeter: 'Задать площадь и периметр вручную',
    numpad: 'Цифровая клавиатура',
    theme: 'Тема приложения',
    themeLight: 'Светлая',
    themeDark: 'Тёмная',
    themeSystem: 'Системная',
  },
  en: {
    appName: 'CeilingPro',
    appSubtitle: 'Stretch Ceiling Field Master',
    installApp: 'Install to Phone',
    installGuideTitle: 'Install to Smartphone / Tablet',
    installGuideDesc: 'Add the app to your home screen for quick offline access on job sites.',
    installAndroidHint: 'Install CeilingPro on Android for seamless offline field measurements',
    offlineMode: 'Offline Mode — data is safely stored on your device',

    tabDashboard: 'Dashboard',
    tabObjects: 'Projects',
    tabMeasurements: 'Measurements',
    tabCalculator: 'Calculator',
    tabSettings: 'Settings',

    statusMeasurement: 'Survey',
    statusCalculation: 'Quote',
    statusApproved: 'Approved',
    statusInProgress: 'In Progress',
    statusCompleted: 'Completed',
    statusPaid: 'Paid',
    statusCancelled: 'Cancelled',
    statusAll: 'All',

    newMeasurement: 'New Measurement',
    newObject: 'New Project',
    newClient: 'New Client',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    search: 'Search address, client, phone...',
    back: 'Back',
    close: 'Close',
    copied: 'Copied!',
    printPdf: 'Print / PDF',
    call: 'Call',
    whatsApp: 'WhatsApp / Viber',
    saveToPhoneContacts: 'Save to Phone Contacts (.vcf)',
    exportAllContacts: 'Export Contacts (.vcf)',
    openGoogleMaps: 'Google Maps',
    openWaze: 'Waze',
    openNavigator: 'Navigator',

    roomTitle: 'Room Name',
    roomShape: 'Room Shape',
    shapeRectangle: 'Rectangle',
    shapeSquare: 'Square',
    shapeLShaped: 'L-Shaped',
    shapeCustom: 'Custom Shape',
    dimensionsTitle: 'Room Dimensions (meters)',
    length: 'Length (A)',
    width: 'Width (B)',
    height: 'Ceiling Height (H)',
    sideA: 'Side A',
    sideB: 'Side B',
    sideC: 'Side C',
    sideD: 'Side D',
    sideE: 'Side E',
    sideF: 'Side F',
    diagonal1: 'Diagonal d1',
    diagonal2: 'Diagonal d2',
    area: 'Area',
    perimeter: 'Perimeter',
    corners: 'Corners',
    touchEditorTitle: 'Touch Blueprint (drag with fingers)',
    touchEditorHint: 'Drag corner vertices and light fixtures with your finger',
    gridSnap: 'Grid Snap',
    addCorner: '+Corner',
    removeCorner: 'Delete Corner',
    resetBlueprint: 'Reset',

    materialType: 'Canvas Material Type',
    pvcMatte: 'PVC Matte (MSD Premium)',
    pvcGlossy: 'PVC Glossy',
    pvcSatin: 'PVC Satin',
    fabric: 'Seamless Fabric (Descor)',
    fireproofKM2: 'Fire-Safe Teqtum KM2',
    acoustic: 'Acoustic Perforated',

    complexity: 'Ceiling Complexity',
    complexityStraight: 'Straight Corners (Standard)',
    complexityMultilevel: 'Multi-Level Step',
    complexityCurved: 'Curved / Radial Elements',

    profileSystem: 'Profile System',
    profileStandardAlu: 'Aluminium Harpoon (Standard)',
    profilePVC: 'PVC Wall Profile',
    profileShadow: 'Shadow Gap EuroKRAAB / Lumfer',
    profileFloating: 'Floating Ceiling with LED',
    profileSlott: 'Slott Track Profile',

    lightingAndOptions: 'Lighting & Extra Options',
    lightLines: 'Light Lines',
    shadowGap: 'Shadow Gap Profile',
    floatingProfile: 'Floating LED Profile',
    chandelier: 'Chandelier Mounting',
    spotGX53: 'Spotlights (GX53)',
    pipePass: 'Heating Pipe Bypass',
    curtainNiche: 'Hidden Curtain Niche (PK-5)',
    hardWall: 'Hard Tile Drilling',

    commentsTitle: 'Survey Remarks & Field Notes',
    commentsPlaceholder: 'Wall materials, hidden electrical wiring, slabs level, customer requests...',
    photosTitle: 'Site & Measurement Photos',
    addPhoto: 'Add Photo',
    photoUploadHint: 'Tap to snap a photo with camera or choose from gallery',

    calculatorTitle: 'Stretch Ceiling Cost Calculator',
    calculatorSubtitle: 'Instant calculation of materials, profiles and installation labor',
    totalCost: 'Turnkey Total',
    estimateBreakdown: 'Estimate Breakdown',
    canvasCost: 'Canvas',
    profileCost: 'Profile',
    complexityCost: 'Complexity',
    optionsCost: 'Lighting & Options',
    saveToProject: 'Save as Project Room',
    copyOfferWhatsApp: 'Copy for Client',
    offerTemplateHeader: 'Preliminary Stretch Ceiling Quote',

    priceListTitle: 'Settings',
    priceListSubtitle: 'Set your rates for canvases, profiles, options, and company profile',
    savePriceList: 'Save Settings',
    backupTitle: 'Backup & Data Security',
    exportBackup: 'Export Backup (Download JSON)',
    exportBackupDesc: 'Save all projects, clients, and settings to a .json file',
    importBackup: 'Import Backup (Upload JSON)',
    importBackupDesc: 'Restore database from a previously saved .json backup',
    resetDemoData: 'Reset to Demo Data',
    dangerZone: 'Data Reset',
    resetToDefaults: 'Reset All Data to Defaults',
    languageSelect: 'App Language',
    regionSelect: 'Default Region',
    currency: '₴',
    manualInputDigits: 'Manual digit input',
    calcByDimensions: 'By dimensions (Length × Width)',
    calcByArea: 'By area (m²)',
    manualOverrideAreaPerimeter: 'Manual area & perimeter override',
    numpad: 'Digital keypad',
    theme: 'App Theme',
    themeLight: 'Light',
    themeDark: 'Dark',
    themeSystem: 'System',
  },
};

const LOCALE_STORAGE_KEY = 'potolok_pro_locale_v2';

export function getInitialLocale(): Locale {
  try {
    const saved = localStorage.getItem(LOCALE_STORAGE_KEY);
    if (saved && (saved === 'uk' || saved === 'ru' || saved === 'en')) {
      return saved as Locale;
    }
  } catch {
    // fallback
  }
  // Default region: Ukraine (Ukrainian language)
  return 'uk';
}

export function saveLocale(loc: Locale): void {
  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, loc);
  } catch {
    // ignore
  }
}
