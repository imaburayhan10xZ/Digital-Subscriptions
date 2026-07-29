import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, AlertCircle, Info, ShieldAlert, Download, X, ExternalLink } from 'lucide-react';

export interface NotificationState {
  isOpen: boolean;
  type?: 'success' | 'error' | 'info' | 'warning' | 'download';
  title: string;
  message: string;
  actionText?: string;
  actionUrl?: string;
  onAction?: () => void;
}

interface NotificationModalProps extends NotificationState {
  onClose: () => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  type = 'info',
  title,
  message,
  actionText,
  actionUrl,
  onAction,
}) => {
  if (!isOpen) return null;

  const handleActionClick = () => {
    if (onAction) {
      onAction();
    }
    if (actionUrl) {
      if (actionUrl.startsWith('http://') || actionUrl.startsWith('https://')) {
        window.open(actionUrl, '_blank');
      } else {
        window.location.href = actionUrl;
      }
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-md"
          />

          {/* Popup Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
            className="relative w-full max-w-md bg-white border border-slate-200/80 rounded-3xl shadow-2xl z-10 overflow-hidden p-6 text-center space-y-4 my-8"
          >
            {/* Top Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Icon Header */}
            <div className="flex justify-center pt-2">
              {type === 'download' && (
                <div className="w-16 h-16 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center shadow-inner ring-8 ring-purple-50">
                  <Download className="w-8 h-8 animate-bounce" />
                </div>
              )}
              {type === 'success' && (
                <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-inner ring-8 ring-emerald-50">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
              )}
              {type === 'error' && (
                <div className="w-16 h-16 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shadow-inner ring-8 ring-rose-50">
                  <AlertCircle className="w-8 h-8" />
                </div>
              )}
              {type === 'warning' && (
                <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shadow-inner ring-8 ring-amber-50">
                  <ShieldAlert className="w-8 h-8" />
                </div>
              )}
              {type === 'info' && (
                <div className="w-16 h-16 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center shadow-inner ring-8 ring-blue-50">
                  <Info className="w-8 h-8" />
                </div>
              )}
            </div>

            {/* Content */}
            <div className="space-y-2">
              <h3 className="text-xl font-black text-slate-900 tracking-tight">
                {title}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                {message}
              </p>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center gap-3">
              {(actionText || actionUrl || onAction) && (
                <button
                  type="button"
                  onClick={handleActionClick}
                  className={`flex-1 py-3 px-4 font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center space-x-1.5 ${
                    type === 'download'
                      ? 'bg-purple-600 hover:bg-purple-700 text-white'
                      : type === 'warning'
                      ? 'bg-amber-600 hover:bg-amber-700 text-white'
                      : type === 'error'
                      ? 'bg-rose-600 hover:bg-rose-700 text-white'
                      : 'bg-slate-900 hover:bg-slate-800 text-white'
                  }`}
                >
                  <span>{actionText || 'Proceed'}</span>
                  {actionUrl && <ExternalLink className="w-3.5 h-3.5" />}
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
