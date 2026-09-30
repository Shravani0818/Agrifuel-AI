export type NavPage =
  | 'landing'
  | 'dashboard'
  | 'crop-scanner'
  | 'farm-advisor'
  | 'residue-intelligence'
  | 'community-bioenergy'
  | 'iot-monitoring'
  | 'fpo-dashboard'
  | 'farmer-resource-profile'
  | 'farm-profile'
  | 'settings'
  | 'offline-sms';

export type CropType = 'Soybean' | 'Wheat' | 'Rice' | 'Cotton' | 'Maize';

export type ExtendedCropType = CropType | 'Other';

export type SymptomType =
  | 'Healthy'
  | 'Yellow Leaves'
  | 'Brown Spots'
  | 'Wilting'
  | 'Leaf Holes'
  | 'Slow Growth';

export type CropStage =
  | 'Seedling'
  | 'Vegetative'
  | 'Flowering'
  | 'Fruiting'
  | 'Harvest';

export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';

export type SystemStatus = 'NORMAL' | 'WARNING' | 'CRITICAL';

export type FarmWatchStatus = 'OPTIMAL' | 'WATCH' | 'ACTION NEEDED';

export type OverallCropHealthLabel = 'Good' | 'Moderate' | 'Needs Attention';

export interface FarmProfile {
  farmerId?: string;
  farmerName: string;
  village?: string;
  location: string;
  farmAreaAcres: number;
  primaryCrop: CropType;
  cropGrowthStage?: CropStage;
  soilType: string;
  irrigationType: string;
}

export interface WeatherForecastDay {
  day: string;
  temp: number;
  rainProb: number;
  humidity: number;
}

export interface WeatherData {
  location: string;
  temperature: number;
  humidity: number;
  rainProbability: number;
  windSpeed: number;
  forecast: WeatherForecastDay[];
}

export interface IoTSensorReading {
  timestamp: string;
  temperature: number;
  humidity: number;
  soilMoisture: number;
  methaneIndicator: number; // MQ-4 Methane (CH₄) concentration indicator (%) — qualitative concentration only, not pressure, volume, or tank level
}

export interface IoTState {
  connected: boolean;
  temperature: number;
  humidity: number;
  soilMoisture: number;
  methaneIndicator: number; // MQ-4 qualitative methane concentration indicator (%)
  pumpStatus: 'ON' | 'OFF';
  status: SystemStatus;
  history: IoTSensorReading[];
}

export interface VillageRecord {
  id: string;
  village: string;
  farmers: number;
  mainCrop: CropType;
  areaAcres: number;
  cropHealth: number;
  residueTonnes: number;
  biogasPotentialM3: number;
  risk: RiskLevel;
}

export interface AppSettings {
  demoMode: boolean;
  notifications: boolean;
  sensorSimulation: boolean;
  weatherSimulation: boolean;
}

export interface CropScannerResult {
  crop: string;
  symptom: SymptomType;
  stage: CropStage;
  detectedCondition: string;
  risk: RiskLevel;
  confidence: number;
  possibleCause: string;
  recommendedSteps: string[];
  // Multimodal AI Image-Based Extensions
  cropDetected: string;
  overallHealth: OverallCropHealthLabel;
  healthScore: number;
  visibleSymptoms: string[];
  possibleIssues: string[];
  possibleCauses: string[];
  recommendedActions: string[];
  monitoringAdvice: string[];
  whenToSeekExpertHelp: string;
  environmentalContextNote: string;
  disclaimer: string;
  analysisSource: 'gemini' | 'demo';
  modelName?: string;
  imageQualitySufficient?: boolean;
  isCropImage?: boolean;
  qualityIssueReason?: string;
  // Priority-Based Treatment Hierarchy (Section 10 & 11)
  priority1Natural: string[];
  priority2Nutrient: string[];
  showPriority3Chemical: boolean;
  priority3Chemical: string;
}

export interface SavedCropAnalysis {
  id: string;
  dateLabel: string;
  shortDate: string;
  timestamp: number;
  crop: string;
  stage: CropStage;
  description: string;
  imagePreviewUrl?: string;
  fileName?: string;
  result: CropScannerResult;
}

export interface CombinedFarmRecommendation {
  farmStatus: FarmWatchStatus;
  riskLevel: RiskLevel;
  headline: string;
  irrigationAction: string;
  cropCareAction: string;
  weatherAction: string;
  soilAndBioenergyAction: string;
  rationale: string;
}

export interface AIDecisionEngineOutput {
  farmStatus: FarmWatchStatus;
  crop: CropType;
  cropHealth: number;
  weatherSummary: string;
  irrigationAdvice: string;
  cropAdvice: string;
  residueAssessment: string;
  bioenergyOpportunity: string;
  overallRecommendation: string;
}

// ========================================================
// SMART FARMER RESOURCE & ENERGY ACCOUNTING TYPES
// ========================================================

export type EnergyUsageCategory =
  | 'Irrigation'
  | 'Farm Equipment'
  | 'Lighting'
  | 'Processing'
  | 'Other';

export interface EnergyConversionCoefficients {
  eligibleFeedstockFraction: number; // e.g., 0.8 (80% of gross residue)
  biogasM3PerEligibleTonne: number; // e.g., 212.5 m³ per eligible tonne (170 m³ per gross tonne)
  energyKwhPerBiogasM3: number; // e.g., 2.0 kWh per m³ biogas (340 kWh per gross tonne -> 2.5t = 850 kWh)
  monetaryRateInrPerKwh: number; // e.g., ₹8.0 per kWh
}

export interface ResourceTransaction {
  id: string;
  date: string; // e.g., "Sep 05" or "2026-09-27"
  fullDate: string; // e.g., "September 27, 2026"
  monthKey: 'Sep' | 'Oct' | 'Nov' | 'Dec';
  type: 'CONTRIBUTION' | 'USAGE' | 'CARRY_FORWARD';
  activity: string; // e.g., "Residue Contribution" or "Irrigation"
  crop?: CropType;
  residueType?: string;
  quantityTonnes?: number; // e.g., 1.2 or 2.5
  status?: 'Collected' | 'Delivered' | 'Processed';
  energyKwhDelta: number; // Positive for earned (+400), negative for used (-300)
  category?: EnergyUsageCategory;
}

export interface MonthlyEnergyLedgerEntry {
  monthKey: 'Sep' | 'Oct' | 'Nov' | 'Dec';
  monthName: string; // "September 2026", "October 2026", "November 2026"
  carryForwardKwh: number;
  energyEarnedKwh: number;
  totalAvailableKwh: number;
  energyUsedKwh: number;
  closingBalanceKwh: number;
  residueContributedTonnes: number;
  settled: boolean;
}

export interface FarmerEnergyAccount {
  farmerId: string; // "F001"
  farmerName: string; // "Rajesh Patil"
  village: string; // "Shirur"
  location: string; // "Pune, Maharashtra"
  farmAreaAcres: number; // 5
  primaryCrop: CropType; // "Soybean"
  activeMonth: 'Sep' | 'Oct' | 'Nov' | 'Dec';
  residueContributionTonnes: number; // 2.5 tonnes
  energyEarnedKwh: number; // 850 kWh
  energyUsedKwh: number; // 700 kWh
  currentBalanceKwh: number; // 150 kWh
  carryForwardKwh: number; // 150 kWh
  estimatedMonetaryValueInr: number; // e.g. ₹1,200
  biogasGeneratedM3: number; // e.g. 425 m³
  transactions: ResourceTransaction[];
  monthlyLedger: MonthlyEnergyLedgerEntry[];
}

export type NotificationCategory =
  | 'System'
  | 'Crop'
  | 'Residue'
  | 'Energy'
  | 'Biogas'
  | 'Weather';

export interface AppNotification {
  id: string;
  category: NotificationCategory;
  title: string;
  description: string;
  dateTime: string;
  read: boolean;
  severity?: 'info' | 'warning' | 'critical' | 'success';
  linkPage?: NavPage;
}

export interface FPOFarmerRecord {
  farmerId: string;
  farmerName: string;
  village: string;
  crop: CropType;
  farmAreaAcres: number;
  residueContributionTonnes: number;
  energyEarnedKwh: number;
  energyUsedKwh: number;
  currentBalanceKwh: number;
  carryForwardKwh: number;
  status: 'Active' | 'Settled' | 'Review';
}

// ========================================================
// OFFLINE & GSM SMS EMERGENCY ALERT SYSTEM TYPES
// ========================================================

export type ConnectivityMode = 'online' | 'offline';
export type GSMSignalStrength = 'strong' | 'weak' | 'no-signal';
export type SMSStatus = 'sent' | 'delivered' | 'pending' | 'failed';
export type SMSAlertCategory = 'biogas' | 'weather' | 'irrigation' | 'system';
export type SMSTriggerType =
  | 'biogas-90'
  | 'biogas-95'
  | 'biogas-100'
  | 'weather-rain'
  | 'weather-wind'
  | 'weather-heatwave'
  | 'irrigation-low-moisture'
  | 'irrigation-recommended'
  | 'custom';

export interface SMSAlert {
  id: string;
  timestamp: string; // e.g., "10:15 AM · Sep 27"
  timestampMs: number;
  category: SMSAlertCategory;
  triggerType: SMSTriggerType;
  title: string;
  messageText: string; // Strictly <= 160 characters (GSM standard)
  recipientName: string;
  recipientPhone: string;
  recipientRole: 'farmer' | 'fpo' | 'all';
  dispatchChannel: 'gsm_sms' | 'in_app_push';
  status: SMSStatus;
  deliveryAttempts: number;
  queuedDueToOffline?: boolean;
  atCommands?: string[];
  deliveredAt?: string;
  failureReason?: string;
}

export interface GSMHardwareState {
  model: string;
  imei: string;
  operator: string;
  signalStrength: GSMSignalStrength;
  signalDbm: number;
  simStatus: 'READY' | 'PIN_REQUIRED' | 'NO_SIM';
  networkRegistered: boolean;
  baudRate: number;
  temperature: number;
  voltage: number;
  lastAtCommand: string;
  lastAtResponse: string;
}

export interface SMSStats {
  sent: number;
  delivered: number;
  pending: number;
  failed: number;
}

