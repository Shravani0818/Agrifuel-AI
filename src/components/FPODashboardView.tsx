import React from 'react';
import {
  Building2,
  Users,
  Sprout,
  Recycle,
  Flame,
  AlertTriangle,
  ArrowLeft,
  Zap,
  UserCheck,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { FarmerEnergyAccount, NavPage } from '../types/agrifuel';
import {
  FPO_CROP_DISTRIBUTION,
  FPO_FARMER_CONTRIBUTION_DATA,
  FPO_HEALTH_BREAKDOWN,
  FPO_VILLAGE_DATA,
} from '../data/demoData';
import { ImpactDashboardSection } from './ArchitectureAndImpact';
import { useLanguage } from '../context/LanguageContext';

interface FPODashboardViewProps {
  energyAccount: FarmerEnergyAccount;
  onNavigate: (page: NavPage) => void;
}

export const FPODashboardView: React.FC<FPODashboardViewProps> = ({
  energyAccount,
  onNavigate,
}) => {
  const { t, language } = useLanguage();
  // Sync Rajesh Patil (F001) row with live FarmerEnergyAccount state
  const liveFarmerRecords = FPO_FARMER_CONTRIBUTION_DATA.map((rec) =>
    rec.farmerId === energyAccount.farmerId
      ? {
          ...rec,
          farmerName: energyAccount.farmerName,
          village: energyAccount.village,
          crop: energyAccount.primaryCrop,
          farmAreaAcres: energyAccount.farmAreaAcres,
          residueContributionTonnes: energyAccount.residueContributionTonnes,
          energyEarnedKwh: energyAccount.energyEarnedKwh,
          energyUsedKwh: energyAccount.energyUsedKwh,
          currentBalanceKwh: energyAccount.currentBalanceKwh,
          carryForwardKwh: energyAccount.carryForwardKwh,
        }
      : rec
  );

  // Regional Energy Accounting Totals
  const extraResidue = Math.max(0, +(energyAccount.residueContributionTonnes - 2.5).toFixed(2));
  const extraEarned = Math.max(0, energyAccount.energyEarnedKwh - 850);
  const extraUsed = Math.max(0, energyAccount.energyUsedKwh - 700);

  const totalRegionalResidueTonnes = +(2450 + extraResidue).toFixed(1);
  const totalRegionalEnergyGeneratedKwh = 12500 + extraEarned;
  const totalRegionalEnergyUsedKwh = 9800 + extraUsed;
  const totalRegionalRemainingBalanceKwh = Math.max(
    0,
    totalRegionalEnergyGeneratedKwh - totalRegionalEnergyUsedKwh
  );
  const activeRegionalFarmers = 1250;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* ============================================================ */}
      {/* 1. HEADER (Requested Headline)                                */}
      {/* ============================================================ */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-7 flex flex-col md:flex-row md:items-center justify-between gap-5 shadow-xs">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
              {t('fpo.metricsHeading', 'REGIONAL CLUSTER OVERSIGHT')}
            </span>
            <span className="px-2.5 py-1 rounded-md text-[11px] font-mono font-semibold bg-emerald-50 text-emerald-900 border border-emerald-200">
              5 {t('fpo.clusterMap', 'VILLAGE CLUSTERS')} · Pune District
            </span>
          </div>

          {/* Requested Headline */}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight mt-2">
            {t('fpo.title', 'Regional Agri Intelligence Dashboard')}
          </h1>

          <p className="text-sm text-slate-600 mt-2 max-w-3xl leading-relaxed">
            {t('fpo.subtitle', 'Multi-village agricultural monitoring across Pune District, Maharashtra — aggregating participating farmers, biomass residue yield, clean biogas potential, and crop health risk indicators.')}
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start md:self-auto shrink-0">
          <button
            type="button"
            onClick={() => onNavigate('community-bioenergy')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-[#F8FAF7] border border-slate-300 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t('action.back', 'Back')}: {t('nav.communityBioenergy', 'Community Biogas')}</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('farmer-resource-profile')}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-700 rounded-xl hover:bg-emerald-800 transition-colors shadow-xs"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>{t('nav.farmerResourceProfile', 'Farmer Energy Profile')}</span>
          </button>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. REGIONAL SUMMARY METRICS                                  */}
      {/* ============================================================ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Farmers */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>{t('fpo.totalFarmers', 'Total Farmers')}</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-mono font-bold text-slate-900 mt-2">
            {activeRegionalFarmers.toLocaleString()}
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 text-xs text-slate-500">
            {t('fpo.across5Villages', 'Across 5 participating villages')}
          </div>
        </div>

        {/* Metric 2: Average Crop Health */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>{t('fpo.avgCropHealth', 'Average Crop Health')}</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Sprout className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-mono font-bold text-emerald-700 mt-2">
            84%
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 text-xs text-slate-500">
            {t('fpo.canopyHealthAvg', 'Regional canopy health average')}
          </div>
        </div>

        {/* Metric 3: Biogas Potential */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>{t('fpo.biogasPotential', 'Biogas Potential')}</span>
            <div className="w-9 h-9 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-mono font-bold text-teal-800 mt-2">
            18,400 <span className="text-sm font-normal text-slate-500">m³</span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 text-xs text-slate-500">
            {t('fpo.cleanRuralFuel', 'Clean rural fuel & energy pool')}
          </div>
        </div>

        {/* Metric 4: Risk Indicators */}
        <div className="bg-white border border-amber-200/90 rounded-2xl p-5 shadow-xs bg-amber-50/20">
          <div className="flex items-center justify-between text-xs font-semibold text-amber-900">
            <span>{t('fpo.riskIndicators', 'Risk Indicators')}</span>
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-mono font-bold text-amber-900 mt-2">
            1 {t('scanner.risk.high', 'High')} <span className="text-sm font-normal text-slate-500">· 2 {t('scanner.risk.medium', 'Med')} · 2 {t('scanner.risk.low', 'Low')}</span>
          </div>
          <div className="mt-2 pt-2 border-t border-amber-200/70 text-xs text-amber-800">
            {t('fpo.riskCategorization', 'Village tier risk categorization')}
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 3. LARGER VILLAGE SUMMARY CARDS                              */}
      {/* ============================================================ */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
              {t('fpo.villageCardsTitle', 'Village Summary Cards')}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              {t('fpo.villageCardsDesc', 'Comprehensive overview of participating village clusters, farmers, biomass potential, and risk levels.')}
            </p>
          </div>
          <span className="text-xs font-mono font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
            5 {t('fpo.villagesMonitored', 'Villages Monitored')}
          </span>
        </div>

        {/* Larger Village Summary Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FPO_VILLAGE_DATA.map((v) => {
            const isLowRisk = v.risk === 'LOW';
            const isMedRisk = v.risk === 'MEDIUM';
            const isHighRisk = v.risk === 'HIGH';

            return (
              <div
                key={v.id}
                className={`bg-white border rounded-2xl p-6 sm:p-7 shadow-xs hover:shadow-md transition-all flex flex-col justify-between ${
                  isHighRisk
                    ? 'border-rose-300 ring-2 ring-rose-100 bg-rose-50/10'
                    : isMedRisk
                    ? 'border-amber-200 hover:border-amber-400'
                    : 'border-slate-200 hover:border-emerald-400'
                }`}
              >
                <div>
                  {/* Village Header with Risk Indicator */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold text-sm">
                        <Building2 className="w-5 h-5 text-emerald-700" />
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-slate-900 tracking-tight">
                          {v.village}
                        </h3>
                        <span className="text-xs font-medium text-slate-500">
                          {t('fpo.puneDistrict', 'Pune District')}
                        </span>
                      </div>
                    </div>

                    {/* Risk Indicator Badge */}
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-mono font-bold border flex items-center gap-1.5 ${
                        isLowRisk
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : isMedRisk
                          ? 'bg-amber-50 text-amber-900 border-amber-300'
                          : 'bg-rose-50 text-rose-800 border-rose-300 animate-pulse'
                      }`}
                    >
                      {isLowRisk && <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />}
                      {isMedRisk && <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />}
                      {isHighRisk && <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />}
                      <span>{t('scanner.risk.' + v.risk.toLowerCase(), v.risk)} {t('advisor.risk', 'RISK')}</span>
                    </span>
                  </div>

                  {/* Key Metrics: Farmers & Biogas Potential */}
                  <div className="grid grid-cols-2 gap-3 my-5">
                    <div className="bg-[#F8FAF7] border border-slate-200/80 rounded-xl p-3.5">
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold mb-1">
                        <Users className="w-3.5 h-3.5 text-emerald-700" />
                        <span>{t('fpo.farmers', 'Farmers')}</span>
                      </div>
                      <div className="text-2xl font-mono font-black text-slate-900">
                        {v.farmers}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{t('fpo.enrolled', 'Enrolled')}</div>
                    </div>

                    <div className="bg-teal-50/50 border border-teal-200/80 rounded-xl p-3.5">
                      <div className="flex items-center gap-1.5 text-xs text-teal-800 font-semibold mb-1">
                        <Flame className="w-3.5 h-3.5 text-teal-700" />
                        <span>{t('fpo.biogasPotential', 'Biogas Potential')}</span>
                      </div>
                      <div className="text-2xl font-mono font-black text-teal-900">
                        {v.biogasPotentialM3.toLocaleString()}{' '}
                        <span className="text-xs font-normal text-teal-700">m³</span>
                      </div>
                      <div className="text-[11px] text-teal-700 mt-0.5">{t('fpo.cleanFuelYield', 'Clean fuel yield')}</div>
                    </div>
                  </div>

                  {/* Crop & Agronomic Details */}
                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                      <span className="text-slate-500 font-medium">{t('fpo.mainCrop', 'Main Crop')}:</span>
                      <span className="px-2.5 py-0.5 rounded-md font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {t('crop.' + v.mainCrop, v.mainCrop)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                      <span className="text-slate-500 font-medium">{t('fpo.farmArea', 'Farm Area')}:</span>
                      <span className="font-mono font-semibold text-slate-800">
                        {v.areaAcres.toLocaleString()} {t('unit.acres', 'Acres')}
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-1.5 border-b border-slate-100">
                      <span className="text-slate-500 font-medium">{t('residue.estimatedResidue', 'Estimated Residue')}:</span>
                      <span className="font-mono font-semibold text-slate-800">
                        {v.residueTonnes} {t('unit.tonnes', 'Tonnes')}
                      </span>
                    </div>

                    <div className="flex items-center justify-between py-1.5">
                      <span className="text-slate-500 font-medium">{t('fpo.cropHealthScore', 'Crop Health Score')}:</span>
                      <span className="font-mono font-bold text-emerald-700">
                        {v.cropHealth}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Health Progress Indicator */}
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        v.cropHealth >= 85
                          ? 'bg-emerald-600'
                          : v.cropHealth >= 78
                          ? 'bg-amber-500'
                          : 'bg-rose-500'
                      }`}
                      style={{ width: `${v.cropHealth}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ============================================================ */}
      {/* 4. ANALYTICS (KEEP ONLY THREE VISUALS)                       */}
      {/* 1) Crop Distribution                                         */}
      {/* 2) Crop Health                                               */}
      {/* 3) Biogas Potential                                          */}
      {/* ============================================================ */}
      <div className="space-y-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            {t('fpo.regionalAnalytics', 'Regional Analytics')}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            {t('fpo.analyticsSubtitle', 'Key visual analytics: Crop Distribution, Crop Health, and Biogas Potential across monitored clusters.')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Visual 1: Crop Distribution */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-700">
                    {t('fpo.visual1', 'VISUAL 1')}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-0.5">
                    {t('fpo.cropDistTitle', 'Crop Distribution')}
                  </h3>
                </div>
                <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                  {t('fpo.areaShare', 'Area Share')}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                {t('fpo.cropDistDesc', 'Acreage breakdown across participating crops in the Pune district cluster.')}
              </p>
            </div>

            <div className="h-64 w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={FPO_CROP_DISTRIBUTION.map((entry) => ({
                      ...entry,
                      displayName: t('crop.' + entry.name, entry.name),
                    }))}
                    dataKey="acres"
                    nameKey="displayName"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={82}
                    paddingAngle={3}
                  >
                    {FPO_CROP_DISTRIBUTION.map((entry) => (
                      <Cell key={entry.name} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Visual 2: Crop Health */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-700">
                    {t('fpo.visual2', 'VISUAL 2')}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-0.5">
                    {t('fpo.cropHealthTitle', 'Crop Health')}
                  </h3>
                </div>
                <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                  1,250 {t('fpo.farms', 'Farms')}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                {t('fpo.cropHealthDesc', 'Distribution of canopy vigor tiers across monitored regional farms.')}
              </p>
            </div>

            <div className="h-64 w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={FPO_HEALTH_BREAKDOWN.map((entry) => ({
                  ...entry,
                  displayCategory: t(entry.category, entry.category),
                }))} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis type="number" tick={{ fontSize: 11 }} stroke="#64748B" />
                  <YAxis
                    dataKey="displayCategory"
                    type="category"
                    width={115}
                    tick={{ fontSize: 11 }}
                    stroke="#64748B"
                  />
                  <Tooltip />
                  <Bar dataKey="farms" name={t('fpo.farms', 'Farms')} radius={[0, 6, 6, 0]}>
                    {FPO_HEALTH_BREAKDOWN.map((entry) => (
                      <Cell key={entry.category} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Visual 3: Biogas Potential */}
          <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <span className="text-xs font-mono font-bold uppercase tracking-wider text-teal-700">
                    {t('fpo.visual3', 'VISUAL 3')}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 mt-0.5">
                    {t('fpo.biogasPotential', 'Biogas Potential')}
                  </h3>
                </div>
                <span className="text-xs font-mono text-teal-800 bg-teal-50 px-2 py-0.5 rounded">
                  {t('fpo.villageOutput', 'Village Output')}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                {t('fpo.biogasVolDesc', 'Estimated clean biogas volume (m³) generated per village cluster.')}
              </p>
            </div>

            <div className="h-64 w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={FPO_VILLAGE_DATA}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="village" tick={{ fontSize: 12 }} stroke="#64748B" />
                  <YAxis tick={{ fontSize: 11 }} stroke="#64748B" unit="m³" />
                  <Tooltip />
                  <Bar
                    dataKey="biogasPotentialM3"
                    name={t('fpo.biogasPotential', 'Biogas Potential (m³)')}
                    fill="#0D9488"
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 5. FARMER CONTRIBUTION & ENERGY LEDGER                       */}
      {/* ============================================================ */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 sm:p-7 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                <Zap className="w-3.5 h-3.5 text-emerald-700" />
                <span>{t('fpo.participatingLedger', 'PARTICIPATING FARMER LEDGER')}</span>
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-1.5">
              {t('fpo.ledgerTitle', 'Farmer Residue Contributions & Energy Credits')}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {t('fpo.ledgerSubtitle', 'Tracks individual farmer crop residue contributions, community biogas energy earned, and carry-forward balances.')}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-lg">
              {liveFarmerRecords.length} {t('fpo.activeRecords', 'Active Records')}
            </span>
          </div>
        </div>

        {/* Farmer Ledger Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-mono uppercase text-slate-500 bg-[#F8FAF7]">
                <th className="py-3 px-4">{t('app.farmer', 'Farmer')}</th>
                <th className="py-3 px-4">{t('fpo.village', 'Village')}</th>
                <th className="py-3 px-4">{t('dash.primaryCrop', 'Crop')}</th>
                <th className="py-3 px-4 text-right">{t('residue.stubbleGenerated', 'Residue')} (t)</th>
                <th className="py-3 px-4 text-right">{t('profile.totalEarned', 'Energy Earned')} (kWh)</th>
                <th className="py-3 px-4 text-right">{t('profile.totalUsed', 'Energy Used')} (kWh)</th>
                <th className="py-3 px-4 text-right">{t('profile.carryForward', 'Balance / Carry Forward')}</th>
                <th className="py-3 px-4 text-center">{t('fpo.action', 'Action')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/70 text-xs">
              {liveFarmerRecords.map((farmer) => {
                const isPrimaryDemoFarmer = farmer.farmerId === energyAccount.farmerId;
                return (
                  <tr
                    key={farmer.farmerId}
                    className={`transition-colors ${
                      isPrimaryDemoFarmer
                        ? 'bg-emerald-50/50 hover:bg-emerald-50'
                        : 'hover:bg-slate-50/80'
                    }`}
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{farmer.farmerName}</span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-slate-100 text-slate-700">
                          {farmer.farmerId}
                        </span>
                        {isPrimaryDemoFarmer && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-700 text-white">
                            {t('fpo.activeProfile', 'Active Profile')}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 font-medium">{farmer.village}</td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
                        {t('crop.' + farmer.crop, farmer.crop)}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 text-right">
                      {farmer.residueContributionTonnes.toFixed(1)}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-700 text-right">
                      {farmer.energyEarnedKwh.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-sky-700 text-right">
                      {farmer.energyUsedKwh.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-amber-800 text-right">
                      +{farmer.currentBalanceKwh.toLocaleString()} kWh
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      {isPrimaryDemoFarmer ? (
                        <button
                          type="button"
                          onClick={() => onNavigate('farmer-resource-profile')}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-bold transition-colors shadow-2xs"
                        >
                          <span>{t('fpo.viewLedger', 'View Ledger')}</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      ) : (
                        <span className="text-[11px] font-mono text-slate-400">
                          {t('fpo.synced', 'Synced')}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Impact Dashboard Section */}
      <ImpactDashboardSection />
    </div>
  );
};
