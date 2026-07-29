import React from 'react';

interface BadgeProps {
  variant?: 'active' | 'pending' | 'expired' | 'suspended' | 'rejected' | 'blue' | 'purple' | 'neutral';
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ variant = 'blue', children, className = '' }) => {
  const styles: Record<string, string> = {
    active: 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20',
    approved: 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20',
    pending: 'bg-amber-500/10 text-amber-600 border border-amber-500/20',
    expired: 'bg-slate-500/10 text-slate-600 border border-slate-500/20',
    suspended: 'bg-rose-500/10 text-rose-600 border border-rose-500/20',
    rejected: 'bg-rose-500/10 text-rose-600 border border-rose-500/20',
    blue: 'bg-blue-500/10 text-blue-600 border border-blue-500/20',
    purple: 'bg-purple-500/10 text-purple-600 border border-purple-500/20',
    neutral: 'bg-gray-100 text-gray-700 border border-gray-200',
  };

  const activeStyle = styles[variant] || styles.neutral;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide ${activeStyle} ${className}`}>
      {children}
    </span>
  );
};
