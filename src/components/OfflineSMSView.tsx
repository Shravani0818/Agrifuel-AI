import React, { useState } from 'react';
import {
  Wifi,
  WifiOff,
  Radio,
  Smartphone,
  CheckCircle2,
  Flame,
  CloudRain,
  Droplets,
  Wind,
  Sun,
  Send,
  RotateCw,
  ArrowDown,
  ArrowRight,
  ShieldCheck,
  Bell,
  Sparkles,
  MessageSquare,
  Plus,
} from 'lucide-react';
import {
  ConnectivityMode,
  GSMHardwareState,
  GSMSignalStrength,
  SMSAlert,
  SMSAlertCategory,
  SMSTriggerType,
  FarmProfile,
  NavPage,
} from '../types/agrifuel';
import {
  ALERT_TRIGGER_TEMPLATES,
  AlertTriggerConfig,
  DEFAULT_FARMER_PHONE,
  DEFAULT_FPO_PHONE,
} from '../data/smsAlertsData';
import { useLanguage } from '../context/LanguageContext';

interface OfflineSMSViewProps {
  profile: FarmProfile;
  alerts: SMSAlert[];
  connectivity: ConnectivityMode;
  gsmHardware: GSMHardwareState;
  onToggleConnectivity: () => void;
  onChangeSignalStrength?: (signal: GSMSignalStrength) => void;
  onSendAlert: (
    triggerType: SMSTriggerType,
    category: SMSAlertCategory,
    title: string,
    messageText: string,
    recipientRole: 'farmer' | 'fpo' | 'all',
    recipientPhone?: string,
    recipientName?: string
  ) => void;
  onRetryAlert: (alertId: string) => void;
  onClearDelivered?: () => void;
  onNavigate: (page: NavPage) => void;
}

export const OfflineSMSView: React.FC<OfflineSMSViewProps> = ({
  profile,
  alerts,
  connectivity,
  onToggleConnectivity,
  onSendAlert,
  onRetryAlert,
  onNavigate,
}) => {
  const { t, language } = useLanguage();
  const [customRecipient, setCustomRecipient] = useState<'farmer' | 'fpo'>('farmer');
  const [customMessage, setCustomMessage] = useState<string>(
    'AgriFuel AI: Root-zone moisture low. Schedule 45-min drip irrigation.'
  );
  const [customCategory, setCustomCategory] = useState<SMSAlertCategory>('irrigation');
  const [showPhonePreview, setShowPhonePreview] = useState<boolean>(true);
  const [activeHandsetMsgIndex, setActiveHandsetMsgIndex] = useState<number>(0);

  // Play a gentle SMS chime tone on dispatch
  const playSmsTone = () => {
    try {
      const audioCtx = new (window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, audioCtx.currentTime);
      osc.frequency.setValueAtTime(1040, audioCtx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.18, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.22);
      osc.start(audioCtx.currentTime);
      osc.stop(audioCtx.currentTime + 0.22);
    } catch {
      // AudioContext not allowed or not supported in environment
    }
  };

  const handleTriggerPreset = (template: AlertTriggerConfig) => {
    let targetPhone = DEFAULT_FARMER_PHONE;
    let targetName = `${profile.farmerName} (Farmer)`;

    if (template.targetRole === 'fpo') {
      targetPhone = DEFAULT_FPO_PHONE;
      targetName = 'Shirur Bioenergy FPO Admin';
    } else if (template.targetRole === 'all') {
      targetPhone = `${DEFAULT_FARMER_PHONE} & ${DEFAULT_FPO_PHONE}`;
      targetName = `${profile.farmerName} & FPO Admin`;
    }

    onSendAlert(
      template.type,
      template.category,
      template.name,
      template.defaultMessage,
      template.targetRole,
      targetPhone,
      targetName
    );

    playSmsTone();
  };

  const handleSendCustomSMS = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customMessage.trim()) return;

    const targetPhone =
      customRecipient === 'farmer' ? DEFAULT_FARMER_PHONE : DEFAULT_FPO_PHONE;
    const targetName =
      customRecipient === 'farmer'
        ? `${profile.farmerName} (Farmer)`
        : 'Shirur Bioenergy FPO Admin';

    onSendAlert(
      'custom',
      customCategory,
      'Direct SMS Alert',
      customMessage.trim(),
      customRecipient,
      targetPhone,
      targetName
    );

    playSmsTone();
  };

  const isOffline = connectivity === 'offline';

  // Specific alerts to keep
  const biogas90 = ALERT_TRIGGER_TEMPLATES.find((t) => t.type === 'biogas-90');
  const biogas95 = ALERT_TRIGGER_TEMPLATES.find((t) => t.type === 'biogas-95');
  const biogas100 = ALERT_TRIGGER_TEMPLATES.find((t) => t.type === 'biogas-100');

  const weatherRain = ALERT_TRIGGER_TEMPLATES.find((t) => t.type === 'weather-rain');
  const weatherWind = ALERT_TRIGGER_TEMPLATES.find((t) => t.type === 'weather-wind');
  const weatherHeat = ALERT_TRIGGER_TEMPLATES.find((t) => t.type === 'weather-heatwave');

  const irrigationLow = ALERT_TRIGGER_TEMPLATES.find((t) => t.type === 'irrigation-low-moisture');
  const irrigationRec = ALERT_TRIGGER_TEMPLATES.find((t) => t.type === 'irrigation-recommended');

  return (
    <div className="space-y-7 max-w-6xl mx-auto">
      {/* Header with requested Headline */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-7 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 mb-2">
            <Radio className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
            <span>{t('sms.modemStatus', 'CELLULAR FAILSAFE BACKUP')}</span>
          </div>

          {/* Requested Headline */}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
            {t('sms.title', 'Offline GSM SMS Emergency Hub')}
          </h1>

          <p className="text-sm text-slate-600 mt-2 max-w-2xl leading-relaxed">
            {t('sms.subtitle', 'In rural farming areas, broadband and mobile data frequently disconnect. Critical biogas levels, weather warnings, and irrigation advisories are sent directly as regular cellular SMS text messages so farmers stay informed.')}
          </p>
        </div>

        {/* Live Internet Drop / Online Simulator Toggle */}
        <div className="shrink-0 self-start md:self-center flex flex-col items-start md:items-end gap-2">
          <span className="text-xs font-semibold text-slate-500">{t('dash.demoData', 'Simulation')}</span>
          <button
            type="button"
            onClick={onToggleConnectivity}
            className={`inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl font-bold text-xs transition-all shadow-xs ${
              isOffline
                ? 'bg-rose-700 text-white hover:bg-rose-800'
                : 'bg-emerald-700 text-white hover:bg-emerald-800'
            }`}
          >
            {isOffline ? (
              <>
                <WifiOff className="w-4 h-4 animate-pulse" />
                <span>{t('app.offline', 'Internet Lost (GSM Active)')}</span>
              </>
            ) : (
              <>
                <Wifi className="w-4 h-4" />
                <span>{t('app.online', 'Internet Online')}</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* HERO ELEMENT: VISUAL FLOW                                    */}
      {/* Internet Lost  ↓  SIM800L GSM  ↓  SMS Delivered              */}
      {/* ============================================================ */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white rounded-3xl p-6 sm:p-8 lg:p-9 shadow-xl border border-slate-700 relative overflow-hidden">
        {/* Background glow accents */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

        <div className="relative z-10">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-6 border-b border-slate-700/80">
            <div>
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
                {t('sms.howItWorks', 'HOW OFFLINE SMS WORKS')}
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                {t('sms.zeroInternetFlow', 'Zero-Internet Emergency Alert Flow')}
              </h2>
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/90 border border-slate-700 text-xs font-mono">
              <span
                className={`w-2 h-2 rounded-full ${
                  isOffline ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'
                }`}
              />
              <span className="text-slate-300">
                {t('sms.status', 'Status:')}{' '}
                <strong className={isOffline ? 'text-amber-300' : 'text-emerald-300'}>
                  {isOffline ? t('sms.transmitting', 'SIM800L Transmitting') : t('sms.standby', 'Standby / Online')}
                </strong>
              </span>
            </div>
          </div>

          {/* THE 3-STEP VISUAL FLOW */}
          <div className="mt-8 flex flex-col md:flex-row items-center justify-between gap-4 lg:gap-6">
            {/* Step 1: Internet Lost */}
            <div
              className={`w-full md:flex-1 rounded-2xl p-6 transition-all duration-300 border flex flex-col items-center text-center ${
                isOffline
                  ? 'bg-rose-950/60 border-rose-500/80 shadow-lg shadow-rose-950/50'
                  : 'bg-slate-800/70 border-slate-700 hover:border-slate-600'
              }`}
            >
              <div
                className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-transform ${
                  isOffline ? 'bg-rose-500/20 text-rose-300 scale-105' : 'bg-slate-700/70 text-slate-300'
                }`}
              >
                <WifiOff className="w-8 h-8" />
              </div>
              <div className="text-xs font-mono uppercase tracking-wider text-rose-400 font-bold mb-1">
                {t('sms.step1', 'STEP 1')}
              </div>
              <div className="text-xl font-black text-white">{t('sms.internetLost', 'Internet Lost')}</div>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                {t('sms.step1Desc', 'Rural broadband or cellular data drops in the field. The farm sensor hub detects loss of internet connection.')}
              </p>
              <div className="mt-4 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-700 text-[11px] font-mono font-medium text-slate-300">
                {isOffline ? t('sms.connectionDown', '● Connection Down') : t('sms.standbyDetector', '○ Standby Detector')}
              </div>
            </div>

            {/* Downward Arrow 1 (Mobile & Desktop) */}
            <div className="flex flex-col items-center justify-center shrink-0 py-1">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-black text-lg shadow-md">
                <ArrowDown className="w-5 h-5 block md:hidden" />
                <span className="hidden md:inline font-mono font-bold text-xl">↓</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 font-semibold mt-1">
                {t('sms.switches', 'Switches')}
              </span>
            </div>

            {/* Step 2: SIM800L GSM */}
            <div
              className={`w-full md:flex-1 rounded-2xl p-6 transition-all duration-300 border flex flex-col items-center text-center ${
                isOffline
                  ? 'bg-amber-950/60 border-amber-500/80 shadow-lg shadow-amber-950/50'
                  : 'bg-slate-800/70 border-slate-700 hover:border-slate-600'
              }`}
            >
              <div
                className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-transform ${
                  isOffline ? 'bg-amber-500/20 text-amber-300 scale-105' : 'bg-slate-700/70 text-slate-300'
                }`}
              >
                <Radio className="w-8 h-8" />
              </div>
              <div className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold mb-1">
                {t('sms.step2', 'STEP 2')}
              </div>
              <div className="text-xl font-black text-white">{t('sms.step2Title', 'SIM800L GSM')}</div>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                {t('sms.step2Desc', 'The integrated SIM800L hardware cellular module automatically activates and routes the alert over basic 2G/4G GSM voice & SMS bands.')}
              </p>
              <div className="mt-4 px-3 py-1 rounded-full bg-slate-900/80 border border-slate-700 text-[11px] font-mono font-medium text-slate-300">
                {t('sms.radioReady', 'Cellular Radio Ready')}
              </div>
            </div>

            {/* Downward Arrow 2 (Mobile & Desktop) */}
            <div className="flex flex-col items-center justify-center shrink-0 py-1">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-black text-lg shadow-md">
                <ArrowDown className="w-5 h-5 block md:hidden" />
                <span className="hidden md:inline font-mono font-bold text-xl">↓</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 font-semibold mt-1">
                {t('sms.transmits', 'Transmits')}
              </span>
            </div>

            {/* Step 3: SMS Delivered */}
            <div className="w-full md:flex-1 rounded-2xl p-6 transition-all duration-300 border bg-emerald-950/60 border-emerald-500/80 shadow-lg shadow-emerald-950/50 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center mb-4">
                <Smartphone className="w-8 h-8" />
              </div>
              <div className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold mb-1">
                {t('sms.step3', 'STEP 3')}
              </div>
              <div className="text-xl font-black text-white">{t('sms.step3Title', 'SMS Delivered')}</div>
              <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                {t('sms.step3Desc', 'Plain text message lands on any basic keypad mobile phone or smartphone within seconds, without requiring mobile data or Wi-Fi.')}
              </p>
              <div className="mt-4 px-3 py-1 rounded-full bg-slate-900/80 border border-emerald-600/40 text-[11px] font-mono font-medium text-emerald-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>{t('sms.reliableOffline', '100% Reliable Offline')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 1. BIOGAS ALERTS (90%, 95%, 100%)                            */}
      {/* ============================================================ */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-7 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center shrink-0">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">{t('sms.biogasAlerts', 'Biogas Alerts')}</h2>
              <p className="text-xs sm:text-sm text-slate-500">
                {t('sms.biogasAlertsDesc', 'Monitors digester volume and sends escalating SMS warnings as reserves deplete.')}
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-semibold text-teal-800 bg-teal-50 px-3 py-1 rounded-full border border-teal-200 self-start sm:self-auto">
            {t('sms.threeLevels', '3 Critical Levels')}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* 90% Biogas Used */}
          {biogas90 && (
            <div className="bg-[#F8FAF7] border border-slate-200 rounded-2xl p-5 flex flex-col justify-between hover:border-teal-400 transition-all shadow-xs">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-teal-100 text-teal-900">
                    {t('sms.90warning', '90% Warning')}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">{t('sms.toFarmer', 'To: Farmer')}</span>
                </div>

                <div className="text-base font-bold text-slate-900 mb-2">{t('sms.90biogasUsed', '90% Biogas Used')}</div>

                <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-xs text-slate-800 leading-relaxed font-medium">
                  &ldquo;{t(biogas90.defaultMessage, biogas90.defaultMessage)}&rdquo;
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-200/70 flex items-center justify-between">
                <span className="text-xs text-slate-500">{t('sms.preconfigured', 'Pre-configured')}</span>
                <button
                  type="button"
                  onClick={() => handleTriggerPreset(biogas90)}
                  className="px-3.5 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{t('sms.send90Sms', 'Send 90% SMS')}</span>
                </button>
              </div>
            </div>
          )}

          {/* 95% Biogas Used */}
          {biogas95 && (
            <div className="bg-amber-50/40 border border-amber-200 rounded-2xl p-5 flex flex-col justify-between hover:border-amber-400 transition-all shadow-xs">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-amber-100 text-amber-900">
                    {t('sms.95urgent', '95% Urgent')}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">{t('sms.toFarmer', 'To: Farmer')}</span>
                </div>

                <div className="text-base font-bold text-slate-900 mb-2">{t('sms.95biogasUsed', '95% Biogas Used')}</div>

                <div className="bg-white p-3.5 rounded-xl border border-amber-200 text-xs text-slate-800 leading-relaxed font-medium">
                  &ldquo;{t(biogas95.defaultMessage, biogas95.defaultMessage)}&rdquo;
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-amber-200/70 flex items-center justify-between">
                <span className="text-xs text-amber-800 font-medium">{t('sms.5reserveLeft', '5% Reserve Left')}</span>
                <button
                  type="button"
                  onClick={() => handleTriggerPreset(biogas95)}
                  className="px-3.5 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{t('sms.send95Sms', 'Send 95% SMS')}</span>
                </button>
              </div>
            </div>
          )}

          {/* 100% Biogas Depleted */}
          {biogas100 && (
            <div className="bg-rose-50/40 border border-rose-200 rounded-2xl p-5 flex flex-col justify-between hover:border-rose-400 transition-all shadow-xs">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-rose-100 text-rose-900">
                    {t('sms.100critical', '100% Critical')}
                  </span>
                  <span className="text-xs font-bold text-rose-800">{t('sms.toFarmerFpo', 'To: Farmer & FPO')}</span>
                </div>

                <div className="text-base font-bold text-slate-900 mb-2">{t('sms.100biogasDepleted', '100% Biogas Depleted')}</div>

                <div className="bg-white p-3.5 rounded-xl border border-rose-200 text-xs text-slate-800 leading-relaxed font-medium">
                  &ldquo;{t(biogas100.defaultMessage, biogas100.defaultMessage)}&rdquo;
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-rose-200/70 flex items-center justify-between">
                <span className="text-xs text-rose-700 font-semibold">{t('sms.dualDispatch', 'Dual Dispatch')}</span>
                <button
                  type="button"
                  onClick={() => handleTriggerPreset(biogas100)}
                  className="px-3.5 py-2 bg-rose-700 hover:bg-rose-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{t('sms.send100Sms', 'Send 100% SMS')}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. WEATHER ALERTS                                            */}
      {/* ============================================================ */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-7 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center shrink-0">
              <CloudRain className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">{t('sms.weatherAlerts', 'Weather Alerts')}</h2>
              <p className="text-xs sm:text-sm text-slate-500">
                {t('sms.weatherAlertsDesc', 'Weather forecasts and field advisories to safeguard crops and adjust irrigation plans.')}
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-semibold text-sky-800 bg-sky-50 px-3 py-1 rounded-full border border-sky-200 self-start sm:self-auto">
            {t('sms.earlyWarnings', 'Early Warnings')}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Heavy Rain in 24h */}
          {weatherRain && (
            <div className="bg-[#F8FAF7] border border-slate-200 rounded-2xl p-5 flex flex-col justify-between hover:border-sky-400 transition-all shadow-xs">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-sky-100 text-sky-900 flex items-center gap-1">
                    <CloudRain className="w-3.5 h-3.5" />
                    <span>{t('sms.rainForecast', 'Rain Forecast')}</span>
                  </span>
                  <span className="text-xs font-semibold text-slate-500">{t('sms.toFarmer', 'To: Farmer')}</span>
                </div>

                <div className="text-base font-bold text-slate-900 mb-2">
                  {t('sms.heavyRainExpected', 'Heavy Rain Expected in 24h')}
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-xs text-slate-800 leading-relaxed font-medium">
                  &ldquo;{t(weatherRain.defaultMessage, weatherRain.defaultMessage)}&rdquo;
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-200/70 flex items-center justify-between">
                <span className="text-xs text-slate-500">{t('advisor.delayAdvice', 'Delay Irrigation')}</span>
                <button
                  type="button"
                  onClick={() => handleTriggerPreset(weatherRain)}
                  className="px-3.5 py-2 bg-sky-700 hover:bg-sky-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{t('sms.sendRainSms', 'Send Rain SMS')}</span>
                </button>
              </div>
            </div>
          )}

          {/* Strong Winds */}
          {weatherWind && (
            <div className="bg-[#F8FAF7] border border-slate-200 rounded-2xl p-5 flex flex-col justify-between hover:border-sky-400 transition-all shadow-xs">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-slate-200 text-slate-800 flex items-center gap-1">
                    <Wind className="w-3.5 h-3.5" />
                    <span>{t('sms.windAdvisory', 'Wind Advisory')}</span>
                  </span>
                  <span className="text-xs font-semibold text-slate-500">{t('sms.toFarmer', 'To: Farmer')}</span>
                </div>

                <div className="text-base font-bold text-slate-900 mb-2">
                  {t('sms.strongWinds', 'Strong Winds (>45 km/h)')}
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-xs text-slate-800 leading-relaxed font-medium">
                  &ldquo;{t(weatherWind.defaultMessage, weatherWind.defaultMessage)}&rdquo;
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-200/70 flex items-center justify-between">
                <span className="text-xs text-slate-500">{t('sms.secureCovers', 'Secure Covers')}</span>
                <button
                  type="button"
                  onClick={() => handleTriggerPreset(weatherWind)}
                  className="px-3.5 py-2 bg-sky-700 hover:bg-sky-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{t('sms.sendWindSms', 'Send Wind SMS')}</span>
                </button>
              </div>
            </div>
          )}

          {/* Heatwave Warning */}
          {weatherHeat && (
            <div className="bg-amber-50/40 border border-amber-200 rounded-2xl p-5 flex flex-col justify-between hover:border-amber-400 transition-all shadow-xs">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-amber-100 text-amber-900 flex items-center gap-1">
                    <Sun className="w-3.5 h-3.5" />
                    <span>{t('sms.heatAdvisory', 'Heat Advisory')}</span>
                  </span>
                  <span className="text-xs font-semibold text-slate-500">{t('sms.toFarmer', 'To: Farmer')}</span>
                </div>

                <div className="text-base font-bold text-slate-900 mb-2">
                  {t('sms.heatwaveWarning', 'Heatwave Warning (39°C+)')}
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-amber-200 text-xs text-slate-800 leading-relaxed font-medium">
                  &ldquo;{t(weatherHeat.defaultMessage, weatherHeat.defaultMessage)}&rdquo;
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-amber-200/70 flex items-center justify-between">
                <span className="text-xs text-amber-800 font-medium">{t('sms.earlyIrrigation', 'Early Irrigation')}</span>
                <button
                  type="button"
                  onClick={() => handleTriggerPreset(weatherHeat)}
                  className="px-3.5 py-2 bg-amber-700 hover:bg-amber-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{t('sms.sendHeatSms', 'Send Heat SMS')}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ============================================================ */}
      {/* 3. IRRIGATION ALERTS                                         */}
      {/* ============================================================ */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-7 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
              <Droplets className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">{t('sms.irrigationAlerts', 'Irrigation Alerts')}</h2>
              <p className="text-xs sm:text-sm text-slate-500">
                {t('sms.irrigationAlertsDesc', 'Direct moisture sensor telemetry alerts farmers when crops need water.')}
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-semibold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 self-start sm:self-auto">
            {t('sms.soilTelemetry', 'Soil Telemetry')}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Soil Moisture Below Threshold */}
          {irrigationLow && (
            <div className="bg-[#F8FAF7] border border-slate-200 rounded-2xl p-5 flex flex-col justify-between hover:border-emerald-400 transition-all shadow-xs">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-100 text-emerald-900 flex items-center gap-1">
                    <Droplets className="w-3.5 h-3.5 text-emerald-700" />
                    <span>{t('sms.moistureDeficit', 'Moisture Deficit')}</span>
                  </span>
                  <span className="text-xs font-semibold text-slate-500">{t('sms.toFarmer', 'To: Farmer')}</span>
                </div>

                <div className="text-base font-bold text-slate-900 mb-2">
                  {t('sms.moistureBelowThreshold', 'Soil Moisture Below Threshold (<35%)')}
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-xs text-slate-800 leading-relaxed font-medium">
                  &ldquo;{t(irrigationLow.defaultMessage, irrigationLow.defaultMessage)}&rdquo;
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-200/70 flex items-center justify-between">
                <span className="text-xs text-slate-500">{t('sms.automatedSensorCheck', 'Automated Sensor Check')}</span>
                <button
                  type="button"
                  onClick={() => handleTriggerPreset(irrigationLow)}
                  className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{t('sms.sendMoistureSms', 'Send Moisture SMS')}</span>
                </button>
              </div>
            </div>
          )}

          {/* Irrigation Recommended */}
          {irrigationRec && (
            <div className="bg-[#F8FAF7] border border-slate-200 rounded-2xl p-5 flex flex-col justify-between hover:border-emerald-400 transition-all shadow-xs">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-100 text-emerald-900 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                    <span>{t('sms.solarDripAdvisory', 'Solar Drip Advisory')}</span>
                  </span>
                  <span className="text-xs font-semibold text-slate-500">{t('sms.toFarmer', 'To: Farmer')}</span>
                </div>

                <div className="text-base font-bold text-slate-900 mb-2">
                  {t('sms.irrigationRecSolar', 'Irrigation Recommended (Solar Drip)')}
                </div>

                <div className="bg-white p-3.5 rounded-xl border border-slate-200 text-xs text-slate-800 leading-relaxed font-medium">
                  &ldquo;{t(irrigationRec.defaultMessage, irrigationRec.defaultMessage)}&rdquo;
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-200/70 flex items-center justify-between">
                <span className="text-xs text-slate-500">{t('sms.rootZoneOptimization', 'Root-Zone Optimization')}</span>
                <button
                  type="button"
                  onClick={() => handleTriggerPreset(irrigationRec)}
                  className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{t('sms.sendIrrigationRecSms', 'Send Irrigation Rec SMS')}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ============================================================ */}
      {/* HANDSET PREVIEW & RECENT DISPATCHED ALERTS                   */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Simple Handset Mockup */}
        <div className="lg:col-span-5 bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs flex flex-col items-center">
          <div className="w-full flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-emerald-700" />
              <h3 className="font-bold text-slate-900 text-sm">{t('sms.farmerPhonePreview', 'Farmer Phone Preview')}</h3>
            </div>
            <span className="text-[11px] font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              {t('sms.basicKeypadPhone', 'Basic Keypad Phone')}
            </span>
          </div>

          {/* Simple phone mockup */}
          <div className="w-[270px] bg-slate-900 rounded-[34px] p-3.5 shadow-xl border-4 border-slate-800 text-white">
            <div className="flex justify-center mb-2">
              <div className="w-12 h-1 bg-slate-700 rounded-full" />
            </div>

            {/* Screen */}
            <div className="bg-[#121E14] text-emerald-300 font-mono rounded-xl p-3 border-2 border-emerald-950 min-h-[300px] flex flex-col justify-between shadow-inner">
              <div className="flex items-center justify-between text-[10px] pb-1.5 border-b border-emerald-900/60 text-emerald-400">
                <span>SIM800L GSM</span>
                <span>{t('sms.smsInbox', 'SMS INBOX')}</span>
              </div>

              <div className="my-2 flex-1 space-y-2 overflow-y-auto max-h-[220px] pr-1">
                {alerts.length === 0 ? (
                  <div className="text-center py-8 text-emerald-600 text-xs">
                    {t('sms.noSmsReceived', 'No SMS messages received yet. Click any "Send SMS" button above.')}
                  </div>
                ) : (
                  alerts.slice(0, 5).map((msg, i) => (
                    <div
                      key={msg.id}
                      onClick={() => setActiveHandsetMsgIndex(i)}
                      className={`p-2 rounded-lg text-left text-xs transition-colors cursor-pointer border ${
                        activeHandsetMsgIndex === i
                          ? 'bg-emerald-950 border-emerald-400 text-white'
                          : 'bg-emerald-950/40 border-emerald-900/40 text-emerald-300 hover:bg-emerald-950/70'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[9px] font-bold text-amber-300 mb-0.5">
                        <span>{t(msg.title, msg.title)}</span>
                        <span>{msg.timestamp.split('·')[0]}</span>
                      </div>
                      <p className="text-[11px] leading-snug font-sans text-slate-100">
                        {t(msg.messageText, msg.messageText)}
                      </p>
                    </div>
                  ))
                )}
              </div>

              <div className="pt-1.5 border-t border-emerald-900/60 text-[9px] text-emerald-400 flex justify-between font-bold">
                <span>{t('sms.options', '[Options]')}</span>
                <span>{t('sms.reply', '[Reply]')}</span>
                <span>{t('sms.back', '[Back]')}</span>
              </div>
            </div>

            {/* Keypad */}
            <div className="mt-2.5 grid grid-cols-3 gap-1 px-2 text-center text-[10px] font-mono font-bold text-slate-300">
              <div className="py-1 bg-slate-800 rounded">1</div>
              <div className="py-1 bg-slate-800 rounded">2</div>
              <div className="py-1 bg-slate-800 rounded">3</div>
              <div className="py-1 bg-slate-800 rounded">4</div>
              <div className="py-1 bg-slate-800 rounded">5</div>
              <div className="py-1 bg-slate-800 rounded">6</div>
              <div className="py-1 bg-slate-800 rounded">7</div>
              <div className="py-1 bg-slate-800 rounded">8</div>
              <div className="py-1 bg-slate-800 rounded">9</div>
            </div>
          </div>
        </div>

        {/* Right: Dispatched History & Custom SMS */}
        <div className="lg:col-span-7 space-y-6">
          {/* Recent Deliveries */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-base">{t('sms.recentAlerts', 'Recent Dispatched Alerts')}</h3>
                <p className="text-xs text-slate-500">
                  {t('sms.recentAlertsDesc', 'Messages transmitted over cellular SMS network to farmer devices.')}
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                {alerts.length} {t('sms.total', 'Total')}
              </span>
            </div>

            <div className="space-y-2.5 max-h-[280px] overflow-y-auto pr-1">
              {alerts.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-xs">
                  {t('sms.noAlertsSentYet', 'No alerts sent yet. Use the trigger buttons above to test.')}
                </div>
              ) : (
                alerts.slice(0, 8).map((al) => (
                  <div
                    key={al.id}
                    className="p-3 rounded-xl bg-[#F8FAF7] border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{t(al.title, al.title)}</span>
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>{t('sms.delivered', 'Delivered')}</span>
                        </span>
                      </div>
                      <p className="text-slate-600 text-[11px] leading-relaxed line-clamp-2">
                        {t(al.messageText, al.messageText)}
                      </p>
                      <div className="text-[10px] text-slate-500">
                        {t('sms.toFarmer', 'To')}: {al.recipientName} ({al.recipientPhone}) &bull; {al.timestamp}
                      </div>
                    </div>

                    {(al.status === 'failed' || al.status === 'pending') && (
                      <button
                        type="button"
                        onClick={() => onRetryAlert(al.id)}
                        className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition-colors shrink-0 flex items-center gap-1 self-start sm:self-auto"
                      >
                        <RotateCw className="w-3 h-3" />
                        <span>{t('sms.retry', 'Retry')}</span>
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Simple Custom SMS Composer */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-700" />
                <h3 className="font-bold text-slate-900 text-sm">{t('sms.sendCustomSms', 'Send Custom SMS')}</h3>
              </div>
              <span className="text-xs text-slate-500">{t('sms.quickAlertDispatch', 'Quick Alert Dispatch')}</span>
            </div>

            <form onSubmit={handleSendCustomSMS} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t('sms.recipient', 'Recipient')}
                  </label>
                  <select
                    value={customRecipient}
                    onChange={(e) => setCustomRecipient(e.target.value as 'farmer' | 'fpo')}
                    className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 font-medium"
                  >
                    <option value="farmer">{t('sms.farmer', 'Farmer')}: {profile.farmerName}</option>
                    <option value="fpo">{t('sms.fpoAdminShirur', 'FPO Admin: Shirur Bioenergy')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    {t('sms.alertType', 'Alert Type')}
                  </label>
                  <select
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value as SMSAlertCategory)}
                    className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600 font-medium"
                  >
                    <option value="irrigation">{t('sms.alertTypeIrrigation', 'Irrigation Alert')}</option>
                    <option value="biogas">{t('sms.alertTypeBiogas', 'Biogas Alert')}</option>
                    <option value="weather">{t('sms.alertTypeWeather', 'Weather Alert')}</option>
                    <option value="system">{t('sms.alertTypeGeneral', 'General Advisory')}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {t('sms.messageText', 'Message Text')}
                </label>
                <textarea
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  rows={2}
                  className="w-full text-xs p-3 border border-slate-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-emerald-600"
                  placeholder={t('sms.enterMessagePlaceholder', 'Enter message for farmer...')}
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-slate-500">
                  {t('sms.sendsViaGsmDirectly', "Sends via GSM SMS directly to farmer's phone")}
                </span>
                <button
                  type="submit"
                  disabled={!customMessage.trim()}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{t('sms.sendSms', 'Send SMS')}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
