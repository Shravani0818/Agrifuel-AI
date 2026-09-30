import React, { useState } from 'react';
import {
  Bell,
  CheckCheck,
  Trash2,
  X,
  Sprout,
  CloudRain,
  Recycle,
  Zap,
  Flame,
  Cpu,
  RotateCcw,
  ArrowRight,
} from 'lucide-react';
import {
  AppNotification,
  NavPage,
  NotificationCategory,
  SMSAlert,
} from '../types/agrifuel';
import { Radio, Send as SendIcon, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface NotificationCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: AppNotification[];
  smsAlerts?: SMSAlert[];
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onClearAll: () => void;
  onRestoreDefaults: () => void;
  onNavigate: (page: NavPage) => void;
}

const CATEGORIES: ('All' | NotificationCategory)[] = [
  'All',
  'Crop',
  'Weather',
  'Residue',
  'Energy',
  'Biogas',
  'System',
];

export const NotificationCenterModal: React.FC<NotificationCenterModalProps> = ({
  isOpen,
  onClose,
  notifications,
  smsAlerts = [],
  onMarkAsRead,
  onMarkAllAsRead,
  onClearAll,
  onRestoreDefaults,
  onNavigate,
}) => {
  const { t, language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'in-app' | 'gsm-sms'>('in-app');
  const [selectedCategory, setSelectedCategory] =
    useState<'All' | NotificationCategory>('All');

  if (!isOpen) return null;

  const filtered =
    selectedCategory === 'All'
      ? notifications
      : notifications.filter((n) => n.category === selectedCategory);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const getCategoryIcon = (category: NotificationCategory) => {
    switch (category) {
      case 'Crop':
        return <Sprout className="w-4 h-4 text-emerald-700" />;
      case 'Weather':
        return <CloudRain className="w-4 h-4 text-sky-700" />;
      case 'Residue':
        return <Recycle className="w-4 h-4 text-amber-700" />;
      case 'Energy':
        return <Zap className="w-4 h-4 text-emerald-700" />;
      case 'Biogas':
        return <Flame className="w-4 h-4 text-teal-700" />;
      default:
        return <Cpu className="w-4 h-4 text-slate-700" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end bg-slate-900/40 backdrop-blur-[1px] p-3 sm:p-6">
      <div className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-[#F8FAF7] border-b border-slate-200 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-700 text-white flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">
                  {t('app.notifications', 'Notification Center')}
                </h2>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-md text-[11px] font-mono-tabular font-bold bg-emerald-100 text-emerald-800">
                    {unreadCount} {t('app.queued', 'Unread')}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">
                {t('app.title', 'AgriFuel AI')} {t('app.notifications', 'Alerts')}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200/60 transition-colors"
            aria-label={t('action.close', 'Close')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher: In-App Notifications vs GSM SMS Outbox */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-4 pt-2 gap-2 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('in-app')}
            className={`py-2 px-3 border-b-2 transition-colors ${
              activeTab === 'in-app'
                ? 'border-emerald-700 text-emerald-800 bg-white rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            {t('app.notifications', 'In-App Notifications')} ({notifications.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('gsm-sms')}
            className={`py-2 px-3 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'gsm-sms'
                ? 'border-emerald-700 text-emerald-800 bg-white rounded-t-lg'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-emerald-600" />
            <span>GSM SMS Outbox ({smsAlerts.length})</span>
          </button>
        </div>

        {activeTab === 'in-app' ? (
          <>
            {/* Action Buttons & Category Filter */}
            <div className="px-4 sm:px-5 py-3 border-b border-slate-100 space-y-2.5 bg-white">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={onMarkAllAsRead}
                  disabled={unreadCount === 0}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 disabled:opacity-50 border border-emerald-200 rounded-lg transition-colors"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Mark All as Read</span>
                </button>

                <div className="flex items-center gap-2">
                  {notifications.length === 0 && (
                    <button
                      type="button"
                      onClick={onRestoreDefaults}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Restore Demo Alerts</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={onClearAll}
                    disabled={notifications.length === 0}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 disabled:opacity-50 border border-red-200 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear Notifications</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold whitespace-nowrap transition-colors ${
                      selectedCategory === cat
                        ? 'bg-slate-900 text-white'
                        : 'bg-[#F8FAF7] text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : (
          <div className="px-4 py-2.5 bg-slate-100/70 border-b border-slate-200 flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700">
              Offline Cellular SMS Outbox (SIM800L):
            </span>
            <button
              type="button"
              onClick={() => {
                onClose();
                onNavigate('offline-sms');
              }}
              className="text-emerald-800 font-bold hover:underline inline-flex items-center gap-1"
            >
              <span>Manage in SMS Hub</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3">
          {activeTab === 'gsm-sms' ? (
            smsAlerts.length === 0 ? (
              <div className="py-10 text-center text-xs text-slate-500">
                No SMS alerts in outbox.
              </div>
            ) : (
              smsAlerts.map((sms) => (
                <div
                  key={sms.id}
                  className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors space-y-2 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{sms.title}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold capitalize ${
                        sms.status === 'delivered'
                          ? 'bg-emerald-100 text-emerald-800'
                          : sms.status === 'pending'
                          ? 'bg-amber-100 text-amber-800'
                          : sms.status === 'sent'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {sms.status}
                    </span>
                  </div>
                  <div className="p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono text-[11px] text-slate-800 leading-snug">
                    {sms.messageText}
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono">
                    <span>To: {sms.recipientPhone}</span>
                    <span className="font-semibold text-emerald-700">
                      {sms.messageText.length} / 160 chars
                    </span>
                    <span>{sms.timestamp}</span>
                  </div>
                </div>
              ))
            )
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                <Bell className="w-6 h-6" />
              </div>
              <div className="text-sm font-bold text-slate-800">
                No notifications to display
              </div>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                New alerts appear automatically when you analyze crops, contribute crop residue, or
                update your farmer energy balance.
              </p>
              {notifications.length === 0 && (
                <button
                  type="button"
                  onClick={onRestoreDefaults}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl hover:bg-emerald-100 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Load Default Demo Notifications</span>
                </button>
              )}
            </div>
          ) : (
            filtered.map((notif) => (
              <div
                key={notif.id}
                onClick={() => onMarkAsRead(notif.id)}
                className={`cursor-pointer p-3.5 rounded-xl border transition-all ${
                  notif.read
                    ? 'bg-white border-slate-200/80 opacity-85'
                    : 'bg-emerald-50/40 border-emerald-300 shadow-2xs'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#F8FAF7] border border-slate-200 flex items-center justify-center shrink-0 mt-0.5">
                    {getCategoryIcon(notif.category)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-xs font-bold text-slate-900 truncate">
                          {notif.title}
                        </span>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-mono-tabular font-bold shrink-0 ${
                            notif.read
                              ? 'bg-slate-100 text-slate-500'
                              : 'bg-emerald-700 text-white'
                          }`}
                        >
                          {notif.read ? 'Read' : 'Unread'}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono-tabular text-slate-400 shrink-0">
                        {notif.dateTime}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                      {notif.description}
                    </p>

                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[11px]">
                      <span className="font-mono-tabular text-slate-500">
                        Category: <strong>{notif.category}</strong>
                      </span>
                      {notif.linkPage && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onMarkAsRead(notif.id);
                            onNavigate(notif.linkPage!);
                            onClose();
                          }}
                          className="inline-flex items-center gap-1 font-bold text-emerald-700 hover:text-emerald-900"
                        >
                          <span>Open Module</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-[#F8FAF7] border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
          <span>AgriFuel AI Real-Time Event Stream</span>
          <span className="font-mono-tabular font-semibold text-amber-800">
            DEMO / ILLUSTRATIVE DATA
          </span>
        </div>
      </div>
    </div>
  );
};
