import React, { useState } from 'react';
import {
  Flame,
  Users,
  Zap,
  Sprout,
  Recycle,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Gauge,
  Radio,
  Send,
  AlertTriangle,
  BellRing,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { FarmerEnergyAccount, NavPage, SMSTriggerType } from '../types/agrifuel';
import { COMMUNITY_BIOGAS_PLANT_METRICS } from '../data/demoData';
import { MultilingualRecommendation } from './MultilingualRecommendation';
import { useLanguage } from '../context/LanguageContext';

interface CommunityBioenergyViewProps {
  energyAccount: FarmerEnergyAccount;
  onNavigate: (page: NavPage) => void;
  onSendAlert?: (triggerType: SMSTriggerType) => void;
}

export const CommunityBioenergyView: React.FC<CommunityBioenergyViewProps> = ({
  energyAccount,
  onNavigate,
  onSendAlert,
}) => {
  const { t, language } = useLanguage();
  const [farmersCount, setFarmersCount] = useState<number>(10);
  const [acresPerFarmer, setAcresPerFarmer] = useState<number>(5);
  const [simulatedUsageScenario, setSimulatedUsageScenario] = useState<
    'normal' | '90' | '95' | '100'
  >('normal');

  const totalFarmAreaAcres = farmersCount * acresPerFarmer;
  // Transparent calculation: Total Pooled Area (acres) × Soybean Residue Yield (0.50 t/acre)
  const estCropResidueTonnes = +(totalFarmAreaAcres * 0.5).toFixed(1);
  const eligibleBiogasFeedstockTonnes = +(estCropResidueTonnes * 0.8).toFixed(1);
  const estBiogasOutputM3 = Math.round(eligibleBiogasFeedstockTonnes * 212.5);
  const estElectricalEquivKwh = Math.round(estBiogasOutputM3 * 2.0);
  const estDigestateOutputTonnes = +(eligibleBiogasFeedstockTonnes * 0.72).toFixed(1);

  const clusterChartData = [
    {
      stage: '1. Gross Residue',
      tonnes: estCropResidueTonnes,
    },
    {
      stage: '2. Eligible Feedstock',
      tonnes: eligibleBiogasFeedstockTonnes,
    },
    {
      stage: '3. Organic Digestate',
      tonnes: estDigestateOutputTonnes,
    },
  ];

  // Dynamic plant metrics that also reflect any extra energy earned above the 850 kWh baseline
  const extraFarmerKwh = Math.max(0, energyAccount.energyEarnedKwh - 850);
  const extraUsedKwh = Math.max(0, energyAccount.energyUsedKwh - 700);
  const plantCapacity = COMMUNITY_BIOGAS_PLANT_METRICS.monthlyCapacityKwh; // 20,000
  const currentGeneration = COMMUNITY_BIOGAS_PLANT_METRICS.currentGenerationKwh + extraFarmerKwh; // 12,500
  const energyUsedByFarmers =
    COMMUNITY_BIOGAS_PLANT_METRICS.energyUsedByFarmersKwh + extraUsedKwh; // 9,800
  const baseUtilizationPercent =
    extraFarmerKwh === 0 && extraUsedKwh === 0
      ? COMMUNITY_BIOGAS_PLANT_METRICS.utilizationPercent // 78%
      : Math.min(100, Math.round((energyUsedByFarmers / currentGeneration) * 100));

  const utilizationPercent =
    simulatedUsageScenario === '90'
      ? 90
      : simulatedUsageScenario === '95'
      ? 95
      : simulatedUsageScenario === '100'
      ? 100
      : baseUtilizationPercent;

  const remainingBalance =
    simulatedUsageScenario === '100'
      ? 0
      : simulatedUsageScenario === '95'
      ? Math.round(currentGeneration * 0.05)
      : simulatedUsageScenario === '90'
      ? Math.round(currentGeneration * 0.1)
      : Math.max(0, currentGeneration - energyUsedByFarmers);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono-tabular uppercase font-semibold text-emerald-700">
              {t('bio.title', 'COMMUNITY BIOGAS & CIRCULAR BIOENERGY')}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">
            {t('nav.communityBioenergy', 'Community Biogas')} — {t('bio.plantStatus', 'Plant Capacity Utilization')}
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            {t('bio.subtitle', 'Aggregates post-harvest residue across village farms to generate clean community energy, trackable farmer energy credits, and nutrient-rich organic digestate.')}
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto shrink-0">
          <button
            type="button"
            onClick={() => onNavigate('farmer-resource-profile')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-[#F8FAF7] border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t('action.back', 'Back')}: {t('nav.farmerResourceProfile', 'Energy Profile')}</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('fpo-dashboard')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-emerald-700 rounded-lg hover:bg-emerald-800 transition-colors"
          >
            <span>{t('action.next', 'Next')}: {t('nav.fpoDashboard', 'Regional Dashboard')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* SECTION 13: BIOGAS PLANT CAPACITY & UTILIZATION INDICATOR    */}
      {/* ============================================================ */}
      <div className="bg-white border-2 border-teal-600/30 rounded-2xl p-6 space-y-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-700 text-white flex items-center justify-center shrink-0">
              <Gauge className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono-tabular font-bold text-teal-800 uppercase">
                  {t('SECTION 13 · COMMUNITY BIOGAS PLANT CAPACITY & UTILIZATION (CALCULATED)', 'SECTION 13 · COMMUNITY BIOGAS PLANT CAPACITY & UTILIZATION (CALCULATED)')}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono-tabular font-semibold bg-teal-50 text-teal-800 border border-teal-200">
                  {t('bio.calculatedData', 'Simulated Ledger')}
                </span>
              </div>
              <h2 className="text-lg font-bold text-slate-900 mt-0.5">
                {t('Shirur Community Biogas Plant — Capacity & Utilization Indicator', 'Shirur Community Biogas Plant — Capacity & Utilization Indicator')}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigate('farmer-resource-profile')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-emerald-900 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors self-start sm:self-auto"
          >
            <Zap className="w-3.5 h-3.5 text-emerald-700" />
            <span>
              {t('Your Share', 'Your Share')} ({energyAccount.farmerName}): {energyAccount.energyEarnedKwh} {t('unit.kwh', 'kWh')} {t('profile.totalEarned', 'Earned')} /{' '}
              {energyAccount.currentBalanceKwh} {t('unit.kwh', 'kWh')} {t('profile.netBalance', 'Balance')}
            </span>
          </button>
        </div>

        {/* 5 Required Plant Capacity & Utilization Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="p-4 rounded-xl bg-[#F8FAF7] border border-slate-200/90">
            <div className="text-xs font-semibold text-slate-500">{t('bio.plantStatus', 'Plant Capacity')}</div>
            <div className="text-xl font-mono-tabular font-bold text-slate-900 mt-1.5">
              {plantCapacity.toLocaleString('en-IN')}{' '}
              <span className="text-xs font-normal text-slate-500">{t('unit.kwh', 'kWh')} / {t('time.month', 'mo')}</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              {t('bio.plantStatus', 'Installed digester CHP rating')}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200">
            <div className="text-xs font-semibold text-emerald-900">{t('bio.generatorOutput', 'Current Generation')}</div>
            <div className="text-xl font-mono-tabular font-bold text-emerald-800 mt-1.5">
              {currentGeneration.toLocaleString('en-IN')}{' '}
              <span className="text-xs font-normal text-emerald-700">{t('unit.kwh', 'kWh')}</span>
            </div>
            <div className="text-[11px] text-emerald-700 mt-1">
              {t('bio.powerDistribution', 'From pooled farmer residue')}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-sky-50/70 border border-sky-200">
            <div className="text-xs font-semibold text-sky-900">{t('profile.totalUsed', 'Energy Used by Farmers')}</div>
            <div className="text-xl font-mono-tabular font-bold text-sky-900 mt-1.5">
              {energyUsedByFarmers.toLocaleString('en-IN')}{' '}
              <span className="text-xs font-normal text-sky-700">{t('unit.kwh', 'kWh')}</span>
            </div>
            <div className="text-[11px] text-sky-800 mt-1">
              {t('bio.communityPumps', 'Irrigation, equipment & processing')}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200">
            <div className="text-xs font-semibold text-amber-950">{t('profile.currentBalance', 'Remaining Balance')}</div>
            <div className="text-xl font-mono-tabular font-bold text-amber-900 mt-1.5">
              {remainingBalance.toLocaleString('en-IN')}{' '}
              <span className="text-xs font-normal text-amber-800">{t('unit.kwh', 'kWh')}</span>
            </div>
            <div className="text-[11px] text-amber-800 mt-1">
              {t('profile.monthlyLedger', 'Community carry-forward pool')}
            </div>
          </div>

          <div className="p-4 rounded-xl bg-emerald-950 text-white">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-200">{t('bio.biogasUtilization', 'Biogas Utilization')}</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono-tabular bg-emerald-800/80 text-emerald-200 border border-emerald-700/60">
                {t('bio.calculatedLabel', 'Calculated Ledger')}
              </span>
            </div>
            <div className="text-2xl font-mono-tabular font-bold text-amber-300 mt-1">
              {utilizationPercent}%
            </div>
            <div className="w-full h-2 rounded-full bg-emerald-900 mt-2 overflow-hidden">
              <div
                className="h-full bg-amber-400 rounded-full transition-all"
                style={{ width: `${utilizationPercent}%` }}
              />
            </div>
            <div className="text-[10px] text-emerald-300/80 mt-1.5">
              {t('bio.utilizationNote', 'Calculated from pooled farmer credits & power draw, separate from MQ-4 sensor')}
            </div>
          </div>
        </div>

        {/* Multilingual AI Biogas Dispatch Recommendation */}
        <div className="pt-2">
          <MultilingualRecommendation
            title={t('bio.advisoryTitle', 'Community Biogas AI Advisory')}
            badge={t('bio.plantDispatch', 'PLANT DISPATCH')}
            text={
              utilizationPercent >= 95
                ? 'Community biogas plant is operating near peak capacity (95%+). Non-essential agricultural pumping should be deferred to off-peak hours to preserve backup reserves.'
                : utilizationPercent >= 90
                ? 'Community biogas usage is high (90%). Farmers are advised to prioritize solar drip irrigation and schedule high-draw machinery carefully.'
                : 'Shirur Community Biogas Plant running at optimal capacity. Pooled residue generates continuous power for farm water pumps.'
            }
            subtext={`Current pool: ${currentGeneration.toLocaleString('en-IN')} kWh generated · ${remainingBalance.toLocaleString('en-IN')} kWh available carry-forward balance.`}
            size="md"
          />
        </div>

        {/* Biogas Alert Trigger Controls according to Prompt Requirements */}
        <div className="pt-4 border-t border-slate-100 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-teal-700" />
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                {t('bio.autoGsmTriggers', 'Automated GSM Emergency SMS Biogas Triggers:')}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-slate-500 font-medium">{t('bio.simulateDigesterLevel', 'Simulate Digester Level:')}</span>
              <button
                type="button"
                onClick={() => setSimulatedUsageScenario('normal')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors ${
                  simulatedUsageScenario === 'normal'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {t('bio.normalScenario', 'Normal (78%)')}
              </button>
              <button
                type="button"
                onClick={() => {
                  setSimulatedUsageScenario('90');
                  onSendAlert?.('biogas-90');
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 ${
                  simulatedUsageScenario === '90'
                    ? 'bg-teal-700 text-white ring-2 ring-teal-300'
                    : 'bg-teal-50 text-teal-800 border border-teal-200 hover:bg-teal-100'
                }`}
              >
                <Flame className="w-3 h-3" />
                <span>90% {t('bio.usedWarningSms', 'Used → Warning SMS')}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setSimulatedUsageScenario('95');
                  onSendAlert?.('biogas-95');
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 ${
                  simulatedUsageScenario === '95'
                    ? 'bg-amber-700 text-white ring-2 ring-amber-300'
                    : 'bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100'
                }`}
              >
                <AlertTriangle className="w-3 h-3" />
                <span>95% {t('bio.usedUrgentSms', 'Used → Urgent SMS')}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setSimulatedUsageScenario('100');
                  onSendAlert?.('biogas-100');
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors flex items-center gap-1 ${
                  simulatedUsageScenario === '100'
                    ? 'bg-rose-700 text-white ring-2 ring-rose-300'
                    : 'bg-rose-50 text-rose-900 border border-rose-200 hover:bg-rose-100'
                }`}
              >
                <BellRing className="w-3 h-3" />
                <span>100% {t('bio.depletedDualSms', 'Depleted → Farmer + FPO')}</span>
              </button>
            </div>
          </div>

          {/* Trigger Alert Notification Box */}
          {simulatedUsageScenario !== 'normal' && (
            <div
              className={`p-3 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs ${
                simulatedUsageScenario === '90'
                  ? 'bg-teal-50 border-teal-200 text-teal-900'
                  : simulatedUsageScenario === '95'
                  ? 'bg-amber-50 border-amber-200 text-amber-900'
                  : 'bg-rose-50 border-rose-300 text-rose-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Send className="w-4 h-4 shrink-0" />
                <div>
                  <span className="font-bold">
                    {simulatedUsageScenario === '90'
                      ? t('sms.biogas90Title', '90% Warning SMS Dispatched (86 chars):')
                      : simulatedUsageScenario === '95'
                      ? t('sms.biogas95Title', '95% Urgent SMS Dispatched (106 chars):')
                      : t('sms.biogas100Title', '100% Depleted Dual SMS Dispatched to Farmer & FPO (114 chars):')}
                  </span>{' '}
                  <span className="font-mono">
                    {simulatedUsageScenario === '90' &&
                      t('sms.biogas90Msg', '“AgriFuel AI: Community biogas has reached 90% usage. Please plan energy use carefully.”')}
                    {simulatedUsageScenario === '95' &&
                      t('sms.biogas95Msg', '“AgriFuel AI URGENT: Community biogas is at 95% usage! Only 5% reserve remains. Reduce non-essential power.”')}
                    {simulatedUsageScenario === '100' &&
                      t('sms.biogas100Msg', '“AgriFuel AI CRITICAL: Community biogas pool 100% depleted! Digester backup switching to grid/idle. FPO alerted.”')}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('offline-sms')}
                className="inline-flex items-center gap-1 font-bold underline hover:opacity-80 shrink-0"
              >
                <span>{t('sms.viewOutbox', 'View in SMS Outbox')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Interactive Cluster Scenario Simulator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-5 bg-white border border-slate-200/90 rounded-2xl p-6 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                {t('bio.simulatorTitle', 'Community Scenario Simulator')}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {t('bio.simulatorDesc', 'Adjust participating farmers and average plot size to explore cluster scale.')}
              </p>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
              <span className="text-slate-700">{t('bio.participatingFarmers', 'Participating Farmers')}</span>
              <span className="font-mono-tabular text-emerald-700 font-bold">
                {farmersCount} {t('bio.farmers', 'farmers')}
              </span>
            </div>
            <input
              type="range"
              min={5}
              max={100}
              step={5}
              value={farmersCount}
              onChange={(e) => setFarmersCount(Number(e.target.value))}
              className="w-full accent-emerald-700 cursor-pointer"
            />
          </div>

          <div>
            <div className="flex items-center justify-between text-xs font-semibold mb-1.5">
              <span className="text-slate-700">{t('bio.avgFarmSize', 'Average Farm Size per Farmer')}</span>
              <span className="font-mono-tabular text-emerald-700 font-bold">
                {acresPerFarmer} {t('unit.acres', 'acres')}
              </span>
            </div>
            <input
              type="range"
              min={2}
              max={20}
              step={1}
              value={acresPerFarmer}
              onChange={(e) => setAcresPerFarmer(Number(e.target.value))}
              className="w-full accent-emerald-700 cursor-pointer"
            />
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={() => {
                setFarmersCount(10);
                setAcresPerFarmer(5);
              }}
              className="w-full py-2.5 px-4 text-xs font-semibold rounded-xl bg-emerald-50 text-emerald-900 border border-emerald-200 hover:bg-emerald-100 transition-colors"
            >
              {t('bio.resetBenchmark', 'Reset to Standard 10-Farmer / 50-Acre Benchmark Scenario')}
            </button>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <div className="text-xs font-semibold text-slate-700 mb-2">
              {t('bio.massBalanceTitle', 'Biomass & Digestate Mass Balance (Tonnes)')}
            </div>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={clusterChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="stage" tick={{ fontSize: 11 }} stroke="#64748B" />
                  <YAxis tick={{ fontSize: 11 }} stroke="#64748B" unit="t" />
                  <Tooltip />
                  <Bar
                    dataKey="tonnes"
                    name={t('bio.massTonnes', 'Mass (Tonnes)')}
                    fill="#047857"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right: Community Cluster Metrics + Dual Circular Loop */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-100">
              <div>
                <div className="text-xs font-mono-tabular uppercase font-semibold text-emerald-700">
                  {t('bio.clusterScenario', 'COMMUNITY CLUSTER SCENARIO')}
                </div>
                <h2 className="text-xl font-bold text-slate-900 mt-0.5">
                  {farmersCount} {t('bio.farmers', 'Farmers')} · {totalFarmAreaAcres} {t('bio.acresCombined', 'Acres Combined Area')}
                </h2>
              </div>
              <span className="px-2.5 py-1 rounded-md text-xs font-mono-tabular font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                {t('bio.illustrativeScenario', 'Illustrative Prototype Scenario')}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              <div className="p-4 rounded-xl bg-[#F8FAF7] border border-slate-200/90">
                <div className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                  <Users className="w-3.5 h-3.5 text-emerald-700" />
                  <span>{t('bio.participating', 'Participating')}</span>
                </div>
                <div className="text-2xl font-mono-tabular font-bold text-slate-900 mt-1.5">
                  {farmersCount}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">{t('bio.villageFarmers', 'Village Farmers')}</div>
              </div>

              <div className="p-4 rounded-xl bg-[#F8FAF7] border border-slate-200/90">
                <div className="text-xs font-semibold text-slate-500">{t('bio.totalFarmArea', 'Total Farm Area')}</div>
                <div className="text-2xl font-mono-tabular font-bold text-slate-900 mt-1.5">
                  {totalFarmAreaAcres} <span className="text-sm font-normal">{t('unit.acres', 'ac')}</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">{t('bio.clusterFootprint', 'Cluster Footprint')}</div>
              </div>

              <div className="p-4 rounded-xl bg-[#F8FAF7] border border-slate-200/90">
                <div className="text-xs font-semibold text-slate-500">{t('bio.estCropResidue', 'Est. Crop Residue')}</div>
                <div className="text-2xl font-mono-tabular font-bold text-slate-900 mt-1.5">
                  {estCropResidueTonnes} <span className="text-sm font-normal">{t('unit.tonnes', 't')}</span>
                </div>
                <div className="text-[11px] text-emerald-700 font-medium mt-0.5">
                  {t('bio.divertedFromBurning', 'Diverted from burning')}
                </div>
              </div>

              <div className="p-4 rounded-xl bg-emerald-50/80 border border-emerald-200">
                <div className="text-xs font-semibold text-emerald-900">
                  {t('bio.eligibleFeedstock', 'Eligible Biogas Feedstock')}
                </div>
                <div className="text-2xl font-mono-tabular font-bold text-emerald-800 mt-1.5">
                  {eligibleBiogasFeedstockTonnes} <span className="text-sm font-normal">{t('unit.tonnes', 't')}</span>
                </div>
                <div className="text-[11px] text-emerald-700 font-medium mt-0.5">
                  {t('bio.pretreatedSorted', 'Pre-treated & sorted')}
                </div>
              </div>
            </div>

            {/* Dual Output Loop Visualization */}
            <div className="p-5 rounded-2xl bg-emerald-950 text-white space-y-5">
              <div className="flex items-center justify-between">
                <div className="text-xs font-mono-tabular uppercase tracking-wider text-emerald-300 font-semibold">
                  {t('bio.circularSystem', 'CIRCULAR COMMUNITY BIOGAS & DIGESTATE SYSTEM')}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center text-center">
                <div className="p-3.5 rounded-xl bg-emerald-900/70 border border-emerald-800">
                  <div className="text-xs font-bold text-emerald-200">{t('bio.farmers', 'FARMERS')} ({farmersCount})</div>
                  <div className="text-xs text-emerald-100 mt-1">
                    {totalFarmAreaAcres} {t('bio.acresPooled', 'Acres Pooled')}
                  </div>
                </div>
                <div className="p-3.5 rounded-xl bg-emerald-900/70 border border-emerald-800">
                  <div className="text-xs font-bold text-amber-300">{t('vc.step3', 'RESIDUE COLLECTION')}</div>
                  <div className="text-xs font-mono-tabular text-emerald-100 mt-1">
                    {eligibleBiogasFeedstockTonnes} {t('bio.tonnesFeedstock', 'Tonnes Feedstock')}
                  </div>
                </div>
                <div className="p-3.5 rounded-xl bg-emerald-800 border border-emerald-600">
                  <div className="text-xs font-bold text-white">{t('bio.communityPlant', 'COMMUNITY BIOGAS PLANT')}</div>
                  <div className="text-xs text-emerald-200 mt-1">{t('bio.anaerobicDigester', 'Anaerobic Digester')}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-emerald-800/80">
                <div className="p-4 rounded-xl bg-emerald-900/80 border border-emerald-700 space-y-1.5">
                  <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
                    <Zap className="w-4 h-4" />
                    <span>{t('bio.pathwayA', 'PATHWAY A: BIOGAS → ENERGY CREDITS')}</span>
                  </div>
                  <div className="text-lg font-mono-tabular font-bold text-white">
                    ~{estBiogasOutputM3.toLocaleString()} m³ {t('dash.biogasProduced', 'Biogas')} (~
                    {estElectricalEquivKwh.toLocaleString()} {t('unit.kwh', 'kWh')})
                  </div>
                  <p className="text-xs text-emerald-200 leading-relaxed">
                    {t('bio.pathwayADesc', 'Credited directly to participating farmers’ energy accounts for irrigation pumping, processing, and monthly carry-forward.')}
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-emerald-900/80 border border-emerald-700 space-y-1.5">
                  <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm">
                    <Sprout className="w-4 h-4" />
                    <span>{t('bio.pathwayB', 'PATHWAY B: DIGESTATE → SOIL REUSE')}</span>
                  </div>
                  <div className="text-lg font-mono-tabular font-bold text-white">
                    ~{estDigestateOutputTonnes} {t('bio.bioDigestate', 'Tonnes Bio-Digestate')}
                  </div>
                  <p className="text-xs text-emerald-200 leading-relaxed">
                    {t('bio.pathwayBDesc', 'Nutrient-rich organic soil conditioner returned to the participating farms to support Priority 1 & 2 soil health.')}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-[#F8FAF7] border border-slate-200 flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-slate-900">{t('bio.zeroStubble', 'Zero Stubble Burning')}</div>
                  <div className="text-slate-600 mt-0.5">
                    {t('bio.zeroStubbleDesc', 'Eliminates particulate smoke emissions across the cluster.')}
                  </div>
                </div>
              </div>
              <div className="p-3.5 rounded-xl bg-[#F8FAF7] border border-slate-200 flex items-start gap-2.5">
                <Recycle className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-slate-900">{t('bio.closedLoop', 'Closed-Loop Nutrient & Energy')}</div>
                  <div className="text-slate-600 mt-0.5">
                    {t('bio.closedLoopDesc', 'Every tonne of residue returns both kWh energy credits and organic carbon to the same farmers.')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
