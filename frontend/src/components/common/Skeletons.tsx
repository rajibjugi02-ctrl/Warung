import React from 'react';

// Skeleton for product cards
export const ProductSkeleton: React.FC = () => (
  <div className="bg-white rounded-2xl shadow-card border border-stone-100 overflow-hidden animate-pulse">
    <div className="bg-stone-200 aspect-square" />
    <div className="p-3.5 space-y-2.5">
      <div className="h-3 bg-stone-200 rounded-full w-24" />
      <div className="h-4 bg-stone-200 rounded-full w-full" />
      <div className="h-4 bg-stone-200 rounded-full w-3/4" />
      <div className="h-3 bg-stone-200 rounded-full w-20" />
      <div className="flex justify-between items-center pt-1">
        <div className="h-5 bg-stone-200 rounded-full w-20" />
        <div className="w-9 h-9 bg-stone-200 rounded-xl" />
      </div>
    </div>
  </div>
);

// Page skeleton for full loading
export const PageSkeleton: React.FC = () => (
  <div className="min-h-screen bg-cream-50 flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-warung-600 border-t-transparent rounded-full animate-spin" />
      <p className="text-warung-700 font-medium text-sm">Memuat data...</p>
    </div>
  </div>
);

// Empty State
interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  icon,
  action,
}) => (
  <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
    <div className="text-5xl mb-4">{icon || '🔍'}</div>
    <h3 className="text-lg font-bold text-stone-700 mb-2">{title}</h3>
    {description && <p className="text-stone-500 text-sm max-w-sm mb-6">{description}</p>}
    {action && <div>{action}</div>}
  </div>
);
