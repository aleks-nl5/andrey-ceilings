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

  // PDF / Print Estimate
  printEstimateTitle: string;
  allRoomsScope: string;
  singleRoomScope: string;
  selectRoom: string;
  printPhotos: string;
  photosOnNewPage: string;
  photosSectionTitle: string;
  photosCountUnit: string;
  noPhotosAttached: string;
  blueprintSchemeTitle: string;
  estimateWorkAndMaterials: string;
  quantity: string;
  unit: string;
  unitPcs: string;
  unitM2: string;
  unitM: string;
  price: string;
  amount: string;
  roomSubtotal: string;
  orderGrandTotal: string;
  totalAreaAndPerimeter: string;
  materialsAndLaborSum: string;
  discount: string;
  contractTotal: string;
  prepaymentPaid: string;
  balanceDue: string;
  paymentDetails: string;
  warranty: string;
  customerSignature: string;
  contractorSignature: string;
  canvasItemLabel: string;
  profileItemLabel: string;
  extraCornersItemLabel: string;
  chandelierItemLabel: string;
  spotItemLabel: string;
  lightLineItemLabel: string;
  pipePassItemLabel: string;
  curtainNicheItemLabel: string;
  hardWallItemLabel: string;

  // Blueprint & Legend
  wall: string;
  legendDiagonals: string;
  legendChandeliers: string;
  legendSpots: string;
  legendPipes: string;
  legendCurtainNiche: string;
  legendLightLines: string;
  scaleAuto: string;
  niche: string;
  pipe: string;
  chandelierLetter: string;
  curtainNicheBinding: string;

  // Touch Blueprint Editor
  touchEditorInstructionTitle: string;
  touchEditorInstruction1: string;
  touchEditorInstruction2: string;
  touchEditorInstruction3: string;
  touchEditorInstruction4: string;
  touchEditorInstruction5: string;
  snapToGridOn: string;
  freeMove: string;
  zoomIn: string;
  zoomOut: string;
  resetZoom: string;

  // Dashboard & Workflow
  quickToolsTitle: string;
  quickMeasurement: string;
  objectsAndClients: string;
  noUrgentVisits: string;
  noUrgentVisitsDesc: string;
  todayScheduled: string;
  tomorrow: string;
  inDays: string;
  measureSurvey: string;
  installCeiling: string;
  clientLabel: string;
  goToObject: string;
  objectsCount: string;
  roomsCount: string;
  areaMetric: string;
  chooseObject: string;
  createNewObject: string;
  selectObjectFromListDesc: string;
  selectObjectError: string;
  specifyAddressError: string;
  specifyClientError: string;
  roomTypeApartment: string;
  roomTypeHouse: string;
  roomTypeOffice: string;
  roomTypeCommercial: string;
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

    // PDF / Print Estimate
    printEstimateTitle: 'Друк кошторису (PDF)',
    allRoomsScope: 'Всі приміщення',
    singleRoomScope: 'Окреме приміщення',
    selectRoom: 'Оберіть кімнату',
    printPhotos: 'Друкувати фото обʼєкта',
    photosOnNewPage: 'Фото з нової сторінки',
    photosSectionTitle: 'Фотофіксація приміщення',
    photosCountUnit: 'фото',
    noPhotosAttached: 'Немає доданих фото',
    blueprintSchemeTitle: 'Схема розкрою та діагоналей стелі',
    estimateWorkAndMaterials: 'Найменування робіт та матеріалів',
    quantity: 'Кількість',
    unit: 'Од. вим.',
    unitPcs: 'шт',
    unitM2: 'м²',
    unitM: 'м.п.',
    price: 'Ціна',
    amount: 'Сума',
    roomSubtotal: 'Разом по приміщенню',
    orderGrandTotal: 'Підсумок замовлення',
    totalAreaAndPerimeter: 'S загальна',
    materialsAndLaborSum: 'Сума за матеріали та монтажні роботи:',
    discount: 'Знижка',
    contractTotal: 'Загальна вартість договору:',
    prepaymentPaid: 'Внесена попередня оплата (аванс):',
    balanceDue: 'До сплати після встановлення:',
    paymentDetails: 'Реквізити для оплати / внесення авансу:',
    warranty: 'Гарантія:',
    customerSignature: 'Замовник: (підпис)',
    contractorSignature: 'Виконавець: (підпис)',
    canvasItemLabel: 'Полотно натяжної стелі',
    profileItemLabel: 'Профіль кріплення та монтаж',
    extraCornersItemLabel: 'Обробка додаткових кутів (понад 4 шт)',
    chandelierItemLabel: 'Монтаж люстри (закладна + гак/планка)',
    spotItemLabel: 'Монтаж точкового світильника (стійка, розводка)',
    lightLineItemLabel: 'Світлова лінія зі світлодіодною стрічкою',
    pipePassItemLabel: 'Обвід труби опалення (термокільце)',
    curtainNicheItemLabel: 'Ніша під карниз для штор',
    hardWallItemLabel: 'Свердління керамограніту/плитки',

    // Blueprint & Legend
    wall: 'Стіна',
    legendDiagonals: 'Діагоналі (розкрій)',
    legendChandeliers: 'Люстри',
    legendSpots: 'Точки світла',
    legendPipes: 'Обводи труб',
    legendCurtainNiche: 'Ніша штор',
    legendLightLines: 'Світлові лінії',
    scaleAuto: 'Масштаб 1:1 авто',
    niche: 'Ніша',
    pipe: 'Труба',
    chandelierLetter: 'Л',
    curtainNicheBinding: 'Прив\'язка ніші штор до стіни:',

    // Touch Blueprint Editor
    touchEditorInstructionTitle: 'Як редагувати креслення пальцем на смартфоні/планшеті:',
    touchEditorInstruction1: 'Доторкніться до синього кружка кута (A, B, C...) і тягніть у будь-який бік без стрибків.',
    touchEditorInstruction2: 'Кнопками + та - у верхньому меню регулюйте масштаб відображення для точного підгону.',
    touchEditorInstruction3: 'Розміри стін, діагоналі та площа перераховуються миттєво в реальному часі.',
    touchEditorInstruction4: 'Значки люстри та спотів теж можна переміщати пальцем у потрібне місце кімнати.',
    touchEditorInstruction5: 'Кнопка «+Кут» дозволяє побудувати 5-кутні та багатокутні кімнати.',
    snapToGridOn: 'Прив\'язка до сітки: УВІМК',
    freeMove: 'Вільне переміщення',
    zoomIn: 'Збільшити масштаб (+)',
    zoomOut: 'Зменшити масштаб (-)',
    resetZoom: 'Скинути масштаб (100%)',

    // Dashboard & Workflow
    quickToolsTitle: 'Швидкі інструменти майстра',
    quickMeasurement: 'Швидкий замір',
    objectsAndClients: 'Об\'єкти та клієнти',
    noUrgentVisits: 'На сьогодні термінових виїздів немає',
    noUrgentVisitsDesc: 'Створіть новий замір або перевірте список поточних замовлень',
    todayScheduled: 'Сьогодні за розкладом',
    tomorrow: 'Завтра',
    inDays: 'Через',
    measureSurvey: 'Замір приміщення',
    installCeiling: 'Монтаж натяжної стелі',
    clientLabel: 'Замовник:',
    goToObject: 'Перейти до об\'єкту',
    objectsCount: 'Об\'єктів',
    roomsCount: 'Кімнат',
    areaMetric: 'Площа',
    chooseObject: 'Обрати об’єкт',
    createNewObject: '+ Створити новий об’єкт',
    selectObjectFromListDesc: 'Виберіть об\'єкт з випадаючого списку або створіть новий',
    selectObjectError: 'Будь ласка, оберіть об’єкт зі списку',
    specifyAddressError: 'Будь ласка, вкажіть адресу об’єкта',
    specifyClientError: 'Будь ласка, вкажіть або оберіть клієнта',
    roomTypeApartment: 'Квартира',
    roomTypeHouse: 'Будинок / котедж',
    roomTypeOffice: 'Офіс',
    roomTypeCommercial: 'Комерційне приміщення',
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

    // PDF / Print Estimate
    printEstimateTitle: 'Печать сметы (PDF)',
    allRoomsScope: 'Все помещения',
    singleRoomScope: 'Отдельное помещение',
    selectRoom: 'Выберите комнату',
    printPhotos: 'Печатать фото объекта',
    photosOnNewPage: 'Фото с новой страницы',
    photosSectionTitle: 'Фотофиксация помещения',
    photosCountUnit: 'фото',
    noPhotosAttached: 'Нет прикрепленных фото',
    blueprintSchemeTitle: 'Схема раскроя и диагоналей потолка',
    estimateWorkAndMaterials: 'Наименование работ и материалов',
    quantity: 'Количество',
    unit: 'Ед. изм.',
    unitPcs: 'шт',
    unitM2: 'м²',
    unitM: 'м.п.',
    price: 'Цена',
    amount: 'Сумма',
    roomSubtotal: 'Итого по помещению',
    orderGrandTotal: 'Итог заказа',
    totalAreaAndPerimeter: 'S общая',
    materialsAndLaborSum: 'Сумма за материалы и монтажные работы:',
    discount: 'Скидка',
    contractTotal: 'Общая стоимость договора:',
    prepaymentPaid: 'Внесенная предоплата (аванс):',
    balanceDue: 'К оплате после установки:',
    paymentDetails: 'Реквизиты для оплаты / внесения аванса:',
    warranty: 'Гарантия:',
    customerSignature: 'Заказчик: (подпись)',
    contractorSignature: 'Исполнитель: (подпись)',
    canvasItemLabel: 'Полотно натяжного потолка',
    profileItemLabel: 'Профиль крепления и монтаж',
    extraCornersItemLabel: 'Обработка дополнительных углов (>4 шт)',
    chandelierItemLabel: 'Монтаж люстры (закладная + планка/крюк)',
    spotItemLabel: 'Монтаж точечного светильника (стойка, разводка)',
    lightLineItemLabel: 'Световая линия со светодиодной лентой',
    pipePassItemLabel: 'Обвод трубы отопления (термокольцо)',
    curtainNicheItemLabel: 'Ниша под карниз для штор',
    hardWallItemLabel: 'Сверление керамогранита/плитки',

    // Blueprint & Legend
    wall: 'Стена',
    legendDiagonals: 'Диагонали (раскрой)',
    legendChandeliers: 'Люстры',
    legendSpots: 'Точки света',
    legendPipes: 'Обводы труб',
    legendCurtainNiche: 'Ниша штор',
    legendLightLines: 'Световые линии',
    scaleAuto: 'Масштаб 1:1 авто',
    niche: 'Ниша',
    pipe: 'Труба',
    chandelierLetter: 'Л',
    curtainNicheBinding: 'Привязка ниши штор к стене:',

    // Touch Blueprint Editor
    touchEditorInstructionTitle: 'Как редактировать чертеж пальцем на смартфоне/планшете:',
    touchEditorInstruction1: 'Коснитесь синего кружка угла (A, B, C...) и тяните в любую сторону без рывков.',
    touchEditorInstruction2: 'Кнопками + и - в верхнем меню регулируйте масштаб для точной подгонки.',
    touchEditorInstruction3: 'Размеры стен, диагонали и площадь пересчитываются мгновенно в реальном времени.',
    touchEditorInstruction4: 'Значки люстры и спотов тоже можно перемещать пальцем в нужное место комнаты.',
    touchEditorInstruction5: 'Кнопка «+Угол» позволяет построить 5-угольные и сложные многоугольные комнаты.',
    snapToGridOn: 'Привязка к сетке: ВКЛ',
    freeMove: 'Свободное перемещение',
    zoomIn: 'Увеличить масштаб (+)',
    zoomOut: 'Уменьшить масштаб (-)',
    resetZoom: 'Сбросить масштаб (100%)',

    // Dashboard & Workflow
    quickToolsTitle: 'Быстрые инструменты мастера',
    quickMeasurement: 'Быстрый замер',
    objectsAndClients: 'Объекты и клиенты',
    noUrgentVisits: 'На сегодня срочных выездов нет',
    noUrgentVisitsDesc: 'Создайте новый замер или проверьте список текущих заказов',
    todayScheduled: 'Сегодня по расписанию',
    tomorrow: 'Завтра',
    inDays: 'Через',
    measureSurvey: 'Замер помещения',
    installCeiling: 'Монтаж натяжного потолка',
    clientLabel: 'Заказчик:',
    goToObject: 'Перейти к объекту',
    objectsCount: 'Объектов',
    roomsCount: 'Комнат',
    areaMetric: 'Площадь',
    chooseObject: 'Выбрать объект',
    createNewObject: '+ Создать новый объект',
    selectObjectFromListDesc: 'Выберите объект из выпадающего списка или создайте новый',
    selectObjectError: 'Пожалуйста, выберите объект из списка',
    specifyAddressError: 'Пожалуйста, укажите адрес объекта',
    specifyClientError: 'Пожалуйста, укажите или выберите клиента',
    roomTypeApartment: 'Квартира',
    roomTypeHouse: 'Дом / коттедж',
    roomTypeOffice: 'Офис',
    roomTypeCommercial: 'Коммерческое помещение',
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

    // PDF / Print Estimate
    printEstimateTitle: 'Print Estimate (PDF)',
    allRoomsScope: 'All Rooms',
    singleRoomScope: 'Single Room',
    selectRoom: 'Select room',
    printPhotos: 'Print attached photos',
    photosOnNewPage: 'Photos on new page',
    photosSectionTitle: 'Site Photo Documentation',
    photosCountUnit: 'photos',
    noPhotosAttached: 'No attached photos',
    blueprintSchemeTitle: 'Ceiling cut & diagonals scheme',
    estimateWorkAndMaterials: 'Item description & materials',
    quantity: 'Qty',
    unit: 'Unit',
    unitPcs: 'pcs',
    unitM2: 'm²',
    unitM: 'lin.m',
    price: 'Price',
    amount: 'Amount',
    roomSubtotal: 'Room total',
    orderGrandTotal: 'Order Summary',
    totalAreaAndPerimeter: 'Total Area',
    materialsAndLaborSum: 'Materials & installation total:',
    discount: 'Discount',
    contractTotal: 'Total contract amount:',
    prepaymentPaid: 'Prepayment received (advance):',
    balanceDue: 'Balance due upon completion:',
    paymentDetails: 'Bank details for payment / advance:',
    warranty: 'Warranty:',
    customerSignature: 'Customer: (signature)',
    contractorSignature: 'Contractor: (signature)',
    canvasItemLabel: 'Stretch ceiling canvas',
    profileItemLabel: 'Perimeter mounting profile & labor',
    extraCornersItemLabel: 'Extra corners processing (>4 pcs)',
    chandelierItemLabel: 'Chandelier mount installation',
    spotItemLabel: 'Spotlight installation (mount & wiring)',
    lightLineItemLabel: 'LED light line with profile',
    pipePassItemLabel: 'Heating pipe bypass (thermal ring)',
    curtainNicheItemLabel: 'Hidden curtain niche',
    hardWallItemLabel: 'Hard tile / porcelain drilling',

    // Blueprint & Legend
    wall: 'Wall',
    legendDiagonals: 'Diagonals (cut)',
    legendChandeliers: 'Chandeliers',
    legendSpots: 'Spotlights',
    legendPipes: 'Pipe bypass',
    legendCurtainNiche: 'Curtain niche',
    legendLightLines: 'Light lines',
    scaleAuto: 'Scale 1:1 auto',
    niche: 'Niche',
    pipe: 'Pipe',
    chandelierLetter: 'L',
    curtainNicheBinding: 'Curtain niche wall attachment:',

    // Touch Blueprint Editor
    touchEditorInstructionTitle: 'How to edit blueprint with touch gestures:',
    touchEditorInstruction1: 'Touch corner vertex (A, B, C...) and drag smoothly in any direction.',
    touchEditorInstruction2: 'Use + and - zoom buttons in top toolbar for fine adjustments.',
    touchEditorInstruction3: 'Wall dimensions, diagonals and area update instantly in real time.',
    touchEditorInstruction4: 'Chandelier and spotlight icons can also be dragged to any room position.',
    touchEditorInstruction5: 'Use "+Corner" button to create 5-sided or multi-vertex custom layouts.',
    snapToGridOn: 'Grid Snap: ON',
    freeMove: 'Free movement',
    zoomIn: 'Zoom In (+)',
    zoomOut: 'Zoom Out (-)',
    resetZoom: 'Reset Zoom (100%)',

    // Dashboard & Workflow
    quickToolsTitle: 'Quick Tools',
    quickMeasurement: 'Quick Measurement',
    objectsAndClients: 'Projects & Clients',
    noUrgentVisits: 'No urgent site visits scheduled for today',
    noUrgentVisitsDesc: 'Create a new measurement survey or inspect existing projects',
    todayScheduled: 'Scheduled for today',
    tomorrow: 'Tomorrow',
    inDays: 'In',
    measureSurvey: 'Room survey & measurement',
    installCeiling: 'Stretch ceiling installation',
    clientLabel: 'Customer:',
    goToObject: 'Go to project',
    objectsCount: 'Projects',
    roomsCount: 'Rooms',
    areaMetric: 'Area',
    chooseObject: 'Select Project',
    createNewObject: '+ Create New Project',
    selectObjectFromListDesc: 'Select an existing project from dropdown or create a new one',
    selectObjectError: 'Please select a project from the list',
    specifyAddressError: 'Please specify the project address',
    specifyClientError: 'Please select or enter the customer name',
    roomTypeApartment: 'Apartment',
    roomTypeHouse: 'House / Villa',
    roomTypeOffice: 'Office',
    roomTypeCommercial: 'Commercial Space',
  },
};

export const ROOM_PRESETS: Record<Locale, string[]> = {
  uk: ['Вітальня', 'Спальня', 'Кухня', 'Передпокій', 'Санвузол', 'Ванна', 'Дитяча', 'Коридор', 'Кабінет', 'Балкон'],
  ru: ['Гостиная', 'Спальня', 'Кухня', 'Прихожая', 'Санузел', 'Ванная', 'Детская', 'Коридор', 'Кабинет', 'Балкон'],
  en: ['Living Room', 'Bedroom', 'Kitchen', 'Hallway', 'Bathroom', 'Shower', 'Kids Room', 'Corridor', 'Office', 'Balcony'],
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
