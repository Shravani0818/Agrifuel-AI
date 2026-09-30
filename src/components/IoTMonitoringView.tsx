import React from 'react';
import {
  Cpu,
  Thermometer,
  Droplets,
  Flame,
  Power,
  RefreshCw,
  ArrowRight,
  Radio,
  RotateCcw,
  Sparkles,
  Wifi,
  Activity,
  Send,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { IoTState, NavPage, SMSTriggerType } from '../types/agrifuel';
import { useLanguage } from '../context/LanguageContext';

interface IoTMonitoringViewProps {
  iot: IoTState;
  onSimulateUpdate: () => void;
  onTogglePump: () => void;
  onResetIoT: () => void;
  onNavigate: (page: NavPage) => void;
  onSendAlert?: (triggerType: SMSTriggerType) => void;
}

export const IoTMonitoringView: React.FC<IoTMonitoringViewProps> = ({
  iot,
  onSimulateUpdate,
  onTogglePump,
  onResetIoT,
  onNavigate,
  onSendAlert,
}) => {
  const { t, language } = useLanguage();
  const getTempStatus = (t: number): 'NORMAL' | 'WARNING' | 'CRITICAL' => {
    if (t >= 37) return 'CRITICAL';
    if (t >= 32) return 'WARNING';
    return 'NORMAL';
  };

  const getMoistureStatus = (m: number): 'NORMAL' | 'WARNING' | 'CRITICAL' => {
    if (m < 25) return 'CRITICAL';
    if (m < 35 || m > 75) return 'WARNING';
    return 'NORMAL';
  };

  const getGasStatus = (g: number): 'NORMAL' | 'WARNING' | 'CRITICAL' => {
    if (g >= 88) return 'CRITICAL';
    if (g >= 75) return 'WARNING';
    return 'NORMAL';
  };

  const statusColor = (status: 'NORMAL' | 'WARNING' | 'CRITICAL') => {
    if (status === 'NORMAL') return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    if (status === 'WARNING') return 'text-amber-800 bg-amber-50 border-amber-200';
    return 'text-red-700 bg-red-50 border-red-200';
  };

  const tempStatus = getTempStatus(iot.temperature);
  const moistureStatus = getMoistureStatus(iot.soilMoisture);
  const gasStatus = getGasStatus(iot.methaneIndicator);
  const isPumpOn = iot.pumpStatus === 'ON';

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 lg:p-7 flex flex-col lg:flex-row lg:items-center justify-between gap-5 shadow-xs">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono-tabular font-semibold text-emerald-700">
            <span className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-md">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              ESP32 · {t('app.online', 'Online')}
            </span>
            <span>·</span>
            <span className="text-slate-600 font-medium">
              {t('app.demoModeDesc', 'Simulated telemetry stream for demonstration')}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2 tracking-tight">
            {t('nav.iotMonitoring', 'IoT Monitoring')}
          </h1>

          {/* Primary key line */}
          <div className="mt-2.5 flex items-center gap-2 text-emerald-800 font-semibold text-sm sm:text-base">
            <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{t('iot.subtitle', 'Live sensor data powers AI recommendations.')}</span>
          </div>

          <p className="text-xs sm:text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
            {t('iot.title', 'Hardware telemetry stream from ESP32 edge microcontroller, DHT22 temperature & humidity, capacitive soil moisture probe, MQ-4 methane concentration indicator, and automated pump relay.')}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0 self-start lg:self-center">
          <button
            type="button"
            onClick={onSimulateUpdate}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-emerald-700 rounded-xl hover:bg-emerald-800 transition-colors whitespace-nowrap shadow-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{t('action.refresh', 'Simulate Sensor Update')}</span>
          </button>

          <button
            type="button"
            onClick={onResetIoT}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold text-slate-700 bg-[#F8FAF7] border border-slate-300 rounded-xl hover:bg-slate-100 transition-colors whitespace-nowrap"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{t('action.reset', 'Reset Baseline')}</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('residue-intelligence')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold text-slate-800 bg-white border border-slate-300 rounded-xl hover:bg-slate-50 transition-colors whitespace-nowrap"
          >
            <span>{t('action.next', 'Next')}: {t('nav.residueIntelligence', 'Residue Intelligence')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Prominent Live Telemetry AI Feature Callout */}
      <div className="bg-linear-to-r from-emerald-50 via-teal-50/70 to-emerald-50 border border-emerald-200/90 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span>{t('iot.subtitle', 'Live sensor data powers AI recommendations.')}</span>
              <span className="hidden md:inline-flex px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800">
                {t('iot.activePipeline', 'ACTIVE PIPELINE')}
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              {t('iot.pipelineDesc', 'Root-zone moisture, heat stress, and digester biogas readings feed real-time inputs into irrigation controls, disease vulnerability warnings, and energy yields.')}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
          <span className="px-3 py-1 rounded-lg bg-white/90 border border-emerald-200 font-mono-tabular text-xs font-bold text-emerald-900">
            {t('iot.nodeStatus', 'Node Status')}: {t(iot.status, iot.status)}
          </span>
        </div>
      </div>

      {/* Irrigation Alert & Offline GSM SMS Controls */}
      <div className="bg-white border border-emerald-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
            <Droplets className="w-4 h-4 text-emerald-700" />
          </div>
          <div>
            <div className="font-bold text-slate-900 flex items-center gap-2">
              <span>{t('iot.autoIrrigationAlerts', 'Automated Irrigation Alerts (GSM SMS Fallback)')}</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
                {t('dash.soilMoisture', 'Moisture')}: {iot.soilMoisture}% ({t('iot.threshold', 'Threshold')}: 35%)
              </span>
            </div>
            <p className="text-slate-600 mt-0.5 text-xs">
              {t('iot.autoAlertDesc', 'When moisture drops below critical limits, alerts dispatch directly via GSM SMS if offline.')}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => onSendAlert?.('irrigation-low-moisture')}
            className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-lg font-bold flex items-center gap-1.5 transition-colors text-xs"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{t('iot.sendLowMoistureSms', 'Send Low Moisture SMS')}</span>
          </button>
          <button
            type="button"
            onClick={() => onSendAlert?.('irrigation-recommended')}
            className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-bold flex items-center gap-1.5 transition-colors shadow-xs text-xs"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{t('iot.sendIrrigationSms', 'Send Irrigation Rec SMS')}</span>
          </button>
        </div>
      </div>

      {/* Larger Sensor Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
        {/* 1. ESP32 Node Status */}
        <div className="bg-slate-900 text-white rounded-2xl p-6 lg:p-7 flex flex-col justify-between shadow-md border border-slate-800 min-h-[250px] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
          <div>
            <div className="flex items-center justify-between text-xs text-emerald-400 font-mono-tabular">
              <span className="font-bold tracking-wider uppercase">{t('iot.microcontroller', 'MICROCONTROLLER')}</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-950/80 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Cpu className="w-4 h-4" />
              </div>
            </div>

            <div className="text-xl lg:text-2xl font-black mt-3 text-white tracking-tight">
              {t('iot.esp32Node', 'ESP32 Node')}
            </div>
            <div className="flex items-center gap-1.5 text-xs font-mono-tabular text-emerald-400 font-medium mt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{t('iot.connectedDemo', 'CONNECTED — DEMO MODE')}</span>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-1.5 text-xs text-slate-300">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">{t('iot.gateway', 'Gateway')}:</span>
                <span className="font-mono font-medium text-slate-200">Wi-Fi + LoRa</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">{t('iot.telemetry', 'Telemetry')}:</span>
                <span className="font-mono font-medium text-emerald-400">{t('iot.live5s', 'Live 5s cycle')}</span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-mono-tabular">
            <span className="text-emerald-400 font-semibold bg-emerald-950/60 border border-emerald-800/50 px-2 py-0.5 rounded">
              {t('iot.status', 'STATUS')}: {t(iot.status, iot.status)}
            </span>
            <span className="text-slate-400 text-[11px] font-mono">Edge Node</span>
          </div>
        </div>

        {/* 2. Temperature */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 lg:p-7 flex flex-col justify-between shadow-xs hover:border-amber-400/60 hover:shadow-md transition-all min-h-[250px]">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {t('iot.temperatureDht22', 'Temperature (DHT22)')}
              </span>
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-200/60">
                <Thermometer className="w-5 h-5" />
              </div>
            </div>

            <div className="text-3xl lg:text-4xl font-black text-slate-900 font-mono-tabular tracking-tight mt-3">
              {iot.temperature.toFixed(1)}°C
            </div>

            <div className="text-xs text-slate-500 mt-1 flex items-center justify-between font-mono-tabular">
              <span>{t('iot.tempOptimal', 'Optimal: 20°C – 32°C')}</span>
              <span className="text-amber-700 font-semibold">{t('iot.scale', 'Scale')}: 15–45°C</span>
            </div>

            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden mt-3 shadow-inner">
              <div
                className="h-full bg-linear-to-r from-amber-400 to-amber-600 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, Math.max(10, (iot.temperature / 45) * 100))}%` }}
              />
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-mono-tabular">
            <span className={`px-2.5 py-1 rounded-md border font-bold ${statusColor(tempStatus)}`}>
              {t('status.' + tempStatus.toLowerCase(), tempStatus)}
            </span>
            <span className="text-slate-400 text-[11px]">Microclimate</span>
          </div>
        </div>

        {/* 3. Humidity */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 lg:p-7 flex flex-col justify-between shadow-xs hover:border-sky-400/60 hover:shadow-md transition-all min-h-[250px]">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {t('iot.humidityDht22', 'Humidity (DHT22)')}
              </span>
              <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0 border border-sky-200/60">
                <Radio className="w-5 h-5" />
              </div>
            </div>

            <div className="text-3xl lg:text-4xl font-black text-slate-900 font-mono-tabular tracking-tight mt-3">
              {iot.humidity}%
            </div>

            <div className="text-xs text-slate-500 mt-1 flex items-center justify-between font-mono-tabular">
              <span>{t('iot.humidityOptimal', 'Optimal: 50% – 75%')}</span>
              <span className="text-sky-700 font-semibold">{t('iot.relativeAir', 'Relative Air')}</span>
            </div>

            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden mt-3 shadow-inner">
              <div
                className="h-full bg-linear-to-r from-sky-400 to-sky-600 rounded-full transition-all duration-500"
                style={{ width: `${iot.humidity}%` }}
              />
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-mono-tabular">
            <span className="px-2.5 py-1 rounded-md border font-bold text-emerald-700 bg-emerald-50 border-emerald-200">
              {t('status.normal', 'NORMAL')}
            </span>
            <span className="text-slate-400 text-[11px]">Air Moisture</span>
          </div>
        </div>

        {/* 4. Soil Moisture */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 lg:p-7 flex flex-col justify-between shadow-xs hover:border-emerald-400/60 hover:shadow-md transition-all min-h-[250px]">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {t('dash.soilMoisture', 'Soil Moisture')}
              </span>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-200/60">
                <Droplets className="w-5 h-5" />
              </div>
            </div>

            <div className="text-3xl lg:text-4xl font-black text-slate-900 font-mono-tabular tracking-tight mt-3">
              {iot.soilMoisture}%
            </div>

            <div className="text-xs text-slate-500 mt-1 flex items-center justify-between font-mono-tabular">
              <span>{t('iot.threshold', 'Threshold')}: &gt; 35%</span>
              <span className="text-emerald-700 font-semibold">{t('iot.capacitive', 'Capacitive')}</span>
            </div>

            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden mt-3 shadow-inner">
              <div
                className="h-full bg-linear-to-r from-emerald-500 to-emerald-700 rounded-full transition-all duration-500"
                style={{ width: `${iot.soilMoisture}%` }}
              />
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-mono-tabular">
            <span
              className={`px-2.5 py-1 rounded-md border font-bold ${statusColor(moistureStatus)}`}
            >
              {t('status.' + moistureStatus.toLowerCase(), moistureStatus)}
            </span>
            <span className="text-slate-400 text-[11px]">Root Zone</span>
          </div>
        </div>

        {/* 5. MQ-4 Gas Sensor - Strictly Methane Concentration Indicator */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 lg:p-7 flex flex-col justify-between shadow-xs hover:border-emerald-400/60 hover:shadow-md transition-all min-h-[250px]">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                  {t('iot.mq4ConcentrationTitle', 'Methane Concentration (MQ-4)')}
                </span>
                <span className="text-[10px] text-emerald-700 font-medium">
                  {t('iot.mq4IndicatorOnly', 'Concentration Indicator · Not Tank Level')}
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center shrink-0 border border-emerald-200/60">
                <Flame className="w-5 h-5" />
              </div>
            </div>

            <div className="text-3xl lg:text-4xl font-black text-slate-900 font-mono-tabular tracking-tight mt-3">
              {iot.methaneIndicator}%
            </div>

            <div className="text-xs text-slate-500 mt-1 flex items-center justify-between font-mono-tabular">
              <span>{t('iot.ch4Digester', 'CH₄ Qualitative Headspace')}</span>
              <span className="text-emerald-800 font-semibold">{t('iot.biogasDome', 'Digester Dome')}</span>
            </div>

            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden mt-3 shadow-inner">
              <div
                className="h-full bg-linear-to-r from-emerald-600 to-teal-800 rounded-full transition-all duration-500"
                style={{ width: `${iot.methaneIndicator}%` }}
              />
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-mono-tabular">
            <span className={`px-2.5 py-1 rounded-md border font-bold ${statusColor(gasStatus)}`}>
              {t('status.' + gasStatus.toLowerCase(), gasStatus)}
            </span>
            <span className="text-slate-400 text-[11px]">CH₄ Indicator</span>
          </div>
        </div>
      </div>

      {/* Relay Pump Control & History Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Relay status */}
        <div className="lg:col-span-4 bg-white border border-slate-200/90 rounded-2xl p-6 lg:p-7 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <div className="text-xs font-mono-tabular text-emerald-700 font-bold uppercase tracking-wider">
                  {t('iot.actuatorModule', 'ACTUATOR MODULE')}
                </div>
                <h2 className="text-xl font-bold text-slate-900 mt-1">
                  {t('iot.relayStatusPump', 'Relay Status & Pump')}
                </h2>
              </div>
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-colors ${
                  isPumpOn
                    ? 'bg-emerald-100 text-emerald-700 border-emerald-300'
                    : 'bg-slate-100 text-slate-400 border-slate-200'
                }`}
              >
                <Power className="w-5 h-5" />
              </div>
            </div>

            <div className="mt-5 p-5 rounded-xl bg-[#F8FAF7] border border-slate-200/80 flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-500 font-medium">{t('iot.relayStatus', 'Relay status')}</div>
                <div className="text-2xl lg:text-3xl font-black font-mono-tabular text-slate-900 mt-1 flex items-center gap-2">
                  <span>{t('iot.pump', 'Pump')}:</span>
                  <span className={isPumpOn ? 'text-emerald-700' : 'text-slate-600'}>
                    {isPumpOn ? t('iot.on', 'ON') : t('iot.off', 'OFF')}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={onTogglePump}
                className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all whitespace-nowrap shadow-xs ${
                  isPumpOn
                    ? 'bg-slate-900 text-white hover:bg-slate-800'
                    : 'bg-emerald-700 text-white hover:bg-emerald-800'
                }`}
              >
                {isPumpOn ? t('iot.turnPumpOff', 'Turn Pump OFF') : t('iot.turnPumpOn', 'Turn Pump ON (Demo)')}
              </button>
            </div>

            <div className="mt-5 space-y-2.5 text-xs text-slate-600 leading-relaxed">
              <p className="p-3 bg-emerald-50/60 rounded-xl border border-emerald-100 text-slate-700">
                <span className="font-bold text-emerald-950">{t('iot.aiInterlockRec', 'AI Interlock Recommendation:')}</span>{' '}
                {t('iot.pumpInterlockDesc', 'Pump is kept OFF by default because soil moisture is adequate and rain is probable.')}
              </p>
              <p className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 text-slate-600">
                <span className="font-semibold text-slate-800">{t('iot.mq4TechNote', 'MQ-4 Technical Note:')}</span>{' '}
                {t('iot.mq4TechDesc', 'The MQ-4 semiconductor gas sensor serves strictly as a qualitative methane (CH₄) concentration indicator in the gas headspace. It does NOT measure gas pressure, stored volume, or tank fill level. Biogas plant utilization, storage levels, and power generation are tracked separately as calculated/simulated ledger data.')}
              </p>
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-mono-tabular text-slate-500">
            <span>{t('iot.thresholds', 'Thresholds: NORMAL · WARNING · CRITICAL')}</span>
            <span className="text-emerald-700 font-semibold">Active Relay</span>
          </div>
        </div>

        {/* Sensor chart */}
        <div className="lg:col-span-8 bg-white border border-slate-200/90 rounded-2xl p-6 lg:p-7 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
            <div>
              <div className="text-xs font-mono-tabular text-emerald-700 font-bold uppercase tracking-wider">
                {t('iot.telemetryTimeline', 'TELEMETRY TIMELINE')}
              </div>
              <h2 className="text-xl font-bold text-slate-900 mt-1">
                {t('iot.multiSensorChart', 'Multi-Sensor History Chart')}
              </h2>
            </div>
            <span className="text-xs font-mono-tabular text-slate-500">
              {t('iot.timelineDesc', 'Live sensor telemetry timeline (Temperature, Moisture, MQ-4)')}
            </span>
          </div>

          <div className="h-72 w-full mt-5">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={iot.history}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="timestamp" tick={{ fontSize: 12 }} stroke="#64748B" />
                <YAxis domain={[20, 95]} tick={{ fontSize: 12 }} stroke="#64748B" />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Line
                  type="monotone"
                  dataKey="temperature"
                  name={t('iot.chartTemp', 'Temperature (°C)')}
                  stroke="#D97706"
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="soilMoisture"
                  name={t('iot.chartMoisture', 'Soil Moisture (%)')}
                  stroke="#0284C7"
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                />
                <Line
                  type="monotone"
                  dataKey="methaneIndicator"
                  name={t('iot.chartMethane', 'MQ-4 Methane Concentration (%)')}
                  stroke="#059669"
                  strokeWidth={2.5}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

