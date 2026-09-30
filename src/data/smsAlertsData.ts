import {
  GSMHardwareState,
  SMSAlert,
  SMSTriggerType,
} from '../types/agrifuel';

export interface AlertTriggerConfig {
  type: SMSTriggerType;
  category: 'biogas' | 'weather' | 'irrigation';
  name: string;
  triggerCondition: string;
  defaultMessage: string;
  targetRole: 'farmer' | 'fpo' | 'all';
  severity: 'warning' | 'urgent' | 'critical' | 'info';
}

export const ALERT_TRIGGER_TEMPLATES: AlertTriggerConfig[] = [
  // Biogas Alerts
  {
    type: 'biogas-90',
    category: 'biogas',
    name: '90% Biogas Used',
    triggerCondition: 'Biogas utilization reaches 90%',
    defaultMessage: 'AgriFuel AI: Community biogas has reached 90% usage. Please plan energy use carefully.',
    targetRole: 'farmer',
    severity: 'warning',
  },
  {
    type: 'biogas-95',
    category: 'biogas',
    name: '95% Biogas Used',
    triggerCondition: 'Biogas utilization reaches 95%',
    defaultMessage: 'AgriFuel AI URGENT: Community biogas is at 95% usage! Only 5% reserve remains. Reduce non-essential power.',
    targetRole: 'farmer',
    severity: 'urgent',
  },
  {
    type: 'biogas-100',
    category: 'biogas',
    name: '100% Biogas Depleted',
    triggerCondition: 'Biogas pool 100% depleted (0% remaining balance)',
    defaultMessage: 'AgriFuel AI CRITICAL: Community biogas pool 100% depleted! Digester backup switching to grid/idle. FPO alerted.',
    targetRole: 'all', // Notifies both Farmer & FPO!
    severity: 'critical',
  },

  // Weather Alerts
  {
    type: 'weather-rain',
    category: 'weather',
    name: 'Heavy Rain in 24h',
    triggerCondition: 'Heavy rain expected within 24 hours',
    defaultMessage: 'AgriFuel AI: Heavy rainfall is expected tomorrow. Delay irrigation today.',
    targetRole: 'farmer',
    severity: 'warning',
  },
  {
    type: 'weather-wind',
    category: 'weather',
    name: 'Strong Winds',
    triggerCondition: 'Wind velocity exceeding 45 km/h',
    defaultMessage: 'AgriFuel AI: Strong wind gusts (>45 km/h) forecast today. Secure greenhouse covers & delay foliar spraying.',
    targetRole: 'farmer',
    severity: 'warning',
  },
  {
    type: 'weather-heatwave',
    category: 'weather',
    name: 'Heatwave Warning',
    triggerCondition: 'Ambient temperature exceeds 38°C with high evaporation',
    defaultMessage: 'AgriFuel AI: Heatwave alert (39°C+)! High soil evaporation expected. Irrigate in early morning or evening.',
    targetRole: 'farmer',
    severity: 'urgent',
  },

  // Irrigation Alerts
  {
    type: 'irrigation-low-moisture',
    category: 'irrigation',
    name: 'Soil Moisture Below Threshold',
    triggerCondition: 'Root-zone soil moisture drops below 35%',
    defaultMessage: 'AgriFuel AI: Soil moisture is low. Irrigation is recommended for your rice field.',
    targetRole: 'farmer',
    severity: 'warning',
  },
  {
    type: 'irrigation-recommended',
    category: 'irrigation',
    name: 'Irrigation Recommended',
    triggerCondition: 'Crop evapotranspiration deficit detected',
    defaultMessage: 'AgriFuel AI: Root-zone moisture at 28% (<35% threshold). Schedule 45-min solar drip irrigation now.',
    targetRole: 'farmer',
    severity: 'warning',
  },
];

export const DEFAULT_FARMER_PHONE = '+91 98231 44521';
export const DEFAULT_FPO_PHONE = '+91 94220 88910';

export const INITIAL_GSM_HARDWARE: GSMHardwareState = {
  model: 'SIM800L v2 Quad-Band GSM/GPRS Modem (TTL UART)',
  imei: '867530901234567',
  operator: 'Airtel GSM 2G/4G (Cell ID: 404-45-1289)',
  signalStrength: 'strong',
  signalDbm: -72,
  simStatus: 'READY',
  networkRegistered: true,
  baudRate: 9600,
  temperature: 31.4,
  voltage: 4.08,
  lastAtCommand: 'AT+CSQ',
  lastAtResponse: '+CSQ: 24,0 (Strong -72 dBm)',
};

export const INITIAL_SMS_ALERTS: SMSAlert[] = [
  {
    id: 'sms-demo-1',
    timestamp: 'Today · 09:12 AM',
    timestampMs: Date.now() - 1000 * 60 * 45,
    category: 'biogas',
    triggerType: 'biogas-90',
    title: 'Biogas Warning (90% Used)',
    messageText: 'AgriFuel AI: Community biogas has reached 90% usage. Please plan energy use carefully.',
    recipientName: 'Rajesh Patil (Farmer)',
    recipientPhone: DEFAULT_FARMER_PHONE,
    recipientRole: 'farmer',
    dispatchChannel: 'gsm_sms',
    status: 'delivered',
    deliveryAttempts: 1,
    atCommands: [
      'AT+CMGF=1 -> OK',
      'AT+CMGS="+919823144521" -> > AgriFuel AI: Community biogas has reached 90% usage...',
      '+CMGS: 142 -> OK (Sent via GSM)',
      '+CDS: Delivery ACK received from BTS',
    ],
    deliveredAt: '09:12:18 AM',
  },
  {
    id: 'sms-demo-2',
    timestamp: 'Yesterday · 04:30 PM',
    timestampMs: Date.now() - 1000 * 60 * 60 * 18,
    category: 'weather',
    triggerType: 'weather-rain',
    title: 'Heavy Rain Forecast',
    messageText: 'AgriFuel AI: Heavy rainfall is expected tomorrow. Delay irrigation today.',
    recipientName: 'Rajesh Patil (Farmer)',
    recipientPhone: DEFAULT_FARMER_PHONE,
    recipientRole: 'farmer',
    dispatchChannel: 'gsm_sms',
    status: 'delivered',
    deliveryAttempts: 1,
    atCommands: [
      'AT+CMGF=1 -> OK',
      'AT+CMGS="+919823144521" -> > AgriFuel AI: Heavy rainfall is expected tomorrow...',
      '+CMGS: 141 -> OK (Sent via GSM)',
      '+CDS: Delivery ACK received from BTS',
    ],
    deliveredAt: '04:30:12 PM',
  },
  {
    id: 'sms-demo-3',
    timestamp: 'Yesterday · 01:15 PM',
    timestampMs: Date.now() - 1000 * 60 * 60 * 21,
    category: 'irrigation',
    triggerType: 'irrigation-low-moisture',
    title: 'Low Soil Moisture Alert',
    messageText: 'AgriFuel AI: Soil moisture is low. Irrigation is recommended for your rice field.',
    recipientName: 'Rajesh Patil (Farmer)',
    recipientPhone: DEFAULT_FARMER_PHONE,
    recipientRole: 'farmer',
    dispatchChannel: 'gsm_sms',
    status: 'delivered',
    deliveryAttempts: 1,
    atCommands: [
      'AT+CMGF=1 -> OK',
      'AT+CMGS="+919823144521" -> > AgriFuel AI: Soil moisture is low...',
      '+CMGS: 140 -> OK',
    ],
    deliveredAt: '01:15:20 PM',
  },
  {
    id: 'sms-demo-4',
    timestamp: 'Today · 08:05 AM',
    timestampMs: Date.now() - 1000 * 60 * 110,
    category: 'weather',
    triggerType: 'weather-wind',
    title: 'Strong Winds Alert',
    messageText: 'AgriFuel AI: Strong wind gusts (>45 km/h) forecast today. Secure greenhouse covers & delay foliar spraying.',
    recipientName: 'Rajesh Patil (Farmer)',
    recipientPhone: DEFAULT_FARMER_PHONE,
    recipientRole: 'farmer',
    dispatchChannel: 'gsm_sms',
    status: 'sent',
    deliveryAttempts: 1,
    atCommands: [
      'AT+CMGF=1 -> OK',
      'AT+CMGS="+919823144521" -> > AgriFuel AI: Strong wind gusts...',
      '+CMGS: 143 -> OK (Awaiting Tower Delivery Receipt)',
    ],
  },
  {
    id: 'sms-demo-5',
    timestamp: 'Today · 07:40 AM',
    timestampMs: Date.now() - 1000 * 60 * 135,
    category: 'biogas',
    triggerType: 'biogas-95',
    title: 'Urgent Biogas Reserve Alert',
    messageText: 'AgriFuel AI URGENT: Community biogas is at 95% usage! Only 5% reserve remains. Reduce non-essential power.',
    recipientName: 'Rajesh Patil (Farmer)',
    recipientPhone: DEFAULT_FARMER_PHONE,
    recipientRole: 'farmer',
    dispatchChannel: 'gsm_sms',
    status: 'pending',
    deliveryAttempts: 0,
    queuedDueToOffline: true,
    failureReason: 'Queued: Mobile GSM signal was temporarily lost in valley zone. Ready for auto-dispatch once signal returns.',
    atCommands: [
      'AT+CREG? -> +CREG: 0,2 (Searching / No service)',
      'Signal unavailable: Message pushed to offline GSM Outbox queue',
    ],
  },
  {
    id: 'sms-demo-6',
    timestamp: 'Sep 26 · 05:20 PM',
    timestampMs: Date.now() - 1000 * 60 * 60 * 42,
    category: 'weather',
    triggerType: 'weather-heatwave',
    title: 'Heatwave Advisory',
    messageText: 'AgriFuel AI: Heatwave alert (39°C+)! High soil evaporation expected. Irrigate in early morning or evening.',
    recipientName: 'Rajesh Patil (Farmer)',
    recipientPhone: DEFAULT_FARMER_PHONE,
    recipientRole: 'farmer',
    dispatchChannel: 'gsm_sms',
    status: 'failed',
    deliveryAttempts: 3,
    failureReason: 'SIM Baseband Timeout (+CMS ERROR: 500 Unknown error)',
    atCommands: [
      'AT+CMGF=1 -> OK',
      'AT+CMGS="+919823144521" -> +CMS ERROR: 500',
      'Retry attempt 2 -> +CMS ERROR: 500',
      'Retry attempt 3 -> Failed after 3 retries',
    ],
  },
];
