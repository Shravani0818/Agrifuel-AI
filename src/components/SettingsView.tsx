import React from 'react';
import {
  Bell,
  Radio,
  CloudSun,
  RotateCcw,
  ArrowLeft,
} from 'lucide-react';
import { AppSettings, NavPage } from '../types/agrifuel';
import { useLanguage } from '../context/LanguageContext';

interface SettingsViewProps {
  settings: AppSettings;
  onUpdateSettings: (updated: AppSettings) => void;
  onResetAllDemoData: () => void;
  onNavigate: (page: NavPage) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  onResetAllDemoData,
  onNavigate,
}) => {
  const { t } = useLanguage();
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-mono-tabular font-semibold text-emerald-700">
            {t('settings.title', 'PLATFORM CONFIGURATION')}
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">
            {t('nav.settings', 'Settings')} &amp; {t('settings.interactiveControls', 'Simulation Controls')}
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            {t('settings.subtitle', 'Manage Demo Mode, Notifications, Sensor Simulation, and Weather Simulation presets.')}
          </p>
        </div>

        <button
          type="button"
          onClick={() => onNavigate('dashboard')}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-[#F8FAF7] border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors whitespace-nowrap self-start sm:self-auto"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{t('action.back', 'Back to Dashboard')}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: 4 Settings Controls */}
        <div className="lg:col-span-7 bg-white border border-slate-200/90 rounded-2xl p-6 space-y-5">
          <div className="pb-4 border-b border-slate-100">
            <div className="text-xs font-medium text-emerald-700">
              {t('settings.interactiveControls', 'Interactive Controls')}
            </div>
            <h2 className="text-lg font-bold text-slate-900 mt-0.5">
              {t('settings.interactiveControls', 'System & Simulation Preferences')}
            </h2>
          </div>

          {/* 1. Demo Mode (ON by default) */}
          <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-bold text-emerald-950">
                🟢 {t('settings.demoModeTitle', 'Demo Mode (Active by Default)')}
              </div>
              <p className="text-xs text-emerald-900 mt-0.5">
                {t('settings.demoModeDesc', 'AgriFuel AI is currently using simulated sensor, weather, agricultural, and farmer energy ledger data for prototype demonstration.')}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onUpdateSettings({ ...settings, demoMode: true })}
              className="px-3.5 py-1.5 text-xs font-mono-tabular font-bold bg-emerald-700 text-white rounded-lg shrink-0"
            >
              {t('settings.onDefault', 'ON (DEFAULT)')}
            </button>
          </div>

          {/* 2. Notifications */}
          <div className="p-4 rounded-xl bg-[#F8FAF7] border border-slate-200/80 flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <Bell className="w-4 h-4 text-emerald-700" />
                <span>{t('settings.notificationsTitle', 'Notifications')}</span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                {t('settings.notificationsDesc', 'Display in-app crop analysis alerts, weather updates, residue contribution records, and energy credit notifications.')}
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                onUpdateSettings({
                  ...settings,
                  notifications: !settings.notifications,
                })
              }
              className={`px-4 py-1.5 text-xs font-mono-tabular font-bold rounded-lg transition-colors shrink-0 ${
                settings.notifications
                  ? 'bg-emerald-700 text-white'
                  : 'bg-slate-200 text-slate-700'
              }`}
            >
              {settings.notifications ? t('settings.enabled', 'ENABLED') : t('settings.muted', 'MUTED')}
            </button>
          </div>

          {/* 3. Sensor Simulation */}
          <div className="p-4 rounded-xl bg-[#F8FAF7] border border-slate-200/80 flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <Radio className="w-4 h-4 text-emerald-700" />
                <span>{t('settings.sensorSimTitle', 'Sensor Simulation')}</span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                {t('settings.sensorSimDesc', 'Enable interactive ESP32, DHT22, Soil Moisture, and MQ-4 methane indicator telemetry simulation.')}
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                onUpdateSettings({
                  ...settings,
                  sensorSimulation: !settings.sensorSimulation,
                })
              }
              className={`px-4 py-1.5 text-xs font-mono-tabular font-bold rounded-lg transition-colors shrink-0 ${
                settings.sensorSimulation
                  ? 'bg-emerald-700 text-white'
                  : 'bg-slate-200 text-slate-700'
              }`}
            >
              {settings.sensorSimulation ? t('settings.active', 'ACTIVE') : t('settings.paused', 'PAUSED')}
            </button>
          </div>

          {/* 4. Weather Simulation */}
          <div className="p-4 rounded-xl bg-[#F8FAF7] border border-slate-200/80 flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
                <CloudSun className="w-4 h-4 text-emerald-700" />
                <span>{t('settings.weatherSimTitle', 'Weather Simulation')}</span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                {t('settings.weatherSimDesc', 'Allow simulated 7-day Pune weather pattern shifts to test how the Central AI Decision Engine adapts irrigation advice.')}
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                onUpdateSettings({
                  ...settings,
                  weatherSimulation: !settings.weatherSimulation,
                })
              }
              className={`px-4 py-1.5 text-xs font-mono-tabular font-bold rounded-lg transition-colors shrink-0 ${
                settings.weatherSimulation
                  ? 'bg-emerald-700 text-white'
                  : 'bg-slate-200 text-slate-700'
              }`}
            >
              {settings.weatherSimulation ? t('settings.active', 'ACTIVE') : t('settings.static', 'STATIC')}
            </button>
          </div>
        </div>

        {/* Right: About AgriFuel AI */}
        <div className="lg:col-span-5 bg-white border border-slate-200/90 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="pb-4 border-b border-slate-100">
              <div className="text-xs font-mono-tabular font-semibold text-emerald-700">
                {t('settings.systemMetadata', 'SYSTEM METADATA')}
              </div>
              <h2 className="text-lg font-bold text-slate-900 mt-0.5">
                {t('settings.aboutTitle', 'About AgriFuel AI')}
              </h2>
            </div>

            <div className="mt-4 space-y-3 text-xs text-slate-600 leading-relaxed">
              <div className="p-3.5 rounded-xl bg-[#F8FAF7] border border-slate-200/80 flex items-center justify-between">
                <span className="font-semibold text-slate-700">{t('settings.version', 'Version')}</span>
                <span className="font-mono-tabular font-bold text-emerald-800">
                  Hackathon Prototype v1.0
                </span>
              </div>

              <p>
                <span className="font-bold text-slate-900">AgriFuel AI</span> {t('settings.aboutP1', 'is a Smart Agricultural Intelligence, Bioenergy & Farmer Resource Accounting Platform that connects field-level IoT sensor monitoring and Gemini Multimodal crop advisory with post-harvest crop residue planning, community anaerobic biogas generation, and carry-forward farmer energy credits.')}
              </p>

              <p>
                {t('settings.aboutP2', 'Built for immediate demonstration: sensor telemetry and community energy ledger metrics are simulated in prototype demo mode.')}
              </p>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onResetAllDemoData}
              className="w-full py-2.5 px-4 text-xs font-semibold text-slate-700 bg-[#F8FAF7] hover:bg-slate-100 border border-slate-300 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t('settings.resetDefaults', 'Reset All Prototype State to Factory Defaults')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
