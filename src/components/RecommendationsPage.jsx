import React, { useState, useEffect } from 'react';
import { Lightbulb, Search, Star, Clock, TrendingUp, Filter, ExternalLink, BookOpen, Brain } from 'lucide-react';

export default function RecommendationsPage() {
  const [username, setUsername] = useState('');
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    difficulty: 'all',
    tags: [],
    solved: 'unsolved'
  });

  const difficultyRanges = [
    { value: 'all', label: 'All Difficulties', min: 0, max: 4000 },
    { value: 'beginner', label: 'Beginner (800-1200)', min: 800, max: 1200 },
    { value: 'intermediate', label: 'Intermediate (1201-1600)', min: 1201, max: 1600 },
    { value: 'advanced', label: 'Advanced (1601-2000)', min: 1601, max: 2000 },
    { value: 'expert', label: 'Expert (2001+)', min: 2001, max: 4000 }
  ];

  const popularTags = [
    'implementation', 'math', 'greedy', 'dp', 'data structures',
    'brute force', 'constructive algorithms', 'graphs', 'sortings',
    'binary search', 'dfs and similar', 'trees', 'strings', 'number theory',
    'combinatorics', 'geometry', 'bitmasks', 'two pointers'
  ];

  const fetchRecommendations = async () => {
    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Fetch user's submission history
      const submissionsResponse = await fetch(
        `https://codeforces.com/api/user.status?handle=${encodeURIComponent(username.trim())}`
      );
      const submissionsData = await submissionsResponse.json();

      if (submissionsData.status !== 'OK') {
        throw new Error('User not found');
      }

      // Fetch all problems
      const problemsResponse = await fetch('https://codeforces.com/api/problemset.problems');
      const problemsData = await problemsResponse.json();

      if (problemsData.status !== 'OK') {
        throw new Error('Failed to fetch problems');
      }

      const userSubmissions = submissionsData.result;
      const allProblems = problemsData.result.problems;

      // Analyze user's solving patterns
      const solvedProblems = new Set();
      const attemptedProblems = new Set();
      const tagStats = {};
      const difficultyStats = {};
      let totalRating = 0;
      let solvedCount = 0;

      userSubmissions.forEach(submission => {
        const problemKey = `${submission.problem.contestId}-${submission.problem.index}`;
        attemptedProblems.add(problemKey);

        if (submission.verdict === 'OK') {
          solvedProblems.add(problemKey);

          if (submission.problem.rating) {
            totalRating += submission.problem.rating;
            solvedCount++;

            const rating = submission.problem.rating;
            const range = Math.floor(rating / 200) * 200;
            difficultyStats[range] = (difficultyStats[range] || 0) + 1;
          }

          submission.problem.tags?.forEach(tag => {
            tagStats[tag] = (tagStats[tag] || 0) + 1;
          });
        }
      });

      const averageRating = solvedCount > 0 ? totalRating / solvedCount : 1200;

      // Find weak areas (tags with low solve count)
      const totalSolved = Object.values(tagStats).reduce((a, b) => a + b, 0);
      const weakTags = popularTags.filter(tag => {
        const count = tagStats[tag] || 0;
        return count < totalSolved * 0.1; // Less than 10% of total solved
      }).slice(0, 5);

      // Generate recommendations
      let recommendedProblems = allProblems
        .filter(problem => {
          const problemKey = `${problem.contestId}-${problem.index}`;

          // Apply solved/unsolved filter
          if (filters.solved === 'solved' && !solvedProblems.has(problemKey)) return false;
          if (filters.solved === 'unsolved' && solvedProblems.has(problemKey)) return false;

          // Apply difficulty filter
          if (filters.difficulty !== 'all') {
            const range = difficultyRanges.find(r => r.value === filters.difficulty);
            if (!problem.rating || problem.rating < range.min || problem.rating > range.max) {
              return false;
            }
          }

          // Apply tag filter
          if (filters.tags.length > 0) {
            const hasAnyTag = filters.tags.some(tag => problem.tags?.includes(tag));
            if (!hasAnyTag) return false;
          }

          return problem.rating && problem.tags;
        })
        .map(problem => {
          const problemKey = `${problem.contestId}-${problem.index}`;
          let score = 0;

          // Prefer problems in weak areas
          const hasWeakTag = problem.tags.some(tag => weakTags.includes(tag));
          if (hasWeakTag) score += 50;

          // Prefer problems slightly above user's average rating
          const ratingDiff = problem.rating - averageRating;
          if (ratingDiff >= 0 && ratingDiff <= 400) {
            score += 30 - Math.abs(ratingDiff - 200) / 10;
          }

          // Boost popular problems (higher solve count indicates quality)
          if (problem.solvedCount > 1000) score += 20;
          if (problem.solvedCount > 5000) score += 10;

          // Penalize already attempted problems
          if (attemptedProblems.has(problemKey)) score -= 20;

          return {
            ...problem,
            score,
            recommendationReason: hasWeakTag ?
              `Improve in: ${problem.tags.filter(tag => weakTags.includes(tag)).join(', ')}` :
              'Good for skill progression'
          };
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, 20);

      setRecommendations(recommendedProblems);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (rating) => {
    if (rating >= 2400) return 'text-red-600';
    if (rating >= 2100) return 'text-red-500';
    if (rating >= 1900) return 'text-purple-600';
    if (rating >= 1600) return 'text-blue-600';
    if (rating >= 1400) return 'text-cyan-600';
    if (rating >= 1200) return 'text-green-600';
    return 'text-gray-600';
  };

  const handleTagToggle = (tag) => {
    setFilters(prev => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter(t => t !== tag)
        : [...prev.tags, tag]
    }));
  };

  return (
    <div className="min-h-screen pt-[120px] md:pt-28 pb-8" style={{ backgroundColor: 'var(--bg-secondary)' }}>
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Lightbulb className="text-yellow-500" size={32} />
            <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
              Problem Recommendations
            </h1>
          </div>
          <p className="text-lg" style={{ color: 'var(--text-muted)' }}>
            Get personalized problem suggestions based on your solving patterns
          </p>
        </div>

        {/* Search Section */}
        <div className="leet-card mb-8">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                Codeforces Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter your handle (e.g., tourist)"
                className="w-full px-4 py-2 rounded-lg border transition-all focus:ring-2 focus:ring-yellow-500/50"
                style={{
                  backgroundColor: 'var(--bg-tertiary)',
                  borderColor: 'var(--border-color)',
                  color: 'var(--text-primary)'
                }}
              />
            </div>
            <button
              onClick={fetchRecommendations}
              disabled={loading}
              className="px-6 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors font-medium flex items-center gap-2 disabled:opacity-50"
            >
              <Search size={18} />
              {loading ? 'Analyzing...' : 'Get Recommendations'}
            </button>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg">
              <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
            </div>
          )}
        </div>

        {/* Filters */}
        {recommendations.length > 0 && (
          <div className="leet-card mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Filter size={20} style={{ color: 'var(--text-secondary)' }} />
              <h3 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                Filters
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Difficulty Filter */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Difficulty Range
                </label>
                <select
                  value={filters.difficulty}
                  onChange={(e) => setFilters(prev => ({ ...prev, difficulty: e.target.value }))}
                  className="w-full px-3 py-2 rounded border"
                  style={{
                    backgroundColor: 'var(--bg-tertiary)',
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-primary)'
                  }}
                >
                  {difficultyRanges.map(range => (
                    <option key={range.value} value={range.value}>
                      {range.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Solved Filter */}
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: 'var(--text-secondary)' }}>
                  Problem Status
                </label>
                <select
                  value={filters.solved}
                  onChange={(e) => setFilters(prev => ({ ...prev, solved: e.target.value }))}
                  className="w-full px-3 py-2 rounded border"
                  style={{
                    backgroundColor: 'var(--bg-tertiary)',
                    borderColor: 'var(--border-color)',
                    color: 'var(--text-primary)'
                  }}
                >
                  <option value="unsolved">Unsolved Only</option>
                  <option value="solved">Solved Only</option>
                  <option value="all">All Problems</option>
                </select>
              </div>

              {/* Apply Filters Button */}
              <div className="flex items-end">
                <button
                  onClick={fetchRecommendations}
                  className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                  Apply Filters
                </button>
              </div>
            </div>

            {/* Tags Filter */}
            <div className="mt-6">
              <label className="block text-sm font-medium mb-3" style={{ color: 'var(--text-secondary)' }}>
                Filter by Tags
              </label>
              <div className="flex flex-wrap gap-2">
                {popularTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => handleTagToggle(tag)}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${filters.tags.includes(tag)
                      ? 'bg-blue-500 text-white'
                      : 'border border-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      }`}
                    style={{
                      color: filters.tags.includes(tag) ? 'white' : 'var(--text-secondary)',
                      borderColor: filters.tags.includes(tag) ? 'transparent' : 'var(--border-color)'
                    }}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Recommendations */}
        {loading ? (
          <div className="leet-card text-center py-12">
            <Brain className="mx-auto mb-4 animate-pulse text-yellow-500" size={48} />
            <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
              Analyzing Your Profile...
            </h3>
            <p style={{ color: 'var(--text-muted)' }}>
              Finding problems that match your skill level and weak areas
            </p>
          </div>
        ) : recommendations.length === 0 ? (
          <div className="leet-card text-center py-12">
            <BookOpen className="mx-auto mb-4 text-gray-400" size={48} />
            <h3 className="text-xl font-semibold mb-2" style={{ color: 'var(--text-primary)' }}>
              No Recommendations Yet
            </h3>
            <p style={{ color: 'var(--text-muted)' }}>
              Enter your Codeforces username to get personalized problem recommendations
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                Recommended Problems ({recommendations.length})
              </h3>
              <div className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Sorted by relevance to your profile
              </div>
            </div>

            {recommendations.map((problem, index) => (
              <div key={`${problem.contestId}-${problem.index}`} className="leet-card hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm font-medium px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 rounded">
                        #{index + 1}
                      </span>
                      <h4 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                        {problem.contestId}{problem.index}. {problem.name}
                      </h4>
                    </div>

                    <div className="flex items-center gap-4 mb-3">
                      <div className="flex items-center gap-1">
                        <Star className={getDifficultyColor(problem.rating)} size={16} />
                        <span className={`font-medium ${getDifficultyColor(problem.rating)}`}>
                          {problem.rating}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-sm" style={{ color: 'var(--text-muted)' }}>
                        <TrendingUp size={14} />
                        {problem.solvedCount} solved
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-3">
                      {problem.tags.slice(0, 5).map(tag => (
                        <span
                          key={tag}
                          className="px-2 py-1 text-xs rounded-full"
                          style={{
                            backgroundColor: 'var(--bg-tertiary)',
                            color: 'var(--text-secondary)'
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <p className="text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
                      <Lightbulb size={14} className="inline mr-1 text-yellow-500" />
                      {problem.recommendationReason}
                    </p>
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    <a
                      href={`https://codeforces.com/problemset/problem/${problem.contestId}/${problem.index}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm flex items-center gap-2"
                    >
                      <ExternalLink size={14} />
                      Solve
                    </a>
                    <div className="text-xs text-center" style={{ color: 'var(--text-muted)' }}>
                      Score: {problem.score.toFixed(0)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
