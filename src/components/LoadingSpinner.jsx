import React from 'react';

// Animated loading spinner component
export function LoadingSpinner({ size = 'md', className = '' }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-12 h-12'
  };

  return (
    <div className={`animate-spin rounded-full border-2 border-gray-300 border-t-amber-400 ${sizeClasses[size]} ${className}`} />
  );
}

// Skeleton loader for cards
export function SkeletonCard({ className = '' }) {
  return (
    <div className={`leet-card animate-pulse ${className}`}>
      <div className="space-y-4">
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
        <div className="space-y-2">
          <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded"></div>
          <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-5/6"></div>
        </div>
      </div>
    </div>
  );
}

// Profile skeleton loader
export function ProfileSkeleton() {
  return (
    <div className="leet-card animate-pulse">
      <div className="flex items-center space-x-4 mb-4">
        <div className="rounded-full bg-gray-300 dark:bg-gray-700 h-16 w-16"></div>
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
          <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 mb-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded"></div>
            <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
          </div>
        ))}
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded"></div>
        <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-4/5"></div>
      </div>
    </div>
  );
}

// Chart skeleton loader
export function ChartSkeleton({ height = '300px' }) {
  return (
    <div className="leet-card animate-pulse">
      <div className="space-y-4">
        <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
        <div className="bg-gray-300 dark:bg-gray-700 rounded" style={{ height }}>
          <div className="flex items-end justify-center h-full p-4 space-x-2">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="bg-gray-400 dark:bg-gray-600 rounded-t"
                style={{
                  height: `${Math.random() * 60 + 20}%`,
                  width: '12px'
                }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Heatmap skeleton loader
export function HeatmapSkeleton() {
  return (
    <div className="leet-card animate-pulse">
      <div className="space-y-4">
        <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-2/3"></div>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-20"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-16"></div>
          </div>
          <div className="flex items-center gap-1 text-xs">
            <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-8"></div>
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-2 h-2 bg-gray-300 dark:bg-gray-700 rounded-sm"></div>
              ))}
            </div>
            <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-8"></div>
          </div>
        </div>
        <div className="space-y-1">
          {[...Array(7)].map((_, week) => (
            <div key={week} className="flex gap-1">
              {[...Array(53)].map((_, day) => (
                <div
                  key={day}
                  className="w-2.5 h-2.5 bg-gray-300 dark:bg-gray-700 rounded-sm"
                />
              ))}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-6 gap-4 text-center">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="space-y-1">
              <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded w-full"></div>
              <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-3/4 mx-auto"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Problems panel skeleton
export function ProblemsSkeleton() {
  return (
    <div className="leet-card animate-pulse">
      <div className="space-y-4">
        <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-2/3"></div>
        <div className="flex items-center justify-center h-32">
          <div className="relative">
            <div className="w-24 h-24 bg-gray-300 dark:bg-gray-700 rounded-full"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="h-6 bg-gray-400 dark:bg-gray-600 rounded w-8 mx-auto mb-1"></div>
                <div className="h-3 bg-gray-400 dark:bg-gray-600 rounded w-12 mx-auto"></div>
              </div>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="space-y-1">
              <div className="h-8 bg-gray-300 dark:bg-gray-700 rounded"></div>
              <div className="h-3 bg-gray-300 dark:bg-gray-700 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Tags cloud skeleton
export function TagsSkeleton() {
  return (
    <div className="leet-card animate-pulse">
      <div className="space-y-4">
        <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-3/4"></div>
        <div className="flex flex-wrap gap-2">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="h-8 bg-gray-300 dark:bg-gray-700 rounded-full"
              style={{
                width: `${Math.random() * 60 + 40}px`
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// Language stats skeleton
export function LanguageSkeleton() {
  return (
    <div className="leet-card animate-pulse">
      <div className="space-y-4">
        <div className="h-6 bg-gray-300 dark:bg-gray-700 rounded w-2/3"></div>
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-1/2"></div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gray-300 dark:bg-gray-700 rounded"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-16"></div>
              </div>
              <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-8"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default LoadingSpinner;
