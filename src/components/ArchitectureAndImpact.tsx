import React from 'react';
import {
  Cpu,
  Wifi,
  BrainCircuit,
  LayoutDashboard,
  Sprout,
  Recycle,
  Flame,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  Zap,
  RefreshCw,
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const SystemArchitectureDiagram: React.FC = () => {
  const { t } = useLanguage();
  const steps = [
    {
      step: '01',
      title: t('vc.step1', 'FARM'),
      subtitle: t('5-Acre Plots & Community Clusters', '5-Acre Plots & Community Clusters'),
      detail: t('Crop canopy, root-zone soil moisture, and post-harvest biomass source', 'Crop canopy, root-zone soil moisture, and post-harvest biomass source'),
      icon: Sprout,
      badge: t('Physical Layer', 'Physical Layer'),
    },
    {
      step: '02',
      title: t('vc.step2', 'IOT SENSORS'),
      subtitle: t('ESP32 Edge Telemetry', 'ESP32 Edge Telemetry'),
      detail: t('DHT22 (Temp/Humidity), Soil Moisture Probe, MQ-4 Methane Indicator, Relay', 'DHT22 (Temp/Humidity), Soil Moisture Probe, MQ-4 Methane Indicator, Relay'),
      icon: Cpu,
      badge: t('Edge Hardware', 'Edge Hardware'),
    },
    {
      step: '03',
      title: 'ESP32',
      subtitle: t('Wi-Fi / LoRa Field Gateway', 'Wi-Fi / LoRa Field Gateway'),
      detail: t('Real-time packet streaming & autonomous irrigation relay switching', 'Real-time packet streaming & autonomous irrigation relay switching'),
      icon: Wifi,
      badge: t('Connectivity', 'Connectivity'),
    },
    {
      step: '04',
      title: t('app.title', 'AGRI FUEL AI PLATFORM'),
      subtitle: t('Multimodal AI + Energy Ledger', 'Multimodal AI + Energy Ledger'),
      detail: t('Gemini Vision crop diagnosis, Priority 1/2/3 treatment & kWh credit accounting', 'Gemini Vision crop diagnosis, Priority 1/2/3 treatment & kWh credit accounting'),
      icon: BrainCircuit,
      badge: t('AI Core', 'AI Core'),
    },
    {
      step: '05',
      title: t('nav.farmerResourceProfile', 'FARMER & FPO DASHBOARD'),
      subtitle: t('Advisory + Carry-Forward Credits', 'Advisory + Carry-Forward Credits'),
      detail: t('Trackable residue-to-energy balance, monthly carry-forward & FPO ledger', 'Trackable residue-to-energy balance, monthly carry-forward & FPO ledger'),
      icon: LayoutDashboard,
      badge: t('Action Layer', 'Action Layer'),
    },
  ];

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-6 lg:p-8 shadow-2xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <span className="text-xs font-mono-tabular uppercase tracking-wider font-semibold text-emerald-700">
            {t('arch.heading', 'SYSTEM ARCHITECTURE & CIRCULAR ENERGY LEDGER')}
          </span>
          <h3 className="text-xl font-bold text-slate-900 mt-1">
            {t('arch.title', 'End-to-End Hardware, AI & Farmer Energy Accounting Pipeline')}
          </h3>
        </div>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono-tabular font-medium bg-emerald-50 text-emerald-800 border border-emerald-200 self-start sm:self-auto">
          {t('ARCHITECTURE VIEW', 'ARCHITECTURE VIEW')}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
        {steps.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={item.step}
              className="relative flex flex-col justify-between rounded-xl border border-slate-200/90 bg-[#F8FAF7] p-4 hover:border-emerald-600/40 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-xs font-mono-tabular font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                    {t('nav.step', 'STEP')} {item.step}
                  </span>
                  <span className="text-[11px] font-medium text-slate-500">
                    {item.badge}
                  </span>
                </div>
                <div className="w-10 h-10 rounded-lg bg-emerald-700 text-white flex items-center justify-center mb-3">
                  <Icon className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 tracking-tight">
                  {item.title}
                </h4>
                <p className="text-xs font-semibold text-emerald-800 mt-0.5">
                  {item.subtitle}
                </p>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  {item.detail}
                </p>
              </div>

              {idx < steps.length - 1 && (
                <div className="hidden md:flex items-center justify-end mt-3 pt-2 border-t border-slate-200/60 text-[11px] font-mono-tabular text-emerald-700 font-semibold">
                  <span>{t('arch.flowNext', 'FLOWS TO NEXT STAGE →')}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Section 14: Circular Flow Visualization */}
      <div className="mt-6 pt-6 border-t border-slate-200/80 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <RefreshCw className="w-4 h-4 text-emerald-700" />
            <span className="text-xs font-mono-tabular font-bold text-emerald-800 uppercase">
              {t('CIRCULAR FARMER RESOURCE & ENERGY ACCOUNTING FLOW', 'CIRCULAR FARMER RESOURCE & ENERGY ACCOUNTING FLOW')}
            </span>
          </div>
          <span className="text-xs font-semibold text-slate-600 italic">
            &ldquo;{t('hero.quote', 'AgriFuel AI turns crop residue into trackable community energy credits that farmers can use and carry forward across seasons.')}&rdquo;
          </span>
        </div>

        <div className="p-4 rounded-xl bg-emerald-950 text-white flex flex-wrap items-center justify-between gap-2 text-xs font-semibold">
          <span className="px-3 py-1.5 rounded-lg bg-emerald-900 border border-emerald-700">
            1. {t('vc.step1', 'FARM')}
          </span>
          <span className="text-amber-400 font-bold">→</span>
          <span className="px-3 py-1.5 rounded-lg bg-emerald-900 border border-emerald-700">
            2. {t('dash.primaryCrop', 'CROP')}
          </span>
          <span className="text-amber-400 font-bold">→</span>
          <span className="px-3 py-1.5 rounded-lg bg-emerald-900 border border-emerald-700">
            3. {t('vc.step3', 'CROP RESIDUE')} (2.5t)
          </span>
          <span className="text-amber-400 font-bold">→</span>
          <span className="px-3 py-1.5 rounded-lg bg-teal-900 border border-teal-600 text-teal-200">
            4. {t('vc.step4', 'COMMUNITY BIOGAS')}
          </span>
          <span className="text-amber-400 font-bold">→</span>
          <span className="px-3 py-1.5 rounded-lg bg-amber-400/20 border border-amber-400/40 text-amber-200 font-mono-tabular">
            5. {t('vc.step5', 'ENERGY CREDIT')} (+850 kWh)
          </span>
          <span className="text-amber-400 font-bold">→</span>
          <span className="px-3 py-1.5 rounded-lg bg-sky-900 border border-sky-700 text-sky-200 font-mono-tabular">
            6. {t('vc.step6', 'FARM OPERATIONS')} (-700 kWh)
          </span>
          <span className="text-amber-400 font-bold">→</span>
          <span className="px-3 py-1.5 rounded-lg bg-amber-400 text-slate-950 font-mono-tabular font-bold">
            7. {t('vc.step7', 'CARRY FORWARD')} (150 kWh)
          </span>
        </div>
      </div>
    </div>
  );
};

export const ProblemVsSolutionSection: React.FC = () => {
  const { t } = useLanguage();
  const problems = [
    {
      title: t('arch.p1.title', 'Crop Stress & Delayed Detection'),
      desc: t('arch.p1.desc', 'Unnoticed leaf chlorosis, fungal spots, or pest damage reduce harvest yields across smallholder plots.'),
    },
    {
      title: t('arch.p2.title', 'Uncertain Irrigation Timing'),
      desc: t('arch.p2.desc', 'Irrigating without soil moisture telemetry or rain probability wastes water, electricity, and pump life.'),
    },
    {
      title: t('arch.p3.title', 'Crop Residue Burning'),
      desc: t('arch.p3.desc', 'Post-harvest stubble burning destroys soil organic carbon and creates severe regional air pollution.'),
    },
    {
      title: t('arch.p4.title', 'Untracked Biomass & Rural Energy Gap'),
      desc: t('arch.p4.desc', 'Farmers lack a transparent ledger to earn, consume, and carry forward clean energy credits from their own crop residue.'),
    },
  ];

  const solutions = [
    {
      title: t('arch.s1.title', 'Multimodal AI + Priority 1/2/3 Care'),
      desc: t('arch.s1.desc', 'Gemini Vision leaf diagnosis paired with a Natural-First, Soil-Test-Second, Professional-Third treatment hierarchy.'),
    },
    {
      title: t('arch.s2.title', 'Smart Weather + Soil Advisory'),
      desc: t('arch.s2.desc', 'Synthesizes 65% rain probability with 42% soil moisture to delay unnecessary irrigation.'),
    },
    {
      title: t('arch.s3.title', 'Residue-to-Bioenergy Planning'),
      desc: t('arch.s3.desc', 'Quantifies post-harvest residue (tonnes/ha) and routes eligible feedstock to community anaerobic digesters.'),
    },
    {
      title: t('arch.s4.title', 'Smart Farmer Energy Accounting'),
      desc: t('arch.s4.desc', 'Tracks every farmer’s residue contribution (2.5t → 850 kWh), farm energy usage (700 kWh), and monthly carry-forward (150 kWh).'),
    },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* THE PROBLEM */}
      <div className="bg-white border border-red-200/80 rounded-2xl p-6 lg:p-8">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 rounded-lg bg-red-50 border border-red-200 text-red-700 flex items-center justify-center">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-mono-tabular uppercase tracking-wider font-bold text-red-700">
              {t('arch.challengeBadge', 'THE CHALLENGE')}
            </span>
            <h3 className="text-lg font-bold text-slate-900">
              {t('arch.challengeTitle', 'Disconnected Farm Decisions & Wasted Biomass')}
            </h3>
          </div>
        </div>

        <div className="space-y-3.5 mt-5">
          {problems.map((p) => (
            <div
              key={p.title}
              className="p-4 rounded-xl bg-red-50/40 border border-red-100 flex items-start gap-3"
            >
              <span className="w-2 h-2 rounded-full bg-red-600 mt-2 shrink-0" />
              <div>
                <h4 className="text-sm font-bold text-slate-900">{p.title}</h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {p.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* THE AGRI FUEL AI SOLUTION */}
      <div className="bg-white border border-emerald-200/90 rounded-2xl p-6 lg:p-8">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <span className="text-xs font-mono-tabular uppercase tracking-wider font-bold text-emerald-700">
              {t('arch.solutionBadge', 'THE AGRI FUEL AI SOLUTION')}
            </span>
            <h3 className="text-lg font-bold text-slate-900">
              {t('arch.solutionTitle', 'Unified Intelligence, Clean Bioenergy & Farmer Energy Credits')}
            </h3>
          </div>
        </div>

        <div className="space-y-3.5 mt-5">
          {solutions.map((s) => (
            <div
              key={s.title}
              className="p-4 rounded-xl bg-emerald-50/40 border border-emerald-100 flex items-start gap-3"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-700 mt-0.5 shrink-0" />
              <div>
                <h4 className="text-sm font-bold text-slate-900">{s.title}</h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {s.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const ImpactDashboardSection: React.FC = () => {
  const { t } = useLanguage();
  const pillars = [
    {
      title: t('impact.1.title', '1. Smarter Crop Decisions'),
      metric: t('Early Stress & Priority 1/2/3 Care', 'Early Stress & Priority 1/2/3 Care'),
      desc: t('impact.1.desc', 'Combines Gemini Vision crop analysis with natural-first treatment priorities and soil moisture telemetry.'),
      icon: Sprout,
    },
    {
      title: t('impact.2.title', '2. Reduced Residue Burning'),
      metric: '2,450 Tonnes Identified',
      desc: t('impact.2.desc', 'Converts post-harvest crop residue from a burning liability into trackable community biogas feedstock.'),
      icon: Recycle,
    },
    {
      title: t('impact.3.title', '3. Community Clean Energy'),
      metric: '12,500 kWh / Mo Generated',
      desc: t('impact.3.desc', 'Produces clean electricity and biogas across village clusters with active farmer utilization.'),
      icon: Flame,
    },
    {
      title: t('impact.4.title', '4. Farmer Energy Accounting'),
      metric: t('Trackable Carry-Forward Credits', 'Trackable Carry-Forward Credits'),
      desc: t('impact.4.desc', 'Every farmer earns kWh credits from residue (e.g. 850 kWh), uses energy for irrigation (700 kWh), and carries forward the balance (150 kWh).'),
      icon: Zap,
    },
  ];

  return (
    <div className="bg-emerald-950 text-white rounded-2xl p-6 lg:p-8 border border-emerald-800">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <span className="text-xs font-mono-tabular uppercase tracking-wider font-semibold text-emerald-300">
            {t('impact.heading', 'PLATFORM IMPACT SUMMARY')}
          </span>
          <h3 className="text-xl font-bold text-white mt-1">
            {t('impact.title', 'Circular Value Across Farm, Bioenergy & Farmer Energy Ledger')}
          </h3>
        </div>
        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-mono-tabular font-medium bg-emerald-900/90 text-emerald-200 border border-emerald-700 self-start sm:self-auto">
          {t('impact.badge', 'ILLUSTRATIVE PROTOTYPE IMPACT')}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {pillars.map((pillar) => {
          const Icon = pillar.icon;
          return (
            <div
              key={pillar.title}
              className="rounded-xl bg-emerald-900/50 border border-emerald-800/90 p-5 flex flex-col justify-between"
            >
              <div>
                <div className="w-9 h-9 rounded-lg bg-emerald-800/80 text-emerald-200 flex items-center justify-center mb-3">
                  <Icon className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-white">{pillar.title}</h4>
                <div className="text-xs font-mono-tabular font-semibold text-amber-300 mt-1">
                  {pillar.metric}
                </div>
                <p className="text-xs text-emerald-100/80 mt-2 leading-relaxed">
                  {pillar.desc}
                </p>
              </div>
              <div className="mt-4 pt-2.5 border-t border-emerald-800/60 flex items-center justify-between text-[11px] font-mono-tabular text-emerald-300">
                <span>{t('VERIFIED WORKFLOW', 'VERIFIED WORKFLOW')}</span>
                <span>Impact Model</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
