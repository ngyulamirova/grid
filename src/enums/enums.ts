export enum TypesEnums {
  combo = 'COMBO',
  solo = 'SOLO',
  promo = 'PROMO',
  regular = 'REGULAR',
  conjunction = 'CONJUNCTION',
  promoVersion = 'PROMO_VERSION',
  promoRegular = 'PROMO_REGULAR',
  allPromoVersions = 'ALL_PROMO_VERSIONS',
  fact = 'FACT',
  categories = 'CATEGORIES',
  support = 'SUPPORT_TYPES',
  subdivisions = 'SUBDIVISIONS',
  storeFormats = 'STORE_FORMATS',
  regions = 'REGIONS',
  mechanics = 'MECHANICS',
  promoPeriods = 'PROMO_PERIODS',
  senseChecks = 'SENSE_CHECKS',
  allAggregated = 'ALL_AGGREGATED',
  allSelected = 'ALL_SELECTED'
}

export enum RolesEnum {
  manager = 'ROLE_MANAGER',
  head = 'ROLE_HEAD',
  plan = 'ROLE_PLAN_MANAGER',
  admin = 'ROLE_ADMIN'
}

export enum StartConfigEnum {
  dixy = 'dixy',
  kfc = 'kfc',
  wdf = 'wdf'
}

export enum ActionTypes {
  combo = 'COMBO',
  solo = 'SOLO',
  sent = 'SENT',
  filling = 'FILLING',
  calculated = 'CALCULATED',
  rejected = 'REJECTED',
  processing = 'PROCESSING',
  approved = 'APPROVED',
  unsaved = 'UNSAVED',
  created = 'CREATED',
  failed = 'FAILED',
  active = 'ACTIVE',
  finished = 'FINISHED',
  undefined = 'UNDEFINED'
}

export enum TimesEnum {
  quarter = 'QUARTER',
  month = 'MONTH',
  week = 'WEEK',
  day = 'DAY'
}

export enum MetricsEnum {
  rubles = 'RUBLES',
  averageCheck = 'AVERAGE_CHECK',
  price = 'PRICE',
  checks = 'CHECKS',
  items = 'ITEMS',
  ssacg = 'SSACG',
  sssg = 'SSSG',
  sstg = 'SSTG'
}

export enum MenuAvailableActionsEnum {
  comment = 'COMMENT_DO',
  uncomment = 'COMMENT_UNDO',
  approve = 'APPROVAL_APPROVE',
  reject = 'APPROVAL_REJECT',
  undo = 'APPROVAL_UNDO',
  fix = 'FIX_DO',
  undoFix = 'FIX_UNDO',
  correct = 'CORRECT',
  clear = 'CLEAR',
}
