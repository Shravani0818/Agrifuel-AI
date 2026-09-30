import {
  AIDecisionEngineOutput,
  AppNotification,
  AppSettings,
  CombinedFarmRecommendation,
  CropScannerResult,
  CropStage,
  CropType,
  EnergyConversionCoefficients,
  FarmProfile,
  FarmerEnergyAccount,
  FPOFarmerRecord,
  IoTState,
  OverallCropHealthLabel,
  RiskLevel,
  SavedCropAnalysis,
  SymptomType,
  VillageRecord,
  WeatherData,
} from '../types/agrifuel';

export const DEFAULT_FARM_PROFILE: FarmProfile = {
  farmerId: 'F001',
  farmerName: 'Rajesh Patil',
  village: 'Shirur',
  location: 'Shirur, Pune, Maharashtra',
  farmAreaAcres: 5,
  primaryCrop: 'Soybean',
  soilType: 'Black Soil',
  irrigationType: 'Rainfed',
};

export const DEFAULT_SETTINGS: AppSettings = {
  demoMode: true,
  notifications: true,
  sensorSimulation: true,
  weatherSimulation: true,
};

export const DEMO_WEATHER_DATA: WeatherData = {
  location: 'Pune, Maharashtra',
  temperature: 28,
  humidity: 67,
  rainProbability: 65,
  windSpeed: 12,
  forecast: [
    { day: 'Mon', temp: 28, rainProb: 65, humidity: 67 },
    { day: 'Tue', temp: 29, rainProb: 58, humidity: 64 },
    { day: 'Wed', temp: 27, rainProb: 74, humidity: 72 },
    { day: 'Thu', temp: 26, rainProb: 80, humidity: 76 },
    { day: 'Fri', temp: 28, rainProb: 50, humidity: 65 },
    { day: 'Sat', temp: 30, rainProb: 35, humidity: 58 },
    { day: 'Sun', temp: 29, rainProb: 42, humidity: 61 },
  ],
};

export const INITIAL_IOT_STATE: IoTState = {
  connected: true,
  temperature: 28.4,
  humidity: 67,
  soilMoisture: 42,
  methaneIndicator: 72, // MQ-4 Methane (CH₄) concentration indicator (qualitative concentration in headspace, %)
  pumpStatus: 'OFF',
  status: 'NORMAL',
  history: [
    { timestamp: '08:00', temperature: 26.8, humidity: 71, soilMoisture: 45, methaneIndicator: 68 },
    { timestamp: '09:00', temperature: 27.3, humidity: 69, soilMoisture: 44, methaneIndicator: 69 },
    { timestamp: '10:00', temperature: 27.9, humidity: 68, soilMoisture: 43, methaneIndicator: 71 },
    { timestamp: '11:00', temperature: 28.2, humidity: 67, soilMoisture: 42, methaneIndicator: 71 },
    { timestamp: '12:00', temperature: 28.4, humidity: 67, soilMoisture: 42, methaneIndicator: 72 },
  ],
};

// Crop residue yield coefficients in Tonnes per Acre
// Ensures direct mathematical consistency: Farm Area (acres) × Coefficient (t/acre) = Displayed Residue (tonnes)
// e.g. 5.0 acres × 0.50 t/acre = 2.50 tonnes (matches default 5-acre Soybean baseline)
export const RESIDUE_COEFFICIENTS_TONNES_PER_ACRE: Record<CropType, number> = {
  Soybean: 0.5,
  Wheat: 0.6,
  Rice: 0.8,
  Cotton: 0.7,
  Maize: 0.8,
};

// Kept for backward compatibility and hectare conversions (~2.471 acres per hectare)
export const RESIDUE_COEFFICIENTS_TONNES_PER_HA: Record<CropType, number> = {
  Soybean: 1.25,
  Wheat: 1.5,
  Rice: 2.0,
  Cotton: 1.75,
  Maize: 2.0,
};

export const CROP_RESIDUE_TYPES: Record<CropType, string> = {
  Soybean: 'Soybean Haulms & Pod Husks',
  Wheat: 'Wheat Straw & Chaff',
  Rice: 'Paddy Straw & Husk',
  Cotton: 'Cotton Stalks & Boll Shells',
  Maize: 'Maize Stover & Cobs',
};

export const ACRES_TO_HECTARES = 0.404686;

export function calculateResidueMetrics(crop: CropType, areaAcres: number) {
  const safeAcres = Math.max(0.5, Number.isFinite(areaAcres) ? areaAcres : 5);
  const areaHectares = +(safeAcres * ACRES_TO_HECTARES).toFixed(2);
  const coeffPerAcre = RESIDUE_COEFFICIENTS_TONNES_PER_ACRE[crop] ?? 0.5;
  // Direct, transparent formula: farm area × residue coefficient gives the displayed residue value
  const estimatedResidueTonnes = +(safeAcres * coeffPerAcre).toFixed(2);
  const potentialBiomassTonnes = +(estimatedResidueTonnes * 0.85).toFixed(2);
  const potentialFeedstockTonnes = +(estimatedResidueTonnes * 0.8).toFixed(2);
  const illustrativeBiogasM3 = Math.round(potentialFeedstockTonnes * 212.5);
  const illustrativeEnergyKwh = Math.round(illustrativeBiogasM3 * 2.0);
  const illustrativeDigestateTonnes = +(potentialFeedstockTonnes * 0.72).toFixed(2);

  return {
    areaAcres: safeAcres,
    areaHectares,
    coefficientTonnesPerAcre: coeffPerAcre,
    coefficientTonnesPerHa: +(coeffPerAcre / ACRES_TO_HECTARES).toFixed(2),
    estimatedResidueTonnes,
    potentialBiomassTonnes,
    potentialFeedstockTonnes,
    illustrativeBiogasM3,
    illustrativeEnergyKwh,
    illustrativeDigestateTonnes,
  };
}

// ========================================================
// SMART FARMER RESOURCE & ENERGY ACCOUNTING DEFAULTS
// ========================================================

// Default configurable coefficients designed so that:
// 2.5 tonnes gross residue -> 2.0 tonnes eligible feedstock (80%)
// -> 425 m³ biogas (212.5 m³/t eligible feedstock)
// -> 850 kWh energy earned (2.0 kWh/m³ biogas, or 340 kWh per gross tonne)
export const DEFAULT_CONVERSION_COEFFICIENTS: EnergyConversionCoefficients = {
  eligibleFeedstockFraction: 0.8,
  biogasM3PerEligibleTonne: 212.5,
  energyKwhPerBiogasM3: 2.0,
  monetaryRateInrPerKwh: 8.0,
};

export function calculateEnergyFromResidue(
  grossResidueTonnes: number,
  coeffs: EnergyConversionCoefficients = DEFAULT_CONVERSION_COEFFICIENTS
) {
  const safeTonnes = Math.max(0.1, Number.isFinite(grossResidueTonnes) ? grossResidueTonnes : 0);
  const eligibleFeedstockTonnes = +(safeTonnes * coeffs.eligibleFeedstockFraction).toFixed(2);
  const estimatedBiogasM3 = Math.round(
    eligibleFeedstockTonnes * coeffs.biogasM3PerEligibleTonne
  );
  const farmerEnergyCreditKwh = Math.round(
    estimatedBiogasM3 * coeffs.energyKwhPerBiogasM3
  );
  const estimatedMonetaryValueInr = Math.round(
    farmerEnergyCreditKwh * coeffs.monetaryRateInrPerKwh
  );

  return {
    grossResidueTonnes: +safeTonnes.toFixed(2),
    eligibleFeedstockTonnes,
    estimatedBiogasM3,
    farmerEnergyCreditKwh,
    estimatedMonetaryValueInr,
  };
}

export const INITIAL_FARMER_ENERGY_ACCOUNT: FarmerEnergyAccount = {
  farmerId: 'F001',
  farmerName: 'Rajesh Patil',
  village: 'Shirur',
  location: 'Shirur, Pune, Maharashtra',
  farmAreaAcres: 5,
  primaryCrop: 'Soybean',
  activeMonth: 'Sep',
  residueContributionTonnes: 2.5,
  energyEarnedKwh: 850,
  energyUsedKwh: 700,
  currentBalanceKwh: 150,
  carryForwardKwh: 150,
  estimatedMonetaryValueInr: 1200,
  biogasGeneratedM3: 425,
  transactions: [
    {
      id: 'tx-sep-01',
      date: 'Sep 05',
      fullDate: 'September 05, 2026',
      monthKey: 'Sep',
      type: 'CONTRIBUTION',
      activity: 'Residue Contribution (Soybean)',
      crop: 'Soybean',
      residueType: 'Soybean Haulms & Pod Husks',
      quantityTonnes: 1.2,
      status: 'Collected',
      energyKwhDelta: 400,
    },
    {
      id: 'tx-sep-02',
      date: 'Sep 12',
      fullDate: 'September 12, 2026',
      monthKey: 'Sep',
      type: 'CONTRIBUTION',
      activity: 'Residue Contribution (Soybean)',
      crop: 'Soybean',
      residueType: 'Soybean Haulms & Pod Husks',
      quantityTonnes: 1.3,
      status: 'Collected',
      energyKwhDelta: 450,
    },
    {
      id: 'tx-sep-03',
      date: 'Sep 20',
      fullDate: 'September 20, 2026',
      monthKey: 'Sep',
      type: 'USAGE',
      activity: 'Irrigation',
      energyKwhDelta: -300,
      category: 'Irrigation',
    },
    {
      id: 'tx-sep-04',
      date: 'Sep 25',
      fullDate: 'September 25, 2026',
      monthKey: 'Sep',
      type: 'USAGE',
      activity: 'Farm Equipment',
      energyKwhDelta: -200,
      category: 'Farm Equipment',
    },
    {
      id: 'tx-sep-05',
      date: 'Sep 26',
      fullDate: 'September 26, 2026',
      monthKey: 'Sep',
      type: 'USAGE',
      activity: 'Processing & Lighting',
      energyKwhDelta: -200,
      category: 'Processing',
    },
  ],
  monthlyLedger: [
    {
      monthKey: 'Sep',
      monthName: 'September 2026',
      carryForwardKwh: 0,
      energyEarnedKwh: 850,
      totalAvailableKwh: 850,
      energyUsedKwh: 700,
      closingBalanceKwh: 150,
      residueContributedTonnes: 2.5,
      settled: false,
    },
    {
      monthKey: 'Oct',
      monthName: 'October 2026',
      carryForwardKwh: 150,
      energyEarnedKwh: 500,
      totalAvailableKwh: 650,
      energyUsedKwh: 400,
      closingBalanceKwh: 250,
      residueContributedTonnes: 1.5,
      settled: false,
    },
    {
      monthKey: 'Nov',
      monthName: 'November 2026',
      carryForwardKwh: 250,
      energyEarnedKwh: 600,
      totalAvailableKwh: 850,
      energyUsedKwh: 500,
      closingBalanceKwh: 350,
      residueContributedTonnes: 1.8,
      settled: false,
    },
  ],
};

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-1',
    category: 'Energy',
    title: '⚡ Energy Balance Updated',
    description:
      'You have 150 kWh of unused energy available for carry-forward from your 850 kWh September credits.',
    dateTime: 'Today, 09:45 AM',
    read: false,
    severity: 'info',
    linkPage: 'farmer-resource-profile',
  },
  {
    id: 'notif-2',
    category: 'Residue',
    title: '🌾 Residue Contribution Recorded',
    description:
      'Your 2.5 tonnes of soybean residue has been recorded in the Shirur Community Biogas ledger (+850 kWh).',
    dateTime: 'Sep 26, 2026 · 04:15 PM',
    read: false,
    severity: 'success',
    linkPage: 'residue-intelligence',
  },
  {
    id: 'notif-3',
    category: 'Crop',
    title: '🌱 Crop Analysis Available',
    description:
      'Your uploaded crop image has been analyzed. Review the Priority 1 Natural & Priority 2 Nutrient actions.',
    dateTime: 'Sep 26, 2026 · 11:30 AM',
    read: false,
    severity: 'info',
    linkPage: 'crop-scanner',
  },
  {
    id: 'notif-4',
    category: 'Energy',
    title: '♻ Energy Carry Forward',
    description:
      '150 kWh from September is scheduled to carry forward automatically to your October opening balance.',
    dateTime: 'Sep 25, 2026 · 06:00 PM',
    read: true,
    severity: 'info',
    linkPage: 'farmer-resource-profile',
  },
  {
    id: 'notif-5',
    category: 'Weather',
    title: '🌦 Elevated Rain Probability (65%)',
    description:
      'Rain probability in Shirur, Pune is elevated at 65%. Delay irrigation to conserve water and energy credits.',
    dateTime: 'Sep 25, 2026 · 08:00 AM',
    read: true,
    severity: 'warning',
    linkPage: 'farm-advisor',
  },
];

export const INITIAL_FPO_FARMER_RECORDS: FPOFarmerRecord[] = [
  {
    farmerId: 'F001',
    farmerName: 'Rajesh Patil',
    village: 'Shirur',
    crop: 'Soybean',
    farmAreaAcres: 5,
    residueContributionTonnes: 2.5,
    energyEarnedKwh: 850,
    energyUsedKwh: 700,
    currentBalanceKwh: 150,
    carryForwardKwh: 150,
    status: 'Active',
  },
  {
    farmerId: 'F002',
    farmerName: 'Sunita Deshmukh',
    village: 'Baramati',
    crop: 'Maize',
    farmAreaAcres: 6.5,
    residueContributionTonnes: 3.8,
    energyEarnedKwh: 1290,
    energyUsedKwh: 980,
    currentBalanceKwh: 310,
    carryForwardKwh: 310,
    status: 'Active',
  },
  {
    farmerId: 'F003',
    farmerName: 'Mahesh Jadhav',
    village: 'Daund',
    crop: 'Wheat',
    farmAreaAcres: 4.0,
    residueContributionTonnes: 2.1,
    energyEarnedKwh: 715,
    energyUsedKwh: 600,
    currentBalanceKwh: 115,
    carryForwardKwh: 115,
    status: 'Active',
  },
  {
    farmerId: 'F004',
    farmerName: 'Kavita Shinde',
    village: 'Indapur',
    crop: 'Cotton',
    farmAreaAcres: 7.0,
    residueContributionTonnes: 3.4,
    energyEarnedKwh: 1155,
    energyUsedKwh: 910,
    currentBalanceKwh: 245,
    carryForwardKwh: 245,
    status: 'Active',
  },
  {
    farmerId: 'F005',
    farmerName: 'Prakash Pawar',
    village: 'Khed',
    crop: 'Rice',
    farmAreaAcres: 5.5,
    residueContributionTonnes: 3.2,
    energyEarnedKwh: 1090,
    energyUsedKwh: 840,
    currentBalanceKwh: 250,
    carryForwardKwh: 250,
    status: 'Active',
  },
  {
    farmerId: 'F006',
    farmerName: 'Anil Gaikwad',
    village: 'Shirur',
    crop: 'Soybean',
    farmAreaAcres: 4.5,
    residueContributionTonnes: 2.2,
    energyEarnedKwh: 750,
    energyUsedKwh: 590,
    currentBalanceKwh: 160,
    carryForwardKwh: 160,
    status: 'Active',
  },
  {
    farmerId: 'F007',
    farmerName: 'rekha Kadam',
    village: 'Baramati',
    crop: 'Soybean',
    farmAreaAcres: 5.0,
    residueContributionTonnes: 2.6,
    energyEarnedKwh: 885,
    energyUsedKwh: 745,
    currentBalanceKwh: 140,
    carryForwardKwh: 140,
    status: 'Settled',
  },
  {
    farmerId: 'F008',
    farmerName: 'Santosh Bhosale',
    village: 'Daund',
    crop: 'Maize',
    farmAreaAcres: 8.0,
    residueContributionTonnes: 4.4,
    energyEarnedKwh: 1495,
    energyUsedKwh: 1195,
    currentBalanceKwh: 300,
    carryForwardKwh: 300,
    status: 'Active',
  },
  {
    farmerId: 'F009',
    farmerName: 'Nitin Thorat',
    village: 'Indapur',
    crop: 'Wheat',
    farmAreaAcres: 3.5,
    residueContributionTonnes: 1.8,
    energyEarnedKwh: 610,
    energyUsedKwh: 520,
    currentBalanceKwh: 90,
    carryForwardKwh: 90,
    status: 'Review',
  },
  {
    farmerId: 'F010',
    farmerName: 'Vaishali Kulkarni',
    village: 'Khed',
    crop: 'Soybean',
    farmAreaAcres: 6.0,
    residueContributionTonnes: 3.0,
    energyEarnedKwh: 1020,
    energyUsedKwh: 800,
    currentBalanceKwh: 220,
    carryForwardKwh: 220,
    status: 'Active',
  },
];

// Generate Crop Scanner Demo Analysis (with Priority 1, 2, 3 Treatment Hierarchy)
export function generateCropAnalysis(
  crop: string,
  symptom: SymptomType,
  stage: CropStage,
  description?: string
): CropScannerResult {
  const descNote = description?.trim()
    ? `Farmer observation ("${description.trim()}") aligns with visual canopy indicators.`
    : 'Evaluated against Pune Black Soil moisture (42%) and elevated rain probability (65%).';

  if (symptom === 'Healthy') {
    return {
      crop,
      symptom,
      stage,
      detectedCondition: 'Healthy canopy vigor and balanced leaf coloration',
      risk: 'LOW',
      confidence: 92,
      possibleCause: 'Adequate soil moisture and balanced root-zone nutrition',
      recommendedSteps: [
        'Continue routine weekly visual field scouting across inner and outer rows.',
        'Maintain current soil moisture levels without over-irrigating.',
        'Keep field borders clear of weeds to support natural airflow.',
        'Record growth stage progression for harvest and residue planning.',
        'Consult local agricultural extension guidelines for seasonal best practices.',
      ],
      cropDetected: crop,
      overallHealth: 'Good',
      healthScore: 91,
      visibleSymptoms: [
        'Uniform deep-green chlorophyll coloration across upper and mid canopy',
        'Normal leaf turgor and upright petiole posture without wilting',
        'No significant necrotic lesions, chlorosis, or insect feeding holes observed',
      ],
      possibleIssues: [
        'No immediate stress indicators observed in the image',
        'Potential minor micro-climate humidity buildup if dense rainfall continues',
      ],
      possibleCauses: [
        'Balanced soil moisture (42%) and favorable vegetative/flowering nutrition',
        'Effective natural canopy ventilation across rows',
      ],
      priority1Natural: [
        'Continue weekly visual scouting across multiple rows to track flower and pod development.',
        'Maintain current root-zone moisture balance; delay irrigation while rain probability is 65%.',
        'Preserve clean field borders and inter-row airflow to prevent humidity buildup.',
        'Plan post-harvest residue collection early to avoid open-field burning.',
      ],
      priority2Nutrient: [
        'Consider routine seasonal soil testing before applying any supplementary fertilizer.',
        'Apply stabilized organic bio-digestate from the community biogas plant during land preparation to maintain soil carbon.',
      ],
      showPriority3Chemical: false,
      priority3Chemical:
        'No chemical intervention indicated. If unexpected pest or disease symptoms appear later, consult a qualified agricultural professional.',
      recommendedActions: [
        'Continue routine field monitoring across multiple plants in the plot.',
        'Avoid unnecessary irrigation while rain probability remains elevated (65%).',
        'Maintain clean inter-row drainage channels ahead of forecast showers.',
        'Upload another image in 5–7 days to track canopy progression.',
        'Plan post-harvest crop residue collection for community bioenergy & organic digestate.',
      ],
      monitoringAdvice: [
        'Upload another image in a few days to compare crop condition.',
        'Inspect lower canopy leaves after rainfall events for excess dampness.',
      ],
      whenToSeekExpertHelp:
        'If sudden yellowing, wilting, or pest damage appears across multiple rows, consult a qualified agricultural expert.',
      environmentalContextNote: `${descNote} Environmental data (42% soil moisture, 28°C, 67% humidity) helps contextualize canopy health but does not guarantee a definitive diagnosis.`,
      disclaimer: 'AI image-based assessment — Not a certified professional agricultural diagnosis.',
      analysisSource: 'demo',
      imageQualitySufficient: true,
      isCropImage: true,
    };
  }

  const analysisMap: Record<
    Exclude<SymptomType, 'Healthy'>,
    {
      condition: string;
      risk: RiskLevel;
      confidence: number;
      healthLabel: OverallCropHealthLabel;
      healthScore: number;
      cause: string;
      visibleSymptoms: string[];
      possibleIssues: string[];
      possibleCauses: string[];
      priority1Natural: string[];
      priority2Nutrient: string[];
      showPriority3Chemical: boolean;
      priority3Chemical: string;
      steps: string[];
    }
  > = {
    'Yellow Leaves': {
      condition: 'Possible nutrient / moisture stress',
      risk: 'MEDIUM',
      confidence: 84,
      healthLabel: 'Moderate',
      healthScore: 78,
      cause: 'Nutrient imbalance (such as nitrogen/iron mobilization) or root-zone moisture stress',
      visibleSymptoms: [
        'Yellowing (chlorosis) visible primarily on lower and older leaves',
        'Mild interveinal leaf discoloration along mid-canopy foliage',
        'No obvious severe necrotic stem damage or widespread wilting visible',
      ],
      possibleIssues: [
        'Possible nutrient stress (nitrogen or micronutrient mobilization during flowering)',
        'Possible root-zone moisture fluctuation',
      ],
      possibleCauses: [
        'Temporary nutrient draw during active vegetative/flowering transition',
        'Leaching or uneven moisture distribution in Black Soil following recent showers',
      ],
      priority1Natural: [
        'Monitor affected plants across 5–10 locations in the field to check if yellowing is localized.',
        'Maintain appropriate soil moisture (currently 42%) and avoid over-irrigation before forecast rain (65%).',
        'Remove severely senescent or damaged lower leaves if they restrict ground-level airflow.',
        'Improve field hygiene and ensure shallow drainage furrows are clear of standing water.',
      ],
      priority2Nutrient: [
        'Consider soil testing before applying fertilizer to verify nitrogen, iron, or sulfur levels.',
        'Consider an appropriate nutrient source or stabilized organic bio-digestate based on soil-test recommendations.',
        'Avoid uncalibrated foliar fertilizer sprays during humid or rainy conditions.',
      ],
      showPriority3Chemical: true,
      priority3Chemical:
        'If the problem continues or spreads rapidly across the upper canopy, consult a qualified agricultural professional for an appropriate registered treatment.',
      steps: [
        'Check soil moisture.',
        'Inspect additional plants in the same area.',
        'Compare symptoms across multiple leaves.',
        'Review recent rainfall and irrigation.',
        'Consider soil testing if symptoms persist.',
      ],
    },
    'Brown Spots': {
      condition: 'Possible foliar moisture stress or early leaf spotting',
      risk: 'MEDIUM',
      confidence: 84,
      healthLabel: 'Moderate',
      healthScore: 75,
      cause: 'Prolonged leaf wetness, high relative humidity, or localized foliar stress',
      visibleSymptoms: [
        'Small scattered brown spots visible on mid-to-lower leaf surfaces',
        'Mild yellowish halo surrounding older spots on humid lower foliage',
        'Upper canopy leaves remain mostly intact with moderate vigor',
      ],
      possibleIssues: [
        'Possible humidity-related foliar spotting',
        'Potential localized fungal or environmental leaf stress',
      ],
      possibleCauses: [
        'Elevated relative humidity (67%) and prolonged morning dew on dense foliage',
        'Rain splash from soil surface onto lower leaves',
      ],
      priority1Natural: [
        'Monitor affected plants and inspect both upper and lower leaf surfaces across multiple rows.',
        'Maintain appropriate soil moisture and avoid overhead sprinkler wetting in late afternoon.',
        'Remove severely affected plant material if appropriate to reduce localized spore splash.',
        'Improve field hygiene and inter-row canopy airflow.',
      ],
      priority2Nutrient: [
        'Consider soil testing before applying fertilizer to ensure balanced potassium and micronutrient levels.',
        'Consider an appropriate nutrient source or organic bio-digestate to support natural leaf resilience.',
      ],
      showPriority3Chemical: true,
      priority3Chemical:
        'If the problem continues or spreads across the field, consult a qualified agricultural professional for an appropriate registered treatment.',
      steps: [
        'Inspect both upper and lower leaf surfaces across 5–10 random plants.',
        'Avoid overhead evening irrigation to reduce prolonged leaf wetness.',
        'Improve airflow by managing excessive weed density between rows.',
        'Remove heavily fallen debris during routine manual weeding.',
        'Consult a qualified agricultural expert if spotting spreads rapidly.',
      ],
    },
    Wilting: {
      condition: 'Possible root-zone water deficit or drainage imbalance',
      risk: 'HIGH',
      confidence: 89,
      healthLabel: 'Needs Attention',
      healthScore: 66,
      cause: 'Insufficient root-zone moisture availability or localized soil compaction',
      visibleSymptoms: [
        'Drooping leaf petioles and loss of turgor pressure across upper shoots',
        'Inward leaf rolling indicating transpiration stress',
        'Dull greyish-green leaf surface appearance compared to healthy rows',
      ],
      possibleIssues: [
        'Possible acute moisture stress or uneven root-zone water uptake',
        'Potential localized root compaction or drainage issue',
      ],
      possibleCauses: [
        'Uneven soil moisture distribution across sloped or compacted plot sections',
        'High midday evapotranspiration demand during ${stage} stage',
      ],
      priority1Natural: [
        'Monitor affected plants early in the morning vs midday to check if turgor recovers overnight.',
        'Maintain appropriate soil moisture by checking root-zone dampness at 10–15 cm depth.',
        'Improve field hygiene and loosen crusted surface soil gently around plant rows.',
        'Ensure drainage channels prevent both waterlogging and dry runoff pockets.',
      ],
      priority2Nutrient: [
        'Consider soil testing before applying fertilizer; avoid high-salt fertilizers on wilted plants.',
        'Incorporate organic compost or community biogas digestate between seasons to improve Black Soil water retention.',
      ],
      showPriority3Chemical: true,
      priority3Chemical:
        'If wilting persists despite adequate soil moisture or spreads along rows, consult a qualified agricultural professional for an appropriate registered treatment.',
      steps: [
        'Check soil moisture immediately at 10–15 cm root depth.',
        'Verify whether wilting recovers during cooler evening hours.',
        'Inspect irrigation lines or bunds for dry pockets or waterlogging.',
        'Apply light, targeted irrigation if soil is dry and rain is not imminent.',
        'Consult a qualified agricultural expert if wilting persists despite adequate moisture.',
      ],
    },
    'Leaf Holes': {
      condition: 'Possible mechanical or insect feeding activity',
      risk: 'MEDIUM',
      confidence: 83,
      healthLabel: 'Moderate',
      healthScore: 76,
      cause: 'Localized foliage chewing insects or weather-related physical damage',
      visibleSymptoms: [
        'Irregular small perforations and chewed margins on outer canopy leaves',
        'Most stems and growing points remain intact',
        'Localized distribution concentrated near field borders',
      ],
      possibleIssues: [
        'Possible foliage-feeding insect activity',
        'Potential minor mechanical or wind-borne abrasion',
      ],
      possibleCauses: [
        'Seasonal caterpillar or beetle foraging during vegetative/flowering growth',
        'Border weed hosts harboring opportunistic leaf feeders',
      ],
      priority1Natural: [
        'Monitor affected plants during early morning hours and check under leaves for insect presence.',
        'Maintain appropriate soil moisture so the crop can naturally compensate for minor leaf loss.',
        'Remove severely affected plant material or hand-pick visible larvae on small plots if appropriate.',
        'Improve field hygiene by clearing border weeds and installing pheromone/bird perches.',
      ],
      priority2Nutrient: [
        'Consider soil testing before applying fertilizer; avoid excessive nitrogen which makes foliage overly succulent to pests.',
        'Consider an appropriate balanced nutrient source based on soil-test recommendations.',
      ],
      showPriority3Chemical: true,
      priority3Chemical:
        'If the problem continues or defoliation exceeds economic thresholds, consult a qualified agricultural professional for an appropriate registered treatment.',
      steps: [
        'Scout the field during early morning hours to observe actual pest presence.',
        'Assess what percentage of plants across the plot show fresh leaf feeding.',
        'Use physical traps, bird perches, or cultural monitoring practices first.',
        'Maintain balanced soil nutrition to help the crop tolerate minor foliage loss.',
        'Consult a qualified agricultural expert before considering any intervention.',
      ],
    },
    'Slow Growth': {
      condition: 'Possible soil compaction or nutrient availability constraint',
      risk: 'LOW',
      confidence: 80,
      healthLabel: 'Moderate',
      healthScore: 80,
      cause: 'Sub-optimal root aeration, low organic matter, or cool/cloudy weather spells',
      visibleSymptoms: [
        'Shorter internode length and smaller leaf lamina for the current growth stage',
        'Pale green overall canopy tone without acute lesions',
        'Patchy plant height uniformity across the inspected area',
      ],
      possibleIssues: [
        'Possible slow root establishment or soil compaction',
        'Possible gradual macronutrient availability constraint',
      ],
      possibleCauses: [
        'Heavy Black Soil crusting or reduced root aeration',
        'Low baseline soil organic carbon in rainfed plots',
      ],
      priority1Natural: [
        'Monitor affected plants and compare root depth between vigorous and slow-growing zones.',
        'Maintain appropriate soil moisture without saturating heavy Black Soil.',
        'Improve field hygiene and perform shallow inter-cultivation to aerate the topsoil.',
      ],
      priority2Nutrient: [
        'Consider soil testing before applying fertilizer to check pH, organic carbon, and NPK balance.',
        'Consider an appropriate nutrient source and organic bio-digestate application based on soil-test recommendations.',
      ],
      showPriority3Chemical: false,
      priority3Chemical:
        'Chemical pesticide treatment is not recommended for slow growth. Consult a qualified agricultural professional if root disease is suspected.',
      steps: [
        'Compare growth rate across different zones of the 5-acre plot.',
        'Check soil structure for crusting or water stagnation after rain.',
        'Incorporate organic compost or stabilized biogas digestate in soil management plans.',
        'Schedule a standard soil pH and organic carbon test with the local KVK.',
        'Consult a qualified agricultural expert for stage-appropriate nutrient planning.',
      ],
    },
  };

  const item = analysisMap[symptom];
  return {
    crop,
    symptom,
    stage,
    detectedCondition: item.condition,
    risk: item.risk,
    confidence: item.confidence,
    possibleCause: item.cause,
    recommendedSteps: item.steps,
    cropDetected: crop,
    overallHealth: item.healthLabel,
    healthScore: item.healthScore,
    visibleSymptoms: item.visibleSymptoms,
    possibleIssues: item.possibleIssues,
    possibleCauses: item.possibleCauses,
    priority1Natural: item.priority1Natural,
    priority2Nutrient: item.priority2Nutrient,
    showPriority3Chemical: item.showPriority3Chemical,
    priority3Chemical: item.priority3Chemical,
    recommendedActions: item.steps,
    monitoringAdvice: [
      'Upload another image in a few days to compare crop condition.',
      `Track ${crop} ${stage.toLowerCase()}-stage leaves across 5–10 plants in the same zone.`,
    ],
    whenToSeekExpertHelp:
      'If symptoms spread rapidly or crop damage becomes significant, consult a qualified agricultural expert.',
    environmentalContextNote: `${descNote} Farm context (Soil Moisture: 42%, Temp: 28°C, Humidity: 67%, Rain Prob: 65%) helps interpret visual symptoms but does not guarantee a definitive diagnosis.`,
    disclaimer: 'AI image-based assessment — Not a certified professional agricultural diagnosis.',
    analysisSource: 'demo',
    imageQualitySufficient: true,
    isCropImage: true,
  };
}

// Pre-populated Saved Analysis History so "Crop Health Trend" renders out-of-the-box
export const INITIAL_SAVED_ANALYSES: SavedCropAnalysis[] = [
  {
    id: 'demo-hist-1',
    dateLabel: 'September 20, 2026',
    shortDate: 'Sep 20',
    timestamp: new Date('2026-09-20T09:30:00').getTime(),
    crop: 'Soybean',
    stage: 'Vegetative',
    description: 'Routine canopy check across north parcel.',
    fileName: 'soybean_vegetative_sep20.jpg',
    result: {
      ...generateCropAnalysis('Soybean', 'Slow Growth', 'Vegetative', 'Routine canopy check'),
      overallHealth: 'Good',
      healthScore: 82,
      risk: 'LOW',
      confidence: 86,
    },
  },
  {
    id: 'demo-hist-2',
    dateLabel: 'September 23, 2026',
    shortDate: 'Sep 23',
    timestamp: new Date('2026-09-23T10:15:00').getTime(),
    crop: 'Soybean',
    stage: 'Flowering',
    description: 'Healthy flowering onset after light shower.',
    fileName: 'soybean_flowering_sep23.jpg',
    result: {
      ...generateCropAnalysis('Soybean', 'Healthy', 'Flowering', 'Healthy flowering onset'),
      overallHealth: 'Good',
      healthScore: 85,
      risk: 'LOW',
      confidence: 89,
    },
  },
  {
    id: 'demo-hist-3',
    dateLabel: 'September 27, 2026',
    shortDate: 'Sep 27',
    timestamp: new Date('2026-09-27T11:00:00').getTime(),
    crop: 'Soybean',
    stage: 'Flowering',
    description: 'Leaves have started turning yellow on the lower canopy.',
    fileName: 'soybean_yellow_leaves_sep27.jpg',
    result: {
      ...generateCropAnalysis(
        'Soybean',
        'Yellow Leaves',
        'Flowering',
        'Leaves have started turning yellow on the lower canopy.'
      ),
      overallHealth: 'Moderate',
      healthScore: 78,
      risk: 'MEDIUM',
      confidence: 84,
    },
  },
];

// Combine Crop Image Analysis + Weather + Soil Moisture + Farm Profile (Section 10)
export function generateCombinedFarmRecommendation(
  analysis: CropScannerResult,
  profile: FarmProfile,
  soilMoisture: number,
  temperature: number,
  humidity: number,
  rainProbability: number,
  stage: CropStage
): CombinedFarmRecommendation {
  const isElevatedRain = rainProbability >= 55;
  const isLowMoisture = soilMoisture < 32;

  let farmStatus: 'OPTIMAL' | 'WATCH' | 'ACTION NEEDED' = 'WATCH';
  if (analysis.risk === 'HIGH' || isLowMoisture) {
    farmStatus = 'ACTION NEEDED';
  } else if (analysis.risk === 'LOW' && !isElevatedRain) {
    farmStatus = 'OPTIMAL';
  }

  const irrigationAction =
    soilMoisture >= 38 && isElevatedRain
      ? `Delay irrigation: Root-zone soil moisture is adequate (${soilMoisture}%) and rain probability in ${profile.location} is elevated (${rainProbability}%). Conserving pump run-time also saves your farmer energy credits.`
      : isLowMoisture
      ? `Apply targeted irrigation: Soil moisture is low (${soilMoisture}%), which may be contributing to the observed ${analysis.detectedCondition.toLowerCase()}.`
      : `Maintain moderate moisture monitoring (${soilMoisture}% current) tailored to ${profile.soilType}.`;

  const cropCareAction =
    analysis.overallHealth === 'Good'
      ? `Continue standard ${stage.toLowerCase()}-stage scouting across your ${profile.farmAreaAcres}-acre ${analysis.cropDetected} plot.`
      : `Priority 1 Natural Response: Address "${analysis.possibleIssues[0] || analysis.detectedCondition}" through multi-plant field scouting, moisture balance, and soil testing prior to any fertilizer intervention.`;

  const weatherAction = `Current ${temperature}°C temperature and ${humidity}% relative humidity with ${rainProbability}% rain chance require keeping field drainage channels clear and avoiding foliar sprays before rain.`;

  const residueMetrics = calculateResidueMetrics(
    (profile.primaryCrop as CropType) || 'Soybean',
    profile.farmAreaAcres
  );
  const soilAndBioenergyAction = `Apply stabilized organic digestate from the community biogas plant to enrich ${profile.soilType} micronutrient retention, and plan post-harvest collection (~${residueMetrics.estimatedResidueTonnes}t potential residue) to earn next season's farmer energy credits.`;

  const headline =
    analysis.overallHealth === 'Good'
      ? `Canopy health is strong (${analysis.confidence}% confidence). Hold irrigation ahead of ${rainProbability}% rain forecast.`
      : `Image analysis indicates ${analysis.possibleIssues[0]?.toLowerCase() || 'possible stress'}. Delay irrigation (${soilMoisture}% moisture, ${rainProbability}% rain prob) and inspect lower leaves & soil nutrition.`;

  return {
    farmStatus,
    riskLevel: analysis.risk,
    headline,
    irrigationAction,
    cropCareAction,
    weatherAction,
    soilAndBioenergyAction,
    rationale: `Synthesized from ${
      analysis.analysisSource === 'gemini' ? 'Gemini Multimodal Vision' : 'AgriFuel AI Demo Vision'
    } (${analysis.overallHealth} health, ${analysis.risk} risk) + ESP32 Soil Moisture (${soilMoisture}%) + ${profile.location} Weather (${temperature}°C, ${rainProbability}% rain).`,
  };
}

// Central AI Decision Engine (Section 16)
export function generateAIDecisionEngine(
  profile: FarmProfile,
  iot: IoTState,
  weather: WeatherData,
  cropHealthPercent = 87
): AIDecisionEngineOutput {
  const residue = calculateResidueMetrics(profile.primaryCrop, profile.farmAreaAcres);

  const isLowMoisture = iot.soilMoisture < 32;
  const isHighRainProb = weather.rainProbability >= 55;

  let farmStatus: 'OPTIMAL' | 'WATCH' | 'ACTION NEEDED' = 'WATCH';
  if (isLowMoisture && !isHighRainProb) {
    farmStatus = 'ACTION NEEDED';
  } else if (!isLowMoisture && !isHighRainProb && cropHealthPercent >= 85) {
    farmStatus = 'OPTIMAL';
  }

  const weatherSummary =
    weather.rainProbability >= 55
      ? `Rain probability elevated (${weather.rainProbability}%)`
      : `Moderate conditions (${weather.temperature}°C, ${weather.rainProbability}% rain prob)`;

  const irrigationAdvice =
    iot.soilMoisture >= 38 && weather.rainProbability >= 50
      ? 'Delay irrigation'
      : iot.soilMoisture < 32
      ? 'Schedule light protective irrigation'
      : 'Maintain current moisture schedule';

  const cropAdvice =
    cropHealthPercent >= 85
      ? 'Monitor lower leaves for nutrient stress.'
      : 'Inspect mid-canopy leaves and verify root-zone moisture.';

  const residueAssessment = `Estimated residue availability is high (~${residue.estimatedResidueTonnes} tonnes across ${profile.farmAreaAcres} acres).`;

  const bioenergyOpportunity = `Residue may be evaluated for community biogas (~${residue.potentialFeedstockTonnes} tonnes eligible feedstock) and farmer energy credits.`;

  const overallRecommendation =
    irrigationAdvice === 'Delay irrigation'
      ? 'Continue monitoring crop conditions and avoid unnecessary irrigation while evaluating residue collection and farmer energy credit opportunities.'
      : 'Monitor root-zone soil moisture closely and prepare post-harvest residue collection plans for community bioenergy.';

  return {
    farmStatus,
    crop: profile.primaryCrop,
    cropHealth: cropHealthPercent,
    weatherSummary,
    irrigationAdvice,
    cropAdvice,
    residueAssessment,
    bioenergyOpportunity,
    overallRecommendation,
  };
}

// FPO / Government Regional Dataset (Section 13)
export const FPO_VILLAGE_DATA: VillageRecord[] = [
  {
    id: 'v-shirur',
    village: 'Shirur',
    farmers: 310,
    mainCrop: 'Soybean',
    areaAcres: 1680,
    cropHealth: 88,
    residueTonnes: 620,
    biogasPotentialM3: 4650,
    risk: 'LOW',
  },
  {
    id: 'v-baramati',
    village: 'Baramati',
    farmers: 295,
    mainCrop: 'Maize',
    areaAcres: 1590,
    cropHealth: 86,
    residueTonnes: 580,
    biogasPotentialM3: 4380,
    risk: 'LOW',
  },
  {
    id: 'v-daund',
    village: 'Daund',
    farmers: 240,
    mainCrop: 'Wheat',
    areaAcres: 1320,
    cropHealth: 81,
    residueTonnes: 490,
    biogasPotentialM3: 3690,
    risk: 'MEDIUM',
  },
  {
    id: 'v-indapur',
    village: 'Indapur',
    farmers: 215,
    mainCrop: 'Cotton',
    areaAcres: 1210,
    cropHealth: 76,
    residueTonnes: 410,
    biogasPotentialM3: 3050,
    risk: 'HIGH',
  },
  {
    id: 'v-khed',
    village: 'Khed',
    farmers: 190,
    mainCrop: 'Rice',
    areaAcres: 1040,
    cropHealth: 84,
    residueTonnes: 350,
    biogasPotentialM3: 2630,
    risk: 'MEDIUM',
  },
];

export const FPO_CROP_DISTRIBUTION = [
  { name: 'Soybean', acres: 2450, percentage: 36, fill: '#059669' },
  { name: 'Maize', acres: 1640, percentage: 24, fill: '#0D9488' },
  { name: 'Wheat', acres: 1230, percentage: 18, fill: '#D97706' },
  { name: 'Cotton', acres: 890, percentage: 13, fill: '#0284C7' },
  { name: 'Rice', acres: 630, percentage: 9, fill: '#65A30D' },
];

export const FPO_HEALTH_BREAKDOWN = [
  { category: 'Optimal (85-100%)', farms: 820, fill: '#059669' },
  { category: 'Watch (75-84%)', farms: 346, fill: '#D97706' },
  { category: 'High Risk (<75%)', farms: 84, fill: '#DC2626' },
];

export const FPO_FARMER_CONTRIBUTION_DATA: FPOFarmerRecord[] = INITIAL_FPO_FARMER_RECORDS;

export const COMMUNITY_BIOGAS_PLANT_METRICS = {
  monthlyCapacityKwh: 20000,
  currentGenerationKwh: 12500,
  energyUsedByFarmersKwh: 9800,
  remainingBalanceKwh: 2700,
  utilizationPercent: 78,
};

