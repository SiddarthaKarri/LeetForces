import React from "react";
import { TagsSkeleton } from "./LoadingSpinner";

// Problem Tags Component
const ProblemTagsCloud = React.memo(({ tagStats }) => {
  // Show loading skeleton if no data yet
  if (!tagStats) {
    return <TagsSkeleton />;
  }

  const topTags = Object.entries(tagStats || {})
    .sort(([,a], [,b]) => b - a)
    .slice(0, 12);

  if (topTags.length === 0) {
    return (
      <div className="leet-card">
        <div className="text-center py-8" style={{ color: 'var(--text-muted)' }}>
          No tag statistics available
        </div>
      </div>
    );
  }

  const maxCount = Math.max(...topTags.map(([,count]) => count));

  return (
    <div className="leet-card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
          Problem Tags
        </h3>
        <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Most solved topics
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {topTags.map(([tag, count], index) => {
          const size = Math.max(0.8, (count / maxCount) * 1.5);
          const opacity = Math.max(0.6, (count / maxCount));
          
          return (
            <span
              key={tag}
              className="px-3 py-1 rounded-full border transition-all duration-300 hover:scale-110 cursor-pointer"
              style={{
                fontSize: `${size}rem`,
                opacity: opacity,
                backgroundColor: 'var(--bg-tertiary)',
                borderColor: 'var(--border-color)',
                color: 'var(--text-primary)',
                animation: `fadeInUp 0.5s ease-out ${index * 0.05}s both`
              }}
              title={`${count} problems solved`}
            >
              {tag} ({count})
            </span>
          );
        })}
      </div>
    </div>
  );
});

export default ProblemTagsCloud;
