import React from 'react';
import {
  Wallet,
  Zap,
  Flame,
  RotateCw,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  IndianRupee,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Cpu,
  CheckCircle2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import {
  CropType,
  EnergyConversionCoefficients,
  EnergyUsageCategory,
  FarmerEnergyAccount,
  FarmProfile,
  NavPage,
} from '../types/agrifuel';
import { useLanguage } from '../context/LanguageContext';

interface FarmerResourceProfileViewProps {
  profile: FarmProfile;
  energyAccount: FarmerEnergyAccount;
  coefficients: EnergyConversionCoefficients;
  onUpdateCoefficients?: (coeffs: EnergyConversionCoefficients) => void;
  onContributeResidue?: (
    crop: CropType,
    quantityTonnes: number,
    dateLabel: string
  ) => void;
  onRecordEnergyUsage?: (
    category: EnergyUsageCategory,
    kwhUsed: number,
    dateLabel: string,
    note?: string
  ) => void;
  onSelectActiveMonth?: (monthKey: 'Sep' | 'Oct' | 'Nov' | 'Dec') => void;
  onResetEnergyAccount?: () => void;
  onNavigate: (page: NavPage) => void;
}

export const FarmerResourceProfileView: React.FC<FarmerResourceProfileViewProps> = ({
  profile,
  energyAccount,
  coefficients,
  onResetEnergyAccount,
  onNavigate,
}) => {
  const { t, language } = useLanguage();
  // Simple monthly trend data for the single trend chart
  const trendData = energyAccount.monthlyLedger.map((entry) => ({
    month: entry.monthName.split(' ')[0],
    fullMonth: entry.monthName,
    earned: entry.energyEarnedKwh,
    used: entry.energyUsedKwh,
    carryForward: entry.closingBalanceKwh,
  }));

  const monetaryRate = coefficients.monetaryRateInrPerKwh || 8;
  const estimatedValue = energyAccount.estimatedMonetaryValueInr || Math.round(energyAccount.carryForwardKwh * monetaryRate);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Top Bar with Navigation & Reset */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono-tabular font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
              <Wallet className="w-3.5 h-3.5 text-emerald-700" />
              <span>{t('profile.title', 'DIGITAL ENERGY WALLET')}</span>
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono-tabular font-semibold bg-slate-100 text-slate-700 border border-slate-200">
              {t('profile.accountNo', 'ID')}: {energyAccount.farmerId || 'F001'}
            </span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1.5 tracking-tight">
            {t('nav.farmerResourceProfile', 'Farmer Energy Profile')}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {t('profile.subtitle', 'Your personal seasonal energy wallet: track credits earned from crop biomass, energy used, and carry-forward balance.')}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {onResetEnergyAccount && (
            <button
              type="button"
              onClick={onResetEnergyAccount}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-2xs"
              title="Reset wallet demo data"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t('action.reset', 'Reset Wallet')}</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => onNavigate('dashboard')}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t('nav.dashboard', 'Dashboard')}</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('residue-intelligence')}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl transition-colors shadow-2xs"
          >
            <span>{t('nav.residueIntelligence', 'Residue Hub')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Digital Wallet Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950 via-slate-900 to-emerald-900 text-white p-6 sm:p-8 shadow-xl border border-emerald-500/30">
        {/* Subtle decorative glow circles */}
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col justify-between space-y-6">
          {/* Card Top Row: Brand, Chip, and Status */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-400 to-amber-200 flex items-center justify-center text-slate-900 shadow-md">
                <Cpu className="w-5 h-5 text-emerald-950" />
              </div>
              <div>
                <div className="text-[11px] font-mono-tabular uppercase tracking-widest text-emerald-300 font-bold">
                  {t('profile.passTitle', 'AgriFuel Energy Pass')}
                </div>
                <div className="text-xs text-slate-300 font-mono-tabular">
                  •••• •••• •••• {energyAccount.farmerId || 'F001'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-xs font-mono-tabular font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{t('profile.activeWallet', 'ACTIVE WALLET')}</span>
            </div>
          </div>

          {/* Card Middle: Primary Carry Forward Balance */}
          <div className="py-2">
            <div className="text-xs uppercase tracking-wider font-semibold text-emerald-200/90 mb-1 flex items-center gap-1.5">
              <RotateCw className="w-3.5 h-3.5 text-emerald-400" />
              <span>{t('profile.currentBalance', 'Current Carry Forward Balance')}</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl sm:text-5xl font-mono-tabular font-extrabold tracking-tight text-white">
                {energyAccount.carryForwardKwh.toLocaleString('en-IN')}
              </span>
              <span className="text-xl sm:text-2xl font-bold text-emerald-300">
                {t('unit.kwh', 'kWh')}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2 mt-2 text-xs sm:text-sm text-slate-300">
              <span className="flex items-center text-amber-300 font-mono-tabular font-semibold">
                <IndianRupee className="w-3.5 h-3.5 mr-0.5" />
                {estimatedValue.toLocaleString('en-IN')} {t('profile.creditValue', 'Est. Credit Value')}
              </span>
              <span className="text-slate-400">·</span>
              <span className="text-slate-300">
                ₹{monetaryRate}/{t('unit.kwh', 'kWh')} {t('profile.conversionRate', 'conversion rate')}
              </span>
            </div>
          </div>

          {/* Card Bottom Row: Farmer Details */}
          <div className="pt-4 border-t border-emerald-800/80 flex flex-wrap items-center justify-between gap-4 text-xs">
            <div>
              <div className="text-[10px] uppercase font-mono-tabular text-emerald-300/80">
                {t('profile.cardholder', 'Farmer Cardholder')}
              </div>
              <div className="text-base font-bold text-white mt-0.5">
                {energyAccount.farmerName || profile.farmerName}
              </div>
            </div>

            <div>
              <div className="text-[10px] uppercase font-mono-tabular text-emerald-300/80">
                {t('profile.farmLocation', 'Farm / Location')}
              </div>
              <div className="font-semibold text-slate-200 mt-0.5">
                {energyAccount.village || profile.village || 'Shirur'}, {energyAccount.location ? energyAccount.location.split(',')[1] || 'Pune' : 'Pune'}
              </div>
            </div>

            <div>
              <div className="text-[10px] uppercase font-mono-tabular text-emerald-300/80">
                {t('dash.primaryCrop', 'Primary Crop')}
              </div>
              <div className="font-semibold text-slate-200 mt-0.5">
                {t('crop.' + (energyAccount.primaryCrop || profile.primaryCrop || 'Soybean'), energyAccount.primaryCrop || profile.primaryCrop || 'Soybean')} ({energyAccount.farmAreaAcres || profile.farmAreaAcres} {t('unit.acres', 'ac')})
              </div>
            </div>

            <div className="flex items-center gap-1 text-[11px] text-emerald-300 bg-emerald-900/60 px-2.5 py-1 rounded-lg border border-emerald-700/50">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>{t('profile.rolloverProtected', 'Rollover Protected')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* The 3 Core Metrics Only: Energy Earned, Energy Used, Carry Forward */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Metric 1: Energy Earned */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <span className="text-xs font-mono-tabular font-bold text-emerald-700 uppercase tracking-wider">
              {t('profile.incomeCredit', 'INCOME CREDIT')}
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-xs font-medium text-slate-500">
              {t('profile.totalEarned', 'Energy Earned')}
            </div>
            <div className="text-3xl font-mono-tabular font-extrabold text-emerald-700 mt-1">
              +{energyAccount.energyEarnedKwh.toLocaleString('en-IN')}
              <span className="text-sm font-bold text-emerald-600 ml-1">{t('unit.kwh', 'kWh')}</span>
            </div>
            <p className="text-xs text-slate-600 mt-2">
              {t('profile.totalEarned', 'Earned from')} {energyAccount.residueContributionTonnes}{t('unit.tonnes', 't')} {t('residue.potentialBiomass', 'crop biomass')} {t('nav.communityBioenergy', 'community biogas')}.
            </p>
          </div>
        </div>

        {/* Metric 2: Energy Used */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <span className="text-xs font-mono-tabular font-bold text-sky-700 uppercase tracking-wider">
              {t('profile.farmConsumption', 'FARM CONSUMPTION')}
            </span>
            <div className="w-8 h-8 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-700">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-xs font-medium text-slate-500">
              {t('profile.totalUsed', 'Energy Used')}
            </div>
            <div className="text-3xl font-mono-tabular font-extrabold text-sky-800 mt-1">
              -{energyAccount.energyUsedKwh.toLocaleString('en-IN')}
              <span className="text-sm font-bold text-sky-700 ml-1">{t('unit.kwh', 'kWh')}</span>
            </div>
            <p className="text-xs text-slate-600 mt-2">
              {t('profile.totalUsed', 'Deducted for farm irrigation pump cycles, equipment, and on-field processing.')}
            </p>
          </div>
        </div>

        {/* Metric 3: Carry Forward */}
        <div className="bg-white border border-emerald-300 rounded-2xl p-6 shadow-2xs hover:shadow-xs transition-shadow bg-gradient-to-b from-white to-emerald-50/40">
          <div className="flex items-center justify-between pb-3 border-b border-emerald-100">
            <span className="text-xs font-mono-tabular font-bold text-emerald-800 uppercase tracking-wider">
              {t('profile.netBalance', 'NET WALLET BALANCE')}
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-700 text-white flex items-center justify-center">
              <RotateCw className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-xs font-medium text-slate-500">
              {t('profile.carryForward', 'Carry Forward')}
            </div>
            <div className="text-3xl font-mono-tabular font-extrabold text-slate-900 mt-1">
              {energyAccount.carryForwardKwh.toLocaleString('en-IN')}
              <span className="text-sm font-bold text-emerald-700 ml-1">{t('unit.kwh', 'kWh')}</span>
            </div>
            <p className="text-xs text-emerald-800 font-medium mt-2">
              {t('profile.carryForward', 'Unused credits roll forward automatically to power the next planting and harvest season.')}
            </p>
          </div>
        </div>
      </div>

      {/* One Simple Trend Chart */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-700" />
              <h2 className="text-base font-bold text-slate-900">
                {t('profile.trendTitle', 'Energy Balance & Carry Forward Trend')}
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {t('profile.trendSubtitle', 'Monthly progression of energy earned, farm energy consumed, and cumulative carry-forward balance.')}
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-mono-tabular text-slate-500">
            <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200">
              {t('profile.seasonLabel', 'Season')}: Sep – Nov 2026
            </span>
          </div>
        </div>

        <div className="h-64 sm:h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="carryForwardGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#059669" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#059669" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="usedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0284C7" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#0284C7" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12, fill: '#64748B' }}
                stroke="#CBD5E1"
              />
              <YAxis
                unit=" kWh"
                tick={{ fontSize: 11, fill: '#64748B' }}
                stroke="#CBD5E1"
              />
              <Tooltip
                formatter={(value: any, name: any) => [
                  `${value ?? 0} kWh`,
                  name === 'carryForward'
                    ? t('profile.carryForward', 'Carry Forward Balance')
                    : name === 'earned'
                    ? t('profile.totalEarned', 'Energy Earned')
                    : t('profile.totalUsed', 'Energy Used'),
                ]}
                labelFormatter={(label) => `${t('profile.month', 'Month')}: ${label}`}
                contentStyle={{
                  backgroundColor: '#0F172A',
                  color: '#FFFFFF',
                  borderRadius: '12px',
                  border: '1px solid #334155',
                  fontSize: '12px',
                  padding: '8px 12px',
                }}
              />
              <Legend
                wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }}
                formatter={(value) =>
                  value === 'carryForward'
                    ? t('profile.carryForward', 'Carry Forward (Roll-over)')
                    : value === 'earned'
                    ? t('profile.totalEarned', 'Energy Earned')
                    : t('profile.totalUsed', 'Energy Used')
                }
              />
              <Area
                type="monotone"
                dataKey="carryForward"
                stroke="#059669"
                strokeWidth={3}
                fill="url(#carryForwardGrad)"
                name="carryForward"
              />
              <Area
                type="monotone"
                dataKey="earned"
                stroke="#10B981"
                strokeWidth={2}
                strokeDasharray="4 4"
                fill="none"
                name="earned"
              />
              <Area
                type="monotone"
                dataKey="used"
                stroke="#0284C7"
                strokeWidth={2}
                fill="url(#usedGrad)"
                name="used"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>
              {t('profile.cumulativeGrows', 'Cumulative Carry Forward grows each month')}: <strong>150 kWh</strong> (Sep) →{' '}
              <strong>250 kWh</strong> (Oct) → <strong>350 kWh</strong> (Nov).
            </span>
          </div>
          <span className="font-mono-tabular text-slate-400">
            AgriFuel Energy Protocol v2.4
          </span>
        </div>
      </div>
    </div>
  );
};
