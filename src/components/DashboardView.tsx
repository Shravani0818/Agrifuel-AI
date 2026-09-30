import React from 'react';
import {
  Sprout,
  Droplets,
  Thermometer,
  CloudRain,
  Recycle,
  Flame,
  BrainCircuit,
  ArrowRight,
  Wind,
  Sun,
  AlertCircle,
  CheckCircle2,
  Cpu,
  ScanLine,
  Building2,
  Zap,
  IndianRupee,
  UserCheck,
  Radio,
  SignalHigh,
  Wifi,
  WifiOff,
  Clock,
  XCircle,
  Send,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import {
  ConnectivityMode,
  FarmerEnergyAccount,
  FarmProfile,
  GSMHardwareState,
  IoTState,
  NavPage,
  SMSAlert,
  SMSTriggerType,
  WeatherData,
} from '../types/agrifuel';
import {
  calculateResidueMetrics,
  generateAIDecisionEngine,
} from '../data/demoData';
import { AIInsightCard } from './AIInsightCard';
import { useLanguage } from '../context/LanguageContext';

interface DashboardViewProps {
  profile: FarmProfile;
  iot: IoTState;
  weather: WeatherData;
  energyAccount: FarmerEnergyAccount;
  onNavigate: (page: NavPage) => void;
  onSimulateWeatherShift: () => void;
  alerts?: SMSAlert[];
  connectivity?: ConnectivityMode;
  gsmHardware?: GSMHardwareState;
  onQuickTriggerAlert?: (triggerType: SMSTriggerType) => void;
  onToggleConnectivity?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  profile,
  iot,
  weather,
  energyAccount,
  onNavigate,
  onSimulateWeatherShift,
  alerts = [],
  connectivity = 'offline',
  gsmHardware,
  onQuickTriggerAlert,
  onToggleConnectivity,
}) => {
  const { t } = useLanguage();
  const cropHealthPercent = 87;
  const residueMetrics = calculateResidueMetrics(profile.primaryCrop, profile.farmAreaAcres);
  const aiDecision = generateAIDecisionEngine(profile, iot, weather, cropHealthPercent);

  // SMS Stats for Dashboard
  const smsSentCount = alerts.filter((a) => a.status === 'sent' || a.status === 'delivered').length;
  const smsDeliveredCount = alerts.filter((a) => a.status === 'delivered').length;
  const smsPendingCount = alerts.filter((a) => a.status === 'pending').length;
  const smsFailedCount = alerts.filter((a) => a.status === 'failed').length;

  const cropTrendData = [
    { day: 'Day 1', health: 83, moisture: 45 },
    { day: 'Day 2', health: 84, moisture: 44 },
    { day: 'Day 3', health: 85, moisture: 43 },
    { day: 'Day 4', health: 86, moisture: 41 },
    { day: 'Day 5', health: 86, moisture: 43 },
    { day: t('dash.today', 'Today'), health: cropHealthPercent, moisture: iot.soilMoisture },
  ];

  return (
    <div className="space-y-6">
      {/* Top Farmer Banner */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 sm:p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono-tabular uppercase tracking-wider font-semibold text-emerald-700">
              {t('dash.commandCenter', 'FARMER COMMAND CENTER')} · ID: {profile.farmerId || 'F001'}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">
            {profile.farmerName} — {profile.location}
          </h1>
          <p className="text-sm text-slate-600">
            {t('dash.farmSize', 'Farm Size')}:{' '}
            <span className="font-mono-tabular font-semibold text-slate-900">
              {profile.farmAreaAcres} {t('unit.acres', 'Acres')} ({residueMetrics.areaHectares} {t('unit.hectares', 'ha')})
            </span>{' '}
            · {t('dash.primaryCrop', 'Primary Crop')}:{' '}
            <span className="font-semibold text-emerald-800">{profile.primaryCrop}</span> · {t('dash.soilType', 'Soil Type')}:{' '}
            <span className="font-medium text-slate-800">{profile.soilType}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => onNavigate('crop-scanner')}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-xl transition-colors whitespace-nowrap"
          >
            <ScanLine className="w-4 h-4" />
            <span>{t('dash.actionScan', 'Scan Crop Leaf')}</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('farmer-resource-profile')}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-950 hover:bg-slate-900 text-white text-xs font-semibold rounded-xl transition-colors whitespace-nowrap"
          >
            <Zap className="w-4 h-4 text-amber-300" />
            <span>{t('nav.farmerResourceProfile', 'Farmer Energy Account')} ({energyAccount.currentBalanceKwh} {t('unit.kwh', 'kWh')})</span>
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* SECTION 6: 6 SUMMARY METRIC CARDS                            */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {/* Card 1: Crop Health */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-600">{t('dash.cropHealth', 'Crop Health')}</span>
            <Sprout className="w-4 h-4 text-emerald-700 shrink-0" />
          </div>
          <div className="my-2.5">
            <div className="text-2xl font-mono-tabular font-bold text-slate-900">
              {cropHealthPercent}%
            </div>
            <div className="text-xs font-semibold text-emerald-700 mt-0.5">
              {t('status.good', 'Status: Good')}
            </div>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>{profile.primaryCrop}</span>
            <span className="font-mono-tabular font-semibold text-emerald-700">Healthy</span>
          </div>
        </div>

        {/* Card 2: Soil Moisture */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-600">{t('dash.soilMoisture', 'Soil Moisture')}</span>
            <Droplets className="w-4 h-4 text-sky-600 shrink-0" />
          </div>
          <div className="my-2.5">
            <div className="text-2xl font-mono-tabular font-bold text-slate-900">
              {iot.soilMoisture}%
            </div>
            <div className="text-xs font-semibold text-sky-700 mt-0.5">
              {t('status.moderate', 'Status: Moderate')}
            </div>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>{t('dash.soilMoisture', 'Root Sensor')}</span>
            <span className="font-mono-tabular font-semibold text-sky-700">Capacitive</span>
          </div>
        </div>

        {/* Card 3: Temperature & Humidity */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-600">{t('dash.temperature', 'Temp')} &amp; {t('dash.humidity', 'Humidity')}</span>
            <Thermometer className="w-4 h-4 text-amber-600 shrink-0" />
          </div>
          <div className="my-2.5">
            <div className="text-2xl font-mono-tabular font-bold text-slate-900">
              {Math.round(iot.temperature)}°C{' '}
              <span className="text-base font-normal text-slate-400">/</span> {iot.humidity}%
            </div>
            <div className="text-xs font-semibold text-slate-600 mt-0.5">
              {t('DHT22 Field Node', 'DHT22 Field Node')}
            </div>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>{t('Pune Microclimate', 'Pune Microclimate')}</span>
            <span className="font-mono-tabular font-semibold text-amber-700">Ambient</span>
          </div>
        </div>

        {/* Card 4: Rain Probability */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-600">{t('dash.rainProb', 'Rain Probability')}</span>
            <CloudRain className="w-4 h-4 text-blue-600 shrink-0" />
          </div>
          <div className="my-2.5">
            <div className="text-2xl font-mono-tabular font-bold text-slate-900">
              {weather.rainProbability}%
            </div>
            <div className="text-xs font-semibold text-blue-700 mt-0.5">
              {t('Next 24h Window', 'Next 24h Window')}
            </div>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>{t('dash.windSpeed', 'Wind')}: {weather.windSpeed} km/h</span>
            <span className="font-mono-tabular font-semibold text-blue-700">Forecast</span>
          </div>
        </div>

        {/* Card 5: Estimated Crop Residue - Transparent Calculation: Area x Coeff */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-600">{t('dash.residueContributed', 'Est. Crop Residue')}</span>
            <Recycle className="w-4 h-4 text-emerald-700 shrink-0" />
          </div>
          <div className="my-2.5">
            <div className="text-2xl font-mono-tabular font-bold text-slate-900">
              {residueMetrics.estimatedResidueTonnes} <span className="text-sm font-medium text-slate-600">{t('unit.tonnes', 'tonnes')}</span>
            </div>
            <div className="text-xs font-semibold text-emerald-700 mt-0.5">
              {profile.farmAreaAcres} ac × {residueMetrics.coefficientTonnesPerAcre.toFixed(2)} t/ac
            </div>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>{profile.farmAreaAcres} {t('unit.acres', 'Acres')}</span>
            <span className="font-mono-tabular font-semibold text-emerald-700">Area × Coeff</span>
          </div>
        </div>

        {/* Card 6: Estimated Biogas Potential - Simulated Model */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-600">{t('dash.biogasProduced', 'Est. Biogas Potential')}</span>
            <Flame className="w-4 h-4 text-teal-700 shrink-0" />
          </div>
          <div className="my-2.5">
            <div className="text-2xl font-mono-tabular font-bold text-slate-900">
              {residueMetrics.illustrativeBiogasM3} <span className="text-sm font-medium text-slate-600">{t('unit.m3', 'm³')}</span>
            </div>
            <div className="text-xs font-semibold text-teal-700 mt-0.5">
              ~{residueMetrics.illustrativeEnergyKwh} {t('unit.kwh', 'kWh')}
            </div>
          </div>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>{t('dash.cleanPowerTitle', 'Clean Fuel')}</span>
            <span className="font-mono-tabular font-semibold text-teal-700">Simulated</span>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* SMART FARMER RESOURCE & ENERGY ACCOUNT SUMMARY CARD          */}
      {/* ============================================================ */}
      <div className="bg-white border-2 border-emerald-600/30 rounded-2xl p-6 space-y-5 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono-tabular font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                <Zap className="w-3.5 h-3.5 text-emerald-700" />
                <span>{t('profile.title', 'FARMER ENERGY ACCOUNT')} · ID: {energyAccount.farmerId}</span>
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 mt-2">
              {t('profile.title', 'Smart Farmer Resource & Energy Accounting')} — {energyAccount.farmerName} (
              {energyAccount.village})
            </h2>
            <p className="text-xs text-slate-600 mt-0.5">
              {t('dash.cleanPowerDesc', 'Tracks crop residue contributed to the community biogas plant, energy credits earned, farm energy consumed, and monthly carry-forward balance.')}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => onNavigate('residue-intelligence')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors"
            >
              <Recycle className="w-3.5 h-3.5 text-emerald-700" />
              <span>{t('residue.contributeButton', 'Contribute Residue')}</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('farmer-resource-profile')}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition-colors"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>{t('profile.passbookHeading', 'Open Full Farmer Resource Profile')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
          <div className="p-3.5 rounded-xl bg-[#F8FAF7] border border-slate-200/90">
            <div className="text-[11px] font-semibold text-slate-500">
              {t('dash.residueContributed', 'Residue Contributed')}
            </div>
            <div className="text-xl font-mono-tabular font-bold text-slate-900 mt-1">
              {energyAccount.residueContributionTonnes} {t('unit.tonnes', 'tonnes')}
            </div>
            <div className="text-[10px] text-emerald-700 font-medium mt-0.5">
              {energyAccount.primaryCrop}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200">
            <div className="text-[11px] font-semibold text-emerald-900">
              {t('dash.energyEarned', 'Energy Earned')}
            </div>
            <div className="text-xl font-mono-tabular font-bold text-emerald-800 mt-1">
              {energyAccount.energyEarnedKwh} {t('unit.kwh', 'kWh')}
            </div>
            <div className="text-[10px] text-emerald-700 font-medium mt-0.5">
              {t('bio.powerDistribution', 'Community biogas credit')}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-sky-50/70 border border-sky-200">
            <div className="text-[11px] font-semibold text-sky-900">
              {t('profile.totalUsed', 'Energy Used')}
            </div>
            <div className="text-xl font-mono-tabular font-bold text-sky-900 mt-1">
              {energyAccount.energyUsedKwh} {t('unit.kwh', 'kWh')}
            </div>
            <div className="text-[10px] text-sky-800 font-medium mt-0.5">
              {t('profile.recordUsage', 'Irrigation & equipment')}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200">
            <div className="text-[11px] font-semibold text-amber-950">
              {t('dash.currentBalance', 'Current Balance')}
            </div>
            <div className="text-xl font-mono-tabular font-bold text-amber-900 mt-1">
              {energyAccount.currentBalanceKwh} {t('unit.kwh', 'kWh')}
            </div>
            <div className="text-[10px] text-amber-800 font-medium mt-0.5">
              {t('dash.energyBalanceTitle', 'Available for farm use')}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-950 text-white">
            <div className="text-[11px] font-semibold text-emerald-200">
              {t('dash.carryForward', 'Carry Forward')}
            </div>
            <div className="text-xl font-mono-tabular font-bold text-white mt-1">
              {energyAccount.carryForwardKwh} {t('unit.kwh', 'kWh')}
            </div>
            <div className="text-[10px] text-emerald-300 font-medium mt-0.5">
              {t('dash.carryForward', 'Rolls to next month')}
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#F8FAF7] border border-slate-200/90">
            <div className="text-[11px] font-semibold text-slate-500">
              {t('dash.monetaryValue', 'Est. Monetary Value')}
            </div>
            <div className="text-xl font-mono-tabular font-bold text-slate-900 flex items-center gap-0.5 mt-1">
              <IndianRupee className="w-4 h-4 text-emerald-700" />
              <span>{energyAccount.estimatedMonetaryValueInr.toLocaleString('en-IN')}</span>
            </div>
            <div className="text-[10px] text-slate-500 font-medium mt-0.5">
              {t('dash.monetaryValue', 'Remaining credit value')}
            </div>
          </div>
        </div>
      </div>


      {/* ============================================================ */}
      {/* OFFLINE & GSM SMS EMERGENCY ALERT DASHBOARD                  */}
      {/* ============================================================ */}
      <div className="bg-white border-2 border-slate-300 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0">
              <Radio className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-emerald-800 uppercase tracking-wider">
                  {t('sms.modemStatus', 'GSM SMS EMERGENCY DISPATCHER')}
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                    connectivity === 'online'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-rose-100 text-rose-800 border border-rose-300 animate-pulse'
                  }`}
                >
                  {connectivity === 'online' ? `🟢 ${t('app.online', 'Online')}` : `🔴 ${t('app.offline', 'Offline (GSM)')}`}
                </span>
              </div>
              <h2 className="text-lg font-bold text-slate-900 mt-0.5">
                {t('sms.title', 'Offline SMS Mobile Alert System')}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            {onToggleConnectivity && (
              <button
                type="button"
                onClick={onToggleConnectivity}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                title="Toggle simulated Internet connectivity"
              >
                {connectivity === 'online' ? t('sms.title', 'Simulate Internet Drop') : t('app.online', 'Simulate Internet Restored')}
              </button>
            )}
            <button
              type="button"
              onClick={() => onNavigate('offline-sms')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors whitespace-nowrap"
            >
              <span>{t('nav.offlineSms', 'Open SMS Hub')}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 4 Required Dashboard Metrics: SMS Sent, Delivered, Pending, Failed */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div
            onClick={() => onNavigate('offline-sms')}
            className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 cursor-pointer hover:border-blue-300 transition-all"
          >
            <div className="flex items-center justify-between text-xs font-semibold text-blue-900">
              <span>{t('app.sms', 'SMS')} {t('sms.sentAt', 'Sent')}</span>
              <Send className="w-3.5 h-3.5 text-blue-700" />
            </div>
            <div className="text-2xl font-mono font-bold text-blue-900 mt-1">
              {smsSentCount}
            </div>
            <div className="text-[10px] text-blue-700 font-medium mt-0.5">
              {t('sms.cellularTransmissions', 'Cellular transmissions')}
            </div>
          </div>

          <div
            onClick={() => onNavigate('offline-sms')}
            className="p-3.5 rounded-xl bg-emerald-50/80 border border-emerald-300 cursor-pointer hover:border-emerald-400 transition-all"
          >
            <div className="flex items-center justify-between text-xs font-semibold text-emerald-900">
              <span>{t('sms.delivered', 'Delivered')}</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
            </div>
            <div className="text-2xl font-mono font-bold text-emerald-800 mt-1">
              {smsDeliveredCount}
            </div>
            <div className="text-[10px] text-emerald-700 font-medium mt-0.5">
              {t('sms.towerAck', 'Tower ACK confirmed')}
            </div>
          </div>

          <div
            onClick={() => onNavigate('offline-sms')}
            className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
              smsPendingCount > 0
                ? 'bg-amber-50/90 border-amber-300 ring-2 ring-amber-200'
                : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-semibold text-amber-950">
              <span>{t('sms.pending', 'Pending')}</span>
              <Clock className="w-3.5 h-3.5 text-amber-700" />
            </div>
            <div className="text-2xl font-mono font-bold text-amber-900 mt-1">
              {smsPendingCount}
            </div>
            <div className="text-[10px] text-amber-800 font-medium mt-0.5">
              {smsPendingCount > 0 ? t('app.queued', 'Queued in Outbox') : t('sms.outboxEmpty', 'Outbox empty')}
            </div>
          </div>

          <div
            onClick={() => onNavigate('offline-sms')}
            className="p-3.5 rounded-xl bg-rose-50/70 border border-rose-200 cursor-pointer hover:border-rose-300 transition-all"
          >
            <div className="flex items-center justify-between text-xs font-semibold text-rose-900">
              <span>{t('sms.failed', 'Failed')}</span>
              <XCircle className="w-3.5 h-3.5 text-rose-700" />
            </div>
            <div className="text-2xl font-mono font-bold text-rose-700 mt-1">
              {smsFailedCount}
            </div>
            <div className="text-[10px] text-rose-600 font-medium mt-0.5">
              {t('action.retry', 'Requires retry')}
            </div>
          </div>
        </div>

        {/* Quick Test Trigger Buttons */}
        <div className="pt-2 border-t border-slate-100">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-700">
              {t('sms.triggerAlert', 'Quick Trigger Alerts')} (&le;160 chars):
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => onQuickTriggerAlert?.('biogas-90')}
                className="px-2.5 py-1 text-[11px] font-semibold bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 rounded-lg transition-colors flex items-center gap-1"
                title="Trigger 90% Biogas Quota Used Warning SMS"
              >
                <Flame className="w-3 h-3 text-teal-600" />
                <span>90% {t('dash.biogasQuota', 'Biogas Used')}</span>
              </button>
              <button
                type="button"
                onClick={() => onQuickTriggerAlert?.('biogas-95')}
                className="px-2.5 py-1 text-[11px] font-semibold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-lg transition-colors flex items-center gap-1"
                title="Trigger 95% Biogas Quota Urgent SMS"
              >
                <Flame className="w-3 h-3 text-amber-600" />
                <span>95% {t('dash.biogasQuota', 'Biogas Used')}</span>
              </button>
              <button
                type="button"
                onClick={() => onQuickTriggerAlert?.('biogas-100')}
                className="px-2.5 py-1 text-[11px] font-semibold bg-rose-50 hover:bg-rose-100 text-rose-900 border border-rose-200 rounded-lg transition-colors flex items-center gap-1"
                title="Trigger 100% Biogas Depleted (Farmer + FPO) SMS"
              >
                <Flame className="w-3 h-3 text-rose-600" />
                <span>100% {t('dash.biogasDepleted', 'Biogas Depleted')}</span>
              </button>
              <button
                type="button"
                onClick={() => onQuickTriggerAlert?.('weather-rain')}
                className="px-2.5 py-1 text-[11px] font-semibold bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200 rounded-lg transition-colors flex items-center gap-1"
                title="Trigger Heavy Rain in 24h Warning SMS"
              >
                <CloudRain className="w-3 h-3 text-sky-600" />
                <span>{t('dash.rainProb', 'Heavy Rain')}</span>
              </button>
              <button
                type="button"
                onClick={() => onQuickTriggerAlert?.('irrigation-low-moisture')}
                className="px-2.5 py-1 text-[11px] font-semibold bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg transition-colors flex items-center gap-1"
                title="Trigger Low Soil Moisture Irrigation SMS"
              >
                <Droplets className="w-3 h-3 text-emerald-600" />
                <span>{t('dash.soilMoisture', 'Soil Moisture Low')}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* CENTRAL AI DECISION ENGINE + WEATHER                         */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* AI Decision Engine Panel (7 columns) */}
        <div className="lg:col-span-7 space-y-4">
          <AIInsightCard
            farmData={{
              crop: profile.primaryCrop,
              growthStage: profile.cropGrowthStage || 'Vegetative',
              soilMoisture: iot.soilMoisture,
              temperature: weather.temperature,
              humidity: weather.humidity,
              rainProbability: weather.rainProbability,
              biogasLevel: iot.methaneIndicator,
              location: profile.location,
              farmSize: profile.farmAreaAcres,
              context: 'dashboard',
            }}
            title={t('dash.energyBalanceTitle', 'AgriFuel AI Recommendation')}
            initialHeadline="Delay irrigation today"
            initialAction="Rain is likely within 24 hours, and current soil moisture is sufficient. Waiting until tomorrow can help conserve water."
            initialConfidence={93}
          />

          <div className="bg-white border border-slate-200/90 rounded-2xl p-5">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <span className="text-xs font-mono font-bold text-emerald-800 uppercase tracking-wider">
                {t('dash.commandCenter', 'DECISION SUPPORT TELEMETRY')}
              </span>
              <span className="text-xs font-semibold text-emerald-700">
                {t('crop.' + profile.primaryCrop, profile.primaryCrop)} · {t('stage.' + (profile.cropGrowthStage || 'Vegetative'), profile.cropGrowthStage || 'Vegetative')}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
              <div className="p-3 rounded-xl bg-[#F8FAF7] border border-slate-200/80">
                <div className="text-xs font-semibold text-slate-500">{t('dash.cropHealth', 'Crop Vigor')}</div>
                <div className="text-sm font-bold text-slate-900 mt-0.5">
                  {cropHealthPercent}% {t('status.good', 'Good Health')}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#F8FAF7] border border-slate-200/80">
                <div className="text-xs font-semibold text-slate-500">{t('advisor.irrigationScheduler', 'Irrigation Plan')}</div>
                <div className="text-sm font-bold text-sky-900 mt-0.5">
                  {t('advisor.delayAdvice', 'Delay irrigation (Rain predicted)')}
                </div>
              </div>
            </div>

            <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs text-slate-500">
                {t('dash.quickActions', 'Precision Advice')}
              </span>
              <button
                type="button"
                onClick={() => onNavigate('farm-advisor')}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800"
              >
                <span>{t('advisor.title', 'Open Full Farm Advisor')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Weather Intelligence Card (Section 9) (5 columns) */}
        <div className="lg:col-span-5 bg-white border border-slate-200/90 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 pb-4 border-b border-slate-100">
              <div>
                <div className="text-xs font-mono-tabular uppercase font-semibold text-sky-700">
                  {t('dash.weatherVitals', 'WEATHER INTELLIGENCE')}
                </div>
                <h2 className="text-lg font-bold text-slate-900">{weather.location}</h2>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onSimulateWeatherShift}
                  className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-sky-50 text-sky-800 border border-sky-200 hover:bg-sky-100 transition-colors"
                >
                  {t('dash.simulateWeatherShift', 'Simulate Weather Shift')}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
              <div className="p-3 rounded-xl bg-[#F8FAF7] border border-slate-200/70">
                <div className="text-[11px] text-slate-500 flex items-center gap-1">
                  <Sun className="w-3.5 h-3.5 text-amber-500" />
                  <span>{t('dash.temperature', 'Temp')}</span>
                </div>
                <div className="text-lg font-mono-tabular font-bold text-slate-900 mt-1">
                  {weather.temperature}°C
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#F8FAF7] border border-slate-200/70">
                <div className="text-[11px] text-slate-500 flex items-center gap-1">
                  <Droplets className="w-3.5 h-3.5 text-sky-500" />
                  <span>{t('dash.humidity', 'Humidity')}</span>
                </div>
                <div className="text-lg font-mono-tabular font-bold text-slate-900 mt-1">
                  {weather.humidity}%
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#F8FAF7] border border-slate-200/70">
                <div className="text-[11px] text-slate-500 flex items-center gap-1">
                  <CloudRain className="w-3.5 h-3.5 text-blue-600" />
                  <span>{t('dash.rainProb', 'Rain Prob')}</span>
                </div>
                <div className="text-lg font-mono-tabular font-bold text-blue-700 mt-1">
                  {weather.rainProbability}%
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#F8FAF7] border border-slate-200/70">
                <div className="text-[11px] text-slate-500 flex items-center gap-1">
                  <Wind className="w-3.5 h-3.5 text-slate-500" />
                  <span>{t('dash.windSpeed', 'Wind')}</span>
                </div>
                <div className="text-lg font-mono-tabular font-bold text-slate-900 mt-1">
                  {weather.windSpeed} <span className="text-xs font-normal">km/h</span>
                </div>
              </div>
            </div>

            <div className="mt-2">
              <div className="text-xs font-semibold text-slate-600 mb-2">
                {t('dash.forecastTitle', '7-Day Climate & Weather Forecast')}
              </div>
              <div className="grid grid-cols-7 gap-1.5 text-center">
                {weather.forecast.map((d) => (
                  <div
                    key={d.day}
                    className="p-2 rounded-lg bg-[#F8FAF7] border border-slate-200/70 flex flex-col items-center"
                  >
                    <span className="text-[11px] font-semibold text-slate-700">{d.day}</span>
                    <span className="text-xs font-mono-tabular font-bold text-slate-900 mt-1">
                      {d.temp}°
                    </span>
                    <span className="text-[10px] font-mono-tabular text-blue-700 font-semibold mt-0.5">
                      {d.rainProb}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-4 p-3.5 rounded-xl bg-sky-50/80 border border-sky-200 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-sky-700 shrink-0 mt-0.5" />
            <div className="text-xs text-sky-950">
              <span className="font-bold">{t('ai.insight', 'AI Insight')}: </span>
              {t('advisor.delayAdvice', 'Rain probability is elevated. Delay irrigation to conserve water and preserve your farmer energy credits.')}
            </div>
          </div>
        </div>

      </div>

      {/* ============================================================ */}
      {/* CHART + END-TO-END WORKFLOW LAUNCHPAD                        */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Crop Health & Soil Moisture Chart */}
        <div className="lg:col-span-6 bg-white border border-slate-200/90 rounded-2xl p-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <span className="text-xs font-mono-tabular uppercase font-semibold text-emerald-700">
                {t('dash.cropHealthTrend', 'FIELD TELEMETRY TREND')}
              </span>
              <h3 className="text-base font-bold text-slate-900">
                {t('dash.cropHealth', 'Crop Health')} vs. {t('dash.soilMoisture', 'Soil Moisture')} (6-Day Window)
              </h3>
            </div>
          </div>

          <div className="h-56 w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cropTrendData}>
                <defs>
                  <linearGradient id="healthGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#047857" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#047857" stopOpacity={0.02} />
                  </linearGradient>
                  <linearGradient id="moistureGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0284C7" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#0284C7" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="#64748B" />
                <YAxis tick={{ fontSize: 12 }} stroke="#64748B" domain={[0, 100]} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="health"
                  name={`${t('dash.cropHealth', 'Crop Health')} (%)`}
                  stroke="#047857"
                  strokeWidth={2.5}
                  fill="url(#healthGrad)"
                />
                <Area
                  type="monotone"
                  dataKey="moisture"
                  name={`${t('dash.soilMoisture', 'Soil Moisture')} (%)`}
                  stroke="#0284C7"
                  strokeWidth={2}
                  fill="url(#moistureGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Interactive Module Cards for Judge Walkthrough */}
        <div className="lg:col-span-6 bg-white border border-slate-200/90 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-xs font-mono-tabular uppercase font-semibold text-emerald-700">
                  {t('dash.quickActions', 'END-TO-END WORKFLOW MODULES')}
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  {t('dash.energyBalanceTitle', 'Explore Connected Platform Intelligence')}
                </h3>
              </div>
              <span className="text-xs font-mono-tabular text-slate-500">🟢 {t('app.online', 'All Systems Active')}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
              <button
                type="button"
                onClick={() => onNavigate('crop-scanner')}
                className="text-left p-3.5 rounded-xl bg-[#F8FAF7] hover:bg-emerald-50/70 border border-slate-200/90 hover:border-emerald-300 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 group-hover:text-emerald-900">
                    1. {t('nav.cropScanner', 'AI Crop Scanner')}
                  </span>
                  <ScanLine className="w-4 h-4 text-emerald-700" />
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  {t('scanner.subtitle', 'Upload leaf photo → Gemini Vision + Priority 1/2/3 natural-first treatment.')}
                </p>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('residue-intelligence')}
                className="text-left p-3.5 rounded-xl bg-[#F8FAF7] hover:bg-emerald-50/70 border border-slate-200/90 hover:border-emerald-300 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 group-hover:text-emerald-900">
                    2. {t('nav.residueIntelligence', 'Crop Residue Intelligence')}
                  </span>
                  <Recycle className="w-4 h-4 text-emerald-700" />
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  {t('residue.subtitle', 'Calculate biomass & contribute residue to earn energy credits.')}
                </p>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('farmer-resource-profile')}
                className="text-left p-3.5 rounded-xl bg-[#F8FAF7] hover:bg-emerald-50/70 border border-slate-200/90 hover:border-emerald-300 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 group-hover:text-emerald-900">
                    3. {t('nav.farmerResourceProfile', 'Farmer Resource Profile')}
                  </span>
                  <Zap className="w-4 h-4 text-amber-600" />
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  {t('profile.subtitle', 'Track kWh earned, used, and monthly carry-forward balance.')}
                </p>
              </button>

              <button
                type="button"
                onClick={() => onNavigate('fpo-dashboard')}
                className="text-left p-3.5 rounded-xl bg-[#F8FAF7] hover:bg-emerald-50/70 border border-slate-200/90 hover:border-emerald-300 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 group-hover:text-emerald-900">
                    4. {t('nav.fpoDashboard', 'Regional Agri Intelligence')}
                  </span>
                  <Building2 className="w-4 h-4 text-emerald-700" />
                </div>
                <p className="text-xs text-slate-600 mt-1">
                  {t('fpo.subtitle', 'Regional farmer FPO ledger & clean bioenergy plant utilization.')}
                </p>
              </button>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>{t('dash.cleanPowerTitle', 'Connected Circular Flow: Farm → Residue → Biogas → Energy Credit')}</span>
            <button
              type="button"
              onClick={() => onNavigate('iot-monitoring')}
              className="inline-flex items-center gap-1 font-semibold text-emerald-700 hover:text-emerald-800"
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>{t('nav.iotMonitoring', 'ESP32 Live Telemetry')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

