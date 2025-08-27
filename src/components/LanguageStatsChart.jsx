import React from "react";
import { LanguageSkeleton } from "./LoadingSpinner";

// Language Statistics Component
const LanguageStatsChart = React.memo(({ languageStats }) => {
  // Show loading skeleton if no data yet
  if (!languageStats) {
    return <LanguageSkeleton />;
  }

  const topLanguages = Object.entries(languageStats || {})
    .sort(([,a], [,b]) => b - a)
    .slice(0, 6);

  if (topLanguages.length === 0) {
    return (
      <div className="leet-card">
        <div className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
          No language statistics available
        </div>
      </div>
    );
  }

  const maxCount = Math.max(...topLanguages.map(([,count]) => count));

  return (
    <div className="leet-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
          Languages Used
        </h3>
        <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Top {topLanguages.length} languages
        </div>
      </div>
      <div className="space-y-3">
        {topLanguages.map(([language, count], index) => {
          const percentage = (count / maxCount) * 100;
          const colors = ['#00b4aa', '#ffc01e', '#ff375f', '#b91c1c', '#7c3aed', '#059669'];
          
          return (
            <div key={language} className="flex items-center gap-3">
              <div className="w-16 text-sm font-medium truncate" style={{ color: 'var(--text-primary)' }}>
                {language}
              </div>
              <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2 relative overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-1000 ease-out"
                  style={{
                    backgroundColor: colors[index % colors.length],
                    width: `${percentage}%`,
                    animation: `slideIn 1s ease-out ${index * 0.1}s both`
                  }}
                />
              </div>
              <div className="w-12 text-sm text-right font-bold" style={{ color: 'var(--text-primary)' }}>
                {count}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
});

export default LanguageStatsChart;
