import React, { useEffect, useState } from "react";
import { ProblemsSkeleton } from "./LoadingSpinner";
import { getProblemsData } from "../utils/simpleProblemsCache";

/**
 * Fetch user-specific problems from submissions
 */
export default function ProblemsPanel({ handle, submissions = [] }) {
  const [stats, setStats] = useState(null);
  const [sample, setSample] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showMore, setShowMore] = useState(false);
  const [displayCount, setDisplayCount] = useState(6);

  useEffect(() => {
    const loadProblems = async () => {
      if (!handle || !submissions.length) {
        setStats(null);
        setSample([]);
        return;
      }

      setLoading(true);
      try {
        // Get global problems data for problem details
        const globalProblems = await getProblemsData();
        
        // Filter user's solved problems from submissions
        const solvedProblems = new Map();
        
        submissions.forEach(sub => {
          if (sub.verdict === 'OK') {
            const key = `${sub.problem.contestId}-${sub.problem.index}`;
            if (!solvedProblems.has(key)) {
              solvedProblems.set(key, {
                contestId: sub.problem.contestId,
                index: sub.problem.index,
                name: sub.problem.name,
                rating: sub.problem.rating,
                tags: sub.problem.tags || []
              });
            }
          }
        });

        const userSolvedArray = Array.from(solvedProblems.values());
        
        // Calculate stats
        const totalSolved = userSolvedArray.length;
        const byRating = {};
        userSolvedArray.forEach(problem => {
          if (problem.rating) {
            const range = Math.floor(problem.rating / 100) * 100;
            byRating[range] = (byRating[range] || 0) + 1;
          }
        });

        setStats({ 
          total: totalSolved,
          totalAvailable: globalProblems?.total || 0,
          byRating 
        });
        
        // Show recent solved problems
        setSample(userSolvedArray.slice(0, 20));
      } catch (error) {
        console.error('Failed to load problems:', error);
        setStats({ total: 0, totalAvailable: 0, byRating: {} });
        setSample([]);
      } finally {
        setLoading(false);
      }
    };

    loadProblems();
  }, [handle, submissions]); // Depend on handle and submissions

  const handleViewMore = () => {
    if (showMore) {
      setDisplayCount(6);
      setShowMore(false);
    } else {
      setDisplayCount(sample.length);
      setShowMore(true);
    }
  };

  const getDifficultyColor = (rating) => {
    if (!rating) return 'var(--text-muted)';
    if (rating <= 1200) return 'var(--easy-color)';
    if (rating <= 1900) return 'var(--medium-color)';
    return 'var(--hard-color)';
  };

  const getProblemUrl = (contestId, index) => {
    return `https://codeforces.com/problemset/problem/${contestId}/${index}`;
  };

  return (
    <div className="h-full">
      {loading && <ProblemsSkeleton />}
      {!loading && (
        <div className={`leet-card flex flex-col ${showMore ? 'h-auto' : 'h-195'}`}>
          <div className="flex items-center justify-between mb-4 flex-shrink-0">
            <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>Problems Snapshot</h3>
            {sample.length > 6 && (
              <button 
                onClick={handleViewMore}
                className="text-sm font-medium hover:opacity-80 transition-opacity"
                style={{ color: 'var(--easy-color)' }}
              >
                {showMore ? 'View Less' : 'View More'}
              </button>
            )}
          </div>
          
          {stats && (
            <div className="text-sm mb-4 flex-shrink-0" style={{ color: 'var(--text-muted)' }}>
              <strong className="text-base" style={{ color: 'var(--text-primary)' }}>{stats.total}</strong> solved, <strong className="text-base" style={{ color: 'var(--text-primary)' }}>{stats.totalAvailable}</strong> total available
            </div>
          )}
          
          <div className={`flex-1 ${!showMore ? 'overflow-hidden' : 'overflow-visible'}`}>
            {stats && sample.length > 0 && (
              <div className="grid grid-cols-1 gap-3">
                {sample.slice(0, displayCount).map((p, i) => (
                <a
                  key={i}
                  href={getProblemUrl(p.contestId, p.index)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="problem-item block p-3 rounded-lg border transition-all duration-200 hover:shadow-md"
                  style={{
                    backgroundColor: 'var(--bg-tertiary)',
                    borderColor: 'var(--border-color)'
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-medium mb-1" style={{ color: 'var(--text-primary)' }}>
                        {p.contestId && p.index ? `${p.contestId}${p.index}. ` : ''}{p.name}
                      </div>
                      <div className="text-xs flex items-center gap-2" style={{ color: 'var(--text-muted)' }}>
                        {p.rating && (
                          <span 
                            className="font-medium"
                            style={{ color: getDifficultyColor(p.rating) }}
                          >
                            {p.rating}
                          </span>
                        )}
                        {p.tags && p.tags.length > 0 && (
                          <span>• {p.tags.slice(0, 3).join(', ')}</span>
                        )}
                      </div>
                    </div>
                    <div className="ml-2">
                      <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ color: 'var(--text-muted)' }}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </div>
                  </div>
                </a>
              ))}
            </div>
            )}
            {(!stats || sample.length === 0) && (
              <div className="text-center py-4" style={{ color: 'var(--text-muted)' }}>
                {!stats ? 'Problems data not available.' : 'No solved problems found.'}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
