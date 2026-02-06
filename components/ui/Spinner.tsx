/**
 * Spinner Component
 * Loading spinner
 */

import React from 'react';

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  };

  return (
    <div
      className={`
        ${sizeClasses[size]}
        border-slate-200 border-t-brand-500 rounded-full animate-spin
        ${className}
      `}
    />
  );
};

export const LoadingOverlay: React.FC<{ message?: string }> = ({ message }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
    <div className="bg-white rounded-2xl p-8 shadow-xl flex flex-col items-center gap-4">
      <Spinner size="lg" />
      {message && <p className="text-slate-600 font-medium">{message}</p>}
    </div>
  </div>
);
