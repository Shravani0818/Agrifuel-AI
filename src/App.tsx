import React, { useState, useCallback, useEffect } from 'react';
import {
  LayoutDashboard,
  Search,
  CloudSun,
  Recycle,
  Zap,
  Radio,
  Building2,
  User,
  UserCheck,
  Wallet,
  Settings as SettingsIcon,
  Home,
  Menu,
  X,
  ArrowRight,
  ArrowLeft,
  Compass,
  Bell,
} from 'lucide-react';
import {
  AppNotification,
  AppSettings,
  ConnectivityMode,
  CropType,
  EnergyConversionCoefficients,
  EnergyUsageCategory,
  FarmerEnergyAccount,
  FarmProfile,
  GSMHardwareState,
  GSMSignalStrength,
  IoTState,
  NavPage,
  RiskLevel,
  SMSAlert,
  SMSAlertCategory,
  SMSTriggerType,
  WeatherData,
} from './types/agrifuel';
import {
  CROP_RESIDUE_TYPES,
  DEFAULT_CONVERSION_COEFFICIENTS,
  DEFAULT_FARM_PROFILE,
  DEFAULT_SETTINGS,
  DEMO_WEATHER_DATA,
  INITIAL_FARMER_ENERGY_ACCOUNT,
  INITIAL_IOT_STATE,
  INITIAL_NOTIFICATIONS,
  calculateEnergyFromResidue,
} from './data/demoData';
import {
  ALERT_TRIGGER_TEMPLATES,
  DEFAULT_FARMER_PHONE,
  DEFAULT_FPO_PHONE,
  INITIAL_GSM_HARDWARE,
  INITIAL_SMS_ALERTS,
} from './data/smsAlertsData';
import { LandingPage } from './components/LandingPage';
import { DashboardView } from './components/DashboardView';
import { CropScannerView } from './components/CropScannerView';
import { FarmAdvisorView } from './components/FarmAdvisorView';
import { IoTMonitoringView } from './components/IoTMonitoringView';
import { ResidueIntelligenceView } from './components/ResidueIntelligenceView';
import { CommunityBioenergyView } from './components/CommunityBioenergyView';
import { FPODashboardView } from './components/FPODashboardView';
import { FarmerResourceProfileView } from './components/FarmerResourceProfileView';
import { FarmProfileView } from './components/FarmProfileView';
import { SettingsView } from './components/SettingsView';
import { NotificationCenterModal } from './components/NotificationCenterModal';
import { OfflineSMSView } from './components/OfflineSMSView';
import { Wifi, WifiOff, SignalHigh, SignalLow, SignalZero, MessageSquare } from 'lucide-react';
import {
  AppLanguage,
  subscribeToLanguageChange,
} from './services/multilingualService';
import { useLanguage } from './context/LanguageContext';

const STORAGE_KEYS = {
  PROFILE: 'agrifuel_ai_farm_profile_v2',
  SETTINGS: 'agrifuel_ai_settings_v2',
  ENERGY_ACCOUNT: 'agrifuel_ai_farmer_energy_account_v1',
  COEFFICIENTS: 'agrifuel_ai_conversion_coeffs_v1',
  NOTIFICATIONS: 'agrifuel_ai_notifications_v1',
  SMS_ALERTS: 'agrifuel_ai_sms_alerts_v1',
  CONNECTIVITY: 'agrifuel_ai_connectivity_v1',
  GSM_HARDWARE: 'agrifuel_ai_gsm_hardware_v1',
};

const JUDGE_DEMO_FLOW: { page: NavPage; label: string; step: number }[] = [
  { step: 1, page: 'landing', label: 'Landing Page' },
  { step: 2, page: 'dashboard', label: 'Farmer Dashboard' },
  { step: 3, page: 'crop-scanner', label: 'Crop Scanner + Priority Care' },
  { step: 4, page: 'farm-advisor', label: 'Farm Advisor' },
  { step: 5, page: 'iot-monitoring', label: 'IoT Monitoring' },
  { step: 6, page: 'residue-intelligence', label: 'Residue Intelligence' },
  { step: 7, page: 'community-bioenergy', label: 'Community Biogas' },
  { step: 8, page: 'farmer-resource-profile', label: 'Farmer Energy Profile' },
  { step: 9, page: 'offline-sms', label: 'Offline GSM Alerts' },
  { step: 10, page: 'fpo-dashboard', label: 'Regional Agri Intelligence' },
];

export default function App() {
  const [currentPage, setCurrentPage] = useState<NavPage>('landing');
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [judgeTourActive, setJudgeTourActive] = useState<boolean>(true);
  const [notificationCenterOpen, setNotificationCenterOpen] = useState<boolean>(false);

  const [profile, setProfile] = useState<FarmProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROFILE);
      if (saved) {
        return { ...DEFAULT_FARM_PROFILE, ...JSON.parse(saved) };
      }
    } catch {
      // Fallback
    }
    return DEFAULT_FARM_PROFILE;
  });

  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (saved) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved), demoMode: true };
      }
    } catch {
      // Fallback
    }
    return DEFAULT_SETTINGS;
  });

  const [iot, setIot] = useState<IoTState>(INITIAL_IOT_STATE);
  const [weather, setWeather] = useState<WeatherData>(DEMO_WEATHER_DATA);
  const [simStep, setSimStep] = useState<number>(0);

  // Configurable Conversion Coefficients (Section 3)
  const [coefficients, setCoefficients] = useState<EnergyConversionCoefficients>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.COEFFICIENTS);
      if (saved) {
        return { ...DEFAULT_CONVERSION_COEFFICIENTS, ...JSON.parse(saved) };
      }
    } catch {
      // Fallback
    }
    return DEFAULT_CONVERSION_COEFFICIENTS;
  });

  // Individual Farmer Energy Account (Sections 1-8)
  const [energyAccount, setEnergyAccount] = useState<FarmerEnergyAccount>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ENERGY_ACCOUNT);
      if (saved) {
        return { ...INITIAL_FARMER_ENERGY_ACCOUNT, ...JSON.parse(saved) };
      }
    } catch {
      // Fallback
    }
    return INITIAL_FARMER_ENERGY_ACCOUNT;
  });

  // Notifications State (Section 9)
  const [notifications, setNotifications] = useState<AppNotification[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // Fallback
    }
    return INITIAL_NOTIFICATIONS;
  });

  const saveNotifications = (updated: AppNotification[]) => {
    setNotifications(updated);
    try {
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(updated));
    } catch {
      // Ignore quota errors
    }
  };

  const pushNotification = useCallback(
    (notif: Omit<AppNotification, 'id' | 'dateTime' | 'read'>) => {
      if (!settings.notifications) return;
      const newNotif: AppNotification = {
        ...notif,
        id: `notif-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        dateTime: 'Just now · Sep 27, 2026',
        read: false,
      };
      setNotifications((prev) => {
        const next = [newNotif, ...prev].slice(0, 25);
        try {
          localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(next));
        } catch {
          // Ignore
        }
        return next;
      });
    },
    [settings.notifications]
  );

  // ========================================================
  // OFFLINE & GSM SMS EMERGENCY ALERT SYSTEM STATE
  // ========================================================
  const [connectivity, setConnectivity] = useState<ConnectivityMode>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CONNECTIVITY);
      if (saved === 'online' || saved === 'offline') return saved;
    } catch {
      // Fallback
    }
    return 'offline'; // Default to offline to demonstrate GSM cellular SMS flow!
  });

  const [gsmHardware, setGsmHardware] = useState<GSMHardwareState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.GSM_HARDWARE);
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return INITIAL_GSM_HARDWARE;
  });

  const [smsAlerts, setSmsAlerts] = useState<SMSAlert[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SMS_ALERTS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // Fallback
    }
    return INITIAL_SMS_ALERTS;
  });

  const { language: appLang, setLanguage: setSavedLanguage, t } = useLanguage();

  const saveSmsAlerts = (updated: SMSAlert[]) => {
    setSmsAlerts(updated);
    try {
      localStorage.setItem(STORAGE_KEYS.SMS_ALERTS, JSON.stringify(updated));
    } catch {
      // Ignore
    }
  };

  // Toggle Internet Connectivity Mode
  const handleToggleConnectivity = () => {
    const nextMode: ConnectivityMode = connectivity === 'online' ? 'offline' : 'online';
    setConnectivity(nextMode);
    try {
      localStorage.setItem(STORAGE_KEYS.CONNECTIVITY, nextMode);
    } catch {
      // Ignore
    }
    pushNotification({
      category: 'System',
      title: nextMode === 'offline' ? 'Offline Mode Active' : 'Internet Connection Restored',
      description:
        nextMode === 'offline'
          ? 'Internet is unavailable. AgriFuel AI has switched to GSM Mobile SMS Alert Routing (SIM800L).'
          : 'Internet is back online. Alerts will route via high-speed in-app and browser push notifications.',
      severity: nextMode === 'offline' ? 'warning' : 'success',
      linkPage: 'offline-sms',
    });
  };

  // Change GSM Mobile Signal Strength & Auto-Deliver Queued SMS if signal restored
  const handleChangeSignalStrength = (newSignal: GSMSignalStrength) => {
    const updatedHardware: GSMHardwareState = {
      ...gsmHardware,
      signalStrength: newSignal,
      signalDbm: newSignal === 'strong' ? -72 : newSignal === 'weak' ? -98 : -115,
      networkRegistered: newSignal !== 'no-signal',
      lastAtCommand: 'AT+CSQ',
      lastAtResponse:
        newSignal === 'strong'
          ? '+CSQ: 24,0 (Strong -72 dBm)'
          : newSignal === 'weak'
          ? '+CSQ: 11,0 (Weak -98 dBm)'
          : '+CSQ: 0,0 (No signal)',
    };
    setGsmHardware(updatedHardware);
    try {
      localStorage.setItem(STORAGE_KEYS.GSM_HARDWARE, JSON.stringify(updatedHardware));
    } catch {
      // Ignore
    }

    // Deliver queued SMS once the signal returns!
    if (newSignal !== 'no-signal') {
      const pendingAlerts = smsAlerts.filter((a) => a.status === 'pending');
      if (pendingAlerts.length > 0) {
        pendingAlerts.forEach((pending, index) => {
          setTimeout(() => {
            setSmsAlerts((prev) =>
              prev.map((item) =>
                item.id === pending.id
                  ? {
                      ...item,
                      status: 'delivered' as const,
                      deliveryAttempts: item.deliveryAttempts + 1,
                      deliveredAt: new Date().toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      }),
                      failureReason: undefined,
                      atCommands: [
                        ...(item.atCommands || []),
                        'Network registered (+CREG: 1)',
                        `AT+CMGS="${item.recipientPhone}" -> OK`,
                        '+CDS: Auto-delivered queued SMS after signal restoration',
                      ],
                    }
                  : item
              )
            );
          }, (index + 1) * 600);
        });

        pushNotification({
          category: 'System',
          title: `GSM Network Signal Restored`,
          description: `Mobile tower reconnected. Auto-delivering ${pendingAlerts.length} queued SMS from offline outbox.`,
          severity: 'success',
          linkPage: 'offline-sms',
        });
      }
    }
  };

  // Retry failed or pending alert
  const handleRetryAlert = (alertId: string) => {
    setSmsAlerts((prev) =>
      prev.map((item) =>
        item.id === alertId
          ? {
              ...item,
              status: 'sent' as const,
              deliveryAttempts: item.deliveryAttempts + 1,
              failureReason: undefined,
              atCommands: [
                ...(item.atCommands || []),
                `Retry transmission triggered manually -> AT+CMGS="${item.recipientPhone}" -> OK`,
              ],
            }
          : item
      )
    );

    setTimeout(() => {
      setSmsAlerts((prev) =>
        prev.map((item) =>
          item.id === alertId
            ? {
                ...item,
                status: 'delivered' as const,
                deliveredAt: new Date().toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                }),
                atCommands: [
                  ...(item.atCommands || []),
                  '+CDS: Delivery ACK received from tower',
                ],
              }
            : item
        )
      );
    }, 1000);
  };

  // Main SMS Dispatcher implementing prompt Offline Logic
  const handleSendSMSAlert = useCallback(
    (
      triggerType: SMSTriggerType,
      category: SMSAlertCategory,
      title: string,
      messageText: string,
      recipientRole: 'farmer' | 'fpo' | 'all' = 'farmer',
      recipientPhone?: string,
      recipientName?: string
    ) => {
      // Ensure strictly <= 160 characters
      const trimmedText = messageText.length > 160 ? messageText.slice(0, 160) : messageText;
      const now = new Date();
      const timeLabel = `Today · ${String(now.getHours()).padStart(2, '0')}:${String(
        now.getMinutes()
      ).padStart(2, '0')} ${now.getHours() >= 12 ? 'PM' : 'AM'}`;

      const phone =
        recipientPhone ||
        (recipientRole === 'fpo' ? DEFAULT_FPO_PHONE : DEFAULT_FARMER_PHONE);
      const name =
        recipientName ||
        (recipientRole === 'fpo'
          ? 'Shirur FPO Admin'
          : `${profile.farmerName} (Farmer)`);

      // IF internet is available:
      // Show in-app notification & send push notification.
      if (connectivity === 'online') {
        pushNotification({
          category:
            category === 'biogas' ? 'Biogas' : category === 'weather' ? 'Weather' : 'Crop',
          title: `[Push Alert] ${title}`,
          description: trimmedText,
          severity:
            triggerType === 'biogas-100'
              ? 'critical'
              : triggerType === 'biogas-95'
              ? 'warning'
              : 'info',
          linkPage: 'offline-sms',
        });

        const newAlert: SMSAlert = {
          id: `alert-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          timestamp: timeLabel,
          timestampMs: Date.now(),
          category,
          triggerType,
          title,
          messageText: trimmedText,
          recipientName: name,
          recipientPhone: phone,
          recipientRole,
          dispatchChannel: 'in_app_push',
          status: 'delivered',
          deliveryAttempts: 1,
          deliveredAt: timeLabel.split('·')[1]?.trim(),
        };

        setSmsAlerts((prev) => [newAlert, ...prev]);
        return;
      }

      // IF internet is unavailable:
      // Automatically send SMS using the GSM module.
      // If mobile signal is temporarily unavailable: Queue messages.
      const isSignalAvailable = gsmHardware.signalStrength !== 'no-signal';

      if (!isSignalAvailable) {
        // Queued in offline GSM Outbox!
        const queuedAlert: SMSAlert = {
          id: `alert-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          timestamp: timeLabel,
          timestampMs: Date.now(),
          category,
          triggerType,
          title,
          messageText: trimmedText,
          recipientName: name,
          recipientPhone: phone,
          recipientRole,
          dispatchChannel: 'gsm_sms',
          status: 'pending',
          deliveryAttempts: 0,
          queuedDueToOffline: true,
          failureReason:
            'Queued: Mobile GSM signal unavailable (0 bars). Waiting for network registration.',
          atCommands: [
            'AT+CREG? -> +CREG: 0,2 (Searching...)',
            `Message pushed to GSM Outbox: "${trimmedText}"`,
          ],
        };

        setSmsAlerts((prev) => [queuedAlert, ...prev]);

        pushNotification({
          category: 'System',
          title: `[GSM Queued] ${title}`,
          description: `No internet & no GSM signal. Alert queued in GSM Outbox. Will auto-deliver once signal returns.`,
          severity: 'warning',
          linkPage: 'offline-sms',
        });
        return;
      }

      // If mobile signal IS available, transmit via GSM module
      const alertId = `alert-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      const transmittingAlert: SMSAlert = {
        id: alertId,
        timestamp: timeLabel,
        timestampMs: Date.now(),
        category,
        triggerType,
        title,
        messageText: trimmedText,
        recipientName: name,
        recipientPhone: phone,
        recipientRole,
        dispatchChannel: 'gsm_sms',
        status: 'sent',
        deliveryAttempts: 1,
        atCommands: [
          'AT+CMGF=1 -> OK',
          `AT+CMGS="${phone}" -> > ${trimmedText}`,
          `+CMGS: ${Math.floor(100 + Math.random() * 900)} -> OK (Cellular BTS Acknowledged)`,
        ],
      };

      setSmsAlerts((prev) => [transmittingAlert, ...prev]);

      // Simulate cellular tower delivery ACK within 1200ms
      setTimeout(() => {
        setSmsAlerts((prev) =>
          prev.map((a) =>
            a.id === alertId
              ? {
                  ...a,
                  status: 'delivered' as const,
                  deliveredAt: new Date().toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  }),
                  atCommands: [
                    ...(a.atCommands || []),
                    '+CDS: Cellular Delivery ACK received from mobile carrier',
                  ],
                }
              : a
          )
        );
      }, 1200);

      pushNotification({
        category:
          category === 'biogas' ? 'Biogas' : category === 'weather' ? 'Weather' : 'Crop',
        title: `[GSM SMS Dispatched] ${title}`,
        description: `Internet offline. SMS sent via SIM800L to ${phone} (${trimmedText.length}/160 chars).`,
        severity: 'info',
        linkPage: 'offline-sms',
      });
    },
    [connectivity, gsmHardware.signalStrength, profile.farmerName, pushNotification]
  );

  // Quick Trigger Presets Handler
  const handleQuickTriggerAlert = (type: SMSTriggerType) => {
    const template = ALERT_TRIGGER_TEMPLATES.find((t) => t.type === type);
    if (!template) return;
    let targetPhone = DEFAULT_FARMER_PHONE;
    let targetName = `${profile.farmerName} (Farmer)`;

    if (template.targetRole === 'fpo') {
      targetPhone = DEFAULT_FPO_PHONE;
      targetName = 'Shirur Bioenergy FPO Admin';
    } else if (template.targetRole === 'all') {
      targetPhone = `${DEFAULT_FARMER_PHONE} & ${DEFAULT_FPO_PHONE}`;
      targetName = `${profile.farmerName} & FPO Admin`;
    }

    handleSendSMSAlert(
      template.type,
      template.category,
      template.name,
      template.defaultMessage,
      template.targetRole,
      targetPhone,
      targetName
    );
  };

  const saveEnergyAccount = (updated: FarmerEnergyAccount) => {
    setEnergyAccount(updated);
    try {
      localStorage.setItem(STORAGE_KEYS.ENERGY_ACCOUNT, JSON.stringify(updated));
    } catch {
      // Ignore
    }
  };

  // Update conversion coefficients and recalculate energy account monetary value
  const handleUpdateCoefficients = (nextCoeffs: EnergyConversionCoefficients) => {
    setCoefficients(nextCoeffs);
    try {
      localStorage.setItem(STORAGE_KEYS.COEFFICIENTS, JSON.stringify(nextCoeffs));
    } catch {
      // Ignore
    }
    const conv = calculateEnergyFromResidue(
      energyAccount.residueContributionTonnes,
      nextCoeffs
    );
    const nextBalance = Math.max(0, conv.farmerEnergyCreditKwh - energyAccount.energyUsedKwh);
    const updatedAccount: FarmerEnergyAccount = {
      ...energyAccount,
      energyEarnedKwh: conv.farmerEnergyCreditKwh,
      biogasGeneratedM3: conv.estimatedBiogasM3,
      currentBalanceKwh: nextBalance,
      carryForwardKwh: nextBalance,
      estimatedMonetaryValueInr: Math.round(nextBalance * nextCoeffs.monetaryRateInrPerKwh),
    };
    saveEnergyAccount(updatedAccount);
  };

  // Contribute Residue (Section 2 & 3)
  const handleContributeResidue = (
    crop: CropType,
    quantityTonnes: number,
    dateLabel: string
  ) => {
    const addedConv = calculateEnergyFromResidue(quantityTonnes, coefficients);
    const newResidueTotal = +(
      energyAccount.residueContributionTonnes + quantityTonnes
    ).toFixed(2);
    const newEarnedTotal = energyAccount.energyEarnedKwh + addedConv.farmerEnergyCreditKwh;
    const newBalance = Math.max(0, newEarnedTotal - energyAccount.energyUsedKwh);
    const newBiogasTotal = energyAccount.biogasGeneratedM3 + addedConv.estimatedBiogasM3;

    const newTx = {
      id: `tx-${Date.now()}`,
      date: dateLabel || 'Sep 27',
      fullDate: 'September 27, 2026',
      monthKey: energyAccount.activeMonth,
      type: 'CONTRIBUTION' as const,
      activity: 'Residue Contribution',
      crop,
      residueType: CROP_RESIDUE_TYPES[crop],
      quantityTonnes: +quantityTonnes.toFixed(2),
      status: 'Collected' as const,
      energyKwhDelta: addedConv.farmerEnergyCreditKwh,
    };

    const updatedLedger = energyAccount.monthlyLedger.map((entry, idx) => {
      if (idx === 0) {
        const nextEarned = entry.energyEarnedKwh + addedConv.farmerEnergyCreditKwh;
        const nextAvail = entry.carryForwardKwh + nextEarned;
        const nextClosing = Math.max(0, nextAvail - entry.energyUsedKwh);
        return {
          ...entry,
          energyEarnedKwh: nextEarned,
          totalAvailableKwh: nextAvail,
          closingBalanceKwh: nextClosing,
          residueContributedTonnes: +(
            entry.residueContributedTonnes + quantityTonnes
          ).toFixed(2),
        };
      }
      return entry;
    });

    // Propagate carry-forward across subsequent months
    for (let i = 1; i < updatedLedger.length; i++) {
      const prevClosing = updatedLedger[i - 1].closingBalanceKwh;
      const avail = prevClosing + updatedLedger[i].energyEarnedKwh;
      updatedLedger[i] = {
        ...updatedLedger[i],
        carryForwardKwh: prevClosing,
        totalAvailableKwh: avail,
        closingBalanceKwh: Math.max(0, avail - updatedLedger[i].energyUsedKwh),
      };
    }

    const updatedAccount: FarmerEnergyAccount = {
      ...energyAccount,
      residueContributionTonnes: newResidueTotal,
      energyEarnedKwh: newEarnedTotal,
      currentBalanceKwh: newBalance,
      carryForwardKwh: newBalance,
      biogasGeneratedM3: newBiogasTotal,
      estimatedMonetaryValueInr: Math.round(
        newBalance * coefficients.monetaryRateInrPerKwh
      ),
      transactions: [newTx, ...energyAccount.transactions],
      monthlyLedger: updatedLedger,
    };

    saveEnergyAccount(updatedAccount);

    pushNotification({
      category: 'Residue',
      title: 'Residue Contribution Recorded',
      description: `${quantityTonnes} tonnes ${crop.toLowerCase()} residue added to your account.`,
      severity: 'success',
      linkPage: 'farmer-resource-profile',
    });

    pushNotification({
      category: 'Energy',
      title: 'Energy Credit Updated',
      description: `${addedConv.farmerEnergyCreditKwh} kWh energy added to your balance (New balance: ${newBalance} kWh).`,
      severity: 'success',
      linkPage: 'farmer-resource-profile',
    });
  };

  // Record Farm Energy Usage (Section 4 & 5)
  const handleRecordEnergyUsage = (
    category: EnergyUsageCategory,
    kwhUsed: number,
    dateLabel: string
  ) => {
    const newUsedTotal = energyAccount.energyUsedKwh + kwhUsed;
    const newBalance = Math.max(0, energyAccount.energyEarnedKwh - newUsedTotal);

    const newTx = {
      id: `tx-use-${Date.now()}`,
      date: dateLabel || 'Sep 28',
      fullDate: 'September 28, 2026',
      monthKey: energyAccount.activeMonth,
      type: 'USAGE' as const,
      activity: category === 'Farm Equipment' ? 'Equipment Use' : category,
      energyKwhDelta: -Math.abs(kwhUsed),
      category,
    };

    const updatedLedger = energyAccount.monthlyLedger.map((entry, idx) => {
      if (idx === 0) {
        const nextUsed = entry.energyUsedKwh + kwhUsed;
        const nextClosing = Math.max(0, entry.totalAvailableKwh - nextUsed);
        return {
          ...entry,
          energyUsedKwh: nextUsed,
          closingBalanceKwh: nextClosing,
        };
      }
      return entry;
    });

    for (let i = 1; i < updatedLedger.length; i++) {
      const prevClosing = updatedLedger[i - 1].closingBalanceKwh;
      const avail = prevClosing + updatedLedger[i].energyEarnedKwh;
      updatedLedger[i] = {
        ...updatedLedger[i],
        carryForwardKwh: prevClosing,
        totalAvailableKwh: avail,
        closingBalanceKwh: Math.max(0, avail - updatedLedger[i].energyUsedKwh),
      };
    }

    const updatedAccount: FarmerEnergyAccount = {
      ...energyAccount,
      energyUsedKwh: newUsedTotal,
      currentBalanceKwh: newBalance,
      carryForwardKwh: newBalance,
      estimatedMonetaryValueInr: Math.round(
        newBalance * coefficients.monetaryRateInrPerKwh
      ),
      transactions: [newTx, ...energyAccount.transactions],
      monthlyLedger: updatedLedger,
    };

    saveEnergyAccount(updatedAccount);

    pushNotification({
      category: 'Energy',
      title: 'Farm Energy Usage Logged',
      description: `${kwhUsed} kWh used for ${category}. Remaining carry-forward balance: ${newBalance} kWh.`,
      severity: 'info',
      linkPage: 'farmer-resource-profile',
    });
  };

  const handleSelectActiveMonth = (monthKey: 'Sep' | 'Oct' | 'Nov' | 'Dec') => {
    const selectedLedger = energyAccount.monthlyLedger.find((m) => m.monthKey === monthKey);
    if (!selectedLedger) return;
    const updatedAccount: FarmerEnergyAccount = {
      ...energyAccount,
      activeMonth: monthKey,
      energyEarnedKwh: selectedLedger.totalAvailableKwh,
      energyUsedKwh: selectedLedger.energyUsedKwh,
      currentBalanceKwh: selectedLedger.closingBalanceKwh,
      carryForwardKwh: selectedLedger.closingBalanceKwh,
      estimatedMonetaryValueInr: Math.round(
        selectedLedger.closingBalanceKwh * coefficients.monetaryRateInrPerKwh
      ),
    };
    saveEnergyAccount(updatedAccount);
  };

  const handleResetEnergyAccount = () => {
    setCoefficients(DEFAULT_CONVERSION_COEFFICIENTS);
    setEnergyAccount(INITIAL_FARMER_ENERGY_ACCOUNT);
    try {
      localStorage.removeItem(STORAGE_KEYS.COEFFICIENTS);
      localStorage.removeItem(STORAGE_KEYS.ENERGY_ACCOUNT);
    } catch {
      // Ignore
    }
  };

  // Save profile to localStorage and sync with energyAccount
  const handleSaveProfile = (updated: FarmProfile) => {
    setProfile(updated);
    const syncedEnergy: FarmerEnergyAccount = {
      ...energyAccount,
      farmerName: updated.farmerName,
      village: updated.village || 'Shirur',
      location: updated.location,
      farmAreaAcres: updated.farmAreaAcres,
      primaryCrop: updated.primaryCrop,
    };
    saveEnergyAccount(syncedEnergy);
    try {
      localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(updated));
    } catch {
      // Ignore
    }
  };

  const handleResetProfile = () => {
    setProfile(DEFAULT_FARM_PROFILE);
    try {
      localStorage.removeItem(STORAGE_KEYS.PROFILE);
    } catch {
      // Ignore
    }
  };

  const handleUpdateSettings = (updated: AppSettings) => {
    const safeUpdated = { ...updated, demoMode: true };
    setSettings(safeUpdated);
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(safeUpdated));
    } catch {
      // Ignore
    }
  };

  // Simulate IoT Sensor Update
  const handleSimulateSensorUpdate = useCallback(() => {
    setSimStep((prevStep) => {
      const nextStep = prevStep + 1;
      setIot((prev) => {
        let nextTemp = 29.1;
        let nextMoisture = 39;
        let nextGas = 76;
        let nextHumidity = 65;

        if (nextStep > 1) {
          const tempDelta = nextStep % 2 === 0 ? -0.4 : 0.6;
          nextTemp = +Math.min(35.5, Math.max(25.0, prev.temperature + tempDelta)).toFixed(1);
          const moistureDelta = prev.pumpStatus === 'ON' ? 3 : nextStep % 3 === 0 ? 2 : -2;
          nextMoisture = Math.min(68, Math.max(31, prev.soilMoisture + moistureDelta));
          const gasDelta = nextStep % 2 === 0 ? 2 : -1;
          nextGas = Math.min(86, Math.max(66, prev.methaneIndicator + gasDelta));
          nextHumidity = Math.min(82, Math.max(54, prev.humidity + (nextStep % 2 === 0 ? 2 : -1)));
        }

        const now = new Date();
        const timeLabel = `${String(now.getHours()).padStart(2, '0')}:${String(
          now.getMinutes()
        ).padStart(2, '0')}`;

        return {
          ...prev,
          temperature: nextTemp,
          humidity: nextHumidity,
          soilMoisture: nextMoisture,
          methaneIndicator: nextGas,
          status: nextMoisture < 33 || nextTemp > 33 ? 'WARNING' : 'NORMAL',
          history: [
            ...prev.history.slice(-5),
            {
              timestamp: timeLabel,
              temperature: nextTemp,
              humidity: nextHumidity,
              soilMoisture: nextMoisture,
              methaneIndicator: nextGas,
            },
          ],
        };
      });
      return nextStep;
    });
  }, []);

  const handleTogglePump = () => {
    setIot((prev) => ({
      ...prev,
      pumpStatus: prev.pumpStatus === 'ON' ? 'OFF' : 'ON',
    }));
  };

  const handleResetIoT = () => {
    setSimStep(0);
    setIot(INITIAL_IOT_STATE);
  };

  const handleSimulateWeatherShift = () => {
    setWeather((prev) => {
      const isCurrentlyRainy = prev.rainProbability >= 60;
      const nextRain = isCurrentlyRainy ? 25 : 65;
      const nextTemp = isCurrentlyRainy ? 31 : 28;
      const nextHumidity = isCurrentlyRainy ? 54 : 67;
      pushNotification({
        category: 'Weather',
        title: 'Weather Alert',
        description:
          nextRain >= 60
            ? `Rain probability increased to ${nextRain}%. Consider delaying irrigation.`
            : `Skies clearing (${nextRain}% rain probability, ${nextTemp}°C). Monitor root-zone soil moisture.`,
        severity: nextRain >= 60 ? 'warning' : 'info',
        linkPage: 'farm-advisor',
      });
      return {
        ...prev,
        temperature: nextTemp,
        humidity: nextHumidity,
        rainProbability: nextRain,
      };
    });
  };

  const handleResetAllDemoData = () => {
    handleResetProfile();
    handleUpdateSettings(DEFAULT_SETTINGS);
    handleResetIoT();
    handleResetEnergyAccount();
    setWeather(DEMO_WEATHER_DATA);
    saveNotifications(INITIAL_NOTIFICATIONS);
    try {
      localStorage.removeItem('agrifuel_ai_crop_analysis_history_v2');
    } catch {
      // Ignore
    }
  };

  const navigateTo = (page: NavPage) => {
    setCurrentPage(page);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Sidebar items including "Farmer Resource Profile" (Section 7)
  const sidebarItems: {
    id: NavPage;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
  }[] = [
    { id: 'dashboard', label: t('nav.dashboard', 'Dashboard'), icon: LayoutDashboard },
    { id: 'crop-scanner', label: t('nav.cropScanner', 'Crop Scanner'), icon: Search },
    { id: 'farm-advisor', label: t('nav.farmAdvisor', 'Farm Advisor'), icon: CloudSun },
    { id: 'residue-intelligence', label: t('nav.residueIntelligence', 'Residue Intelligence'), icon: Recycle },
    { id: 'community-bioenergy', label: t('nav.communityBioenergy', 'Community Bioenergy'), icon: Zap },
    {
      id: 'farmer-resource-profile',
      label: t('nav.farmerResourceProfile', 'Farmer Energy Profile'),
      icon: Wallet,
      badge: `${energyAccount.currentBalanceKwh} ${t('unit.kwh', 'kWh')}`,
    },
    { id: 'iot-monitoring', label: t('nav.iotMonitoring', 'IoT Monitoring'), icon: Radio },
    {
      id: 'offline-sms',
      label: t('nav.offlineSms', 'Offline GSM Alerts'),
      icon: MessageSquare,
      badge:
        smsAlerts.filter((a) => a.status === 'pending').length > 0
          ? `${smsAlerts.filter((a) => a.status === 'pending').length} ${t('app.queued', 'Queued')}`
          : `${smsAlerts.length} ${t('app.sms', 'SMS')}`,
    },
    { id: 'fpo-dashboard', label: t('nav.fpoDashboard', 'Regional Agri Intelligence'), icon: Building2 },
    { id: 'farm-profile', label: t('nav.farmProfile', 'Farm Profile'), icon: User },
    { id: 'settings', label: t('nav.settings', 'Settings'), icon: SettingsIcon },
  ];

  const unreadNotificationCount = notifications.filter((n) => !n.read).length;
  const currentJudgeIndex = JUDGE_DEMO_FLOW.findIndex((s) => s.page === currentPage);

  if (currentPage === 'landing') {
    return (
      <LandingPage
        onNavigate={(page) => navigateTo(page)}
        onStartJudgeTour={() => {
          setJudgeTourActive(true);
          navigateTo('dashboard');
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAF7] text-slate-900 flex flex-col">
      {/* Top Global Navigation Bar (Section 5 & Section 9 Notification Bell) */}
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200/90">
        <div className="px-4 lg:px-6 h-16 flex items-center justify-between gap-4">
          {/* Left: Mobile Menu Toggle + Brand */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <button
              type="button"
              onClick={() => navigateTo('dashboard')}
              className="text-left flex items-center gap-2.5"
            >
              <span className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap">
                {t('app.title', 'AgriFuel AI')}
              </span>
            </button>
          </div>

          {/* Center: Global Demo Mode Explanation */}
          <div className="hidden xl:flex items-center gap-2 text-xs text-slate-600">
            <span className="font-semibold text-emerald-800 whitespace-nowrap">
              🟢 {t('app.demoModeActive', 'DEMO MODE ACTIVE')}
            </span>
            <span aria-hidden="true">·</span>
            <span className="truncate max-w-md font-medium text-slate-700">
              {t('app.prototypeNotice', 'Prototype Demo Mode – Sensor and energy values are simulated')}
            </span>
          </div>

          {/* Right: Demo Mode: ON, Farmer, Energy Balance, Location, Notification Bell */}
          <div className="flex items-center gap-3 sm:gap-4 text-xs">
            <div className="hidden sm:flex items-center gap-1.5 font-mono-tabular font-semibold text-emerald-800">
              <span>{t('app.demoModeOn', 'Demo Mode: ON')}</span>
            </div>

            <div className="hidden md:block h-4 w-px bg-slate-200" />

            <button
              type="button"
              onClick={() => navigateTo('farmer-resource-profile')}
              className="text-left hover:text-emerald-800 transition-colors"
            >
              <span className="text-slate-500">{t('app.farmer', 'Farmer')}: </span>
              <span className="font-semibold text-slate-900">
                {profile.farmerName} ({profile.farmerId || 'F001'})
              </span>
            </button>

            <button
              type="button"
              onClick={() => navigateTo('farmer-resource-profile')}
              className="hidden md:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-900 border border-emerald-200 font-mono-tabular font-bold hover:bg-emerald-100 transition-colors"
            >
              <Zap className="w-3.5 h-3.5 text-emerald-700" />
              <span>{energyAccount.currentBalanceKwh} {t('unit.kwh', 'kWh')}</span>
            </button>

            <div className="hidden sm:block h-4 w-px bg-slate-200" />

            {/* Network & GSM Status Pill */}
            <button
              type="button"
              onClick={handleToggleConnectivity}
              className={`hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-mono font-bold text-xs transition-colors ${
                connectivity === 'online'
                  ? 'bg-emerald-50 text-emerald-900 border-emerald-300 hover:bg-emerald-100'
                  : 'bg-rose-50 text-rose-900 border-rose-300 hover:bg-rose-100'
              }`}
              title="Click to toggle Internet connectivity simulation"
            >
              {connectivity === 'online' ? (
                <>
                  <Wifi className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{t('app.online', 'Online')}</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
                  <span>{t('app.offline', 'Offline (GSM)')}</span>
                </>
              )}
            </button>

            {/* GSM Signal Indicator Pill */}
            <button
              type="button"
              onClick={() => navigateTo('offline-sms')}
              className="hidden lg:inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 text-slate-800 border border-slate-200 font-mono text-xs font-semibold hover:bg-slate-200 transition-colors"
              title="GSM Modem SIM800L Signal Status"
            >
              {gsmHardware.signalStrength === 'strong' ? (
                <SignalHigh className="w-3.5 h-3.5 text-emerald-600" />
              ) : gsmHardware.signalStrength === 'weak' ? (
                <SignalLow className="w-3.5 h-3.5 text-amber-600" />
              ) : (
                <SignalZero className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
              )}
              <span className="capitalize">{t('app.signal.' + gsmHardware.signalStrength, gsmHardware.signalStrength)}</span>
            </button>

            <div className="hidden lg:block h-4 w-px bg-slate-200" />

            <button
              type="button"
              onClick={() => navigateTo('farm-profile')}
              className="hidden lg:block text-left hover:text-emerald-800 transition-colors"
            >
              <span className="text-slate-500">{t('app.location', 'Location')}: </span>
              <span className="font-semibold text-slate-900">{profile.location}</span>
            </button>

            {/* Global Multilingual Selector Pill (Controls the entire app globally) */}
            <div className="flex items-center gap-1 bg-[#F8FAF7] border border-slate-200 rounded-xl p-1 shrink-0">
              <button
                type="button"
                onClick={() => setSavedLanguage('en')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  appLang === 'en'
                    ? 'bg-emerald-700 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="English"
              >
                🇬🇧 English
              </button>
              <button
                type="button"
                onClick={() => setSavedLanguage('hi')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  appLang === 'hi'
                    ? 'bg-emerald-700 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="हिन्दी (Hindi)"
              >
                🇮🇳 हिन्दी
              </button>
              <button
                type="button"
                onClick={() => setSavedLanguage('mr')}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  appLang === 'mr'
                    ? 'bg-emerald-700 text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="मराठी (Marathi)"
              >
                🇮🇳 मराठी
              </button>
            </div>


            {/* Section 9: Notification Center Bell with Unread Badge */}
            <button
              type="button"
              onClick={() => setNotificationCenterOpen(true)}
              className="relative p-2 rounded-xl bg-[#F8FAF7] hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-slate-700 transition-colors"
              aria-label="Open Notification Center"
            >
              <Bell className="w-4 h-4 text-emerald-800" />
              {unreadNotificationCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full bg-emerald-700 text-white text-[10px] font-mono-tabular font-bold flex items-center justify-center shadow-xs">
                  {unreadNotificationCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Notification Center Modal (Section 9) */}
      <NotificationCenterModal
        isOpen={notificationCenterOpen}
        onClose={() => setNotificationCenterOpen(false)}
        notifications={notifications}
        smsAlerts={smsAlerts}
        onMarkAsRead={(id) =>
          saveNotifications(
            notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
          )
        }
        onMarkAllAsRead={() =>
          saveNotifications(notifications.map((n) => ({ ...n, read: true })))
        }
        onClearAll={() => saveNotifications([])}
        onRestoreDefaults={() => saveNotifications(INITIAL_NOTIFICATIONS)}
        onNavigate={navigateTo}
      />

      {/* Main Workspace Container: Sidebar + Content Viewport */}
      <div className="flex-1 flex">
        {/* Sidebar Navigation */}
        <aside
          className={`${
            mobileMenuOpen ? 'fixed inset-y-0 left-0 z-40 w-64 shadow-xl' : 'hidden'
          } lg:static lg:block lg:w-64 bg-white border-r border-slate-200/90 shrink-0 flex flex-col justify-between`}
        >
          <div className="p-4 space-y-1">
            <div className="px-3 py-2 text-[11px] font-mono-tabular font-semibold text-slate-400">
              {t('nav.platformNavigation', 'PLATFORM NAVIGATION')}
            </div>

            {sidebarItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = currentPage === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => navigateTo(item.id)}
                  className={`w-full flex items-center justify-between gap-2 px-3.5 py-2.5 text-xs font-semibold rounded-xl transition-colors whitespace-nowrap ${
                    isActive
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'text-slate-700 hover:bg-[#F8FAF7] hover:text-emerald-800'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <IconComponent className="w-4 h-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-mono-tabular font-bold ${
                        isActive
                          ? 'bg-emerald-900 text-emerald-100'
                          : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}

            <div className="pt-4 mt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => navigateTo('landing')}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-[#F8FAF7] rounded-xl transition-colors whitespace-nowrap"
              >
                <Home className="w-4 h-4 shrink-0" />
                <span>{t('nav.landing', 'Landing Page Overview')}</span>
              </button>
            </div>
          </div>

          {/* Sidebar Bottom Demo Mode Notice */}
          <div className="p-4 m-3 rounded-xl bg-[#F8FAF7] border border-slate-200/80 text-[11px] text-slate-600 space-y-1.5">
            <div className="font-bold text-emerald-800 flex items-center gap-1.5">
              <span>🟢 {t('app.demoModeActive', 'DEMO MODE ACTIVE')}</span>
            </div>
            <p className="leading-relaxed">
              {t('app.demoModeDesc', 'AgriFuel AI turns crop residue into trackable community energy credits that farmers can use and carry forward across seasons.')}
            </p>
            <div className="pt-1 font-mono-tabular text-[10px] text-slate-400">
              Hackathon Prototype v1.0 · Simulated Testbed
            </div>
          </div>
        </aside>

        {/* Mobile Backdrop */}
        {mobileMenuOpen && (
          <div
            className="fixed inset-0 z-30 bg-slate-900/40 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* Main Content Viewport */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full space-y-6">
          {/* Unified Prototype Demo Notice */}
          <div className="bg-amber-50/90 border border-amber-200/90 rounded-2xl px-4 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs shadow-2xs">
            <div className="flex items-center gap-2 text-amber-950 font-semibold">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
              <span>{t('app.prototypeNotice', 'Prototype Demo Mode – Sensor and energy values are simulated')}</span>
            </div>
            <span className="text-[11px] font-mono-tabular text-amber-800 hidden sm:inline-block">
              {t('app.prototypeNoticeSub', 'Hardware telemetry & bioenergy ledger testbench')}
            </span>
          </div>

          {/* End-to-End Judge Demo Flow Navigator (Section 16) */}
          {judgeTourActive && (
            <div className="bg-white border border-emerald-200 rounded-2xl p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 text-xs">
                <Compass className="w-4 h-4 text-emerald-700 shrink-0" />
                <span className="font-bold text-slate-900 whitespace-nowrap">
                  {t('nav.judgeTour', 'Judge Demo Flow')}:
                </span>
                <div className="flex flex-wrap items-center gap-1 text-slate-600">
                  {JUDGE_DEMO_FLOW.map((stepObj, i) => {
                    const translatedLabel =
                      stepObj.page === 'landing'
                        ? t('nav.landing', 'Landing Page')
                        : stepObj.page === 'dashboard'
                        ? t('nav.dashboard', 'Farmer Dashboard')
                        : stepObj.page === 'crop-scanner'
                        ? t('nav.cropScanner', 'Crop Scanner')
                        : stepObj.page === 'farm-advisor'
                        ? t('nav.farmAdvisor', 'Farm Advisor')
                        : stepObj.page === 'iot-monitoring'
                        ? t('nav.iotMonitoring', 'IoT Monitoring')
                        : stepObj.page === 'residue-intelligence'
                        ? t('nav.residueIntelligence', 'Residue Intelligence')
                        : stepObj.page === 'community-bioenergy'
                        ? t('nav.communityBioenergy', 'Community Biogas')
                        : stepObj.page === 'farmer-resource-profile'
                        ? t('nav.farmerResourceProfile', 'Farmer Energy Profile')
                        : stepObj.page === 'offline-sms'
                        ? t('nav.offlineSms', 'Offline GSM Alerts')
                        : t('nav.fpoDashboard', 'Regional Agri Intelligence');

                    return (
                      <React.Fragment key={stepObj.page}>
                        <button
                          type="button"
                          onClick={() => navigateTo(stepObj.page)}
                          className={`px-2 py-0.5 rounded font-medium transition-colors whitespace-nowrap ${
                            currentPage === stepObj.page
                              ? 'bg-emerald-700 text-white font-semibold'
                              : 'hover:bg-emerald-50 text-slate-600'
                          }`}
                        >
                          {stepObj.step}. {translatedLabel}
                        </button>
                        {i < JUDGE_DEMO_FLOW.length - 1 && (
                          <span className="text-slate-300">→</span>
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0 self-end md:self-auto">
                {currentJudgeIndex > 0 && (
                  <button
                    type="button"
                    onClick={() => navigateTo(JUDGE_DEMO_FLOW[currentJudgeIndex - 1].page)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-700 bg-[#F8FAF7] border border-slate-200 rounded-lg hover:bg-slate-100 whitespace-nowrap"
                  >
                    <ArrowLeft className="w-3 h-3" />
                    <span>{t('nav.prevStep', 'Prev')}</span>
                  </button>
                )}
                {currentJudgeIndex >= 0 && currentJudgeIndex < JUDGE_DEMO_FLOW.length - 1 && (
                  <button
                    type="button"
                    onClick={() => navigateTo(JUDGE_DEMO_FLOW[currentJudgeIndex + 1].page)}
                    className="inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold text-white bg-emerald-700 rounded-lg hover:bg-emerald-800 whitespace-nowrap"
                  >
                    <span>{t('nav.nextStep', 'Next Step')}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          )}


          {/* Active Page View */}
          {currentPage === 'dashboard' && (
            <DashboardView
              profile={profile}
              iot={iot}
              weather={weather}
              energyAccount={energyAccount}
              onNavigate={navigateTo}
              onSimulateWeatherShift={handleSimulateWeatherShift}
              alerts={smsAlerts}
              connectivity={connectivity}
              gsmHardware={gsmHardware}
              onQuickTriggerAlert={handleQuickTriggerAlert}
              onToggleConnectivity={handleToggleConnectivity}
            />
          )}

          {currentPage === 'crop-scanner' && (
            <CropScannerView
              profile={profile}
              iot={iot}
              weather={weather}
              onNavigate={navigateTo}
              onAnalysisComplete={(cropName, condition, risk: RiskLevel) => {
                pushNotification({
                  category: 'Crop',
                  title: 'Crop Analysis Completed',
                  description: `${cropName} leaf image analyzed. ${condition}.`,
                  severity: risk === 'HIGH' ? 'warning' : 'info',
                  linkPage: 'crop-scanner',
                });
              }}
            />
          )}

          {currentPage === 'farm-advisor' && (
            <FarmAdvisorView
              profile={profile}
              iot={iot}
              weather={weather}
              onNavigate={navigateTo}
            />
          )}

          {currentPage === 'iot-monitoring' && (
            <IoTMonitoringView
              iot={iot}
              onSimulateUpdate={handleSimulateSensorUpdate}
              onTogglePump={handleTogglePump}
              onResetIoT={handleResetIoT}
              onNavigate={navigateTo}
              onSendAlert={handleQuickTriggerAlert}
            />
          )}

          {currentPage === 'residue-intelligence' && (
            <ResidueIntelligenceView
              defaultCrop={profile.primaryCrop}
              defaultAreaAcres={profile.farmAreaAcres}
              energyAccount={energyAccount}
              coefficients={coefficients}
              onContributeResidue={handleContributeResidue}
              onNavigate={navigateTo}
            />
          )}

          {currentPage === 'community-bioenergy' && (
            <CommunityBioenergyView
              energyAccount={energyAccount}
              onNavigate={navigateTo}
              onSendAlert={handleQuickTriggerAlert}
            />
          )}

          {currentPage === 'offline-sms' && (
            <OfflineSMSView
              profile={profile}
              alerts={smsAlerts}
              connectivity={connectivity}
              gsmHardware={gsmHardware}
              onToggleConnectivity={handleToggleConnectivity}
              onChangeSignalStrength={handleChangeSignalStrength}
              onSendAlert={handleSendSMSAlert}
              onRetryAlert={handleRetryAlert}
              onNavigate={navigateTo}
            />
          )}

          {currentPage === 'farmer-resource-profile' && (
            <FarmerResourceProfileView
              profile={profile}
              energyAccount={energyAccount}
              coefficients={coefficients}
              onUpdateCoefficients={handleUpdateCoefficients}
              onContributeResidue={handleContributeResidue}
              onRecordEnergyUsage={handleRecordEnergyUsage}
              onSelectActiveMonth={handleSelectActiveMonth}
              onResetEnergyAccount={handleResetEnergyAccount}
              onNavigate={navigateTo}
            />
          )}

          {currentPage === 'fpo-dashboard' && (
            <FPODashboardView
              energyAccount={energyAccount}
              onNavigate={navigateTo}
            />
          )}

          {currentPage === 'farm-profile' && (
            <FarmProfileView
              profile={profile}
              onSaveProfile={handleSaveProfile}
              onResetProfile={handleResetProfile}
              onNavigate={navigateTo}
            />
          )}

          {currentPage === 'settings' && (
            <SettingsView
              settings={settings}
              onUpdateSettings={handleUpdateSettings}
              onResetAllDemoData={handleResetAllDemoData}
              onNavigate={navigateTo}
            />
          )}
        </main>
      </div>
    </div>
  );
}
